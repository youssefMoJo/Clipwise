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
const GUEST_TABLE = "safetube_guest_users";

// Extract user_id from Cognito JWT token
function getUserIdFromEvent(event) {
  const claims = event.requestContext?.authorizer?.claims;
  if (claims && claims.sub) {
    return claims.sub;
  }
  return null;
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

    const userTable = isGuest ? GUEST_TABLE : USERS_TABLE;
    const userKey = isGuest ? { guest_id: guestId } : { user_id: userId };

    // Get user/guest record
    const userResult = await ddb.send(
      new GetCommand({
        TableName: userTable,
        Key: userKey,
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
          message: isGuest ? "Guest session not found or expired" : "User not found",
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

    // For guests, also decrement video_count
    const updateExpression = isGuest
      ? "SET videos = :v, video_count = if_not_exists(video_count, :zero) - :one"
      : "SET videos = :v";

    const expressionValues = isGuest
      ? {
          ":v": updatedVideos,
          ":zero": 0,
          ":one": 1,
        }
      : {
          ":v": updatedVideos,
        };

    await ddb.send(
      new UpdateCommand({
        TableName: userTable,
        Key: userKey,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionValues,
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

