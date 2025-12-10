# Guest User Feature - Deployment Guide

This guide provides step-by-step instructions for deploying the Guest User feature to your Clipwise application.

## Overview

The Guest User feature allows users to try the application without creating an account, with the following capabilities:
- **Guest Login**: One-click access without email/password
- **Video Upload Limit**: 3 videos maximum for guest users
- **Seamless Conversion**: Guest videos automatically transfer when upgrading to a real account
- **Session Expiration**: Guest sessions expire after 7 days
- **Security**: Isolated guest accounts with automatic cleanup

---

## Prerequisites

Before deploying, ensure you have:
- [x] AWS CLI configured with appropriate credentials
- [x] Terraform installed (v1.0+)
- [x] Node.js and npm installed
- [x] Access to the AWS account where Clipwise is deployed

---

## Deployment Steps

### Step 1: Package Lambda Functions

First, package all the Lambda functions including the new guest-related ones:

```bash
cd lambda

# Package guest login Lambda
cd guestLogin
npm install
zip -r ../guestLogin.zip .
cd ..

# Package convert guest to user Lambda
cd convertGuestToUser
npm install
zip -r ../convertGuestToUser.zip .
cd ..

# Re-package updated Lambda functions
cd processVideo
zip -r ../processVideo.zip .
cd ..

cd getVideos
zip -r ../getVideos.zip .
cd ..

cd deleteVideo
zip -r ../deleteVideo.zip .
cd ..
```

### Step 2: Deploy Infrastructure with Terraform

Navigate to the terraform directory and deploy the changes:

```bash
cd terraform

# Initialize Terraform (if not already done)
terraform init

# Review the changes
terraform plan

# Apply the changes
terraform apply
```

**What this deploys:**
- New DynamoDB table: `safetube_guest_users`
- New Lambda functions: `guestLogin`, `convertGuestToUser`
- Updated Lambda functions with guest support
- New API Gateway endpoints: `/guest-login`, `/convert-guest`
- Updated CORS headers to include `X-Guest-ID`

### Step 3: Deploy Frontend

Build and deploy the updated frontend:

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to your hosting service (e.g., S3 + CloudFront, Vercel, etc.)
# Example for S3:
aws s3 sync build/ s3://your-frontend-bucket/ --delete
```

### Step 4: Verify Deployment

#### Backend Verification

1. **Test Guest Login Endpoint:**
```bash
curl -X POST https://your-api-gateway-url/prod/guest-login \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "message": "Guest session created successfully",
  "guest_id": "guest_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "max_videos": 3,
  "expires_at": 1234567890,
  "expires_at_iso": "2025-01-15T00:00:00.000Z"
}
```

2. **Verify DynamoDB Table:**
```bash
aws dynamodb describe-table --table-name safetube_guest_users
```

#### Frontend Verification

1. Navigate to your app's auth page
2. Click "Continue as Guest"
3. Verify you're redirected to the app
4. Upload a test video
5. Check that the guest banner appears in "My Videos"

---

## Configuration

### Guest User Limits

To modify the guest video limit, update the following files:

**Backend** ([lambda/guestLogin/index.js:11](lambda/guestLogin/index.js#L11)):
```javascript
const MAX_GUEST_VIDEOS = 3; // Change this value
```

**Backend** ([lambda/processVideo/index.js:20](lambda/processVideo/index.js#L20)):
```javascript
const MAX_GUEST_VIDEOS = 3; // Must match guestLogin value
```

After changing, re-package and redeploy the Lambda functions.

### Session Expiration

To modify guest session duration, update ([lambda/guestLogin/index.js:10](lambda/guestLogin/index.js#L10)):

```javascript
const GUEST_SESSION_DURATION_DAYS = 7; // Change number of days
```

---

## Database Schema

### safetube_guest_users Table

```
Primary Key: guest_id (String)

Attributes:
{
  "guest_id": "guest_<uuid>",
  "videos": ["video_id1", "video_id2"],  // Array of video IDs
  "video_count": 2,                       // Number of videos uploaded
  "max_videos": 3,                        // Maximum allowed videos
  "created_at": "2025-01-08T00:00:00Z",  // ISO timestamp
  "expires_at": 1234567890,              // Unix timestamp (TTL)
  "converted_to_user_id": null,          // Set when converted to real user
  "is_active": true                       // False when converted
}
```

**Indexes:**
- ConvertedUserIndex: GSI on `converted_to_user_id`

**TTL:** Enabled on `expires_at` for automatic cleanup after 7 days

---

## API Endpoints

### New Endpoints

#### POST /guest-login
Creates a new guest session.

**Request:**
```json
{}
```

**Response:**
```json
{
  "guest_id": "guest_abc123",
  "max_videos": 3,
  "expires_at": 1234567890
}
```

#### POST /convert-guest
Converts guest account to real user account (requires authentication).

**Headers:**
```
Authorization: Bearer <id_token>
X-Guest-ID: <guest_id>
```

**Response:**
```json
{
  "message": "Guest account successfully converted",
  "videos_transferred": 2,
  "user_id": "cognito_user_id"
}
```

### Updated Endpoints

The following endpoints now support guest users via the `X-Guest-ID` header:

- **POST /process** - Upload video
- **GET /videos** - Get user's videos
- **DELETE /videos/{video_id}** - Delete video

---

## Guest User Flow

### 1. Guest Login
```
User clicks "Continue as Guest"
  ↓
Frontend calls POST /guest-login
  ↓
Backend creates guest session in DynamoDB
  ↓
Returns guest_id and session info
  ↓
Frontend stores in localStorage:
  - guest_id
  - is_guest = "true"
```

### 2. Guest Video Upload
```
Guest uploads video
  ↓
Frontend sends X-Guest-ID header
  ↓
Backend checks guest video count
  ↓
If under limit:
  - Process video
  - Increment video_count
  - Add to guest's videos array
  ↓
If at limit:
  - Return 403 error
  - Frontend shows "Create Account" prompt
```

### 3. Guest to User Conversion
```
Guest clicks "Sign Up"
  ↓
User creates account with email/password
  ↓
Frontend detects is_guest=true
  ↓
After successful signup & login:
  - Call POST /convert-guest with:
    - Authorization header (new user token)
    - X-Guest-ID header
  ↓
Backend:
  - Updates all guest videos → uploaded_by = new_user_id
  - Adds videos to new user's account
  - Marks guest account as converted
  ↓
User now has all guest videos in their account
```

---

## Security Considerations

### Guest Isolation
- Each guest gets a unique `guest_id` UUID
- Guest sessions cannot access other guests' videos
- `uploaded_by` field in videos table ensures ownership

### Session Expiration
- DynamoDB TTL automatically deletes expired guest sessions
- 7-day default expiration
- Guest videos remain but become inaccessible after expiration

### Conversion Safety
- Backend verifies both `guest_id` and `user_id` during conversion
- Atomic updates prevent race conditions
- Prevents double-conversion with `converted_to_user_id` check

### Rate Limiting
Consider adding rate limiting on `/guest-login` to prevent abuse:
- Implement API Gateway throttling
- Add IP-based rate limiting
- Monitor guest account creation patterns

---

## Monitoring & Troubleshooting

### CloudWatch Metrics to Monitor

1. **Guest Login Rate**
   - Metric: `guestLogin` Lambda invocations
   - Alert if spike indicates abuse

2. **Guest Conversion Rate**
   - Track `convertGuestToUser` invocations
   - Measure conversion funnel effectiveness

3. **Guest Video Uploads**
   - Filter `processVideo` logs for guest IDs
   - Monitor for limit violations

### Common Issues

#### Issue: "Guest session not found or expired"
**Cause**: Guest session TTL expired or localStorage cleared
**Solution**: User must create new guest session or sign up

#### Issue: Guest videos don't transfer after signup
**Causes**:
1. `guest_id` cleared from localStorage before conversion
2. Network error during conversion API call

**Solution**:
- Check browser console for errors
- Verify `/convert-guest` endpoint is reachable
- Check CloudWatch logs for conversion Lambda

#### Issue: Guest can upload more than 3 videos
**Causes**:
1. `video_count` not incrementing properly
2. Frontend bypassing limit check

**Solution**:
- Check DynamoDB guest record `video_count` field
- Verify backend increments count in `processVideo` Lambda
- Review CloudWatch logs for errors

---

## Testing Checklist

- [ ] Guest can click "Continue as Guest" and access app
- [ ] Guest can upload up to 3 videos
- [ ] Guest limit banner shows correct count
- [ ] Guest limit banner shows warning at 3/3 videos
- [ ] Guest cannot upload 4th video (receives error)
- [ ] Guest can sign up while still a guest
- [ ] After signup, guest videos appear in new account
- [ ] Guest video count transfers correctly
- [ ] Guest banner disappears after conversion
- [ ] New user can upload unlimited videos
- [ ] Expired guest sessions are cleaned up automatically

---

## Rollback Plan

If issues occur, rollback with:

```bash
# Rollback Terraform changes
cd terraform
terraform apply -target=aws_api_gateway_deployment.deployment

# Or full rollback to previous state
terraform apply -var-file=previous.tfvars

# Rollback frontend
cd frontend
git checkout <previous-commit>
npm run build
aws s3 sync build/ s3://your-frontend-bucket/ --delete
```

---

## Performance Optimization

### DynamoDB Optimization
- **On-Demand Billing**: Already configured for automatic scaling
- **TTL**: Enabled for automatic cleanup, no manual intervention needed

### Lambda Optimization
- All Lambda functions use 128-256MB memory
- Timeout: 30 seconds (sufficient for guest operations)
- Consider increasing memory if guest login is slow

### API Gateway Optimization
- Enable caching for `/videos` endpoint if needed
- Monitor throttling metrics
- Consider CloudFront in front of API Gateway

---

## Cost Estimation

**Additional Monthly Costs** (assuming 1000 guests/month):

| Service | Usage | Estimated Cost |
|---------|-------|----------------|
| DynamoDB (guest_users table) | 1000 writes, 3000 reads, 0.5GB storage | ~$1.50 |
| Lambda (guestLogin) | 1000 invocations | ~$0.00 |
| Lambda (convertGuestToUser) | 200 conversions | ~$0.00 |
| API Gateway | 5000 requests | ~$0.02 |
| **Total** | | **~$1.52/month** |

*Costs are estimates and may vary based on actual usage*

---

## Support & Maintenance

### Monitoring Dashboard
Set up CloudWatch dashboard to track:
- Guest login attempts
- Guest-to-user conversion rate
- Average videos per guest
- Session expiration rate

### Regular Maintenance
- Review DynamoDB TTL settings quarterly
- Monitor guest abuse patterns
- Adjust video limits based on usage data
- Review and optimize Lambda function costs

---

## Additional Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [DynamoDB TTL Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)
- [API Gateway CORS Configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)
- [Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)

---

## Completion Checklist

- [x] Backend Lambda functions implemented
- [x] DynamoDB guest_users table configured
- [x] API Gateway endpoints added
- [x] Frontend guest login UI enabled
- [x] Guest limit tracking implemented
- [x] Guest-to-user conversion flow working
- [x] Documentation completed

**Deployment Date**: _____________

**Deployed By**: _____________

**Production URL**: _____________

---

**Questions or Issues?** Open an issue in the repository or contact the development team.
