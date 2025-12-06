import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import VideoCard from "./VideoCard";

const MyVideos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call to fetch user's videos
    const fetchVideos = async () => {
      try {
        // const response = await fetch('/api/videos');
        // const data = await response.json();
        // setVideos(data);

        // Mock data for now - adding sample videos to showcase the cards
        setTimeout(() => {
          setVideos([
            {
              id: 1,
              title: "Introduction to React Hooks",
              thumbnail: null,
              duration: 245,
              status: "ready",
              createdAt: new Date().toISOString(),
            },
            {
              id: 2,
              title: "Building a Full-Stack Application with Node.js and React",
              thumbnail: null,
              duration: 1825,
              status: "processing",
              createdAt: new Date().toISOString(),
            },
            {
              id: 3,
              title: "CSS Grid Layout Tutorial",
              thumbnail: null,
              duration: 680,
              status: "ready",
              createdAt: new Date().toISOString(),
            },
            {
              id: 4,
              title: "JavaScript ES6 Features",
              thumbnail: null,
              duration: 420,
              status: "failed",
              createdAt: new Date().toISOString(),
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleVideoClick = (video) => {
    if (video.status === "ready") {
      // TODO: Navigate to video insights page
      console.log("View insights for:", video.title);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingText>Loading your videos...</LoadingText>
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

        {videos.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🎬</EmptyIcon>
            <EmptyTitle>No videos yet</EmptyTitle>
            <EmptyMessage>
              Start creating engaging clips by uploading your first video!
            </EmptyMessage>
            <CTAButton onClick={() => navigate("/add-video")}>
              Upload Your First Video
            </CTAButton>
          </EmptyState>
        ) : (
          <VideoGrid>
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={handleVideoClick}
              />
            ))}
          </VideoGrid>
        )}
      </Content>
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

export default MyVideos;
