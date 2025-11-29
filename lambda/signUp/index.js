import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const cognitoClient = new CognitoIdentityProviderClient({});
const dynamoClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(dynamoClient);

const USER_POOL_ID = process.env.USER_POOL_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const USERS_TABLE = process.env.DYNAMO_USERS_TABLE;

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Email and password are required",
        }),
      };
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Invalid email format",
        }),
      };
    }

    // Check if email already exists in Cognito
    try {
      await cognitoClient.send(
        new AdminGetUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: email,
        })
      );
      // User exists
      return {
        statusCode: 409,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Email already registered",
        }),
      };
    } catch (err) {
      // User doesn't exist, which is what we want
      if (err.name !== "UserNotFoundException") {
        throw err;
      }
    }

    // Create user in Cognito using Admin API (auto-confirmed)
    const createUserResponse = await cognitoClient.send(
      new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        UserAttributes: [
          {
            Name: "email",
            Value: email,
          },
          {
            Name: "email_verified",
            Value: "true",
          },
        ],
        MessageAction: "SUPPRESS", // Don't send welcome email
        DesiredDeliveryMediums: [], // Don't send any messages
      })
    );

    // Extract user ID (sub) from the response
    const userId =
      createUserResponse.User?.Attributes?.find((attr) => attr.Name === "sub")
        ?.Value || createUserResponse.User?.Username;

    // Set user password (this also confirms the user)
    await cognitoClient.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        Password: password,
        Permanent: true, // Password is permanent (not temporary)
      })
    );

    // Create user record in DynamoDB
    await ddb.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: {
          user_id: userId,
          email: email,
          videos: [],
          created_at: new Date().toISOString(),
        },
        ConditionExpression: "attribute_not_exists(user_id)", // Ensure atomicity
      })
    );

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "User created successfully",
        user_id: userId,
        email: email,
      }),
    };
  } catch (err) {
    console.error("Sign-up error:", err);

    // Handle Cognito errors
    if (
      err.name === "UsernameExistsException" ||
      err.name === "AliasExistsException"
    ) {
      return {
        statusCode: 409,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Email already registered",
        }),
      };
    }

    if (err.name === "InvalidPasswordException") {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Password does not meet requirements",
        }),
      };
    }

    if (err.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 409,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "User already exists",
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
        message: "Error creating user",
        error: err.message || "Unknown error",
      }),
    };
  }
};
