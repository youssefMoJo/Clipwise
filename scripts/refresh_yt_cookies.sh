#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COOKIE_FILE="$SCRIPT_DIR/all_cookies.txt"
VENV_DIR="$SCRIPT_DIR/venv"
S3_BUCKET="safetube-cookies"
S3_KEY="all_cookies.txt"
LOG_FILE="$SCRIPT_DIR/cookie_refresh.log"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========== Cookie Refresh Started =========="

# Check if yt-dlp is installed
if ! command -v yt-dlp &> /dev/null; then
    log "ERROR: yt-dlp is not installed. Install with: brew install yt-dlp"
    exit 1
fi

# Extract cookies from Chrome using yt-dlp's built-in extractor
# This is better than browser_cookie3 because it captures all cookies including HTTPOnly and dynamically generated ones
log "Extracting cookies from Chrome using yt-dlp..."

# Use a test video to trigger cookie extraction
if yt-dlp --cookies-from-browser chrome --cookies "$COOKIE_FILE" --skip-download "https://www.youtube.com/watch?v=dQw4w9WgXcQ" >> "$LOG_FILE" 2>&1; then
    log "✅ Cookies extracted successfully"

    # Verify the cookie file was created and has content
    if [ -f "$COOKIE_FILE" ] && [ -s "$COOKIE_FILE" ]; then
        COOKIE_COUNT=$(grep -c "^[^#]" "$COOKIE_FILE" || echo "0")
        log "✅ Cookie file created with $COOKIE_COUNT cookies"
    else
        log "❌ ERROR: Cookie file is empty or wasn't created"
        exit 1
    fi
else
    log "❌ ERROR: Failed to extract cookies from Chrome"
    log "Make sure Chrome is installed and you're logged into YouTube"
    exit 1
fi

# Upload to S3
log "Uploading cookies to s3://$S3_BUCKET/$S3_KEY..."
if aws s3 cp "$COOKIE_FILE" "s3://$S3_BUCKET/$S3_KEY" --acl private >> "$LOG_FILE" 2>&1; then
    log "✅ Uploaded to S3 successfully!"

    # Delete local cookies file after upload
    rm -f "$COOKIE_FILE"
    log "✅ Local cookies file deleted."
    log "========== Cookie Refresh Completed Successfully =========="
    exit 0
else
    log "❌ ERROR: Failed to upload to S3"
    exit 1
fi