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
 * Get authentication headers based on user session
 */
const getAuthHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  const isGuest = localStorage.getItem("is_guest") === "true";

  if (isGuest) {
    const guestId = localStorage.getItem("guest_id");
    if (guestId) {
      headers["X-Guest-ID"] = guestId;
    }
  } else {
    const idToken = localStorage.getItem("id_token");
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
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
 */
export const signUp = async (email, password) => {
  return apiRequest(API_ENDPOINTS.SIGN_UP, {
    method: HTTP_METHODS.POST,
    body: JSON.stringify({ email, password }),
  });
};

/**
 * Log in an existing user
 */
export const logIn = async (email, password) => {
  return apiRequest(API_ENDPOINTS.LOG_IN, {
    method: HTTP_METHODS.POST,
    body: JSON.stringify({ email, password }),
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
  localStorage.removeItem("is_guest");
  localStorage.removeItem("guest_id");
};
