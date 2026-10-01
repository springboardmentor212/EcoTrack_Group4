import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Login from "./pages/Auth/login/login";
import Register from "./pages/Auth/Register/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword/ResetPassword";
import Profile from "./pages/Auth/Profile/Profile";
import Dashboard from "./pages/Auth/Dashboard/Dashboard";
import Report from "./pages/Report/report";
import GoalsPage from "./pages/Goal/goal";
import Challenges from "./pages/Challenges/challenges";
import Home from "./pages/Home/home";
import CarbonFootprint from "./pages/CarbonFootprint/CarbonFootprint";
import CarbonFootPrintTracker from "./pages/CarbonFootPrintTracker/CarbonFootPrintTracker";

const GOOGLE_CLIENT_ID =
 "818650396288-6s2ba3aqf306cejbgvip393qreb2ef1i.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
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
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;