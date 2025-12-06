import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({});

const CLIENT_ID = process.env.CLIENT_ID;

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { refresh_token } = body;

    // Validate input
    if (!refresh_token) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Refresh token is required",
        }),
      };
    }

    // Refresh tokens with Cognito
    const authResponse = await cognitoClient.send(
      new InitiateAuthCommand({
        ClientId: CLIENT_ID,
        AuthFlow: "REFRESH_TOKEN_AUTH",
        AuthParameters: {
          REFRESH_TOKEN: refresh_token,
        },
      })
    );

    const accessToken = authResponse.AuthenticationResult?.AccessToken;
    const idToken = authResponse.AuthenticationResult?.IdToken;
    const expiresIn = authResponse.AuthenticationResult?.ExpiresIn;

    if (!accessToken || !idToken) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Token refresh failed - no tokens received",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Token refresh successful",
        access_token: accessToken,
        id_token: idToken,
        expires_in: expiresIn,
        token_type: "Bearer",
      }),
    };
  } catch (err) {
    console.error("Token refresh error:", err);

    // Handle Cognito errors
    if (err.name === "NotAuthorizedException") {
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Invalid or expired refresh token. Please log in again.",
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
        message: "Error during token refresh",
        error: err.message || "Unknown error",
      }),
    };
  }
};
