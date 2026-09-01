import React, { useState } from "react";
import "./ForgotPassword.css";
import bgImage from "../../../assets/bg-image.jpeg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setSubmitted(false);

  if (!email.trim()) {
    setError("Please enter your email address.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    setError("Please enter a valid email address.");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch(
      "http://localhost:5000/api/auth/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Something went wrong. Please try again.");
      return;
    }

    console.log("Forgot password response:", data);
    setSubmitted(true);

  } catch (err) {
    console.error("Forgot password error:", err);

    setError(
      "Unable to connect to the server. Please make sure the backend is running."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="forgot-page">
     <div
  className="background-image"
  style={{ backgroundImage: `url(${bgImage})` }}
></div>

      {/* Main card */}
      <main className="forgot-card">

        {/* Logo */}
        <div className="brand">
          <div className="brand-icon">
            🌐
          </div>

          <span>EcoTrack</span>
        </div>

        {/* Heading */}
        <h1>Forgot Password</h1>

        <p className="subtitle">
          Enter your email to reset your EcoTrack account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          <label htmlFor="email">
            Email
          </label>

          <div className={`input-wrapper ${error ? "input-error" : ""}`}>


            <input
              id="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setSubmitted(false);
              }}
            />

          </div>

          {/* Error */}
          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {/* Information box */}
          <div className="instruction-box">

            <strong>
              Instructions will be sent to your email
            </strong>

            <span>
              Click the link in the email to set a new password.
            </span>

          </div>

          {/* Success message */}
          {submitted && (
          <div className="success-message">
           Password reset request created successfully.
          </div>
)}

          {/* Button */}
          <button
           type="submit"
           className="reset-button"
           disabled={loading}
          >
  {loading ? "Sending..." : "Send Reset Link"}
</button>

        </form>

        {/* Bottom links */}
        <div className="auth-links">

          <p>
            Remembered password?
            <a href="/login"> Sign In</a>
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

export default ForgotPassword;