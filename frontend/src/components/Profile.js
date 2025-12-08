import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ProfileContainer,
  ProfileCard,
  Section,
  SectionTitle,
  InfoRow,
  Label,
  Value,
  Badge,
  Form,
  TextArea,
  Button,
  DangerButton,
  DeleteSection,
  WarningText,
  ConfirmBox,
  ActionButtons,
} from "./Profile.styled";

function Profile() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const isGuest = localStorage.getItem("is_guest") === "true";
  const userEmail = localStorage.getItem("user_email") || "N/A";
  // Extract name from email (part before @)
  const userName =
    userEmail !== "N/A" && userEmail.includes("@")
      ? userEmail.split("@")[0]
      : localStorage.getItem("user_name") || "Guest User";
  const guestId = localStorage.getItem("guest_id");

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!feedback.trim()) {
      alert("Please enter your feedback");
      return;
    }

    // TODO: Send feedback to backend API
    console.log("Feedback submitted:", feedback);

    setFeedbackSubmitted(true);
    setFeedback("");

    setTimeout(() => {
      setFeedbackSubmitted(false);
    }, 3000);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      alert('Please type "DELETE" to confirm');
      return;
    }

    // TODO: Call backend API to delete account
    console.log("Deleting account...");

    // Clear all localStorage data
    localStorage.clear();

    // Redirect to auth page
    navigate("/auth");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("guest_id");
    localStorage.removeItem("is_guest");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    navigate("/auth");
  };

  return (
    <ProfileContainer>
      <ProfileCard>
        <Section>
          <SectionTitle>Account Information</SectionTitle>
          <InfoRow>
            <Label>Name:</Label>
            <Value>{userName}</Value>
            {isGuest && <Badge>Guest</Badge>}
          </InfoRow>
          <InfoRow>
            <Label>Email:</Label>
            <Value>{isGuest ? "Not available (Guest)" : userEmail}</Value>
          </InfoRow>
          {isGuest && guestId && (
            <InfoRow>
              <Label>Guest ID:</Label>
              <Value>{guestId.substring(0, 12)}...</Value>
            </InfoRow>
          )}
        </Section>

        <Section>
          <SectionTitle>Send Feedback</SectionTitle>
          <Form onSubmit={handleFeedbackSubmit}>
            <TextArea
              placeholder="Share your thoughts, suggestions, or report issues..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
            />
            <Button type="submit" disabled={feedbackSubmitted}>
              {feedbackSubmitted ? "✓ Feedback Sent!" : "Submit Feedback"}
            </Button>
          </Form>
        </Section>

        <Section>
          <SectionTitle>Account Actions</SectionTitle>
          <Button onClick={handleLogout}>
            {isGuest ? "Exit Guest Mode" : "Logout"}
          </Button>
        </Section>

        <DeleteSection>
          <SectionTitle>Danger Zone</SectionTitle>
          <WarningText>
            {isGuest
              ? "Delete your guest session and all associated data. This action cannot be undone."
              : "Permanently delete your account and all associated data. This action cannot be undone."}
          </WarningText>

          {!showDeleteConfirm ? (
            <DangerButton onClick={() => setShowDeleteConfirm(true)}>
              Delete {isGuest ? "Session" : "Account"}
            </DangerButton>
          ) : (
            <ConfirmBox>
              <p>
                Type <strong>DELETE</strong> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
              <ActionButtons>
                <DangerButton onClick={handleDeleteAccount}>
                  Confirm Delete
                </DangerButton>
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                  }}
                >
                  Cancel
                </Button>
              </ActionButtons>
            </ConfirmBox>
          )}
        </DeleteSection>
      </ProfileCard>
    </ProfileContainer>
  );
}

export default Profile;
