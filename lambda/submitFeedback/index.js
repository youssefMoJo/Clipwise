import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const dynamoClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(dynamoClient);

const FEEDBACK_TABLE = process.env.DYNAMO_FEEDBACK_TABLE;

// Decode JWT token (without verification since API Gateway already verified it)
function decodeJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const payload = Buffer.from(parts[1], "base64").toString("utf8");
    return JSON.parse(payload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { message, email, rating } = body;

    // Validate input
    if (!message || message.trim().length === 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Feedback message is required",
        }),
      };
    }

    // Validate message length
    if (message.length > 5000) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Feedback message is too long (max 5000 characters)",
        }),
      };
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Rating must be between 1 and 5",
        }),
      };
    }

    // Extract user information from headers
    const authHeader = event.headers.Authorization || event.headers.authorization;
    const guestId = event.headers["X-Guest-ID"] || event.headers["x-guest-id"];

    let userId = null;
    let userType = "anonymous";
    let userEmail = null;

    // Check if authenticated user or guest
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = decodeJWT(token);

      if (decoded) {
        userId = decoded.sub || decoded["cognito:username"];
        userEmail = decoded.email;
        userType = "authenticated";
      }
    } else if (guestId) {
      userId = guestId;
      userType = "guest";
    }

    const feedbackId = randomUUID();
    const timestamp = new Date().toISOString();

    // Create feedback item
    const feedbackItem = {
      feedback_id: feedbackId,
      created_at: timestamp,
      message: message.trim(),
      user_type: userType,
      user_id: userId,
      user_email: userEmail,
      email: email || userEmail || null, // Use provided email or user's email from token
      rating: rating || null,
    };

    // Save to DynamoDB
    await ddb.send(
      new PutCommand({
        TableName: FEEDBACK_TABLE,
        Item: feedbackItem,
      })
    );

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Feedback submitted successfully",
        feedback_id: feedbackId,
      }),
    };
  } catch (err) {
    console.error("Submit feedback error:", err);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Error submitting feedback",
        error: err.message || "Unknown error",
      }),
    };
  }
};
