import axios from "axios";
import { Supadata } from "@supadata/js";
import {
  DynamoDBClient,
  UpdateItemCommand,
  PutItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const dynamoClient = new DynamoDBClient({});
const sqsClient = new SQSClient({});
const s3Client = new S3Client({});

const RAPIDAPI_KEYS = [
  process.env.RAPIDAPI_KEY_1,
  process.env.RAPIDAPI_KEY_2,
  process.env.RAPIDAPI_KEY_3,
  process.env.RAPIDAPI_KEY_4,
];

const DYNAMO_VIDEOS_TABLE = process.env.DYNAMO_VIDEOS_TABLE;
const DYNAMO_USERS_TABLE = process.env.DYNAMO_USERS_TABLE;
const TRANSCRIBE_OUTPUT_BUCKET = process.env.TRANSCRIBE_OUTPUT_BUCKET;
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
const VIDEO_DLQ_URL = process.env.VIDEO_DLQ_URL;
const SUPADATA_API_KEY = process.env.SUPADATA_API_KEY;
const MAX_RETRIES = 3;

// Initialize Supadata client
const supadata = new Supadata({
  apiKey: SUPADATA_API_KEY,
});

export const handler = async (event) => {
  console.log("[INFO] Lambda invoked", {
    eventRecordCount: event.Records?.length,
  });

  for (const record of event.Records) {
    let messageBody;
    let videoId;
    let youtubeLink;
    let uploadedBy;
    let retryCount;

    try {
      messageBody = JSON.parse(record.body);
      videoId = messageBody.video_id;
      youtubeLink = messageBody.youtube_link;
      uploadedBy = messageBody.uploaded_by;
      retryCount = parseInt(messageBody.retry_count || "0", 10);

      console.log("[INFO] Processing message", {
        videoId,
        youtubeLink,
        uploadedBy,
        retryCount,
      });

      // Validate required fields
      if (!videoId || !youtubeLink || !uploadedBy) {
        throw new Error(
          `Missing required fields: video_id=${videoId}, youtube_link=${youtubeLink}, uploaded_by=${uploadedBy}`
        );
      }

      // Update status to processing
      await updateVideoStatus(videoId, "processing", null, retryCount);

      // Step 1: Get transcript from Transcript API
      console.log("[INFO] Fetching transcript from Transcript API", {
        youtubeLink,
      });
      const transcriptText = await getTranscriptFromAPI(youtubeLink);

      if (!transcriptText || transcriptText.trim().length === 0) {
        throw new Error("Transcript API returned empty transcript");
      }

      console.log("[INFO] Transcript received", {
        transcriptLength: transcriptText.length,
      });

      // Step 2: Generate AI insights from transcript
      console.log("[INFO] Generating AI insights from transcript");
      const aiInsights = await generateInsightsFromTranscript(transcriptText);

      // Step 3: Normalize insights
      const normalizedInsights = normalizeInsights(aiInsights);

      // Step 4: Save transcript to S3
      const timestamp = Date.now();
      const youtubeId = extractYouTubeID(youtubeLink);
      const transcriptS3Key = `transcription-${youtubeId}-${timestamp}.json`;

      console.log("[INFO] Saving transcript to S3", { transcriptS3Key });
      await s3Client.send(
        new PutObjectCommand({
          Bucket: TRANSCRIBE_OUTPUT_BUCKET,
          Key: transcriptS3Key,
          Body: JSON.stringify(
            {
              results: {
                transcripts: [{ transcript: transcriptText }],
              },
            },
            null,
            2
          ),
          ContentType: "application/json",
        })
      );

      // Step 5: Save insights to S3
      const insightsS3Key = `insights-${youtubeId}-${timestamp}.json`;
      console.log("[INFO] Saving insights to S3", { insightsS3Key });
      await s3Client.send(
        new PutObjectCommand({
          Bucket: TRANSCRIBE_OUTPUT_BUCKET,
          Key: insightsS3Key,
          Body: JSON.stringify(normalizedInsights, null, 2),
          ContentType: "application/json",
        })
      );

      // Step 6: Update DynamoDB with transcript and insights S3 keys
      console.log("[INFO] Updating DynamoDB with S3 keys");
      await dynamoClient.send(
        new UpdateItemCommand({
          TableName: DYNAMO_VIDEOS_TABLE,
          Key: { video_id: { S: videoId } },
          UpdateExpression:
            "SET transcript_s3_key = :tkey, transcript_saved_at = :ttime, insights_s3_key = :ikey, insights_saved_at = :itime",
          ExpressionAttributeValues: {
            ":tkey": { S: transcriptS3Key },
            ":ttime": { S: new Date().toISOString() },
            ":ikey": { S: insightsS3Key },
            ":itime": { S: new Date().toISOString() },
          },
        })
      );

      // Step 7: Add video to user's videos array
      console.log("[INFO] Adding video to user's array", { uploadedBy });
      await addVideoToUser(uploadedBy, videoId);

      // Step 8: Mark video as completed
      await updateVideoStatus(videoId, "done", null, retryCount);

      console.log("[SUCCESS] Video processing completed", { videoId });
    } catch (error) {
      console.error("[ERROR] Processing failed", {
        videoId,
        error: error.message,
        stack: error.stack,
      });

      // Handle retry logic
      if (retryCount < MAX_RETRIES) {
        console.log("[INFO] Retrying", {
          videoId,
          currentRetry: retryCount,
          maxRetries: MAX_RETRIES,
        });

        await updateVideoStatus(
          videoId,
          "retrying",
          error.message,
          retryCount + 1
        );

        // Re-send to SQS with incremented retry count
        await sqsClient.send(
          new SendMessageCommand({
            QueueUrl: SQS_QUEUE_URL,
            MessageBody: JSON.stringify({
              video_id: videoId,
              youtube_link: youtubeLink,
              uploaded_by: uploadedBy,
              retry_count: retryCount + 1,
            }),
          })
        );
      } else {
        // Max retries reached - send to DLQ and mark as failed
        console.error("[ERROR] Max retries reached, sending to DLQ", {
          videoId,
        });

        await updateVideoStatus(
          videoId,
          "failed_permanent",
          error.message,
          retryCount
        );

        // Send to DLQ
        try {
          await sqsClient.send(
            new SendMessageCommand({
              QueueUrl: VIDEO_DLQ_URL,
              MessageBody: JSON.stringify({
                video_id: videoId,
                youtube_link: youtubeLink,
                uploaded_by: uploadedBy,
                final_status: "failed_permanent",
                error: error.message,
              }),
            })
          );
          console.log("[INFO] Message sent to DLQ", { videoId });
        } catch (dlqError) {
          console.error("[ERROR] Failed to send to DLQ", {
            error: dlqError.message,
          });
        }
      }

      // Don't throw - we handled the error
      // Throwing would cause Lambda to retry, which we don't want (we handle retries manually)
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Processing completed" }),
  };
};

async function getTranscriptFromAPI(youtubeLink) {
  let lastError = null;

  for (const key of [SUPADATA_API_KEY, ...RAPIDAPI_KEYS].filter(Boolean)) {
    try {
      const client = new Supadata({ apiKey: key });
      console.log("[INFO] Calling Supadata transcript API", {
        youtubeLink,
        key,
      });

      const transcriptResult = await client.transcript({
        url: youtubeLink,
        text: false, // use async job mode
        mode: "native",
      });

      // If we got a job, poll for completion
      if (transcriptResult.jobId) {
        let result;
        let attempts = 0;
        do {
          await new Promise((r) => setTimeout(r, 2000)); // wait 2s between polls
          result = await client.transcript.getJobStatus(transcriptResult.jobId);
          attempts++;
        } while (result.status !== "done" && attempts < 50);

        if (result.status !== "done") {
          throw new Error("Transcript job did not complete in time");
        }

        if (Array.isArray(result.content)) {
          const transcriptText = result.content.map((c) => c.text).join(" ");
          if (transcriptText.trim().length === 0)
            throw new Error("Supadata returned empty transcript");
          return transcriptText;
        }
      } else if (Array.isArray(transcriptResult.content)) {
        const transcriptText = transcriptResult.content
          .map((c) => c.text)
          .join(" ");
        if (transcriptText.trim().length === 0)
          throw new Error("Supadata returned empty transcript");
        return transcriptText;
      } else {
        throw new Error("Supadata returned unexpected format");
      }
    } catch (error) {
      lastError = error;
      console.warn("[WARN] Supadata key failed or limit exceeded", {
        key,
        error: error.message,
      });

      if (error.message.includes("Limit Exceeded")) {
        // small delay before trying next key
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
    }
  }

  throw new Error(
    `All Supadata keys failed. Last error: ${lastError?.message}`
  );
}

async function generateInsightsFromTranscript(transcriptText) {
  if (!transcriptText || transcriptText.length === 0) {
    throw new Error("Transcript text is empty; cannot generate AI insights.");
  }

  const messages = [
    {
      role: "system",
      content:
        "You are an expert knowledge extractor, learning designer, and life coach. Your job is to analyze transcripts and return highly actionable, structured, and standardized JSON insights in a consistent format for downstream systems.",
    },
    {
      role: "user",
      content: `
        Carefully read the following transcript. Analyze and extract deep, practical, and structured insights in the following format. Return ONLY valid, minified JSON (no markdown, no commentary, no extra text). Always include all fields, even if empty.

        Format:
        {
          "lessons": [
            {
              "title": "Concise lesson title",
              "summary": "Brief summary of the lesson.",
              "detailed_explanation": "Expanded explanation, context, and why it matters.",
              "action_steps": ["Actionable tip 1", "Actionable tip 2"],
              "examples": ["Relevant quote or story from transcript", "..."]
            }
          ],
          "quotes": [
            "Direct impactful quote from transcript",
            "Another quote"
          ],
          "mindset_shifts": [
            "Describe any mindset or perspective shifts recommended by the speaker"
          ],
          "reflection_questions": [
            "A question to help the user reflect/apply the lesson"
          ],
          "mistakes_or_warnings": [
            "Common mistake or warning highlighted by the speaker"
          ],
          "personal_insights": [
            "Any personal stories, opinions, or unique insights from the speaker"
          ],
          "emotional_tone": "Describe the overall emotional tone (e.g., motivational, cautionary, optimistic)",
          "category": "Thematic category (e.g., productivity, relationships, health, finance)",
          "tags": ["tag1", "tag2", "tag3"]
        }

        Instructions:
        - Carefully extract and fill each field. Use arrays even if only one item.
        - All JSON keys must always be present.
        - Quotes and examples must be directly from the transcript.
        - Action steps must be practical and specific.
        - Do NOT include any text outside of the JSON.
        - Always return valid JSON (no markdown, no comments, no trailing commas).
        - Give me the insights in the same language of the transcription.

        Transcript:
        ${transcriptText}
      `,
    },
  ];

  const responseData = await callRapidApiWithFallback(messages);

  const aiOutput =
    responseData?.text ||
    responseData?.choices?.[0]?.message?.content ||
    responseData?.choices?.[0]?.text ||
    JSON.stringify(responseData);

  const cleaned = (aiOutput || "")
    .replace(/```json|```/gi, "")
    .replace(/^\s+|\s+$/g, "")
    .trim();

  if (!cleaned || cleaned.length === 0) {
    throw new Error("AI response is empty");
  }

  try {
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (parseErr) {
    console.error("[ERROR] AI output not valid JSON", { output: cleaned });
    throw new Error("AI output not valid JSON");
  }
}

async function callRapidApiWithFallback(messages) {
  let lastError = null;

  for (const key of RAPIDAPI_KEYS) {
    if (!key) continue;

    try {
      console.log("[INFO] Trying RapidAPI key");
      const response = await axios.post(
        "https://chatgpt-api8.p.rapidapi.com/",
        messages,
        {
          headers: {
            "x-rapidapi-key": key,
            "x-rapidapi-host": "chatgpt-api8.p.rapidapi.com",
            "Content-Type": "application/json",
          },
          timeout: 120000, // 2 minute timeout
        }
      );

      if (response?.data) {
        console.log("[INFO] RapidAPI call successful");
        return response.data;
      }
    } catch (err) {
      console.warn("[WARN] RapidAPI key failed", { error: err.message });
      lastError = err;
      continue;
    }
  }

  throw new Error(
    `All RapidAPI keys failed. Last error: ${lastError?.message}`
  );
}

function normalizeInsights(input) {
  if (!input || typeof input !== "object") {
    return {
      lessons: [],
      examples: [],
      tips: [],
      quotes: [],
      mindset_shifts: [],
      reflection_questions: [],
      mistakes_or_warnings: [],
      personal_insights: [],
      emotional_tone: "",
      category: "",
      tags: [],
    };
  }

  const normalized = {
    lessons: [],
    examples: Array.isArray(input.examples) ? input.examples : [],
    tips: Array.isArray(input.tips) ? input.tips : [],
    quotes: Array.isArray(input.quotes) ? input.quotes : [],
    mindset_shifts: Array.isArray(input.mindset_shifts)
      ? input.mindset_shifts
      : [],
    reflection_questions: Array.isArray(input.reflection_questions)
      ? input.reflection_questions
      : [],
    mistakes_or_warnings: Array.isArray(input.mistakes_or_warnings)
      ? input.mistakes_or_warnings
      : [],
    personal_insights: Array.isArray(input.personal_insights)
      ? input.personal_insights
      : [],
    emotional_tone: input.emotional_tone || "",
    category: input.category || "",
    tags: Array.isArray(input.tags) ? input.tags : [],
  };

  if (Array.isArray(input.lessons)) {
    normalized.lessons = input.lessons.map((lesson) => ({
      title:
        lesson.title || lesson.lesson || lesson.key || lesson.key_insight || "",
      summary: lesson.summary || lesson.details || "",
      detailed_explanation: lesson.detailed_explanation || lesson.details || "",
      action_steps: Array.isArray(lesson.action_steps)
        ? lesson.action_steps
        : Array.isArray(lesson.tips)
        ? lesson.tips
        : lesson.action_step
        ? [lesson.action_step]
        : [],
      examples: Array.isArray(lesson.examples) ? lesson.examples : [],
    }));
  }

  return normalized;
}

async function updateVideoStatus(
  videoId,
  status,
  errorMessage = null,
  retryCount = null
) {
  if (!DYNAMO_VIDEOS_TABLE || !videoId) {
    console.warn("[WARN] Missing table name or video ID for status update");
    return;
  }

  let updateExpression = "";
  let expressionAttributeNames = {
    "#s": "status",
  };
  let expressionAttributeValues = {
    ":s": { S: status },
  };

  if (errorMessage) {
    updateExpression = "SET #s = :s, #err = :e, #rc = :rc, #lf = :lf";
    expressionAttributeNames["#err"] = "error";
    expressionAttributeNames["#rc"] = "retry_count";
    expressionAttributeNames["#lf"] = "last_failed_at";
    expressionAttributeValues[":e"] = { S: errorMessage };
    expressionAttributeValues[":rc"] = {
      N: retryCount !== null ? retryCount.toString() : "0",
    };
    expressionAttributeValues[":lf"] = { S: new Date().toISOString() };
  } else {
    updateExpression = "SET #s = :s REMOVE #err, #rc, #lf";
    expressionAttributeNames["#err"] = "error";
    expressionAttributeNames["#rc"] = "retry_count";
    expressionAttributeNames["#lf"] = "last_failed_at";
  }

  try {
    await dynamoClient.send(
      new UpdateItemCommand({
        TableName: DYNAMO_VIDEOS_TABLE,
        Key: { video_id: { S: videoId } },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );
    console.log("[INFO] Video status updated", { videoId, status });
  } catch (err) {
    console.error("[ERROR] Failed to update video status", {
      error: err.message,
    });
  }
}

async function addVideoToUser(uploadedBy, videoId) {
  if (!uploadedBy || !videoId) {
    console.warn("[WARN] Missing uploadedBy or videoId");
    return;
  }

  try {
    // Get current user record
    const getUserParams = {
      TableName: DYNAMO_USERS_TABLE,
      Key: { user_id: { S: uploadedBy } },
    };
    const userResult = await dynamoClient.send(
      new GetItemCommand(getUserParams)
    );

    if (userResult.Item) {
      // User exists - check if video already in their array
      const currentVideos = userResult.Item.videos?.L || [];
      const videoIds = currentVideos.map((v) => v.S || v);

      if (!videoIds.includes(videoId)) {
        // Add video to user's array
        const updateParams = {
          TableName: DYNAMO_USERS_TABLE,
          Key: { user_id: { S: uploadedBy } },
          UpdateExpression:
            "SET videos = list_append(if_not_exists(videos, :empty_list), :video_id)",
          ExpressionAttributeValues: {
            ":empty_list": { L: [] },
            ":video_id": { L: [{ S: videoId }] },
          },
        };
        await dynamoClient.send(new UpdateItemCommand(updateParams));
        console.log("[INFO] Added video to user's array", {
          uploadedBy,
          videoId,
        });
      } else {
        console.log("[INFO] Video already in user's array", {
          uploadedBy,
          videoId,
        });
      }
    } else {
      // User doesn't exist - create record with this video
      console.log("[INFO] User not found, creating user record", {
        uploadedBy,
      });

      const putParams = {
        TableName: DYNAMO_USERS_TABLE,
        Item: {
          user_id: { S: uploadedBy },
          videos: { L: [{ S: videoId }] },
          created_at: { S: new Date().toISOString() },
        },
      };
      await dynamoClient.send(new PutItemCommand(putParams));
      console.log("[INFO] Created user record and added video", {
        uploadedBy,
        videoId,
      });
    }
  } catch (error) {
    console.error("[ERROR] Failed to add video to user's array", {
      error: error.message,
    });
    // Don't throw - this is not critical enough to fail the entire process
  }
}

function extractYouTubeID(url) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname === "youtu.be") {
      return parsedUrl.pathname.slice(1);
    } else if (parsedUrl.hostname.includes("youtube.com")) {
      return parsedUrl.searchParams.get("v");
    }
  } catch (error) {
    console.error("[ERROR] Invalid URL format", { url });
  }
  return null;
}
