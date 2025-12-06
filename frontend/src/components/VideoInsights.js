import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoTitle, setVideoTitle] = useState("");

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchInsights = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          // Mock data
          setInsights({
            lessons: [
              {
                title: "The Power of Averageness",
                summary: "Embrace your averageness as a superpower to drive consistent progress.",
                detailed_explanation: "Realize that being average means relying on hard work and consistency rather than natural talent. By accepting your average status, you unlock the motivation to consistently show up and put in the effort, avoiding the pitfall of overestimating your abilities.",
                action_steps: [
                  "Acknowledge your averageness and commit to showing up consistently in your endeavors.",
                  "Focus on the daily grind and the effort you put in, rather than relying on perceived superiority."
                ],
                examples: [
                  "Acceptance of averageness helps avoid complacency and fosters a mindset of continuous improvement.",
                  "Consistency in effort is key to long-term success, regardless of perceived talent or superiority."
                ]
              },
              {
                title: "The 10% Rule for Extraordinary Results",
                summary: "Going the extra mile by consistently adding 10% effort leads to extraordinary outcomes.",
                detailed_explanation: "Level one involves basic consistency, while level two introduces the 10% rule - doing everything expected and then adding 10%. This incremental approach builds a habit of surpassing average expectations. Level three focuses on innovation by taking unconventional paths that set you apart.",
                action_steps: [
                  "Implement the 10% rule in all areas of your life to push beyond mediocrity.",
                  "Seek opportunities to innovate and stand out by doing what others are not doing."
                ],
                examples: [
                  "Consistently adding a little extra effort can lead to significant improvements over time.",
                  "Thinking creatively and acting innovatively can carve a unique path to success."
                ]
              },
              {
                title: "Creating Your Blue Ocean Strategy",
                summary: "Differentiate yourself by finding untapped opportunities and unique approaches.",
                detailed_explanation: "By crossing disciplines, exploring unconventional paths, and authentically connecting with others, you can carve out your niche in a 'Blue Ocean' - uncontested market space where you thrive.",
                action_steps: [
                  "Look for innovative ways to combine diverse skills and experiences for a unique advantage.",
                  "Seek out unexplored territories where competition is low and potential for growth is high."
                ],
                examples: [
                  "Taking inspiration from one field and applying it to another can lead to unexpected success.",
                  "Authentic connections and genuine interactions can open doors to new opportunities."
                ]
              }
            ],
            quotes: [
              "Every day, a new race begins. You decide if you want to be the turtle or the hare.",
              "The longer you pull, the less coarse it becomes, until eventually, it even starts to taste good."
            ],
            mindset_shifts: [
              "Shift from overestimating abilities to embracing consistent effort and incremental progress."
            ],
            reflection_questions: [
              "How can you leverage your average status as a superpower to drive your success?",
              "What unique skills or experiences can you combine to create your own 'Blue Ocean' strategy?"
            ],
            mistakes_or_warnings: [
              "Beware of falling into the trap of thinking you are above average, which can hinder your progress and lead to complacency."
            ],
            emotional_tone: "Motivational",
            category: "Personal Development",
            tags: ["success", "consistency", "innovation", "motivation", "personal growth"]
          });
          setVideoTitle("Introduction to React Hooks");
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching insights:", error);
        setLoading(false);
      }
    };

    fetchInsights();
  }, [videoId]);

  if (loading) {
    return (
      <InsightsContainer>
        <LoadingContainer>
          <LoadingText>Loading insights...</LoadingText>
        </LoadingContainer>
      </InsightsContainer>
    );
  }

  if (!insights) {
    return (
      <InsightsContainer>
        <Content>
          <EmptyMessage>No insights found for this video.</EmptyMessage>
        </Content>
      </InsightsContainer>
    );
  }

  return (
    <InsightsContainer>
      <Content>
        <Header>
          <BackButton onClick={() => navigate("/my-videos")}>
            ← Back to Videos
          </BackButton>
          <VideoTitle>{videoTitle}</VideoTitle>
          <MetaInfo>
            <CategoryBadge>{insights.category}</CategoryBadge>
            <EmotionalTone>{insights.emotional_tone}</EmotionalTone>
          </MetaInfo>
          {insights.tags && insights.tags.length > 0 && (
            <TagsContainer>
              {insights.tags.map((tag, index) => (
                <Tag key={index}>#{tag}</Tag>
              ))}
            </TagsContainer>
          )}
        </Header>

        {/* Key Lessons */}
        {insights.lessons && insights.lessons.length > 0 && (
          <Section>
            <SectionTitle>
              <SectionIcon>📚</SectionIcon>
              Key Lessons
            </SectionTitle>
            {insights.lessons.map((lesson, index) => (
              <LessonCard key={index}>
                <LessonHeader>
                  <LessonTitle>{lesson.title}</LessonTitle>
                </LessonHeader>
                <LessonSummary>{lesson.summary}</LessonSummary>
                {lesson.detailed_explanation && (
                  <DetailedExplanation>{lesson.detailed_explanation}</DetailedExplanation>
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
        {insights.quotes && insights.quotes.length > 0 && (
          <Section>
            <SectionTitle>
              <SectionIcon>💬</SectionIcon>
              Memorable Quotes
            </SectionTitle>
            {insights.quotes.map((quote, index) => (
              <QuoteCard key={index}>
                <QuoteIcon>"</QuoteIcon>
                <QuoteText>{quote}</QuoteText>
              </QuoteCard>
            ))}
          </Section>
        )}

        {/* Mindset Shifts */}
        {insights.mindset_shifts && insights.mindset_shifts.length > 0 && (
          <Section>
            <SectionTitle>
              <SectionIcon>🧠</SectionIcon>
              Mindset Shifts
            </SectionTitle>
            {insights.mindset_shifts.map((shift, index) => (
              <MindsetCard key={index}>
                <MindsetText>{shift}</MindsetText>
              </MindsetCard>
            ))}
          </Section>
        )}

        {/* Reflection Questions */}
        {insights.reflection_questions && insights.reflection_questions.length > 0 && (
          <Section>
            <SectionTitle>
              <SectionIcon>🤔</SectionIcon>
              Reflection Questions
            </SectionTitle>
            {insights.reflection_questions.map((question, index) => (
              <ReflectionCard key={index}>
                <ReflectionQuestion>{question}</ReflectionQuestion>
              </ReflectionCard>
            ))}
          </Section>
        )}

        {/* Warnings */}
        {insights.mistakes_or_warnings && insights.mistakes_or_warnings.length > 0 && (
          <Section>
            <SectionTitle>
              <SectionIcon>⚠️</SectionIcon>
              Mistakes to Avoid
            </SectionTitle>
            {insights.mistakes_or_warnings.map((warning, index) => (
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
