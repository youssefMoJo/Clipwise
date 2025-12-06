/**
 * API Configuration
 * Central configuration for all API endpoints and settings
 */

// Get API base URL from environment variable or use default
export const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://d316q2mwr5.execute-api.ca-central-1.amazonaws.com/prod";

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  SIGN_UP: "/signup",
  LOG_IN: "/login",

  // Video Operations
  PROCESS_VIDEO: "/process",
  GET_VIDEOS: "/videos",
  GET_VIDEO_DETAILS: "/videos",
  DELETE_VIDEO: "/video",

  // User Operations
  GET_USER_PROFILE: "/profile",
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
};

// Request timeout (30 seconds)
export const REQUEST_TIMEOUT = 30000;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  TIMEOUT_ERROR: "Request timeout. Please try again.",
  UNAUTHORIZED: "You are not authorized. Please log in again.",
  SERVER_ERROR: "Server error. Please try again later.",
  INVALID_INPUT: "Invalid input. Please check your data.",
};
