import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import loadingAnimation from "../Assets/lottie Files/loading2.json";
import { processVideo } from "../services/api";
import {
  AddVideoContainer,
  AddVideoCard,
  Bubble,
  Header,
  Title,
  Subtitle,
  InputContainer,
  VideoInput,
  GenerateButton,
  LoadingContainer,
  LoadingText,
  SupportedPlatforms,
  PlatformsTitle,
  PlatformIcons,
  PlatformIcon,
  ErrorMessage,
  LoadingQuote,
} from "./AddVideo.styled";

const AddVideo = ({ onVideoSubmit }) => {
  const navigate = useNavigate();
  const quotes = [
    "Great things take time. Hang tight!",
    "Your insights are on the way...",
    "AI is thinking hard for you!",
    "Almost there, stay curious!",
    "Knowledge is power — loading yours now!",
  ];

  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 3000); // 2.5 seconds per quote

    return () => clearInterval(interval);
  }, [isLoading]);

  // Generate random bubbles - positioned throughout the screen
  // useMemo ensures bubbles are only created once and don't change on re-renders
  const bubbles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        size: Math.random() * 80 + 60, // 60-140px
        left: Math.random() * 90 + 5, // 5-95%
        top: Math.random() * 90 + 5, // 5-95%
        duration: Math.random() * 8 + 12, // 12-20s for slower, more graceful movement
        delay: Math.random() * -10, // Negative delay for immediate start
      })),
    [] // Empty dependency array means this only runs once
  );

  const validateVideoUrl = (url) => {
    if (!url || url.trim() === "") {
      return "Please enter a video URL";
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    const tiktokRegex = /^(https?:\/\/)?(www\.)?tiktok\.com\/.+/;
    const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/.+/;
    const twitterRegex = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.+/;

    const isValid =
      youtubeRegex.test(url) ||
      tiktokRegex.test(url) ||
      instagramRegex.test(url) ||
      twitterRegex.test(url);

    if (!isValid) {
      return "Please enter a valid video URL from YouTube";
    }

    return null;
  };

  const handleSubmit = async () => {
    setError("");

    const validationError = validateVideoUrl(videoUrl);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const data = await processVideo(videoUrl);

      // Call parent callback if provided
      if (onVideoSubmit) {
        onVideoSubmit(data);
      }

      // Clear input
      setVideoUrl("");

      // Navigate to my videos page after successful submission
      // The video will be processing in the background
      setTimeout(() => {
        navigate("/my-videos");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to process video. Please try again.");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  };

  if (isLoading) {
    return (
      <AddVideoContainer>
        {bubbles.map((bubble) => (
          <Bubble
            key={bubble.id}
            $size={bubble.size}
            $left={bubble.left}
            $top={bubble.top}
            $duration={bubble.duration}
            $delay={bubble.delay}
          />
        ))}
        <AddVideoCard>
          <LoadingContainer>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Lottie
                animationData={loadingAnimation}
                loop={true}
                style={{ width: "100%", maxWidth: 200, height: "auto" }}
              />
            </div>
            <LoadingText>
              Analyzing your video and generating insights...
            </LoadingText>
            <LoadingQuote>{quotes[quoteIndex]}</LoadingQuote>
          </LoadingContainer>
        </AddVideoCard>
      </AddVideoContainer>
    );
  }

  return (
    <AddVideoContainer>
      {bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          $size={bubble.size}
          $left={bubble.left}
          $top={bubble.top}
          $duration={bubble.duration}
          $delay={bubble.delay}
        />
      ))}
      <AddVideoCard>
        <Header>
          <Title>Add Your Video</Title>
          <Subtitle>Paste any video link to get instant AI insights</Subtitle>
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <InputContainer>
          <VideoInput
            type="text"
            placeholder="Paste Youtube video URL here..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            autoFocus
          />
        </InputContainer>

        <GenerateButton onClick={handleSubmit} disabled={isLoading}>
          Generate Insights
        </GenerateButton>

        <SupportedPlatforms>
          <PlatformsTitle>Currently Supported Platform</PlatformsTitle>
          <PlatformIcons>
            <PlatformIcon title="YouTube">▶️</PlatformIcon>
          </PlatformIcons>
        </SupportedPlatforms>
      </AddVideoCard>
    </AddVideoContainer>
  );
};

export default AddVideo;
