resource "aws_dynamodb_table" "safetube_videos" {
  name         = "safetube_videos"
  billing_mode = "PAY_PER_REQUEST" # On-demand pricing (no capacity planning)

  hash_key = "video_id"

  attribute {
    name = "video_id"
    type = "S" # String
  }

  tags = {
    Environment = "dev"
    Project     = "SafeTube"
  }
}

resource "aws_dynamodb_table" "safetube_users" {
  name         = "safetube_users"
  billing_mode = "PAY_PER_REQUEST" # On-demand pricing (no capacity planning)

  hash_key = "user_id"

  attribute {
    name = "user_id"
    type = "S" # String (Cognito sub)
  }

  tags = {
    Environment = "dev"
    Project     = "SafeTube"
  }
}

resource "aws_dynamodb_table" "safetube_feedback" {
  name         = "safetube_feedback"
  billing_mode = "PAY_PER_REQUEST" # On-demand pricing (no capacity planning)

  hash_key  = "feedback_id"
  range_key = "created_at"

  attribute {
    name = "feedback_id"
    type = "S" # String (UUID)
  }

  attribute {
    name = "created_at"
    type = "S" # String (ISO timestamp)
  }

  tags = {
    Environment = "dev"
    Project     = "SafeTube"
  }
}
