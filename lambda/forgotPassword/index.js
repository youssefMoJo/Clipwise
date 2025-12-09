const {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "ca-central-1",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

exports.handler = async (event) => {
  console.log("Forgot Password Request:", JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "OK" }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { email } = body;

    // Validate email
    if (!email) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Email is required" }),
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Invalid email format" }),
      };
    }

    // Initiate forgot password flow in Cognito
    const command = new ForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
    });

    await cognito.send(command);

    console.log(`Password reset code sent to: ${email}`);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Password reset code sent to your email",
      }),
    };
  } catch (error) {
    console.error("Forgot Password Error:", error);

    // Handle specific Cognito errors
    if (error.name === "UserNotFoundException") {
      // Return success even if user not found (security best practice)
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "If an account exists, a password reset code has been sent",
        }),
      };
    }

    if (error.name === "InvalidParameterException") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Invalid email or account not verified",
        }),
      };
    }

    if (error.name === "LimitExceededException") {
      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Too many requests. Please try again later",
        }),
      };
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Failed to process forgot password request",
      }),
    };
  }
};
