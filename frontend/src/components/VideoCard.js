import React, { useState } from "react";
import {
  Card,
  Thumbnail,
  ThumbnailPlaceholder,
  Content,
  Title,
  MetaInfo,
  Duration,
  StatusBadge,
  CardActions,
  DeleteButton,
  ViewButton,
  TimeAgo,
} from "./VideoCard.styled";

function VideoCard({ video, onClick, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const getStatusInfo = (status) => {
    switch (status) {
      case "ready":
        return { emoji: "✅", text: "Ready", color: "#4caf50" };
      case "processing":
        return { emoji: "⏳", text: "Processing", color: "#ff9800" };
      case "failed":
        return { emoji: "❌", text: "Failed", color: "#f44336" };
      default:
        return { emoji: "⏳", text: "Pending", color: "#9e9e9e" };
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "Just now";

    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSecs < 60) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await onDelete(video);
    } finally {
      setIsDeleting(false);
    }
  };

  const statusInfo = getStatusInfo(video.status);

  return (
    <Card>
      {video.picture ? (
        <Thumbnail src={video.picture} alt={video.title} />
      ) : (
        <ThumbnailPlaceholder>
          <span>🎬</span>
        </ThumbnailPlaceholder>
      )}
      <Content>
        <Title>{video.title}</Title>
        <MetaInfo>
          <Duration>⏱️ {formatDuration(video.duration)}</Duration>
          <StatusBadge $color={statusInfo.color}>
            {statusInfo.emoji} {statusInfo.text}
          </StatusBadge>
        </MetaInfo>
        <TimeAgo>📅 {getTimeAgo(video.created_at)}</TimeAgo>
        {video.status === "ready" && (
          <CardActions>
            <ViewButton
              onClick={(e) => {
                e.stopPropagation();
                onClick && onClick(video);
              }}
            >
              View Insights →
            </ViewButton>
            <DeleteButton
              $isDeleting={isDeleting}
              onClick={handleDelete}
              title="Delete video"
            >
              {isDeleting ? "⏳" : "🗑️"}
            </DeleteButton>
          </CardActions>
        )}
        {video.status !== "ready" && (
          <DeleteButton
            $isDeleting={isDeleting}
            onClick={handleDelete}
            title="Delete video"
            style={{ marginTop: "0.75rem", width: "100%" }}
          >
            {isDeleting ? "⏳ Deleting..." : "🗑️ Delete"}
          </DeleteButton>
        )}
      </Content>
    </Card>
  );
}

export default VideoCard;
