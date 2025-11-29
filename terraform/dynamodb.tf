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
