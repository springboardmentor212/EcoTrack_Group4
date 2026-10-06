import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Globe,
  Home,
  Leaf,
  Target,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  User,
  Mail,
  Lock,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";

import "./Settings.css";

const Setting = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
  });

  const [profileImage, setProfileImage] = useState(null);

  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: true,
    goalAchievement: true,
    challengeUpdates: false,
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserData({
          fullName: parsed.name || parsed.fullName || "",
          email: parsed.email || "",
        });

        const customPhoto = localStorage.getItem("customProfileImage");
        if (customPhoto) {
          setProfileImage(customPhoto);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    }

    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (err) {
        console.error("Error loading notifications:", err);
      }
    }
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setProfileImage(imageUrl);
        localStorage.setItem("customProfileImage", imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleNotificationChange = (name) => {
    setNotifications((prev) => {
      const updatedValue = !prev[name];
      const updated = {
        ...prev,
        [name]: updatedValue,
      };

      localStorage.setItem("notifications", JSON.stringify(updated));
      const title = formatTitle(name);

      if (updatedValue) {
        toast.info(`${title} Notifications Enabled!`, {
          toastId: `${name}-enabled`,
          className: "Toastify__toast--custom",
          autoClose: 2000,
        });

        setTimeout(() => {
          const todayDate = new Date().toDateString();
          const lastDailySent = localStorage.getItem("lastDailyReminderDate");

          if (name === "dailyReminder") {
            // Check if already shown today
            if (lastDailySent !== todayDate) {
              toast.success("📌 Add your today carbon records!", {
                toastId: "daily-reminder-demo",
                className: "Toastify__toast--custom",
                autoClose: 5000,
              });
              localStorage.setItem("lastDailyReminderDate", todayDate);
            }
          } else if (name === "weeklyReport") {
            const currentDay = new Date().getDay(); // 0 = Sunday, 6 = Saturday
            if (currentDay === 0 || currentDay === 6) {
              toast.success("📊 Weekend Summary: See your weekly report!", {
                toastId: "weekly-report-demo",
                className: "Toastify__toast--custom",
                autoClose: 5000,
              });
            }
          } else if (name === "goalAchievement") {
            toast.success("🎯 Goal Achievement Alerts Activated!", {
              toastId: "goal-enabled-demo",
              className: "Toastify__toast--custom",
              autoClose: 5000,
            });
          } else if (name === "challengeUpdates") {
            toast.success("🔥 Challenge updates are now active!", {
              toastId: "challenge-enabled-demo",
              className: "Toastify__toast--custom",
              autoClose: 5000,
            });
          }
        }, 10000);
      } else {
        toast.error(`${title} Notifications Disabled!`, {
          toastId: `${name}-disabled`,
          className: "Toastify__toast--custom",
          autoClose: 2000,
        });
      }

      return updated;
    });
  };

  const formatTitle = (key) => {
    switch (key) {
      case "dailyReminder": return "Daily Reminder";
      case "weeklyReport": return "Weekly Report";
      case "goalAchievement": return "Goal Achievement";
      case "challengeUpdates": return "Challenge Updates";
      default: return "";
    }
  };

  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("notifications", JSON.stringify(notifications));
    toast.success("Settings saved successfully!", {
      toastId: "saved-toast",
      className: "Toastify__toast--custom",
    });
  };

  const handleCancel = () => {
    window.location.reload();
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: "", text: "" });

    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setStatusMessage({ type: "error", text: "New passwords do not match!" });
      return;
    }

    if (passwordFields.newPassword.length < 6) {
      setStatusMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/auth/change-password",
        {
          currentPassword: passwordFields.currentPassword,
          newPassword: passwordFields.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message || "Password updated successfully!", { className: "Toastify__toast--custom" });
      setShowPasswordModal(false);
      setPasswordFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update password.",
      });
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      localStorage.clear();
      alert("Account deleted successfully");
      navigate("/login");
    }
  };

  return (
    <div className="settings-page">
      <aside className="settings-sidebar">
        <div className="eco-logo">
          <Globe size={20} />
          <span>EcoTrack</span>
        </div>

        <nav>
          <Link to="/home" className={location.pathname === "/home" ? "active" : ""}><Home size={16} /><span>Home</span></Link>
          <Link to="/carbon-footprint-tracker" className={location.pathname.includes("carbon") ? "active" : ""}><Leaf size={16} /><span>Carbon Tracker</span></Link>
          <Link to="/goals" className={location.pathname === "/goals" ? "active" : ""}><Target size={16} /><span>Goals</span></Link>
          <Link to="/challenges" className={location.pathname === "/challenges" ? "active" : ""}><ShieldCheck size={16} /><span>Challenges</span></Link>
          <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}><LayoutDashboard size={16} /><span>Dashboard</span></Link>
          <Link to="/reports" className={location.pathname === "/reports" ? "active" : ""}><FileText size={16} /><span>Reports</span></Link>
          <Link to="/profile" className={location.pathname === "/profile" ? "active" : ""}><User size={16} /><span>Profile</span></Link>
        </nav>
      </aside>

      <main className="settings-content">
        <div className="settings-heading">
          <h1>Settings</h1>
          <p>Manage your account and notification preferences</p>
        </div>

        <div className="settings-grid">
          <div className="settings-card">
            <h2>Account Settings</h2>

            <div className="field-group">
              <label>Profile Photo</label>
              <div className="profile-upload">
                <div className="profile-avatar">
                  {profileImage ? <img src={profileImage} alt="Profile" /> : <User size={28} />}
                </div>

                <label className="upload-button">
                  <Upload size={14} />
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                </label>
                <span>JPG, PNG</span>
              </div>
            </div>

            <div className="field-group">
              <label>Full Name</label>
              <input type="text" name="fullName" value={userData.fullName} onChange={handleUserInputChange} />
            </div>

            <div className="field-group">
              <label>Update Email Address</label>
              <div className="input-icon">
                <input type="email" name="email" value={userData.email} onChange={handleUserInputChange} />
                <Mail size={14} />
              </div>
            </div>

            <div className="field-group">
              <button className="change-password-btn" onClick={() => setShowPasswordModal(true)}>
                <Lock size={14} /> Change Password
              </button>
            </div>

            <button className="delete-account" onClick={handleDeleteAccount}>
              Delete Account
            </button>
          </div>

          <div className="settings-card">
            <h2>Notification Preferences</h2>

            <NotificationRow
              title="Daily Reminder"
              description="Get reminded to track your carbon footprint daily"
              checked={notifications.dailyReminder}
              onChange={() => handleNotificationChange("dailyReminder")}
            />

            <NotificationRow
              title="Weekly Report"
              description="Receive your weekly sustainability summary"
              checked={notifications.weeklyReport}
              onChange={() => handleNotificationChange("weeklyReport")}
            />

            <NotificationRow
              title="Goal Achievement"
              description="Get notified when you complete a goal"
              checked={notifications.goalAchievement}
              onChange={() => handleNotificationChange("goalAchievement")}
            />

            <NotificationRow
              title="Challenge Updates"
              description="Receive updates about your active challenges"
              checked={notifications.challengeUpdates}
              onChange={() => handleNotificationChange("challengeUpdates")}
            />
          </div>
        </div>

        <div className="settings-actions">
          <button className="save-button" onClick={handleSave}>Save Changes</button>
          <button className="cancel-button" onClick={handleCancel}>Cancel</button>
        </div>
      </main>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="password-modal">
            <div className="modal-header">
              <h2>Change Password</h2>
              <button className="modal-cancel" onClick={() => setShowPasswordModal(false)}>Cancel</button>
            </div>

            {statusMessage.text && (
              <p style={{ color: statusMessage.type === "error" ? "red" : "green", fontSize: "12px", textAlign: "center" }}>
                {statusMessage.text}
              </p>
            )}

            <form onSubmit={handleChangePasswordSubmit}>
              <div className="modal-field">
                <label>Current Password</label>
                <div className="password-input">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={passwordFields.currentPassword}
                    onChange={(e) => setPasswordFields({ ...passwordFields, currentPassword: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}>
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="modal-field">
                <label>New Password</label>
                <div className="password-input">
                  <input
                    type={showNew ? "text" : "password"}
                    value={passwordFields.newPassword}
                    onChange={(e) => setPasswordFields({ ...passwordFields, newPassword: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}>
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="modal-field">
                <label>Confirm New Password</label>
                <div className="password-input">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={passwordFields.confirmPassword}
                    onChange={(e) => setPasswordFields({ ...passwordFields, confirmPassword: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="modal-change-button">Change Password</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationRow = ({ title, description, checked, onChange }) => (
  <div className="notification-row">
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider"></span>
    </label>
  </div>
);

export default Setting;