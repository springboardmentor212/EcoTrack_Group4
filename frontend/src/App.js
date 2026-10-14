import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Admin Imports
import AdminChallenges from "./pages/Admin/Challenges/Challenges";
import Users from "./pages/Admin/Users/Users";
import AdminLogin from "./pages/Admin/Login/Login";
import AdminReports from "./pages/Admin/Report/Report";

// Updated Imports inside pages/Auth/...
import Login from "./pages/Auth/login/login";
import Register from "./pages/Auth/Register/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword/ResetPassword";
import Profile from "./pages/Auth/Profile/Profile";
import Dashboard from "./pages/Auth/Dashboard/Dashboard";
import Report from "./pages/Auth/Report/report";
import GoalsPage from "./pages/Auth/Goal/goal.jsx";
import Challenges from "./pages/Auth/Challenges/challenges";
import Home from "./pages/Auth/Home/home";
import CarbonFootprint from "./pages/Auth/CarbonFootprint/CarbonFootprint";
import CarbonFootPrintTracker from "./pages/Auth/CarbonFootPrintTracker/CarbonFootPrintTracker";

// Exact import path for setting.jsx
import Setting from "./pages/Auth/Settings/setting";

const GOOGLE_CLIENT_ID =
  "818650396288-6s2ba3aqf306cejbgvip393qreb2ef1i.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        {/* Global Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Report />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/home" element={<Home />} />
          <Route path="/carbon-footprint" element={<CarbonFootprint />} />
          <Route
            path="/carbon-footprint-tracker"
            element={<CarbonFootPrintTracker />}
          />
          
          {/* Admin Routes */}
          <Route path="/Admin/login" element={<AdminLogin />} />
          <Route path="/Admin/users" element={<Users />} />
          <Route path="/Admin/challenges" element={<AdminChallenges />} />
          <Route path="/Admin/reports" element={<AdminReports />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;