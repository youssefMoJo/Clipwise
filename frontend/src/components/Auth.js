import React, { useState } from "react";
import { signUp, logIn } from "../services/api";
import {
  AuthContainer,
  AuthCard,
  AuthHeader,
  AuthLogo,
  AuthSubtitle,
  AuthToggle,
  ToggleBtn,
  AuthForm,
  FormGroup,
  Label,
  Input,
  ErrorMessage,
  AuthSubmitBtn,
  AuthFooter,
  LinkBtn,
  GuestSection,
  GuestBtn,
} from "./Auth.styled";

const Auth = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign up
        await signUp(email, password);
        setError("");

        // Automatically log in after successful sign up
        const data = await logIn(email, password);

        // Store tokens
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("id_token", data.id_token);
          localStorage.setItem("refresh_token", data.refresh_token);

          // Calculate and store expiration time (expires_in is in seconds)
          const expiresAt = Date.now() + data.expires_in * 1000;
          localStorage.setItem("token_expires_at", expiresAt.toString());

          // Store user email and username
          localStorage.setItem("user_email", email);
          const username = email.split("@")[0];
          localStorage.setItem("user_name", username);
          localStorage.setItem("is_guest", "false");
        }

        onAuthSuccess();
      } else {
        // Log in
        const data = await logIn(email, password);

        // Store tokens
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("id_token", data.id_token);
          localStorage.setItem("refresh_token", data.refresh_token);

          // Calculate and store expiration time (expires_in is in seconds)
          const expiresAt = Date.now() + data.expires_in * 1000;
          localStorage.setItem("token_expires_at", expiresAt.toString());

          // Store user email and username
          localStorage.setItem("user_email", email);
          const username = email.split("@")[0];
          localStorage.setItem("user_name", username);
          localStorage.setItem("is_guest", "false");
        }

        onAuthSuccess();
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setEmail("");
    setPassword("");
  };

  const handleGuestLogin = () => {
    // Generate a unique guest ID
    const guestId = `guest_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Store guest session
    localStorage.setItem("guest_id", guestId);
    localStorage.setItem("is_guest", "true");

    // Call the success callback
    onAuthSuccess();
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthHeader>
          <AuthLogo src="/Logo1.png" alt="ClipWise Logo" />
          <AuthSubtitle>Your AI-powered video insights platform</AuthSubtitle>
        </AuthHeader>

        <AuthToggle>
          <ToggleBtn
            $active={isSignUp}
            onClick={() => !isSignUp && toggleMode()}
          >
            Sign Up
          </ToggleBtn>
          <ToggleBtn
            $active={!isSignUp}
            onClick={() => isSignUp && toggleMode()}
          >
            Log In
          </ToggleBtn>
        </AuthToggle>

        <AuthForm onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </FormGroup>

          <AuthSubmitBtn type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isSignUp
              ? "Create Account"
              : "Log In"}
          </AuthSubmitBtn>
        </AuthForm>

        {/* <AuthFooter>
          <p>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <LinkBtn onClick={toggleMode} disabled={loading}>
              {isSignUp ? "Log In" : "Sign Up"}
            </LinkBtn>
          </p>
        </AuthFooter> */}

        {/* <GuestSection>
          <GuestBtn onClick={handleGuestLogin} disabled={loading}>
            Continue as Guest
          </GuestBtn>
        </GuestSection> */}
      </AuthCard>
    </AuthContainer>
  );
};

export default Auth;
