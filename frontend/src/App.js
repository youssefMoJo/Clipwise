import React, { useState } from "react";
import "./App.css";
import Onboarding from "./components/Onboarding";
import Auth from "./components/Auth";

function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("onboardingCompleted", "true");
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("guest_id");
    localStorage.removeItem("is_guest");
  };

  React.useEffect(() => {
    const completed = localStorage.getItem("onboardingCompleted");
    const accessToken = localStorage.getItem("access_token");
    const isGuest = localStorage.getItem("is_guest");

    if (completed === "true") {
      setShowOnboarding(false);
    }

    if (accessToken || isGuest === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  const isGuest = localStorage.getItem("is_guest") === "true";

  return (
    <div className="App">
      <h1>Welcome to ClipWise</h1>
      <p>Your AI-powered video insights platform</p>
      {isGuest && (
        <p style={{ color: "#667eea", fontWeight: "600" }}>
          Welcome, guest! Sign up anytime to keep your insights safe.
        </p>
      )}
      <button onClick={() => setShowOnboarding(true)}>
        View Onboarding Again
      </button>
      <button onClick={handleLogout}>
        {isGuest ? "Exit Guest Mode" : "Log Out"}
      </button>
    </div>
  );
}

export default App;
