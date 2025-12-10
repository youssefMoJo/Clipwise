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
const GUEST_TABLE = "safetube_guest_users";

// Extract user_id from Cognito JWT token
function getUserIdFromEvent(event) {
  // First, check if API Gateway Cognito authorizer already validated the token
  const claims = event.requestContext?.authorizer?.claims;
  if (claims && claims.sub) {
    return claims.sub;
  }

  // If no authorizer context, manually decode the JWT from Authorization header
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
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
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }

    // Decode the payload (second part)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));

    // Return the user ID from the 'sub' claim
    return payload.sub || null;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
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

    const userTable = isGuest ? GUEST_TABLE : USERS_TABLE;
    const userKey = isGuest ? { guest_id: guestId } : { user_id: userId };

    // Get user/guest record from DynamoDB
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

    const videoIds = userResult.Item.videos || [];
    const videoCount = isGuest ? userResult.Item.video_count || 0 : videoIds.length;

    // If no videos, return empty array with guest info
    if (videoIds.length === 0) {
      const responseBody = {
        videos: [],
      };

      // Add guest-specific metadata
      if (isGuest) {
        responseBody.guest_info = {
          video_count: 0,
          max_videos: userResult.Item.max_videos || 3,
          videos_remaining: (userResult.Item.max_videos || 3) - 0,
        };
      }

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(responseBody),
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

    const responseBody = {
      videos: videos,
    };

    // Add guest-specific metadata
    if (isGuest) {
      const maxVideos = userResult.Item.max_videos || 3;
      responseBody.guest_info = {
        video_count: videoCount,
        max_videos: maxVideos,
        videos_remaining: Math.max(0, maxVideos - videoCount),
        limit_reached: videoCount >= maxVideos,
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(responseBody),
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

