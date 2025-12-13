import axios from "axios";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
// this is the main lambda handler for processing video metadata requests
const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const sqsClient = new SQSClient({});

const RAPID_API_KEY = process.env.RAPID_API_KEY;
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
const VIDEOS_TABLE = process.env.DYNAMO_VIDEOS_TABLE;
const USERS_TABLE = process.env.DYNAMO_USERS_TABLE;
const GUEST_TABLE = "safetube_guest_users";
const MAX_GUEST_VIDEOS = 3;

function extractYouTubeID(url) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname === "youtu.be") {
      return parsedUrl.pathname.slice(1);
    } else if (parsedUrl.hostname.includes("youtube.com")) {
      return parsedUrl.searchParams.get("v");
    }
  } catch (error) {
    console.error("Invalid URL format:", url);
  }
  return null;
}

// Extract user_id from Cognito JWT token
function getUserIdFromEvent(event) {
  // First, check if API Gateway Cognito authorizer already validated the token
  const claims = event.requestContext?.authorizer?.claims;
  if (claims && claims.sub) {
    return claims.sub;
  }

  // If no authorizer context, manually decode the JWT from Authorization header
  const authHeader =
    event.headers?.Authorization || event.headers?.authorization;
  if (!authHeader) {
    return null;
  }

  // Extract token from "Bearer <token>"
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    return null;
  }

  const token = tokenMatch[1];

  try {
    // Decode JWT token (without verification - API Gateway already verified it)
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid JWT token format");
      return null;
    }

    // Decode the payload (second part)
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );

    // Return the user ID from the 'sub' claim
    return payload.sub || null;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
}

// Get guest ID from headers
function getGuestIdFromEvent(event) {
  return event.headers?.["X-Guest-ID"] || event.headers?.["x-guest-id"];
}

export const handler = async (event) => {
  try {
    // Check if this is a guest user or authenticated user
    const userId = getUserIdFromEvent(event);
    const guestId = getGuestIdFromEvent(event);
    const isGuest = !userId && !!guestId;

    // Must have either userId or guestId
    if (!userId && !guestId) {
      console.error("Unauthorized access: no user ID or guest ID found");
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Unauthorized - authentication required",
        }),
      };
    }

    const userIdentifier = userId || guestId;
    const userTable = isGuest ? GUEST_TABLE : USERS_TABLE;

    // For guest users, check video limit
    if (isGuest) {
      const guestData = await ddb.send(
        new GetCommand({
          TableName: GUEST_TABLE,
          Key: { guest_id: guestId },
        })
      );

      if (!guestData.Item) {
        return {
          statusCode: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            message: "Guest session not found or expired",
          }),
        };
      }

      // Check if guest has already converted
      if (guestData.Item.converted_to_user_id) {
        return {
          statusCode: 403,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            message:
              "Guest account has been converted. Please log in with your account.",
          }),
        };
      }

      const guestVideoCount = guestData.Item.video_count || 0;
      if (guestVideoCount >= MAX_GUEST_VIDEOS) {
        return {
          statusCode: 403,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            message:
              "Guest video limit reached. Please create an account to continue.",
            videos_uploaded: guestVideoCount,
            max_videos: MAX_GUEST_VIDEOS,
            limit_reached: true,
          }),
        };
      }
    }

    const body = JSON.parse(event.body);
    const { youtube_link } = body;

    if (!youtube_link) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Missing youtube_link",
        }),
      };
    }

    const youtube_id = extractYouTubeID(youtube_link);
    if (!youtube_id) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Invalid YouTube URL" }),
      };
    }

    const existing = await ddb.send(
      new GetCommand({
        TableName: VIDEOS_TABLE,
        Key: { video_id: youtube_id },
      })
    );

    // Video exists - check status and handle accordingly
    if (existing.Item) {
      if (existing.Item.status === "ready") {
        console.log("Video already processed:", youtube_id);

        // Check if video is already in user's videos array
        const userResult = await ddb.send(
          new GetCommand({
            TableName: userTable,
            Key: isGuest ? { guest_id: guestId } : { user_id: userId },
          })
        );

        const userVideos = userResult.Item?.videos || [];

        if (userVideos.includes(youtube_id)) {
          // Video already in user's library
          return {
            statusCode: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
              message: "Video already in your library",
              video_id: youtube_id,
              status: "ready",
            }),
          };
        }

        // For guests, check if adding this video would exceed limit
        if (isGuest) {
          const currentCount = userResult.Item?.video_count || 0;
          if (currentCount >= MAX_GUEST_VIDEOS) {
            return {
              statusCode: 403,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              body: JSON.stringify({
                message:
                  "Guest video limit reached. Please create an account to continue.",
                videos_uploaded: currentCount,
                max_videos: MAX_GUEST_VIDEOS,
                limit_reached: true,
              }),
            };
          }
        }

        // Video exists but not in user's array - add it (resource reuse)
        const updateExpression = isGuest
          ? "SET videos = list_append(if_not_exists(videos, :empty), :video), video_count = if_not_exists(video_count, :zero) + :one"
          : "SET videos = list_append(if_not_exists(videos, :empty), :video)";

        const expressionValues = isGuest
          ? {
              ":empty": [],
              ":video": [youtube_id],
              ":zero": 0,
              ":one": 1,
            }
          : {
              ":empty": [],
              ":video": [youtube_id],
            };

        await ddb.send(
          new UpdateCommand({
            TableName: userTable,
            Key: isGuest ? { guest_id: guestId } : { user_id: userId },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionValues,
          })
        );

        console.log(
          `Added existing video ${youtube_id} to ${
            isGuest ? "guest" : "user"
          } ${userIdentifier}'s library`
        );

        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            message:
              "Video added to your library (previously processed - no re-processing needed)",
            video_id: youtube_id,
            status: "ready",
          }),
        };
      } else if (
        existing.Item.status === "failed" ||
        existing.Item.status === "failed_permanent"
      ) {
        // Video failed previously - allow retry by updating status and re-queuing
        console.log(
          `Video ${youtube_id} previously failed with status ${existing.Item.status}. Retrying...`
        );

        // Update video status to pending for retry
        await ddb.send(
          new UpdateCommand({
            TableName: VIDEOS_TABLE,
            Key: { video_id: youtube_id },
            UpdateExpression: "SET #status = :pending, retry_count = :zero",
            ExpressionAttributeNames: {
              "#status": "status",
            },
            ExpressionAttributeValues: {
              ":pending": "pending",
              ":zero": 0,
            },
          })
        );

        // Re-queue the video for processing
        const sendMessageParams = {
          QueueUrl: SQS_QUEUE_URL,
          MessageBody: JSON.stringify({
            video_id: youtube_id,
            youtube_link: youtube_link,
            uploaded_by: userIdentifier,
            dynamo_videos_table: VIDEOS_TABLE,
            retry_count: 0,
          }),
        };
        await sqsClient.send(new SendMessageCommand(sendMessageParams));

        console.log(`Retrying failed video ${youtube_id}`);

        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            message: "Video retry initiated (previously failed)",
            video_id: youtube_id,
            status: "pending",
          }),
        };
      } else {
        // Video is currently being processed (pending or processing status)
        console.log("Video is being processed:", youtube_id);
        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            message: "Video is currently being processed",
            video_id: youtube_id,
            status: existing.Item.status,
          }),
        };
      }
    }

    // Call RapidAPI to fetch video metadata
    const response = await axios.get(
      "https://social-media-video-downloader.p.rapidapi.com/youtube/v3/video/details",
      {
        params: {
          videoId: youtube_id,
          renderableFormats: "720p,highres",
          urlAccess: "proxied",
          getTranscript: "false",
        },
        headers: {
          "X-RapidAPI-Key": RAPID_API_KEY,
          "X-RapidAPI-Host": "social-media-video-downloader.p.rapidapi.com",
        },
      }
    );

    const data = response.data;

    // Check video duration - reject if exceeds 10 minutes (600 seconds)
    const durationInSeconds = data.metadata.additionalData.duration;
    const maxDurationSeconds = 20 * 60; // 20 minutes in seconds

    if (durationInSeconds > maxDurationSeconds) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message:
            "Video duration exceeds 20 minutes. Maximum allowed duration is 20 minutes.",
          duration: durationInSeconds,
        }),
      };
    }

    const metadata = {
      video_id: extractYouTubeID(youtube_link),
      title: data.metadata.title,
      picture: data.metadata.thumbnailUrl,
      duration: durationInSeconds,
      youtube_link,
      uploaded_by: userIdentifier, // User ID or Guest ID
      status: "pending", //Track processing lifecycle: pending, processing, done, failed
      created_at: new Date().toISOString(),
    };

    // Save metadata to DynamoDB
    await ddb.send(
      new PutCommand({
        TableName: VIDEOS_TABLE,
        Item: metadata,
      })
    );

    // Add video to user/guest account and increment count for guests
    const updateExpression = isGuest
      ? "SET videos = list_append(if_not_exists(videos, :empty), :video), video_count = if_not_exists(video_count, :zero) + :one"
      : "SET videos = list_append(if_not_exists(videos, :empty), :video)";

    const expressionValues = isGuest
      ? {
          ":empty": [],
          ":video": [metadata.video_id],
          ":zero": 0,
          ":one": 1,
        }
      : {
          ":empty": [],
          ":video": [metadata.video_id],
        };

    await ddb.send(
      new UpdateCommand({
        TableName: userTable,
        Key: isGuest ? { guest_id: guestId } : { user_id: userId },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionValues,
      })
    );

    // Send message to SQS with the video_id for processing
    const sendMessageParams = {
      QueueUrl: SQS_QUEUE_URL,
      MessageBody: JSON.stringify({
        video_id: metadata.video_id,
        youtube_link: metadata.youtube_link,
        uploaded_by: metadata.uploaded_by,
        dynamo_videos_table: VIDEOS_TABLE,
        retry_count: 2,
      }),
    };
    await sqsClient.send(new SendMessageCommand(sendMessageParams));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Video metadata saved and processing job queued",
        video_id: metadata.video_id,
      }),
    };
  } catch (err) {
    console.error("🔥 FULL ERROR:", err);

    if (err.response) {
      console.error("📌 RapidAPI Error Response:", err.response.data);
      return {
        statusCode: err.response.status || 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "RapidAPI request failed",
          status: err.response.status,
          rapidapi_error: err.response.data,
        }),
      };
    }

    if (err.request) {
      console.error("⚠️ RapidAPI No Response:", err.request);
      return {
        statusCode: 504,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "No response from RapidAPI",
          rapidapi_error: "No response received",
        }),
      };
    }

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Error processing video",
        error: err.message || "Unknown error",
      }),
    };
  }
};
