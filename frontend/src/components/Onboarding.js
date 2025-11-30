import React, { useState } from "react";
import {
  OnboardingContainer,
  OnboardingHeader,
  SkipButton,
  SlidesContainer,
  SlidesWrapper,
  Slide,
  SlideIllustration,
  Illustration,
  IllustrationIcon,
  SlideContent,
  SlideTitle,
  SlideDescription,
  OnboardingFooter,
  DotsContainer,
  Dot,
  NextButton,
} from "./Onboarding.styled";

const Onboarding = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const slides = [
    {
      id: 1,
      title: "Turn Videos Into Life-Changing Insights",
      description:
        "Stop watching videos passively. ClipWise transforms your favorite content into actionable knowledge you can actually use.",
      icon: "🎯",
      illustration: "video-to-insights",
      bgColor1: "#667eea",
      bgColor2: "#764ba2",
    },
    {
      id: 2,
      title: "AI-Powered Smart Summaries",
      description:
        "Our AI coach watches videos for you, extracting key lessons and organizing them into bite-sized, memorable insights.",
      icon: "🤖",
      illustration: "ai-processing",
      bgColor1: "#5f72bd",
      bgColor2: "#9b59b6",
    },
    {
      id: 3,
      title: "Remember & Apply What Matters",
      description:
        "Revisit your insights anytime. Build a personal knowledge library that helps you grow every single day.",
      icon: "💡",
      illustration: "knowledge-library",
      bgColor1: "#5568d3",
      bgColor2: "#a855c4",
    },
  ];

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <OnboardingContainer
      $bgColor1={slides[currentSlide].bgColor1}
      $bgColor2={slides[currentSlide].bgColor2}
    >
      <OnboardingHeader>
        <SkipButton onClick={handleSkip}>Skip</SkipButton>
      </OnboardingHeader>

      <SlidesContainer
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <SlidesWrapper $currentSlide={currentSlide}>
          {slides.map((slide) => (
            <Slide key={slide.id}>
              <SlideIllustration>
                <Illustration $type={slide.illustration}>
                  <IllustrationIcon>{slide.icon}</IllustrationIcon>
                </Illustration>
              </SlideIllustration>
              <SlideContent>
                <SlideTitle>{slide.title}</SlideTitle>
                <SlideDescription>{slide.description}</SlideDescription>
              </SlideContent>
            </Slide>
          ))}
        </SlidesWrapper>
      </SlidesContainer>

      <OnboardingFooter>
        <DotsContainer>
          {slides.map((_, index) => (
            <Dot
              key={index}
              $active={index === currentSlide}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </DotsContainer>

        <NextButton onClick={handleNext}>
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
        </NextButton>
      </OnboardingFooter>
    </OnboardingContainer>
  );
};

export default Onboarding;
