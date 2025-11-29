import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(dynamoClient);

const USERS_TABLE = process.env.DYNAMO_USERS_TABLE;
const VIDEOS_TABLE = process.env.DYNAMO_VIDEOS_TABLE;

// Extract user_id from Cognito JWT token (from API Gateway authorizer context)
function getUserIdFromEvent(event) {
  // API Gateway Cognito authorizer adds the user info in requestContext
  const claims = event.requestContext?.authorizer?.claims;
  if (claims && claims.sub) {
    return claims.sub;
  }
  
  // Fallback: try to extract from Authorization header if needed
  // This shouldn't be necessary with Cognito authorizer, but just in case
  return null;
}

export const handler = async (event) => {
  try {
    // Get user_id from JWT token (set by Cognito authorizer)
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

    // Get user record from DynamoDB
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

    const videoIds = userResult.Item.videos || [];

    // If no videos, return empty array
    if (videoIds.length === 0) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          videos: [],
        }),
      };
    }

    // Fetch video metadata for each video_id
    // Note: DynamoDB BatchGetItem would be more efficient, but for simplicity
    // we'll use individual GetItem calls
    const videoPromises = videoIds.map((videoId) =>
      ddb.send(
        new GetCommand({
          TableName: VIDEOS_TABLE,
          Key: { video_id: videoId },
        })
      )
    );

    const videoResults = await Promise.all(videoPromises);

    // Map results to video metadata (exclude insights JSON, just return metadata)
    const videos = videoResults
      .filter((result) => result.Item) // Filter out any missing videos
      .map((result) => {
        const item = result.Item;
        return {
          video_id: item.video_id,
          title: item.title,
          picture: item.picture,
          duration: item.duration,
          youtube_link: item.youtube_link,
          status: item.status,
          created_at: item.created_at,
          insights_s3_key: item.insights_s3_key, // Include S3 key for reference
        };
      });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        videos: videos,
      }),
    };
  } catch (err) {
    console.error("Get videos error:", err);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Error fetching videos",
        error: err.message || "Unknown error",
      }),
    };
  }
};

