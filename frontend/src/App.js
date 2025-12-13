import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import Onboarding from "./components/Onboarding";
import Auth from "./components/Auth";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AddVideo from "./components/AddVideo";
import MyVideos from "./components/MyVideos";
import Profile from "./components/Profile";
import VideoInsights from "./components/VideoInsights";
import Layout from "./components/Layout";

// Create a React Query client with optimized cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh
      cacheTime: 10 * 60 * 1000, // 10 minutes - keep in cache
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1, // Retry failed requests once
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

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

          <Route
            path="/video-insights/:videoId"
            element={
              <ProtectedRoute>
                <Layout>
                  <VideoInsights />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
