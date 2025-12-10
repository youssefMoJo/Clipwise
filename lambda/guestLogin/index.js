import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const GUEST_TABLE = "safetube_guest_users";
const GUEST_SESSION_DURATION_DAYS = 7; // Guest sessions expire after 7 days
const MAX_GUEST_VIDEOS = 3; // Maximum videos a guest can upload

export const handler = async (event) => {
  try {
    // Generate unique guest ID
    const guestId = `guest_${randomUUID()}`;
    const now = Date.now();
    const expiresAt =
      Math.floor(now / 1000) + GUEST_SESSION_DURATION_DAYS * 24 * 60 * 60; // Unix timestamp for TTL

    // Create guest user record in DynamoDB
    const guestUser = {
      guest_id: guestId,
      videos: [], // Array to track uploaded video IDs
      video_count: 0, // Track number of videos
      max_videos: MAX_GUEST_VIDEOS,
      created_at: new Date(now).toISOString(),
      expires_at: expiresAt,
      converted_to_user_id: null, // Will be set when guest converts to real user
      is_active: true,
    };

    await docClient.send(
      new PutCommand({
        TableName: GUEST_TABLE,
        Item: guestUser,
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Guest session created successfully",
        guest_id: guestId,
        max_videos: MAX_GUEST_VIDEOS,
        expires_at: expiresAt,
        expires_at_iso: new Date(expiresAt * 1000).toISOString(),
      }),
    };
  } catch (err) {
    console.error("Guest login error:", err);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Error creating guest session",
        error: err.message || "Unknown error",
      }),
    };
  }
};
