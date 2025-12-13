import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import { getVideos, deleteVideo } from "../services/api";
import VideoCard from "./VideoCard";
import DeleteConfirmModal from "./DeleteConfirmModal";
import UpgradeAccountModal from "./UpgradeAccountModal";
import Toast from "./Toast";

const MyVideos = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all"); // all, ready, processing, failed
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const isGuest = localStorage.getItem("is_guest") === "true";

  // Use React Query to fetch and cache videos
  const {
    data,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: getVideos,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const allVideos = data?.videos || data || [];
  const guestInfo = data?.guest_info || null;
  const error = queryError?.message || "";

  // Sort videos by created_at (latest first) and apply filters
  const videos = React.useMemo(() => {
    let filtered = [...allVideos];

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((video) => video.status === filterStatus);
    }

    // Sort by created_at (latest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA; // Descending order (newest first)
    });

    return filtered;
  }, [allVideos, filterStatus]);

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

      // Invalidate the videos cache to refetch updated list
      queryClient.invalidateQueries({ queryKey: ["videos"] });

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

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

  const handleUpgradeSuccess = () => {
    setShowUpgradeModal(false);
    // Refresh the page to show the updated user state
    window.location.reload();
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

        <FilterContainer>
          <FilterHeader onClick={() => setIsFilterExpanded(!isFilterExpanded)}>
            <FilterHeaderContent>
              <FilterIcon $expanded={isFilterExpanded}>🔍</FilterIcon>
              <FilterHeaderText>
                <FilterLabel>Filter by status</FilterLabel>
                <FilterSubtext>
                  {filterStatus === "all"
                    ? `Showing all ${allVideos.length} videos`
                    : `Showing ${videos.length} ${filterStatus} video${videos.length !== 1 ? 's' : ''}`}
                </FilterSubtext>
              </FilterHeaderText>
            </FilterHeaderContent>
            <ExpandIcon $expanded={isFilterExpanded}>
              {isFilterExpanded ? "▲" : "▼"}
            </ExpandIcon>
          </FilterHeader>
          <FilterButtons $expanded={isFilterExpanded}>
            <FilterButton
              $active={filterStatus === "all"}
              onClick={() => setFilterStatus("all")}
            >
              All ({allVideos.length})
            </FilterButton>
            <FilterButton
              $active={filterStatus === "ready"}
              onClick={() => setFilterStatus("ready")}
            >
              ✅ Ready ({allVideos.filter((v) => v.status === "ready").length})
            </FilterButton>
            <FilterButton
              $active={filterStatus === "processing"}
              onClick={() => setFilterStatus("processing")}
            >
              ⏳ Processing ({allVideos.filter((v) => v.status === "processing").length})
            </FilterButton>
            <FilterButton
              $active={filterStatus === "failed"}
              onClick={() => setFilterStatus("failed")}
            >
              ❌ Failed ({allVideos.filter((v) => v.status === "failed").length})
            </FilterButton>
          </FilterButtons>
        </FilterContainer>

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
              <GuestUpgradeButton onClick={handleUpgradeClick}>
                Create Account
              </GuestUpgradeButton>
            </GuestBannerContent>
          </GuestBanner>
        )}

        {videos.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              {allVideos.length === 0 ? "🎬" : "🔍"}
            </EmptyIcon>
            <EmptyTitle>
              {allVideos.length === 0
                ? "No videos yet"
                : `No ${filterStatus} videos`}
            </EmptyTitle>
            <EmptyMessage>
              {allVideos.length === 0
                ? "Start creating engaging clips by uploading your first video!"
                : `You don't have any ${filterStatus} videos. Try selecting a different filter.`}
            </EmptyMessage>
            {allVideos.length === 0 && (
              <CTAButton onClick={() => navigate("/add-video")}>
                Add Your First Video
              </CTAButton>
            )}
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

      <UpgradeAccountModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={handleUpgradeSuccess}
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

const FilterContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.35);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &:active {
    transform: scale(0.99);
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const FilterHeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FilterIcon = styled.div`
  font-size: 1.5rem;
  transition: transform 0.3s ease;
  transform: ${(props) => (props.$expanded ? "scale(1.1)" : "scale(1)")};
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

const FilterHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FilterLabel = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FilterSubtext = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
`;

const ExpandIcon = styled.div`
  font-size: 1rem;
  color: white;
  transition: transform 0.3s ease;
  transform: ${(props) => (props.$expanded ? "rotate(180deg)" : "rotate(0)")};
  padding: 0.5rem;
`;

const FilterButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  padding: ${(props) => (props.$expanded ? "0 1.25rem 1.25rem 1.25rem" : "0 1.25rem")};
  max-height: ${(props) => (props.$expanded ? "500px" : "0")};
  opacity: ${(props) => (props.$expanded ? "1" : "0")};
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    padding: ${(props) => (props.$expanded ? "0 1rem 1rem 1rem" : "0 1rem")};
  }
`;

const FilterButton = styled.button`
  background: ${(props) =>
    props.$active
      ? "white"
      : "rgba(255, 255, 255, 0.2)"};
  color: ${(props) => (props.$active ? "#667eea" : "white")};
  border: 2px solid
    ${(props) =>
      props.$active ? "white" : "rgba(255, 255, 255, 0.3)"};
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.$active
      ? "0 4px 12px rgba(0, 0, 0, 0.2)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)"};
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    background: ${(props) =>
      props.$active ? "white" : "rgba(255, 255, 255, 0.3)"};
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.65rem 0.75rem;
    font-size: 0.85rem;
  }
`;

export default MyVideos;
