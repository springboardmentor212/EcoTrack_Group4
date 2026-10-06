import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Standard Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } else {
          localStorage.setItem("user", JSON.stringify({ email: formData.email }));
        }

        alert("Login Successful!");
        navigate("/home");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setErrorMessage(
        err.response?.data?.message || "Invalid Email or Password!"
      );
    }
  };

  // Google OAuth Fixed Handler
  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const accessToken = tokenResponse.access_token;

      // 1. Fetch User Profile directly from Google API using access_token
      const googleUserRes = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      const googleUser = googleUserRes.data;

      // 2. Send extracted google user details (email, name, picture) to Backend
      const res = await axios.post("http://localhost:5000/api/auth/google", { 
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        googleId: googleUser.id
      });

      if (res.data && res.data.token) {
        // 3. Store Backend JWT Token & User Info
        localStorage.setItem("token", res.data.token);
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }

        alert("Google Sign-In Successful!");
        navigate("/home");
      }
    } catch (error) {
      console.error("Google Auth Error:", error.response?.data || error);
      setErrorMessage(
        error.response?.data?.message || "Google Authentication Failed!"
      );
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setErrorMessage("Google Sign-In was unsuccessful. Try again."),
  });

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="brand-logo">
          <svg className="logo-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="brand-name">EcoTrack</span>
        </div>

        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue to EcoTrack</p>

        {errorMessage && <div className="status-msg">{errorMessage}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <span className="field-icon">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="field-icon">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280"
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-checkbox">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="primary-btn">
            Sign In
          </button>
        </form>

        <div className="or-divider">
          <span>OR</span>
        </div>

        {/* Custom Google Sign-In Button */}
        <div className="social-group">
          <button type="button" className="google-custom-btn" onClick={() => loginWithGoogle()}>
            <span style={{ color: "#4285F4", fontWeight: "bold", fontSize: "15px" }}>G</span>
            Sign in with Google
          </button>
        </div>

        <p className="bottom-link">
          Don't have another account ? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;