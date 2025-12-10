/**
 * API Service Layer
 * Handles all HTTP requests to the backend with authentication and error handling
 */

import {
  API_BASE_URL,
  API_ENDPOINTS,
  HTTP_METHODS,
  REQUEST_TIMEOUT,
  ERROR_MESSAGES,
} from "../config/api";

/**
 * Check if token is expired or will expire soon (within 5 minutes)
 */
const isTokenExpiringSoon = () => {
  const expiresAt = localStorage.getItem("token_expires_at");
  if (!expiresAt) return true;

  const expiryTime = parseInt(expiresAt, 10);
  const currentTime = Date.now();
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

  return currentTime >= expiryTime - fiveMinutes;
};

/**
 * Refresh access and ID tokens using refresh token
 */
const refreshTokens = async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REFRESH_TOKEN}`, {
      method: HTTP_METHODS.POST,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Token refresh failed");
    }

    // Update tokens in localStorage
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("id_token", data.id_token);

    // Calculate and store expiration time (expires_in is in seconds)
    const expiresAt = Date.now() + (data.expires_in * 1000);
    localStorage.setItem("token_expires_at", expiresAt.toString());

    return data;
  } catch (error) {
    // If refresh fails, clear all tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_expires_at");
    throw error;
  }
};

/**
 * Get authentication headers based on user session
 */
const getAuthHeaders = async () => {
  const headers = {
    "Content-Type": "application/json",
  };

  const isGuest = localStorage.getItem("is_guest") === "true";
  const guestId = localStorage.getItem("guest_id");
  const idToken = localStorage.getItem("id_token");

  // Add guest header if guest ID exists
  if (guestId) {
    headers["X-Guest-ID"] = guestId;
  }

  // Add authorization header if ID token exists
  if (idToken) {
    // Check if token needs refresh (only for non-guest or converting guest users)
    if (!isGuest && isTokenExpiringSoon()) {
      try {
        await refreshTokens();
      } catch (error) {
        console.error("Token refresh failed:", error);
        // Let the request proceed with expired token, 401 handler will catch it
      }
    }

    headers["Authorization"] = `Bearer ${idToken}`;
  }

  return headers;
};

/**
 * Generic API request handler with timeout and error handling
 */
const apiRequest = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error status codes
      if (response.status === 401) {
        // Unauthorized - clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("id_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("token_expires_at");
        localStorage.removeItem("is_guest");
        localStorage.removeItem("guest_id");
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }

      throw new Error(
        data.error || data.message || ERROR_MESSAGES.SERVER_ERROR
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
    }

    if (!navigator.onLine) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    throw error;
  }
};

// ============================================================================
// Authentication API
// ============================================================================

/**
 * Sign up a new user
 * Note: Signup doesn't use guest headers to avoid CORS issues
 */
export const signUp = async (email, password) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SIGN_UP}`, {
      method: HTTP_METHODS.POST,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || data.message || ERROR_MESSAGES.SERVER_ERROR
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
    }

    if (!navigator.onLine) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    throw error;
  }
};

/**
 * Log in an existing user
 * Note: Login doesn't use guest headers to avoid CORS issues
 */
export const logIn = async (email, password) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOG_IN}`, {
      method: HTTP_METHODS.POST,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || data.message || ERROR_MESSAGES.SERVER_ERROR
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
    }

    if (!navigator.onLine) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    throw error;
  }
};

/**
 * Request password reset code
 */
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORGOT_PASSWORD}`, {
    method: HTTP_METHODS.POST,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to send reset code");
  }

  return data;
};

/**
 * Reset password with verification code
 */
export const resetPassword = async (email, code, newPassword) => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RESET_PASSWORD}`, {
    method: HTTP_METHODS.POST,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, code, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to reset password");
  }

  return data;
};

/**
 * Create a guest session
 */
export const guestLogin = async () => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GUEST_LOGIN}`, {
    method: HTTP_METHODS.POST,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create guest session");
  }

  return data;
};

/**
 * Convert guest account to real user account
 * Must be called after user signs up
 */
export const convertGuestToUser = async () => {
  return apiRequest(API_ENDPOINTS.CONVERT_GUEST, {
    method: HTTP_METHODS.POST,
  });
};

// ============================================================================
// Video API
// ============================================================================

/**
 * Process a new video URL
 */
export const processVideo = async (videoUrl) => {
  return apiRequest(API_ENDPOINTS.PROCESS_VIDEO, {
    method: HTTP_METHODS.POST,
    body: JSON.stringify({ youtube_link: videoUrl }),
  });
};

/**
 * Get all videos for the current user
 */
export const getVideos = async () => {
  return apiRequest(API_ENDPOINTS.GET_VIDEOS, {
    method: HTTP_METHODS.GET,
  });
};

/**
 * Get details for a specific video
 */
export const getVideoDetails = async (videoId) => {
  return apiRequest(`${API_ENDPOINTS.GET_VIDEO_DETAILS}/${videoId}`, {
    method: HTTP_METHODS.GET,
  });
};

/**
 * Delete a video
 */
export const deleteVideo = async (videoId) => {
  return apiRequest(`${API_ENDPOINTS.DELETE_VIDEO}/${videoId}`, {
    method: HTTP_METHODS.DELETE,
  });
};

// ============================================================================
// User API
// ============================================================================

/**
 * Get user profile information
 */
export const getUserProfile = async () => {
  return apiRequest(API_ENDPOINTS.GET_USER_PROFILE, {
    method: HTTP_METHODS.GET,
  });
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return (
    localStorage.getItem("id_token") ||
    localStorage.getItem("is_guest") === "true"
  );
};

/**
 * Check if user is a guest
 */
export const isGuestUser = () => {
  return localStorage.getItem("is_guest") === "true";
};

/**
 * Log out the current user
 */
export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("id_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token_expires_at");
  localStorage.removeItem("is_guest");
  localStorage.removeItem("guest_id");
};

// ============================================================================
// Feedback API
// ============================================================================

/**
 * Submit user feedback
 */
export const submitFeedback = async ({ message, email, rating }) => {
  return apiRequest(API_ENDPOINTS.SUBMIT_FEEDBACK, {
    method: HTTP_METHODS.POST,
    body: JSON.stringify({ message, email, rating }),
  });
};
