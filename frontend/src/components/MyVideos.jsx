import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getVideos, deleteVideo } from "../services/api";
import VideoCard from "./VideoCard";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Toast from "./Toast";

const MyVideos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [guestInfo, setGuestInfo] = useState(null);
  const isGuest = localStorage.getItem("is_guest") === "true";

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const data = await getVideos();

        // The API returns videos in a specific format
        // Adjust based on your backend response structure
        setVideos(data.videos || data || []);

        // If guest user, extract guest info
        if (data.guest_info) {
          setGuestInfo(data.guest_info);
        }

        setError("");
      } catch (error) {
        console.error("Error fetching videos:", error);
        setError(error.message || "Failed to load videos");
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleVideoClick = (video) => {
    if (video.status === "ready") {
      navigate(`/video-insights/${video.video_id}`);
    }
  };

  const handleDeleteClick = (video) => {
    setVideoToDelete(video);
  };

  const handleDeleteConfirm = async () => {
    if (!videoToDelete) return;

    setIsDeleting(true);
    try {
      await deleteVideo(videoToDelete.video_id);

      // Remove from UI with animation
      setVideos((prevVideos) =>
        prevVideos.filter((v) => v.video_id !== videoToDelete.video_id)
      );

      setToast({
        type: "success",
        message: `"${videoToDelete.title}" has been deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting video:", error);
      setToast({
        type: "error",
        message: error.message || "Failed to delete video",
      });
    } finally {
      setIsDeleting(false);
      setVideoToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setVideoToDelete(null);
  };

  if (loading) {
    return (
      <Container>
        <LoadingText>Loading your videos...</LoadingText>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Content>
          <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Failed to Load Videos</ErrorTitle>
            <ErrorMessage>{error}</ErrorMessage>
            <RetryButton onClick={() => window.location.reload()}>
              Retry
            </RetryButton>
          </ErrorContainer>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <Header>
          <Title>My Videos</Title>
          <VideoCount>
            {videos.length} {videos.length === 1 ? "video" : "videos"}
          </VideoCount>
        </Header>

        {isGuest && guestInfo && (
          <GuestBanner $limitReached={guestInfo.limit_reached}>
            <GuestBannerContent>
              <GuestBannerIcon>
                {guestInfo.limit_reached ? "⚠️" : "👋"}
              </GuestBannerIcon>
              <GuestBannerText>
                <GuestBannerTitle>
                  {guestInfo.limit_reached
                    ? "Guest Limit Reached"
                    : "You're using ClipWise as a Guest"}
                </GuestBannerTitle>
                <GuestBannerSubtitle>
                  {guestInfo.limit_reached
                    ? `You've uploaded ${guestInfo.video_count} of ${guestInfo.max_videos} videos. Create an account to keep your videos forever and upload unlimited content.`
                    : `${guestInfo.videos_remaining} upload${
                        guestInfo.videos_remaining !== 1 ? "s" : ""
                      } remaining (${guestInfo.video_count}/${
                        guestInfo.max_videos
                      } used). Create an account to save your progress!`}
                </GuestBannerSubtitle>
              </GuestBannerText>
              <GuestUpgradeButton onClick={() => navigate("/auth")}>
                Create Account
              </GuestUpgradeButton>
            </GuestBannerContent>
          </GuestBanner>
        )}

        {videos.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🎬</EmptyIcon>
            <EmptyTitle>No videos yet</EmptyTitle>
            <EmptyMessage>
              Start creating engaging clips by uploading your first video!
            </EmptyMessage>
            <CTAButton onClick={() => navigate("/add-video")}>
              Add Your First Video
            </CTAButton>
          </EmptyState>
        ) : (
          <VideoGrid>
            {videos.map((video) => (
              <VideoCard
                key={video.video_id}
                video={video}
                onClick={handleVideoClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </VideoGrid>
        )}
      </Content>

      <DeleteConfirmModal
        isOpen={!!videoToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        videoTitle={videoToDelete?.title || ""}
        isDeleting={isDeleting}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2.5rem 2rem;
  margin-top: -70px;
  padding-top: calc(2.5rem + 70px);

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    padding-top: calc(1.5rem + 70px);
  }
`;

const Content = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const VideoCount = styled.span`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.3);
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 4rem 1rem;
  font-size: 1.2rem;
  color: white;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  max-width: 500px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

const EmptyIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
`;

const EmptyTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const EmptyMessage = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const CTAButton = styled.button`
  background: white;
  color: #667eea;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  padding-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  max-width: 500px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 2px solid rgba(255, 100, 100, 0.3);
`;

const ErrorIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
`;

const ErrorTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ErrorMessage = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const RetryButton = styled.button`
  background: white;
  color: #764ba2;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const GuestBanner = styled.div`
  background: ${(props) =>
    props.$limitReached
      ? "linear-gradient(135deg, rgba(255, 100, 100, 0.15), rgba(255, 150, 100, 0.15))"
      : "linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))"};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 2px solid
    ${(props) =>
      props.$limitReached
        ? "rgba(255, 100, 100, 0.3)"
        : "rgba(255, 255, 255, 0.2)"};
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const GuestBannerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const GuestBannerIcon = styled.div`
  font-size: 3rem;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

const GuestBannerText = styled.div`
  flex: 1;
`;

const GuestBannerTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const GuestBannerSubtitle = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.5;
`;

const GuestUpgradeButton = styled.button`
  background: white;
  color: #667eea;
  border: none;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    background: #f8f9ff;
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export default MyVideos;
