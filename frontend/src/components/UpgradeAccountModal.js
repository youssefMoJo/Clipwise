import React, { useState } from "react";
import ReactDOM from "react-dom";
import styled, { keyframes } from "styled-components";
import { signUp, logIn, convertGuestToUser } from "../services/api";

const UpgradeAccountModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginSuggestion, setShowLoginSuggestion] = useState(false);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setError("");
      setShowLoginSuggestion(false);
    }
  }, [isOpen]);

  const handleEmailBlur = async () => {
    // Simple email check - in real implementation, you'd call an API endpoint
    // For now, we'll skip the email existence check and handle it during signup
    setShowLoginSuggestion(false);
  };

  const handleSubmit = async (e, isLogin = false) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!isLogin && password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const guestId = localStorage.getItem("guest_id");

      if (isLogin) {
        // Log in existing user
        const data = await logIn(email, password);

        // Store tokens (but keep is_guest=true temporarily for video transfer)
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("id_token", data.id_token);
          localStorage.setItem("refresh_token", data.refresh_token);

          const expiresAt = Date.now() + data.expires_in * 1000;
          localStorage.setItem("token_expires_at", expiresAt.toString());

          localStorage.setItem("user_email", email);
          const username = email.split("@")[0];
          localStorage.setItem("user_name", username);

          // Transfer guest videos to this account BEFORE clearing guest status
          if (guestId) {
            try {
              console.log("Starting guest-to-user conversion (login)...");
              console.log("Guest ID:", guestId);
              console.log("is_guest flag:", localStorage.getItem("is_guest"));

              const result = await convertGuestToUser();
              console.log("Conversion successful (login):", result);
            } catch (conversionError) {
              console.error(
                "Failed to transfer guest videos:",
                conversionError
              );
              console.error("Conversion error details:", conversionError.message);
              // Continue anyway - don't block the user from logging in
            } finally {
              // Now clear guest status and guest_id
              localStorage.setItem("is_guest", "false");
              localStorage.removeItem("guest_id");
            }
          } else {
            console.log("No guest ID found (login), skipping conversion");
            // No guest ID, just clear guest status
            localStorage.setItem("is_guest", "false");
          }

          onSuccess();
        }
      } else {
        // Sign up new user
        try {
          await signUp(email, password);
          setError("");

          // Automatically log in after successful sign up
          const data = await logIn(email, password);

          // Store tokens (but keep is_guest=true temporarily for video transfer)
          if (data.access_token) {
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("id_token", data.id_token);
            localStorage.setItem("refresh_token", data.refresh_token);

            const expiresAt = Date.now() + data.expires_in * 1000;
            localStorage.setItem("token_expires_at", expiresAt.toString());

            localStorage.setItem("user_email", email);
            const username = email.split("@")[0];
            localStorage.setItem("user_name", username);

            // Convert guest account BEFORE clearing guest status
            if (guestId) {
              try {
                console.log("Starting guest-to-user conversion...");
                console.log("Guest ID:", guestId);
                console.log("is_guest flag:", localStorage.getItem("is_guest"));

                const result = await convertGuestToUser();
                console.log("Conversion successful:", result);
              } catch (conversionError) {
                console.error(
                  "Failed to convert guest account:",
                  conversionError
                );
                console.error("Conversion error details:", conversionError.message);
                // Continue anyway - don't block the user from logging in
              } finally {
                // Now clear guest status and guest_id
                localStorage.setItem("is_guest", "false");
                localStorage.removeItem("guest_id");
              }
            } else {
              console.log("No guest ID found, skipping conversion");
              // No guest ID, just clear guest status
              localStorage.setItem("is_guest", "false");
            }

            onSuccess();
          }
        } catch (signupError) {
          // Check if error is "User already exists"
          if (
            signupError.message &&
            signupError.message.toLowerCase().includes("already exists")
          ) {
            setShowLoginSuggestion(true);
            setError(
              "An account with this email already exists. Would you like to log in instead? Your current guest videos will be transferred."
            );
          } else {
            setError(signupError.message || "Failed to create account");
          }
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <ModalOverlay onClick={loading ? undefined : onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} disabled={loading}>
          ✕
        </CloseButton>

        <IconContainer>
          <UpgradeIcon>🚀</UpgradeIcon>
        </IconContainer>

        <ModalTitle>Unlock Your Full Potential!</ModalTitle>
        <ModalSubtitle>
          Create an account to keep your videos forever
        </ModalSubtitle>

        <BenefitsList>
          <BenefitItem>
            <BenefitIcon>✓</BenefitIcon>
            <BenefitText>
              Your current videos will be saved to your account
            </BenefitText>
          </BenefitItem>
          <BenefitItem>
            <BenefitIcon>✓</BenefitIcon>
            <BenefitText>Upload unlimited videos</BenefitText>
          </BenefitItem>
          <BenefitItem>
            <BenefitIcon>✓</BenefitIcon>
            <BenefitText>Access your content from anywhere</BenefitText>
          </BenefitItem>
        </BenefitsList>

        <Form onSubmit={handleSubmit}>
          {error && (
            <ErrorMessage $isWarning={showLoginSuggestion}>
              {error}
            </ErrorMessage>
          )}

          <FormGroup>
            <Label htmlFor="upgrade-email">Email</Label>
            <Input
              id="upgrade-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              disabled={loading}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="upgrade-password">Password</Label>
            <Input
              id="upgrade-password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </FormGroup>

          {showLoginSuggestion ? (
            <ButtonGroup>
              <SecondaryButton
                type="button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create New Account Anyway"}
              </SecondaryButton>
              <PrimaryButton
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner /> Logging In...
                  </>
                ) : (
                  "Log In & Transfer Videos"
                )}
              </PrimaryButton>
            </ButtonGroup>
          ) : (
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner /> Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </PrimaryButton>
          )}
        </Form>

        <Footer>
          By creating an account, you agree to our Terms of Service
        </Footer>
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
};

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.3s ease-out;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 80px rgba(102, 126, 234, 0.3);
  animation: ${slideUp} 0.4s ease-out;
  position: relative;
  border: 2px solid rgba(102, 126, 234, 0.1);

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(102, 126, 234, 0.05);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #5568d3 0%, #654091 100%);
  }

  @media (max-width: 768px) {
    padding: 2rem;
    max-width: 95%;
    max-height: 85vh;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(102, 126, 234, 0.1);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #667eea;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(102, 126, 234, 0.2);
    transform: rotate(90deg);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const IconContainer = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const UpgradeIcon = styled.div`
  font-size: 5rem;
  animation: ${pulse} 2s ease-in-out infinite;
  filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3));
`;

const ModalTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const ModalSubtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 2rem 0;
  text-align: center;
  line-height: 1.5;
`;

const BenefitsList = styled.div`
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.05),
    rgba(118, 75, 162, 0.05)
  );
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const BenefitIcon = styled.div`
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
  font-size: 0.9rem;
`;

const BenefitText = styled.span`
  color: #333;
  font-size: 1rem;
  line-height: 1.4;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 0.875rem 1rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #999;
  }
`;

const ErrorMessage = styled.div`
  background: ${(props) =>
    props.$isWarning
      ? "linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 193, 7, 0.1))"
      : "linear-gradient(135deg, rgba(255, 71, 87, 0.1), rgba(255, 107, 129, 0.1))"};
  color: ${(props) => (props.$isWarning ? "#ff6f00" : "#ff4757")};
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
  border: 1px solid
    ${(props) =>
      props.$isWarning ? "rgba(255, 152, 0, 0.3)" : "rgba(255, 71, 87, 0.3)"};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-direction: column;

  @media (min-width: 500px) {
    flex-direction: row;
  }
`;

const PrimaryButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);

    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  flex: 1;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(102, 126, 234, 0.05);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const Footer = styled.p`
  text-align: center;
  font-size: 0.85rem;
  color: #999;
  margin: 1.5rem 0 0 0;
  line-height: 1.4;
`;

export default UpgradeAccountModal;
