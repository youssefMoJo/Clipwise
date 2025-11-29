import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(dynamoClient);

const USERS_TABLE = process.env.DYNAMO_USERS_TABLE;

// Extract user_id from Cognito JWT token
function getUserIdFromEvent(event) {
  const claims = event.requestContext?.authorizer?.claims;
  if (claims && claims.sub) {
    return claims.sub;
  }
  return null;
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

    // Get user record
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

    // Check if user owns this video
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

    // Remove video_id from user's videos array (atomic update)
    const updatedVideos = userVideos.filter((id) => id !== videoId);

    await ddb.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { user_id: userId },
        UpdateExpression: "SET videos = :v",
        ExpressionAttributeValues: {
          ":v": updatedVideos,
        },
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Video removed successfully",
        video_id: videoId,
      }),
    };
  } catch (err) {
    console.error("Delete video error:", err);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Error removing video",
        error: err.message || "Unknown error",
      }),
    };
  }
};

