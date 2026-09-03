import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import background from "../../../assets/bg-image.jpeg";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 1. Standard Email/Password Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/profile");
    } catch (error) {
      console.error("Login Error:", error);
      setMessage(
        error.response?.data?.message || "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Google OAuth Sign In
  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/google", {
        access_token: tokenResponse.access_token,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/profile");
    } catch (err) {
      console.error("Google Auth Error:", err);
      setMessage("Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setMessage("Google Sign-In failed"),
  });

  // 3. Apple Sign In Handler
  const handleAppleLogin = () => {
    if (window.AppleID && window.AppleID.auth) {
      window.AppleID.auth.signIn();
    } else {
      setMessage("Apple Sign-In is initializing. Please try again.");
    }
  };

  return (
    <div
      className="auth-container"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="auth-card">
        {/* Brand Header */}
        <div className="brand-logo">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
          <span className="brand-name">EcoTrack</span>
        </div>

        {/* Title */}
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue to EcoTrack</p>

        {/* Login Form */}
        <form onSubmit={handleSignIn} className="auth-form">
          {/* Email Field */}
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <Mail className="field-icon" size={16} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="field-icon" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Options */}
          <div className="form-options">
            <label className="remember-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <span>Remember me</span>
            </label>

            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {message && <p className="status-msg">{message}</p>}

        {/* Divider */}
        <div className="or-divider">
          <span>OR</span>
        </div>

        {/* Social Buttons Section */}
        <div className="social-group">
          {/* Google Button */}
          <button
            type="button"
            className="social-btn"
            onClick={() => loginWithGoogle()}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Apple Button (Custom Styled to Match Figma) */}
          <button
            type="button"
            className="social-btn"
            onClick={handleAppleLogin}
          >
            <svg viewBox="0 0 170 170" width="16" height="16" fill="currentColor">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.33.13-9.13-1.9-14.4-6.08-3.81-3.1-7.84-7.96-12.1-14.58-6.1-9.46-10.8-19.8-14.1-31.02-3.3-11.22-4.95-21.72-4.95-31.5 0-14.28 3.53-25.92 10.58-34.92 7.06-9 16.12-13.58 27.2-13.75 4.8 0 9.87 1.25 15.22 3.75 5.35 2.5 9.17 3.75 11.45 3.75 2.13 0 6.02-1.25 11.68-3.75 5.66-2.5 10.56-3.67 14.7-3.5 10.74.52 19.38 4.39 25.92 11.61-9.53 5.76-14.17 13.78-13.92 24.06.25 8.1 3.27 14.93 9.06 20.5 5.79 5.57 12.8 8.76 21.03 9.57-2.3 6.83-5.22 13.56-8.76 20.19zM119.22 31.84c0-6.75 2.45-13.1 7.35-19.05 4.9-5.95 11.02-9.55 18.37-10.79.25.88.38 1.75.38 2.63 0 6.78-2.55 13.23-7.65 19.35-5.1 6.12-11.29 9.7-18.57 10.74-.13-.96-.19-1.92-.19-2.88z" />
            </svg>
            <span>Sign in with Apple</span>
          </button>
        </div>

        {/* Footer Link */}
        <p className="bottom-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;