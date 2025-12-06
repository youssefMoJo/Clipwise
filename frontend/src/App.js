import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import Onboarding from "./components/Onboarding";
import Auth from "./components/Auth";
import AddVideo from "./components/AddVideo";
import MyVideos from "./components/MyVideos";
import Profile from "./components/Profile";
import Layout from "./components/Layout";

function OnboardingRoute() {
  const navigate = useNavigate();

  const handleOnboardingComplete = () => {
    localStorage.setItem("onboardingCompleted", "true");
    navigate("/auth");
  };

  return <Onboarding onComplete={handleOnboardingComplete} />;
}

function AuthRoute() {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate("/my-videos");
  };

  return <Auth onAuthSuccess={handleAuthSuccess} />;
}

function ProtectedRoute({ children }) {
  const isAuthenticated =
    localStorage.getItem("access_token") ||
    localStorage.getItem("is_guest") === "true";

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function App() {
  const onboardingCompleted = localStorage.getItem("onboardingCompleted") === "true";
  const isAuthenticated =
    localStorage.getItem("access_token") ||
    localStorage.getItem("is_guest") === "true";

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !onboardingCompleted ? (
              <Navigate to="/onboarding" replace />
            ) : !isAuthenticated ? (
              <Navigate to="/auth" replace />
            ) : (
              <Navigate to="/my-videos" replace />
            )
          }
        />

        <Route path="/onboarding" element={<OnboardingRoute />} />
        <Route path="/auth" element={<AuthRoute />} />

        <Route
          path="/add-video"
          element={
            <ProtectedRoute>
              <Layout>
                <AddVideo />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-videos"
          element={
            <ProtectedRoute>
              <Layout>
                <MyVideos />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
