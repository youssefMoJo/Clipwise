# API Integration Guide

This document explains how the frontend integrates with the backend API.

## Architecture Overview

The frontend uses a layered architecture for API communication:

```
Components → API Service Layer → API Config → Backend
```

### Files Structure

```
frontend/src/
├── config/
│   └── api.js           # API endpoints and configuration
├── services/
│   └── api.js           # API service layer with all HTTP requests
└── components/
    ├── Auth.js          # Authentication component
    ├── AddVideo.js      # Video submission component
    ├── MyVideos.jsx     # Videos list component
    └── VideoInsights.js # Video insights display component
```

## Setup

### 1. Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
cp .env.example .env
```

Update the `REACT_APP_API_URL` with your actual API Gateway URL:

```env
REACT_APP_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
```

To get your API URL:

```bash
cd ../terraform
terraform output api_invoke_url
```

### 2. Configuration

The API configuration is centralized in `src/config/api.js`:

- **API_BASE_URL**: Base URL for all API requests
- **API_ENDPOINTS**: Object containing all endpoint paths
- **HTTP_METHODS**: Standard HTTP methods
- **ERROR_MESSAGES**: Centralized error messages

## API Service Layer

The `src/services/api.js` file provides functions for all API operations:

### Authentication

```javascript
import { signUp, logIn } from '../services/api';

// Sign up a new user
await signUp(email, password);

// Log in an existing user
const data = await logIn(email, password);
```

### Video Operations

```javascript
import { processVideo, getVideos, getVideoDetails, deleteVideo } from '../services/api';

// Process a new video
await processVideo(videoUrl);

// Get all videos for the current user
const videos = await getVideos();

// Get details for a specific video
const videoDetails = await getVideoDetails(videoId);

// Delete a video
await deleteVideo(videoId);
```

### Utility Functions

```javascript
import { isAuthenticated, isGuestUser, logout } from '../services/api';

// Check if user is authenticated
if (isAuthenticated()) {
  // User is logged in or is a guest
}

// Check if user is a guest
if (isGuestUser()) {
  // User is using guest mode
}

// Log out
logout(); // Clears all tokens and session data
```

## Authentication

The app supports two authentication modes:

### 1. Regular User Authentication

- Users sign up with email and password
- Tokens are stored in localStorage:
  - `access_token`: JWT access token
  - `id_token`: Identity token
  - `refresh_token`: Token for refreshing access

### 2. Guest Mode

- Users can continue without creating an account
- A unique guest ID is generated and stored
- Guest ID is sent as `X-Guest-ID` header with requests

### Authorization Headers

The API service automatically adds the correct headers:

**For authenticated users:**
```
Authorization: Bearer <access_token>
```

**For guest users:**
```
X-Guest-ID: <guest_id>
```

## Error Handling

All API requests include comprehensive error handling:

1. **Network Errors**: Detected when offline
2. **Timeout Errors**: Requests timeout after 30 seconds
3. **Authorization Errors** (401): Automatically clears tokens and redirects
4. **Server Errors**: Displays error messages from backend
5. **Validation Errors**: Shows input validation errors

Example error handling in components:

```javascript
try {
  const data = await processVideo(videoUrl);
  // Handle success
} catch (error) {
  // Error message is automatically formatted
  setError(error.message);
}
```

## Backend Response Format

### Process Video Response
```json
{
  "video_id": "abc123",
  "status": "processing",
  "message": "Video is being processed"
}
```

### Get Videos Response
```json
{
  "videos": [
    {
      "id": "abc123",
      "title": "Video Title",
      "thumbnail": "https://...",
      "duration": 120,
      "status": "ready|processing|failed",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Video Details Response
```json
{
  "id": "abc123",
  "title": "Video Title",
  "insights": {
    "lessons": [...],
    "quotes": [...],
    "mindset_shifts": [...],
    "reflection_questions": [...],
    "mistakes_or_warnings": [...],
    "emotional_tone": "Motivational",
    "category": "Personal Development",
    "tags": ["success", "motivation"]
  }
}
```

## Testing

To test the API integration:

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Test authentication:**
   - Try signing up with a new email
   - Try logging in with existing credentials
   - Try guest mode

3. **Test video operations:**
   - Submit a video URL
   - View your videos list
   - Click on a video to see insights

4. **Check browser console:**
   - All API requests are logged
   - Errors are displayed with details

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check that your API Gateway has CORS enabled
2. Verify the API URL in `.env` is correct
3. Ensure you're using HTTPS (not HTTP)

### Authentication Errors

If authentication fails:
1. Check that Cognito is properly configured
2. Verify tokens are being stored in localStorage
3. Check browser console for detailed error messages

### Video Processing Errors

If video processing fails:
1. Verify the video URL is valid
2. Check that the Lambda function is deployed
3. Check CloudWatch logs for backend errors

## Production Deployment

Before deploying to production:

1. **Update environment variables:**
   ```bash
   # Set production API URL
   REACT_APP_API_URL=https://prod-api.example.com/prod
   ```

2. **Build the app:**
   ```bash
   npm run build
   ```

3. **Deploy to S3/CloudFront:**
   Follow your deployment pipeline

## Security Considerations

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Tokens are stored in localStorage** - Clear on logout
3. **HTTPS only** - API requests upgrade HTTP to HTTPS
4. **Request timeout** - Prevents hanging requests
5. **Guest isolation** - Guest users have separate data space

## Need Help?

- Check the browser console for detailed error messages
- Review CloudWatch logs for backend issues
- Ensure all environment variables are set correctly
- Verify Terraform infrastructure is deployed
