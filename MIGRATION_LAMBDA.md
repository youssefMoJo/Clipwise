# ECS/Fargate to Lambda Migration Guide

## Overview

This migration replaces the ECS/Fargate-based video processing pipeline with a pure Lambda-based architecture while keeping SQS as the message queue.

## What Changed

### Removed Components
- ❌ ECS Fargate tasks for video processing
- ❌ Audio download with yt-dlp
- ❌ S3 audio storage
- ❌ AWS Transcribe service
- ❌ `triggerECS` Lambda (disabled, not deleted)

### New Components
- ✅ `videoTranscriptWorker` Lambda (Node.js 20)
- ✅ External Transcript API integration
- ✅ Direct OpenAI/RapidAPI integration
- ✅ Built-in retry logic (max 3 attempts)
- ✅ DLQ handling for permanent failures

### Unchanged Components
- ✅ SQS queue (`SafeTube-VideoProcessingQueue`)
- ✅ DynamoDB tables (`safetube_videos`, `safetube_users`)
- ✅ S3 bucket for transcripts and insights
- ✅ `processVideo` Lambda (sends messages to SQS)

## Architecture Flow

### Old Flow (ECS/Fargate)
```
processVideo Lambda → SQS → triggerECS Lambda → ECS Fargate Task
  → yt-dlp download → S3 audio → AWS Transcribe → OpenAI → DynamoDB
```

### New Flow (Lambda-only)
```
processVideo Lambda → SQS → videoTranscriptWorker Lambda
  → Transcript API → OpenAI → S3 (transcript + insights) → DynamoDB
```

## Deployment Steps

### 1. Set Supadata API Key

Add to `terraform/terraform.tfvars`:

```hcl
supadata_api_key = "sd_bcd9b7628785d4b15c2ec716152da184"
```

Or use your own Supadata API key from https://supadata.ai

### 2. Build the Lambda Package

```bash
cd lambda/videoTranscriptWorker
./deploy.sh
```

This will:
- Install dependencies
- Create `videoTranscriptWorker.zip`

### 3. Apply Terraform Changes

```bash
cd ../../terraform
terraform plan
terraform apply
```

This will:
- Create the new `videoTranscriptWorker` Lambda
- Update SQS event source mapping to point to the new Lambda
- Disable (not delete) the old `triggerECS` Lambda

### 4. Verify Deployment

1. Check Lambda function exists:
   ```bash
   aws lambda get-function --function-name videoTranscriptWorker
   ```

2. Check SQS event source mapping:
   ```bash
   aws lambda list-event-source-mappings --function-name videoTranscriptWorker
   ```

3. Monitor CloudWatch Logs:
   ```bash
   aws logs tail /aws/lambda/videoTranscriptWorker --follow
   ```

## Environment Variables

The new Lambda requires these environment variables (automatically set by Terraform):

| Variable | Description | Source |
|----------|-------------|--------|
| `RAPIDAPI_KEY_1` - `RAPIDAPI_KEY_4` | RapidAPI keys for OpenAI | `var.RAPIDAPI_KEY_*` |
| `DYNAMO_VIDEOS_TABLE` | Videos DynamoDB table | `aws_dynamodb_table.safetube_videos.name` |
| `DYNAMO_USERS_TABLE` | Users DynamoDB table | `aws_dynamodb_table.safetube_users.name` |
| `TRANSCRIBE_OUTPUT_BUCKET` | S3 bucket for transcripts/insights | `aws_s3_bucket.transcribe_output_bucket.bucket` |
| `SQS_QUEUE_URL` | Main processing queue URL | `aws_sqs_queue.video_processing_queue.id` |
| `VIDEO_DLQ_URL` | Dead letter queue URL | `aws_sqs_queue.video_dlq.id` |
| `SUPADATA_API_KEY` | Supadata API key for transcript generation | `var.supadata_api_key` |

## SQS Message Format

The Lambda reads the following fields from `event.Records[].body`:

```json
{
  "video_id": "dQw4w9WgXcQ",
  "youtube_link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "uploaded_by": "user-cognito-sub-id",
  "retry_count": 0
}
```

**Important**: All data comes from the SQS message body, NOT from environment variables (except API keys and resource names).

## Processing Steps

The `videoTranscriptWorker` Lambda performs these steps:

1. **Parse SQS message** - Extract `video_id`, `youtube_link`, `uploaded_by`, `retry_count`
2. **Update status to "processing"** - Set DynamoDB video status
3. **Call Supadata API** - Get transcript using Supadata client library
4. **Generate AI insights** - Send transcript to RapidAPI ChatGPT endpoint
5. **Normalize insights** - Ensure consistent JSON structure
6. **Save transcript to S3** - Store in `transcription-{youtubeId}-{timestamp}.json`
7. **Save insights to S3** - Store in `insights-{youtubeId}-{timestamp}.json`
8. **Update DynamoDB** - Save S3 keys and timestamps
9. **Add video to user** - Update user's videos array
10. **Mark as completed** - Set status to "done"

## Retry Logic

- **Retry Count < 3**: Re-send to SQS with `retry_count + 1`, status = "retrying"
- **Retry Count >= 3**: Send to DLQ, status = "failed_permanent"

All retries are handled **inside the Lambda** - Lambda does not throw errors (always returns 200 OK to prevent AWS-level retries).

## Error Handling

### Transcript API Errors
- **Timeout**: 60 seconds
- **Failure**: Logged, triggers retry logic

### RapidAPI Errors
- **Fallback**: Tries all 4 API keys sequentially
- **All keys fail**: Logs error, triggers retry logic

### DynamoDB Errors
- **Status updates**: Logged but non-blocking
- **User updates**: Logged but non-blocking (doesn't fail entire process)

## Monitoring

### CloudWatch Logs

All logs use structured JSON format with prefixes:
- `[INFO]` - Normal operations
- `[WARN]` - Non-critical issues
- `[ERROR]` - Failures that trigger retries
- `[SUCCESS]` - Completed processing

Example log search:
```
fields @timestamp, @message
| filter @message like /\[ERROR\]/
| sort @timestamp desc
| limit 20
```

### CloudWatch Metrics

Monitor these metrics:
- `videoTranscriptWorker` invocations
- `videoTranscriptWorker` errors
- `videoTranscriptWorker` duration
- SQS `ApproximateNumberOfMessagesVisible`
- DLQ `ApproximateNumberOfMessagesVisible`

### Alarms

Consider setting alarms for:
- Lambda errors > 5% of invocations
- Lambda duration > 13 minutes (90% of timeout)
- DLQ messages > 0
- SQS age of oldest message > 10 minutes

## Cost Comparison

### Old (ECS/Fargate)
- Fargate task: ~$0.05 per hour (512 CPU, 1GB RAM)
- AWS Transcribe: ~$0.024 per minute of audio
- S3 audio storage: $0.023 per GB/month
- Estimated: **$0.15 - $0.30 per video**

### New (Lambda)
- Lambda invocation: 15 min × 512 MB = 7,500 MB-seconds = ~$0.00125
- Transcript API: (depends on your pricing)
- RapidAPI: (existing cost, unchanged)
- S3 storage: Only JSON (much cheaper)
- Estimated: **$0.01 - $0.05 per video** (excluding external API costs)

**Savings**: ~80-90% on AWS infrastructure costs

## Rollback Plan

If issues occur, you can quickly rollback:

### Option 1: Re-enable ECS Flow (Quick)

```bash
cd terraform
```

Edit `terraform/lambda.tf`:
```hcl
resource "aws_lambda_event_source_mapping" "sqs_to_trigger_ecs" {
  enabled = true  # Change from false to true
}

resource "aws_lambda_event_source_mapping" "sqs_to_video_transcript_worker" {
  enabled = false  # Change from true to false
}
```

```bash
terraform apply
```

### Option 2: Full Rollback

```bash
git revert <migration-commit-hash>
terraform apply
```

## Testing

### Test Single Video

1. Submit a video through the frontend or API
2. Check CloudWatch Logs for `videoTranscriptWorker`
3. Verify DynamoDB entry has `status = "done"`
4. Verify S3 contains transcript and insights JSON files
5. Verify user's videos array includes the video_id

### Test Retry Logic

Temporarily set `TRANSCRIPT_API_URL` to an invalid URL:
```bash
aws lambda update-function-configuration \
  --function-name videoTranscriptWorker \
  --environment "Variables={...,TRANSCRIPT_API_URL=https://invalid}"
```

Submit a video and verify:
1. Status changes to "retrying"
2. Message reappears in SQS
3. After 3 attempts, goes to DLQ with status "failed_permanent"

Restore the correct URL after testing.

### Load Testing

Test with multiple concurrent videos:
```bash
for i in {1..10}; do
  # Submit video through API
  curl -X POST https://your-api/videos -d '{"youtube_link":"..."}'
done
```

Monitor:
- Lambda concurrent executions (capped at 10)
- SQS queue depth
- Processing time per video

## IAM Permissions

The Lambda uses the existing `lambda_exec_role` which already has:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["dynamodb:*"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sqs:SendMessage",
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": "*"
    }
  ]
}
```

No new IAM permissions are required.

## Supadata Integration

The Lambda uses the [@supadata/js](https://www.npmjs.com/package/@supadata/js) client library to fetch transcripts.

**Supported Platforms:**
- YouTube
- TikTok
- Instagram
- X (Twitter)

**API Call:**
```javascript
const transcriptResult = await supadata.transcript({
  url: youtubeLink,
  lang: "en",           // Language code
  text: true,           // Return plain text (not timestamped chunks)
  mode: "auto"          // 'native', 'auto', or 'generate'
});
```

**Response:**
The Lambda expects the transcript text in `transcriptResult.data` or `transcriptResult.text`.

## Troubleshooting

### Lambda Timeout
**Symptom**: Processing takes > 15 minutes
**Solution**: Increase timeout in `terraform/lambda.tf`:
```hcl
timeout = 900  # Increase to desired value
```

### Out of Memory
**Symptom**: Lambda runs out of memory
**Solution**: Increase memory in `terraform/lambda.tf`:
```hcl
memory_size = 512  # Increase to 1024 or higher
```

### Supadata API Errors
**Symptom**: `[ERROR] Supadata transcript API failed`
**Check**:
- Is the Supadata API key valid?
- Does the API key have remaining quota?
- Is the YouTube URL valid and accessible?
- Check Supadata dashboard for usage limits

### RapidAPI Errors
**Symptom**: `All RapidAPI keys failed`
**Check**:
- Are all 4 keys valid and have quota remaining?
- Check RapidAPI dashboard for usage limits
- Verify the endpoint URL hasn't changed

### Videos Stuck in "processing"
**Symptom**: Video status remains "processing" indefinitely
**Check**:
- CloudWatch Logs for errors
- DLQ for failed messages
- Lambda execution duration

**Fix**:
```bash
# Manually mark as failed to allow retry
aws dynamodb update-item \
  --table-name safetube_videos \
  --key '{"video_id":{"S":"VIDEO_ID_HERE"}}' \
  --update-expression "SET #status = :failed" \
  --expression-attribute-names '{"#status":"status"}' \
  --expression-attribute-values '{":failed":{"S":"failed"}}'
```

## Support

For issues or questions:
1. Check CloudWatch Logs: `/aws/lambda/videoTranscriptWorker`
2. Check this migration guide
3. Review the Lambda source code: `lambda/videoTranscriptWorker/index.js`
4. Check Terraform state: `terraform show`
