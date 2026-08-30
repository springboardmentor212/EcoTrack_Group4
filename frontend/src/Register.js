import React, { useState } from "react";
import { User, Mail, Lock, Globe } from "lucide-react";
import bgImage from "./assets/bg-image.jpeg";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!formData.agreeTerms) {
      alert("Please agree to Terms & Conditions");
      return;
    }

    console.log("Register Data:", formData);
    alert("Account created successfully!");
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Background Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(5, 30, 40, 0.35)",
        }}
      />

      {/* REGISTER CARD */}
      <div
        style={{
          position: "relative",
          zIndex: 1,

          width: "314px",

          /* REMOVED minHeight - card now fits content */
          background: "rgba(247, 249, 249, 0.94)",
          backdropFilter: "blur(12px)",

          border: "1px solid rgba(210, 220, 220, 0.9)",
          borderRadius: "18px",

          boxShadow: "0px 12px 30px rgba(0, 0, 0, 0.22)",

          /* Balanced padding */
          padding: "24px 20px 20px",

          color: "#1F2937",
          boxSizing: "border-box",
        }}
      >
        {/* LOGO */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "6px",
            marginBottom: "12px",
          }}
        >
          <Globe
            size={21}
            strokeWidth={1.8}
            color="#3E665A"
          />

          <span
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "18px",
              fontWeight: "600",
              color: "#3E665A",
            }}
          >
            EcoTrack
          </span>
        </div>

        {/* HEADER */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "18px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "700",
              color: "#29313A",
            }}
          >
            Register for EcoTrack
          </h2>

          <p
            style={{
              margin: "7px 0 0",
              fontSize: "10px",
              fontWeight: "600",
              color: "#59616B",
            }}
          >
            AI-Powered Platform
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* FULL NAME */}
          <div
            style={{
              position: "relative",
              marginBottom: "10px",
            }}
          >
            <User
              size={14}
              color="#6B7280"
              style={{
                position: "absolute",
                left: "11px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                height: "32px",
                paddingLeft: "32px",
                paddingRight: "12px",
                boxSizing: "border-box",
                border: "1px solid #D3D9D8",
                borderRadius: "16px",
                background: "#FFFFFF",
                fontSize: "10px",
                color: "#374151",
                outline: "none",
                boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
              }}
            />
          </div>

          {/* EMAIL */}
          <div
            style={{
              position: "relative",
              marginBottom: "10px",
            }}
          >
            <Mail
              size={14}
              color="#6B7280"
              style={{
                position: "absolute",
                left: "11px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                height: "32px",
                paddingLeft: "32px",
                paddingRight: "12px",
                boxSizing: "border-box",
                border: "1px solid #D3D9D8",
                borderRadius: "16px",
                background: "#FFFFFF",
                fontSize: "10px",
                color: "#374151",
                outline: "none",
                boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
              }}
            />
          </div>

          {/* PASSWORD ROW */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "9px",
            }}
          >
            {/* PASSWORD */}
            <div
              style={{
                position: "relative",
                width: "50%",
              }}
            >
              <Lock
                size={13}
                color="#6B7280"
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  height: "32px",
                  paddingLeft: "30px",
                  paddingRight: "5px",
                  boxSizing: "border-box",
                  border: "1px solid #D3D9D8",
                  borderRadius: "16px",
                  background: "#FFFFFF",
                  fontSize: "9px",
                  outline: "none",
                  boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
                }}
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div
              style={{
                position: "relative",
                width: "50%",
              }}
            >
              <Lock
                size={13}
                color="#6B7280"
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  height: "32px",
                  paddingLeft: "30px",
                  paddingRight: "4px",
                  boxSizing: "border-box",
                  border: "1px solid #D3D9D8",
                  borderRadius: "16px",
                  background: "#FFFFFF",
                  fontSize: "8.5px",
                  outline: "none",
                  boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
                }}
              />
            </div>
          </div>

          {/* TERMS */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginBottom: "11px",
            }}
          >
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              required
              style={{
                width: "11px",
                height: "11px",
                margin: 0,
                accentColor: "#176B4B",
                cursor: "pointer",
              }}
            />

            <span
              style={{
                fontSize: "8.5px",
                color: "#6B7280",
              }}
            >
              I agree to{" "}
              <span
                style={{
                  fontWeight: "600",
                  color: "#3E665A",
                }}
              >
                Terms & Conditions
              </span>
            </span>
          </div>

          {/* CREATE ACCOUNT BUTTON */}
          <button
            type="submit"
            style={{
              width: "100%",
              height: "34px",
              border: "none",
              borderRadius: "17px",
              background: "#176B4B",
              color: "#FFFFFF",
              fontSize: "10px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0px 3px 7px rgba(23, 107, 75, 0.25)",
            }}
          >
            Create Account
          </button>
        </form>

        {/* OR DIVIDER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            margin: "14px 0 12px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#D7DDDC",
            }}
          />

          <span
            style={{
              fontSize: "9px",
              color: "#7C858B",
            }}
          >
            OR
          </span>

          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#D7DDDC",
            }}
          />
        </div>

        {/* SOCIAL BUTTONS */}
        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          {/* GOOGLE */}
          <button
            type="button"
            style={{
              width: "50%",
              height: "31px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              background: "#FFFFFF",
              border: "1px solid #D3D9D8",
              borderRadius: "15px",
              fontSize: "9px",
              fontWeight: "500",
              color: "#374151",
              cursor: "pointer",
            }}
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

            Register with Google
          </button>

          {/* APPLE */}
          <button
            type="button"
            style={{
              width: "50%",
              height: "31px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              background: "#FFFFFF",
              border: "1px solid #D3D9D8",
              borderRadius: "15px",
              fontSize: "9px",
              fontWeight: "500",
              color: "#374151",
              cursor: "pointer",
            }}
          >
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

        {/* FOOTER */}
        <p
          style={{
            textAlign: "center",
            margin: "13px 0 0",
            fontSize: "9px",
            color: "#6B7280",
          }}
        >
          Already have an account?{" "}
          <a
            href="/login"
            style={{
              color: "#3E665A",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;