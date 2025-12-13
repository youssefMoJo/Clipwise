import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getVideoDetails } from "../services/api";
import {
  InsightsContainer,
  Content,
  Header,
  BackButton,
  VideoTitle,
  MetaInfo,
  CategoryBadge,
  EmotionalTone,
  TagsContainer,
  Tag,
  WatchButton,
  Section,
  SectionTitle,
  SectionIcon,
  LessonCard,
  LessonHeader,
  LessonTitle,
  LessonSummary,
  DetailedExplanation,
  SubSection,
  SubTitle,
  ActionStepsList,
  ActionStep,
  ExamplesList,
  ExampleItem,
  QuoteCard,
  QuoteText,
  QuoteIcon,
  ReflectionCard,
  ReflectionQuestion,
  WarningCard,
  WarningText,
  MindsetCard,
  MindsetText,
  EmptyMessage,
  LoadingContainer,
  LoadingText,
} from "./VideoInsights.styled";

function VideoInsights() {
  const navigate = useNavigate();
  const { videoId } = useParams();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Use React Query to fetch and cache video insights
  const {
    data: videoData,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["video-insights", videoId],
    queryFn: () => getVideoDetails(videoId),
    staleTime: 10 * 60 * 1000, // 10 minutes - insights don't change often
    cacheTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
  });

  const insights = videoData?.insights || videoData;
  const videoTitle = videoData?.title || videoData?.video_title || "Video Insights";
  const error = queryError?.message || "";

  if (loading) {
    return (
      <InsightsContainer>
        <LoadingContainer>
          <LoadingText>Loading insights...</LoadingText>
        </LoadingContainer>
      </InsightsContainer>
    );
  }

  if (error) {
    return (
      <InsightsContainer>
        <Content>
          <Header>
            <BackButton onClick={() => navigate("/my-videos")}>
              ← Back to Videos
            </BackButton>
          </Header>
          <EmptyMessage>
            Error: {error}
            <br />
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1.5rem",
                background: "white",
                color: "#667eea",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </EmptyMessage>
        </Content>
      </InsightsContainer>
    );
  }

  if (!insights) {
    return (
      <InsightsContainer>
        <Content>
          <Header>
            <BackButton onClick={() => navigate("/my-videos")}>
              ← Back to Videos
            </BackButton>
          </Header>
          <EmptyMessage>No insights found for this video.</EmptyMessage>
        </Content>
      </InsightsContainer>
    );
  }

  // For backwards compatibility, handle both old mock data structure and new API structure
  const insightsData = insights.insights || insights;

  return (
    <InsightsContainer>
      <Content>
        <Header>
          <BackButton onClick={() => navigate("/my-videos")}>
            ← Back to Videos
          </BackButton>
          <VideoTitle>{videoTitle}</VideoTitle>
          <MetaInfo>
            <CategoryBadge>
              {insightsData.category || "Uncategorized"}
            </CategoryBadge>
            <EmotionalTone>
              {insightsData.emotional_tone || "Neutral"}
            </EmotionalTone>
          </MetaInfo>
          {insightsData.tags && insightsData.tags.length > 0 && (
            <TagsContainer>
              {insightsData.tags.map((tag, index) => (
                <Tag key={index}>#{tag}</Tag>
              ))}
            </TagsContainer>
          )}
          {videoData && (videoData.link || videoData.youtube_link) && (
            <WatchButton
              href={videoData.link || videoData.youtube_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>▶️</span>
              Watch on YouTube
            </WatchButton>
          )}
        </Header>

        {/* Key Lessons */}
        {insightsData.lessons && insightsData.lessons.length > 0 && (
          <Section>
            <SectionTitle>
              <SectionIcon>📚</SectionIcon>
              Key Lessons
            </SectionTitle>
            {insightsData.lessons.map((lesson, index) => (
              <LessonCard key={index}>
                <LessonHeader>
                  <LessonTitle>{lesson.title}</LessonTitle>
                </LessonHeader>
                <LessonSummary>{lesson.summary}</LessonSummary>
                {lesson.detailed_explanation && (
                  <DetailedExplanation>
                    {lesson.detailed_explanation}
                  </DetailedExplanation>
                )}

                {lesson.action_steps && lesson.action_steps.length > 0 && (
                  <SubSection>
                    <SubTitle>Action Steps</SubTitle>
                    <ActionStepsList>
                      {lesson.action_steps.map((step, idx) => (
                        <ActionStep key={idx}>{step}</ActionStep>
                      ))}
                    </ActionStepsList>
                  </SubSection>
                )}

                {lesson.examples && lesson.examples.length > 0 && (
                  <SubSection>
                    <SubTitle>Examples</SubTitle>
                    <ExamplesList>
                      {lesson.examples.map((example, idx) => (
                        <ExampleItem key={idx}>{example}</ExampleItem>
                      ))}
                    </ExamplesList>
                  </SubSection>
                )}
              </LessonCard>
            ))}
          </Section>
        )}

        {/* Quotes */}
        {insightsData.quotes && insightsData.quotes.length > 0 && (
          <Section>
            <SectionTitle>
              <SectionIcon>💬</SectionIcon>
              Memorable Quotes
            </SectionTitle>
            {insightsData.quotes.map((quote, index) => (
              <QuoteCard key={index}>
                <QuoteIcon>"</QuoteIcon>
                <QuoteText>{quote}</QuoteText>
              </QuoteCard>
            ))}
          </Section>
        )}

        {/* Mindset Shifts */}
        {insightsData.mindset_shifts &&
          insightsData.mindset_shifts.length > 0 && (
            <Section>
              <SectionTitle>
                <SectionIcon>🧠</SectionIcon>
                Mindset Shifts
              </SectionTitle>
              {insightsData.mindset_shifts.map((shift, index) => (
                <MindsetCard key={index}>
                  <MindsetText>{shift}</MindsetText>
                </MindsetCard>
              ))}
            </Section>
          )}

        {/* Reflection Questions */}
        {insightsData.reflection_questions &&
          insightsData.reflection_questions.length > 0 && (
            <Section>
              <SectionTitle>
                <SectionIcon>🤔</SectionIcon>
                Reflection Questions
              </SectionTitle>
              {insightsData.reflection_questions.map((question, index) => (
                <ReflectionCard key={index}>
                  <ReflectionQuestion>{question}</ReflectionQuestion>
                </ReflectionCard>
              ))}
            </Section>
          )}

        {/* Warnings */}
        {insightsData.mistakes_or_warnings &&
          insightsData.mistakes_or_warnings.length > 0 && (
            <Section>
              <SectionTitle>
                <SectionIcon>⚠️</SectionIcon>
                Mistakes to Avoid
              </SectionTitle>
              {insightsData.mistakes_or_warnings.map((warning, index) => (
                <WarningCard key={index}>
                  <WarningText>{warning}</WarningText>
                </WarningCard>
              ))}
            </Section>
          )}
      </Content>
    </InsightsContainer>
  );
}

export default VideoInsights;
