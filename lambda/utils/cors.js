export const corsHeaders = {
  "Content-Type": "application/json",

  // ✅ For development
  "Access-Control-Allow-Origin": "http://localhost:3000",

  // 🔒 When you go to prod, replace with:
  // "Access-Control-Allow-Origin": "https://clipwise.app",

  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS,GET,DELETE",
};
