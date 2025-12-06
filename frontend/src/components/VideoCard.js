import React from "react";
import {
  Card,
  Thumbnail,
  ThumbnailPlaceholder,
  Content,
  Title,
  MetaInfo,
  Duration,
  StatusBadge,
  ActionButton,
} from "./VideoCard.styled";

function VideoCard({ video, onClick }) {
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

  const statusInfo = getStatusInfo(video.status);

  return (
    <Card onClick={() => onClick && onClick(video)}>
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
        {video.status === "ready" && (
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              onClick && onClick(video);
            }}
          >
            View Insights →
          </ActionButton>
        )}
      </Content>
    </Card>
  );
}

export default VideoCard;
