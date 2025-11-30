import React, { useState } from "react";
import "./Onboarding.css";

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
    <div
      className="onboarding-container"
      style={{
        "--bg-color-1": slides[currentSlide].bgColor1,
        "--bg-color-2": slides[currentSlide].bgColor2,
      }}
    >
      <div className="onboarding-header">
        <button className="skip-button" onClick={handleSkip}>
          Skip
        </button>
      </div>

      <div
        className="slides-container"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="slides-wrapper"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={slide.id} className="slide">
              <div className="slide-illustration">
                <div className={`illustration ${slide.illustration}`}>
                  <span className="illustration-icon">{slide.icon}</span>
                </div>
              </div>
              <div className="slide-content">
                <h1 className="slide-title">{slide.title}</h1>
                <p className="slide-description">{slide.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="onboarding-footer">
        <div className="dots-container">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        <button className="next-button" onClick={handleNext}>
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
