import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import background from "../../../assets/bg-image.jpeg";
import "./login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignIn = (e) => {
    e.preventDefault();
    setMessage("Sign in clicked");
  };

  return (
    <div
      className="register-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="background-overlay"></div>

      <div className="register-card">


        <div className="logo">
           <svg className="logo-icon" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" />
            <ellipse cx="20" cy="20" rx="8" ry="18" />
            <path d="M2 20h36" />
            <path d="M5 12h30" />
            <path d="M5 28h30" />
            </svg>
            

          <span>EcoTrack</span>
        </div>

        {/* Header */}
        <div className="register-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue to EcoTrack</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSignIn}>

          {/* Email */}
          <div className="input-group">
            <Mail className="input-icon" size={14} />

            <input
              type="email"
              placeholder="Email Address"
              required
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <Lock className="input-icon" size={14} />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
            />

            <button
              type="button"
              className="show-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Options */}
          <div className="login-options">

            <label className="remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />

              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-password"
              onClick={() =>
                setMessage("Password reset option clicked")
              }
            >
              Forgot Password?
            </button>

          </div>

          {/* Sign In */}
          <button
            type="submit"
            className="create-account-btn"
          >
            Sign In
          </button>

        </form>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

        {/* OR Divider */}
        <div className="or-divider">
          <div></div>
          <span>OR</span>
          <div></div>
        </div>

        {/* Social Buttons */}
        <div className="social-buttons">

          {/* Google */}
          <button
            type="button"
            className="social-btn"
            onClick={() =>
              setMessage("Google sign in clicked")
            }
          >
            <svg width="11" height="11" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.45a5.52 5.52 0 01-2.39 3.62v2.79h3.87c2.27-2.09 3.56-5.17 3.56-8.44z"
              />

              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-2.79c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27A12 12 0 0012 24z"
              />

              <path
                fill="#FBBC05"
                d="M5.27 14.5A7.2 7.2 0 014.9 12c0-.87.15-1.71.42-2.5V6.62H1.27A12 12 0 000 12c0 1.94.46 3.77 1.27 5.38l4-2.88z"
              />

              <path
                fill="#EA4335"
                d="M12 4.55c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95.96 15.24 0 12 0A12 12 0 001.27 6.62l4.05 2.88C6.27 6.66 8.88 4.55 12 4.55z"
              />
            </svg>

            Sign in with Google
          </button>

          {/* Apple */}
          <button
            type="button"
            className="social-btn"
            onClick={() =>
              setMessage("Apple sign in clicked")
            }
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 384 512"
              fill="#000000"
            >
              <path d="M318.7 268.7c-.2-36.7 16.4-64.3 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5 4 299.7 8.8 326.8 18.4 354c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.9-17.9 31.9 0 48.3 17.9 76.5 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.3-30.8-61.9-89.3-61.9-91.2zm-56-163.8c27.3-32.4 24.8-61.9 24-72.9-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 50.3-11.4 69.5-33.9z" />
            </svg>

            Sign in with Apple
          </button>

        </div>

        {/* Register */}
        <p className="login-text">
          Don't have an account?{" "}
          <Link to="/register">Register here</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;