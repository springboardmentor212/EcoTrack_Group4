import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Lock, Globe } from "lucide-react";
import axios from "axios";
import bgImage from "../../../assets/bg-image.jpeg";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!formData.agreeTerms) {
      alert("Please agree to Terms & Conditions");
      return;
    }

    setLoading(true);

    try {
      // Backend Integration using Axios
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        agreeTerms: formData.agreeTerms,
      });

      alert(response.data.message || "Account created successfully!");
      
      // Reset form fields after successful registration
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false,
      });

    } catch (error) {
      console.error("Registration Error:", error);
      alert(
        error.response?.data?.message || "Registration failed! Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="register-page"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Background Overlay */}
      <div className="background-overlay"></div>

      {/* Register Card */}
      <div className="register-card">

        {/* Logo */}
        <div className="logo">
          <Globe size={21} strokeWidth={1.8} />
          <span>EcoTrack</span>
        </div>

        {/* Header */}
        <div className="register-header">
          <h2>Register for EcoTrack</h2>
          <p>AI-Powered Platform</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <div className="input-group">
            <User className="input-icon" size={14} />

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="input-group">
            <Mail className="input-icon" size={14} />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Row */}
          <div className="password-row">

            <div className="password-group">
              <Lock className="input-icon" size={13} />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="password-group">
              <Lock className="input-icon" size={13} />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          {/* Terms */}
          <div className="terms">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              required
            />

            <span>
              I agree to <b>Terms & Conditions</b>
            </span>
          </div>

          {/* Create Account */}
          <button type="submit" className="create-account-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        {/* OR Divider */}
        <div className="or-divider">
          <div></div>
          <span>OR</span>
          <div></div>
        </div>

        {/* Social Buttons */}
        <div className="social-buttons">

          {/* Google */}
          <button type="button" className="social-btn">
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

            Register with Google
          </button>

          {/* Apple */}
          <button type="button" className="social-btn">
            <svg
              width="11"
              height="11"
              viewBox="0 0 384 512"
              fill="#000000"
            >
              <path d="M318.7 268.7c-.2-36.7 16.4-64.3 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5 4 299.7 8.8 326.8 18.4 354c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.9-17.9 31.9 0 48.3 17.9 76.5 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.3-30.8-61.9-89.3-61.9-91.2zm-56-163.8c27.3-32.4 24.8-61.9 24-72.9-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 50.3-11.4 69.5-33.9z" />
            </svg>

            Register with Apple
          </button>

        </div>

        {/* Footer */}
        <p className="login-text">
          Already have an account?{" "}
          <Link to="/login">Log in</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;