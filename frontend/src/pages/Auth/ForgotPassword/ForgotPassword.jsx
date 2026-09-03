import React, { useState } from "react";
import "./ForgotPassword.css";
import { Globe } from "lucide-react";
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

      {/* Background Image */}
      <div
        className="background-image"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Main Card */}
      <main className="forgot-card">

        {/* EcoTrack Logo */}
        <div className="logo">
          <Globe size={21} strokeWidth={1.8} />
          <span>EcoTrack</span>
        </div>

        {/* Heading */}
        <h1>Forgot Password</h1>

        <p className="subtitle">
          Enter your email to reset your EcoTrack account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Email Label */}
          <label htmlFor="email">
            Email
          </label>

          {/* Email Input */}
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

          {/* Information Box */}
          <div className="instruction-box">

            <strong>
              Instructions will be sent to your email
            </strong>

            <span>
              Click the link in the email to set a new password.
            </span>

          </div>

          {/* Success Message */}
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

        {/* Bottom Links */}
        <div className="auth-links">

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

export default ForgotPassword;