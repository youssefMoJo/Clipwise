# Quick Start Deployment Guide

## Prerequisites

- Supadata API key: `sd_bcd9b7628785d4b15c2ec716152da184`
- 4 RapidAPI keys configured
- AWS credentials configured
- Terraform installed

## 5-Minute Deployment

### 1. Configure API Key

Edit `terraform/terraform.tfvars`:

```hcl
# Required for Lambda migration
supadata_api_key = "sd_bcd9b7628785d4b15c2ec716152da184"

# Existing keys (already configured)
RAPIDAPI_KEY_1 = "your-key-1"
RAPIDAPI_KEY_2 = "your-key-2"
RAPIDAPI_KEY_3 = "your-key-3"
RAPIDAPI_KEY_4 = "your-key-4"
```

### 2. Build Lambda Package

```bash
cd lambda/videoTranscriptWorker
./deploy.sh
```

Output:
```
📦 Installing dependencies...
📦 Creating deployment package...
✅ Deployment package created: videoTranscriptWorker.zip
```

### 3. Deploy with Terraform

```bash
cd ../../terraform
terraform plan   # Review changes
terraform apply  # Deploy
```

Expected changes:
- ✅ New Lambda function: `videoTranscriptWorker`
- ✅ New SQS event source mapping
- ⚠️ Old ECS trigger disabled (NOT deleted)
- ℹ️ ECS resources unchanged (kept for rollback)

### 4. Verify Deployment

```bash
# Check Lambda exists
aws lambda get-function --function-name videoTranscriptWorker

# Check event source mapping
aws lambda list-event-source-mappings --function-name videoTranscriptWorker

# Watch logs
aws logs tail /aws/lambda/videoTranscriptWorker --follow
```

### 5. Test with a Video

Submit a video through your frontend or API and monitor CloudWatch Logs:

```bash
aws logs tail /aws/lambda/videoTranscriptWorker --follow --filter-pattern "[INFO]"
```

Expected log flow:
```
[INFO] Lambda invoked
[INFO] Calling Supadata transcript API
[INFO] Supadata API response received
[INFO] Generating AI insights from transcript
[INFO] Saving transcript to S3
[INFO] Saving insights to S3
[INFO] Updating DynamoDB with S3 keys
[INFO] Adding video to user's array
[INFO] Video status updated
[SUCCESS] Video processing completed
```

## Quick Rollback (if needed)

Edit `terraform/lambda.tf`:

```hcl
# Line 51: Disable new Lambda
resource "aws_lambda_event_source_mapping" "sqs_to_video_transcript_worker" {
  enabled = false  # Change to false
}

# Line 47: Re-enable old ECS trigger
resource "aws_lambda_event_source_mapping" "sqs_to_trigger_ecs" {
  enabled = true   # Change to true
}
```

Then apply:
```bash
terraform apply
```

## Key Differences from ECS

| Aspect | ECS/Fargate | New Lambda |
|--------|-------------|------------|
| **Runtime** | Container | Node.js 20 |
| **Transcript** | AWS Transcribe | Supadata API |
| **Audio** | yt-dlp → S3 | None (direct API) |
| **Timeout** | No limit | 15 minutes |
| **Cost per video** | $0.15-$0.30 | $0.01-$0.05 |
| **Scaling** | Manual | Automatic (max 10) |

## Troubleshooting

### Lambda not triggering
```bash
# Check SQS has messages
aws sqs get-queue-attributes \
  --queue-url YOUR_QUEUE_URL \
  --attribute-names ApproximateNumberOfMessages

# Check event source mapping is enabled
aws lambda list-event-source-mappings \
  --function-name videoTranscriptWorker
```

### Supadata API errors
```bash
# Check logs for API errors
aws logs tail /aws/lambda/videoTranscriptWorker \
  --filter-pattern "[ERROR] Supadata"
```

Possible causes:
- Invalid API key
- Quota exceeded
- Invalid YouTube URL

### Videos stuck in "processing"
```bash
# Check for errors in logs
aws logs tail /aws/lambda/videoTranscriptWorker \
  --filter-pattern "[ERROR]"

# Check DLQ for failed messages
aws sqs get-queue-attributes \
  --queue-url YOUR_DLQ_URL \
  --attribute-names ApproximateNumberOfMessages
```

## Monitoring

### Key Metrics to Watch

1. **Lambda Invocations**
   ```bash
   aws cloudwatch get-metric-statistics \
     --namespace AWS/Lambda \
     --metric-name Invocations \
     --dimensions Name=FunctionName,Value=videoTranscriptWorker \
     --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
     --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
     --period 300 \
     --statistics Sum
   ```

2. **Lambda Errors**
   ```bash
   aws cloudwatch get-metric-statistics \
     --namespace AWS/Lambda \
     --metric-name Errors \
     --dimensions Name=FunctionName,Value=videoTranscriptWorker \
     --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
     --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
     --period 300 \
     --statistics Sum
   ```

3. **SQS Queue Depth**
   ```bash
   aws sqs get-queue-attributes \
     --queue-url YOUR_QUEUE_URL \
     --attribute-names All
   ```

## Cost Estimate

For 1,000 videos/month:

### Old (ECS/Fargate)
- Fargate tasks: $150-$300
- AWS Transcribe: ~$240
- S3 audio storage: ~$20
- **Total: ~$410-$560/month**

### New (Lambda + Supadata)
- Lambda invocations: ~$10-$50
- Supadata API: (check your pricing)
- RapidAPI: (existing cost)
- S3 JSON storage: ~$1
- **Total: ~$11-$51/month** (excluding Supadata)

**Savings: ~$360-$510/month (87-91%)**

## Next Steps

1. ✅ Monitor first 10-20 videos in CloudWatch Logs
2. ✅ Check DynamoDB for correct status updates
3. ✅ Verify S3 contains transcript and insights JSON
4. ✅ Set up CloudWatch alarms for errors
5. ✅ Monitor Supadata API usage and quota
6. ✅ Consider deleting ECS resources after 1 week of stable operation

## Support

- **Full migration guide**: [MIGRATION_LAMBDA.md](MIGRATION_LAMBDA.md)
- **Lambda documentation**: [lambda/videoTranscriptWorker/README.md](lambda/videoTranscriptWorker/README.md)
- **CloudWatch Logs**: `/aws/lambda/videoTranscriptWorker`
- **Terraform config**: [terraform/lambda.tf](terraform/lambda.tf)
