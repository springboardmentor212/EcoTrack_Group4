import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Standard Email & Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        alert("Login Successful!");
        
        // Direct Redirection to Home Page
        navigate("/home");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setErrorMessage(
        err.response?.data?.message || "Invalid Email or Password!"
      );
    }
  };

  // 2. Google OAuth Login Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      
      // Store Google ID token in localStorage
      localStorage.setItem("token", token);

      // Backend optional verification endpoint call
      try {
        await axios.post("http://localhost:5000/api/auth/google", { token });
      } catch (backendErr) {
        console.warn("Backend auth route skipped/missing, proceeding with token");
      }

      alert("Google Sign-In Successful!");
      
      // Direct Redirection to Home Page
      navigate("/home");
    } catch (error) {
      console.error("Google Auth Error:", error);
      setErrorMessage("Google Authentication Failed!");
    }
  };

  // 3. Google OAuth Login Failure Handler
  const handleGoogleError = () => {
    console.error("Google Sign-In Failed");
    setErrorMessage("Google Sign-In was unsuccessful. Try again.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Welcome to EcoTrack
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Sign in to continue to your dashboard
        </p>

        {errorMessage && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 text-center border border-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
          >
            Sign In
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-400">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Login Button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;