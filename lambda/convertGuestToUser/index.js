import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
  BatchWriteCommand
} from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const GUEST_TABLE = "safetube_guest_users";
const USER_TABLE = "safetube_users";
const VIDEO_TABLE = "safetube_videos";

export const handler = async (event) => {
  try {
    // Extract guest_id from headers
    const guestId = event.headers?.["X-Guest-ID"] || event.headers?.["x-guest-id"];

    // Extract user_id from JWT token (set by Cognito authorizer)
    const userId = event.requestContext?.authorizer?.claims?.sub;

    if (!guestId || !userId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Guest ID and authenticated user required",
        }),
      };
    }

    // 1. Get guest user data
    const guestResponse = await docClient.send(
      new GetCommand({
        TableName: GUEST_TABLE,
        Key: { guest_id: guestId },
      })
    );

    if (!guestResponse.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Guest session not found",
        }),
      };
    }

    const guestUser = guestResponse.Item;

    // Check if already converted
    if (guestUser.converted_to_user_id) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Guest account already converted",
          converted_to: guestUser.converted_to_user_id,
        }),
      };
    }

    const guestVideos = guestUser.videos || [];

    // 2. Update all guest videos to be owned by the new user
    if (guestVideos.length > 0) {
      const updatePromises = guestVideos.map((videoId) =>
        docClient.send(
          new UpdateCommand({
            TableName: VIDEO_TABLE,
            Key: { video_id: videoId },
            UpdateExpression: "SET uploaded_by = :userId",
            ExpressionAttributeValues: {
              ":userId": userId,
            },
          })
        )
      );

      await Promise.all(updatePromises);

      // 3. Add videos to the new user's account
      await docClient.send(
        new UpdateCommand({
          TableName: USER_TABLE,
          Key: { user_id: userId },
          UpdateExpression: "SET videos = list_append(if_not_exists(videos, :empty), :guestVideos)",
          ExpressionAttributeValues: {
            ":empty": [],
            ":guestVideos": guestVideos,
          },
        })
      );
    }

    // 4. Mark guest account as converted
    await docClient.send(
      new UpdateCommand({
        TableName: GUEST_TABLE,
        Key: { guest_id: guestId },
        UpdateExpression: "SET converted_to_user_id = :userId, is_active = :inactive",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":inactive": false,
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
        message: "Guest account successfully converted",
        videos_transferred: guestVideos.length,
        user_id: userId,
      }),
    };
  } catch (err) {
    console.error("Guest conversion error:", err);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Error converting guest account",
        error: err.message || "Unknown error",
      }),
    };
  }
};
