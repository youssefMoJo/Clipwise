resource "aws_s3_bucket" "transcribe_output_bucket" {
  bucket        = "safetube-transcripts"
  force_destroy = true
}
