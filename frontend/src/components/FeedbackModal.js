import React, { useState } from "react";
import ReactDOM from "react-dom";
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  FormGroup,
  Label,
  TextArea,
  Input,
  StarRating,
  Star,
  CharCount,
  ModalFooter,
  CancelButton,
  SubmitButton,
  SuccessMessage,
  ErrorMessage,
} from "./FeedbackModal.styled";
import { submitFeedback } from "../services/api";

function FeedbackModal({ isOpen, onClose }) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const maxLength = 5000;

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      setErrorMessage("Please enter your feedback");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSubmitStatus(null);

    try {
      await submitFeedback({
        message: message.trim(),
        email: email.trim() || null,
        rating: rating || null,
      });

      setSubmitStatus("success");
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage("");
      setEmail("");
      setRating(0);
      setHoveredRating(0);
      setSubmitStatus(null);
      setErrorMessage("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Send Feedback</ModalTitle>
          <CloseButton onClick={handleClose} disabled={isSubmitting}>
            &times;
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {submitStatus === "success" ? (
            <SuccessMessage>
              Thank you for your feedback! We appreciate your input.
            </SuccessMessage>
          ) : (
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>
                  How would you rate your experience?{" "}
                  <span style={{ color: "#999", fontSize: "0.9rem" }}>
                    (Optional)
                  </span>
                </Label>
                <StarRating>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      $filled={star <= (hoveredRating || rating)}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      ★
                    </Star>
                  ))}
                </StarRating>
              </FormGroup>

              <FormGroup>
                <Label>Your Feedback *</Label>
                <TextArea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think about ClipWise..."
                  maxLength={maxLength}
                  rows={6}
                  disabled={isSubmitting}
                  required
                />
                <CharCount $isNearLimit={message.length > maxLength * 0.9}>
                  {message.length}/{maxLength}
                </CharCount>
              </FormGroup>

              <FormGroup>
                <Label>
                  Email{" "}
                  <span style={{ color: "#999", fontSize: "0.9rem" }}>
                    (Optional - if you'd like a response)
                  </span>
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  disabled={isSubmitting}
                />
              </FormGroup>

              {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

              <ModalFooter>
                <CancelButton
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </CancelButton>
                <SubmitButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Feedback"}
                </SubmitButton>
              </ModalFooter>
            </form>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
}

export default FeedbackModal;
