import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const dynamoClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

const USERS_TABLE = process.env.DYNAMO_USERS_TABLE;
const VIDEOS_TABLE = process.env.DYNAMO_VIDEOS_TABLE;
const TRANSCRIBE_OUTPUT_BUCKET = process.env.TRANSCRIBE_OUTPUT_BUCKET;

// Extract user_id from Cognito JWT token
function getUserIdFromEvent(event) {
  const claims = event.requestContext?.authorizer?.claims;
  if (claims && claims.sub) {
    return claims.sub;
  }
  return null;
}

// Stream S3 object to string
async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}

export const handler = async (event) => {
  try {
    // Get user_id from JWT token
    const userId = getUserIdFromEvent(event);

    if (!userId) {
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Unauthorized - user ID not found in token",
        }),
      };
    }

    // Get video_id from path parameters
    const videoId = event.pathParameters?.video_id;

    if (!videoId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Video ID is required",
        }),
      };
    }

    // Verify user owns this video
    const userResult = await ddb.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { user_id: userId },
      })
    );

    if (!userResult.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "User not found",
        }),
      };
    }

    const userVideos = userResult.Item.videos || [];

    if (!userVideos.includes(videoId)) {
      return {
        statusCode: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Access denied - you do not have access to this video",
        }),
      };
    }

    // Get video metadata from DynamoDB
    const videoResult = await ddb.send(
      new GetCommand({
        TableName: VIDEOS_TABLE,
        Key: { video_id: videoId },
      })
    );

    if (!videoResult.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Video not found",
        }),
      };
    }

    const video = videoResult.Item;
    const insightsS3Key = video.insights_s3_key;

    // If no insights S3 key, return video metadata without insights
    if (!insightsS3Key) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          video_id: video.video_id,
          title: video.title,
          picture: video.picture,
          duration: video.duration,
          youtube_link: video.youtube_link,
          status: video.status,
          created_at: video.created_at,
          insights: null,
          message: "Video processing not yet complete",
        }),
      };
    }

    // Fetch normalized insights JSON from S3
    let insights = null;
    try {
      const s3Object = await s3Client.send(
        new GetObjectCommand({
          Bucket: TRANSCRIBE_OUTPUT_BUCKET,
          Key: insightsS3Key,
        })
      );

      const insightsContent = await streamToString(s3Object.Body);
      insights = JSON.parse(insightsContent);
    } catch (s3Err) {
      console.error("Error fetching insights from S3:", s3Err);
      // Return video metadata even if insights fetch fails
      insights = null;
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        video_id: video.video_id,
        title: video.title,
        picture: video.picture,
        duration: video.duration,
        youtube_link: video.youtube_link,
        status: video.status,
        created_at: video.created_at,
        insights: insights,
      }),
    };
  } catch (err) {
    console.error("Get video details error:", err);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Error fetching video details",
        error: err.message || "Unknown error",
      }),
    };
  }
};

