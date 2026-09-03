import React, { useState } from "react";
import "./ResetPassword.css";
import bgImage from "../../../assets/bg-image.jpeg";
import { Globe } from "lucide-react";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");
    setSubmitted(false);

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError("Password must contain at least one number.");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setError("Password must contain at least one special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Backend API will be connected here later.
    console.log("New password:", newPassword);

    setSubmitted(true);
  };

  return (
    <div className="reset-page">

      {/* Background Image */}
      <div
        className="reset-background"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Main Card */}
      <main className="reset-card">

        {/* Logo */}
        <div className="logo">
          <Globe size={21} strokeWidth={1.8} />
          <span>EcoTrack</span>
        </div>

        {/* Heading */}
        <h1>Reset Password</h1>

        <p className="reset-subtitle">
          Create a new password for your EcoTrack account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* New Password */}
          <div className="password-field">

            <label htmlFor="new-password">
              New Password
            </label>

            <div
              className={`reset-input-wrapper ${
                error ? "reset-input-error" : ""
              }`}
            >
              <span className="password-icon">
                🔒
              </span>

              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="Password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                  setSubmitted(false);
                }}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowNewPassword(!showNewPassword)
                }
                aria-label={
                  showNewPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showNewPassword ? "◉" : "◌"}
              </button>

            </div>

          </div>

          {/* Confirm Password */}
          <div className="password-field">

            <label htmlFor="confirm-password">
              Confirm Password
            </label>

            <div
              className={`reset-input-wrapper ${
                error ? "reset-input-error" : ""
              }`}
            >

              <span className="password-icon">
                🔒
              </span>

              <input
                id="confirm-password"
                type={
                  showConfirmPassword ? "text" : "password"
                }
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                  setSubmitted(false);
                }}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? "◉" : "◌"}
              </button>

            </div>

          </div>

          {/* Password Requirements */}
          <div className="password-instructions">

            <strong>
              Password requirements
            </strong>

            <span>
              Must be at least 8 characters long.
            </span>

            <span>
              Include at least one number and one special character.
            </span>

          </div>

          {/* Error */}
          {error && (
            <div className="reset-error">
              {error}
            </div>
          )}

          {/* Success */}
          {submitted && (
            <div className="reset-success">
              Password has been reset successfully.
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            className="reset-password-button"
          >
            Reset Password
          </button>

        </form>

        {/* Bottom Links */}
        <div className="reset-auth-links">

          <p>
            Remembered password?
            <a href="/"> Sign In</a>
          </p>

          <p>
            Don't have an account?
            <a href="/register"> Register here</a>
          </p>

        </div>

      </main>

    </div>
  );
};

export default ResetPassword;