import React, { useState } from "react";
import "./App.css";
import Onboarding from "./components/Onboarding";

function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("onboardingCompleted", "true");
  };

  React.useEffect(() => {
    const completed = localStorage.getItem("onboardingCompleted");
    if (completed === "true") {
      setShowOnboarding(false);
    }
  }, []);

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="App">
      <h1>Welcome to ClipWise</h1>
      <p>Your AI-powered video insights platform</p>
      <button onClick={() => setShowOnboarding(true)}>
        View Onboarding Again
      </button>
    </div>
  );
}

export default App;
