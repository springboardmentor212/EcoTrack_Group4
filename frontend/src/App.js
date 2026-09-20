import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Auth/login/login";
import Register from "./pages/Auth/Register/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword/ResetPassword";
import Profile from "./pages/Auth/Profile/Profile"; 
import Dashboard from "./dashboard/dashboard";


import Goal from "./pages/Goal/goal";
import Home from "./pages/Home/home";
import CarbonFootprint from "./pages/CarbonFootprint/CarbonFootprint";
import CarbonFootPrintTracker from "./pages/CarbonFootPrintTracker/CarbonFootPrintTracker";

function App() {
  return (
    <Router>
      <Routes>
        {/* Project start aagumbozhudhu direct-a Login Page load aagum */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Standard Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/goals" element={<Goal />} />
        <Route path="/home" element={<Home />} />
        <Route path="/carbon-footprint" element={<CarbonFootprint />} />
        <Route path="/carbon-footprint-tracker" element={<CarbonFootPrintTracker />} />
      </Routes>
    </Router>
  );
}

export default App;