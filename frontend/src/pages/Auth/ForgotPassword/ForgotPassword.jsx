import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, KeyRound, Eye, EyeOff, ArrowLeft, RefreshCw } from "lucide-react";
import axios from "axios";
import background from "../../../assets/bg-image.jpeg";
import "../login/login.css";

const ForgotPassword = () => {
  
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Timer State (30 Seconds)
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();

  // Timer Countdown logic (Runs only in Step 2 - OTP Page)
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // STEP 1: Send OTP
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email,
      });
      setMessage(response.data.message);
      setStep(2);
      
      // Timer Reset to 30 Seconds
      setTimer(30);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // RESEND OTP Handler
  // RESEND OTP Handler
  const handleResendOTP = async () => {
    if (!canResend) return;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email,
      });
      setMessage(response.data.message || "New OTP sent to your email!"); // FIXED: response variable used here
      
      
      setTimer(30);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp,
      });
      setMessage(response.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.trim() !== confirmPassword.trim()) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/reset-password-otp", {
        email,
        otp,
        newPassword: newPassword.trim(),
      });

      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ backgroundImage: `url(${background})` }}>
      <div className="auth-card">
        <div className="brand-logo">
          <span className="brand-name">EcoTrack</span>
        </div>

        {/* STEP 1: Email Form */}
        {step === 1 && (
          <>
            <h2 className="auth-title">Forgot Password?</h2>
            <p className="auth-subtitle">Enter your email to receive a 6-digit OTP</p>

            <form onSubmit={handleSendOTP} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail className="field-icon" size={16} />
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Sending OTP..." : "Send Reset OTP"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="auth-title">Verify OTP</h2>
            <p className="auth-subtitle">Enter the 6-digit OTP sent to {email}</p>

            <form onSubmit={handleVerifyOTP} className="auth-form">
              <div className="form-group">
                <label>OTP Code</label>
                <div className="input-wrapper">
                  <KeyRound className="field-icon" size={16} />
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>

              
              <div style={{ textAlign: "right", marginTop: "8px", marginBottom: "15px" }}>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#1b7a42",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "13px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <RefreshCw size={13} /> Resend OTP
                  </button>
                ) : (
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    Resend OTP in <strong style={{ color: "#1b7a42" }}>{timer}s</strong>
                  </span>
                )}
              </div>

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          </>
        )}

       
        {step === 3 && (
          <>
            <h2 className="auth-title">New Password</h2>
            <p className="auth-subtitle">Create a new password for EcoTrack</p>

            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label>New Password</label>
                <div className="input-wrapper">
                  <Lock className="field-icon" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <Lock className="field-icon" size={16} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        )}

        
        {message && <p style={{ color: "#1b7a42", fontSize: "12px", marginTop: "10px", textAlign: "center" }}>{message}</p>}
        {error && <p className="status-msg" style={{ textAlign: "center", marginTop: "10px" }}>{error}</p>}

        <p className="bottom-link" style={{ marginTop: "20px" }}>
          <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;