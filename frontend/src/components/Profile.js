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
  Button,
  DangerButton,
  DeleteSection,
  WarningText,
  ConfirmBox,
  ActionButtons,
} from "./Profile.styled";

function Profile() {
  const navigate = useNavigate();
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
            {isGuest ? "Guest" : <Value>{userName}</Value>}
          </InfoRow>
          <InfoRow>
            <Label>Email:</Label>
            <Value>{isGuest ? "Not available (Guest)" : userEmail}</Value>
          </InfoRow>
        </Section>

        {/* <Section>
          <SectionTitle>Account Actions</SectionTitle>
          <Button onClick={handleLogout}>
            {isGuest ? "Exit Guest Mode" : "Logout"}
          </Button>
        </Section> */}

        {/* {!isGuest ? (
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
        ) : (
          ""
        )} */}
      </ProfileCard>
    </ProfileContainer>
  );
}

export default Profile;
