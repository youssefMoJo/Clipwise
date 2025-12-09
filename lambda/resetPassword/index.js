const {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
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
  console.log("Reset Password Request:", JSON.stringify(event, null, 2));

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
    const { email, code, newPassword } = body;

    // Validate required fields
    if (!email || !code || !newPassword) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Email, verification code, and new password are required",
        }),
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

    // Validate password requirements (matching Cognito policy)
    if (newPassword.length < 8) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Password must be at least 8 characters long",
        }),
      };
    }

    // Check for required character types based on Cognito policy
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasLowercase || !hasNumber) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error:
            "Password must contain at least one lowercase letter and one number",
        }),
      };
    }

    // Confirm forgot password with verification code
    const command = new ConfirmForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    });

    await cognito.send(command);

    console.log(`Password successfully reset for: ${email}`);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Password reset successful. You can now log in with your new password",
      }),
    };
  } catch (error) {
    console.error("Reset Password Error:", error);

    // Handle specific Cognito errors
    if (error.name === "CodeMismatchException") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Invalid verification code. Please try again",
        }),
      };
    }

    if (error.name === "ExpiredCodeException") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Verification code has expired. Please request a new one",
        }),
      };
    }

    if (error.name === "UserNotFoundException") {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "User not found",
        }),
      };
    }

    if (error.name === "InvalidPasswordException") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Password does not meet requirements",
        }),
      };
    }

    if (error.name === "LimitExceededException") {
      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Too many attempts. Please try again later",
        }),
      };
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Failed to reset password",
      }),
    };
  }
};
