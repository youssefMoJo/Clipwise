// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "http://localhost:3000", // Local development
  "https://clipwise-cc40d.web.app", // Firebase hosting
  "https://clipwise-cc40d.firebaseapp.com", // Firebase hosting alternative
];

export const getCorsHeaders = (origin) => {
  // Check if the origin is in the allowed list
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Guest-ID",
    "Access-Control-Allow-Methods": "POST,OPTIONS,GET,DELETE",
  };
};

// Default CORS headers for backwards compatibility
export const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://clipwise-cc40d.web.app",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Guest-ID",
  "Access-Control-Allow-Methods": "POST,OPTIONS,GET,DELETE",
};
