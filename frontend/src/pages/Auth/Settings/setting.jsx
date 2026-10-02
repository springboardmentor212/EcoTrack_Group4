import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Square,
  Target,
  Grid2X2,
  User,
  Mail,
  Lock,
  Upload,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";

import "./Settings.css";

const Setting = () => {
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

  // Profile image
  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  // Notifications
  const handleNotificationChange = (name) => {
    setNotifications((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Save settings
  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  // Cancel settings
  const handleCancel = () => {
    window.location.reload();
  };

  // Delete account
  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (confirmed) {
      alert("Account deleted successfully");
    }
  };

  return (
    <div className="settings-page">

      {/* SIDEBAR */}
      <aside className="settings-sidebar">

        <div className="eco-logo">
          <Globe size={20} strokeWidth={1.8} />
          <span>EcoTrack</span>
        </div>

        <nav>

          <Link to="/home">
            <Home size={17} />
            <span>Home</span>
          </Link>

          <Link to="/carbon-footprint-tracker">
            <Square size={17} />
            <span>Carbon Tracker</span>
          </Link>

          <Link to="/goals">
            <Target size={17} />
            <span>Goals</span>
          </Link>

          <Link to="/dashboard">
            <Grid2X2 size={17} />
            <span>Dashboard</span>
          </Link>

          <Link to="/profile">
            <User size={17} />
            <span>Profile</span>
          </Link>

        </nav>

      </aside>


      {/* MAIN CONTENT */}
      <main className="settings-content">

        <div className="settings-heading">
          <h1>Settings</h1>
          <p>Manage your account and notification preferences</p>
        </div>


        <div className="settings-grid">

          {/* ACCOUNT SETTINGS */}
          <div className="settings-card">

            <h2>Account Settings</h2>


            {/* PROFILE PHOTO */}
            <div className="field-group">

              <label>Profile Photo</label>

              <div className="profile-upload">

                <div className="profile-avatar">

                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                    />
                  ) : (
                    <User size={30} />
                  )}

                </div>

                <label className="upload-button">

                  <Upload size={14} />

                  Upload Photo

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />

                </label>

                <span>JPG, PNG</span>

              </div>

            </div>


            {/* FULL NAME */}
            <div className="field-group">

              <label>Full Name</label>

              <input
                type="text"
                defaultValue=""
                placeholder="Enter your full name"
              />

            </div>


            {/* EMAIL */}
            <div className="field-group">

              <label>Update Email Address</label>

              <div className="input-icon">

                <input
                  type="email"
                  defaultValue=""
                  placeholder="Enter your email address"
                />

                <Mail size={14} />

              </div>

            </div>


            {/* CHANGE PASSWORD */}
            <div className="field-group">

              <button
                className="change-password-btn"
                onClick={() => setShowPasswordModal(true)}
              >

                <Lock size={14} />

                Change Password

              </button>

            </div>


            {/* DELETE ACCOUNT */}
            <button
              className="delete-account"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>

          </div>


          {/* NOTIFICATION PREFERENCES */}
          <div className="settings-card">

            <h2>Notification Preferences</h2>

            <NotificationRow
              title="Daily Reminder"
              description="Get reminded to track your carbon footprint"
              checked={notifications.dailyReminder}
              onChange={() =>
                handleNotificationChange("dailyReminder")
              }
            />

            <NotificationRow
              title="Weekly Report"
              description="Receive your weekly sustainability summary"
              checked={notifications.weeklyReport}
              onChange={() =>
                handleNotificationChange("weeklyReport")
              }
            />

            <NotificationRow
              title="Goal Achievement"
              description="Get notified when you complete a goal"
              checked={notifications.goalAchievement}
              onChange={() =>
                handleNotificationChange("goalAchievement")
              }
            />

            <NotificationRow
              title="Challenge Updates"
              description="Receive updates about your challenges"
              checked={notifications.challengeUpdates}
              onChange={() =>
                handleNotificationChange("challengeUpdates")
              }
            />

          </div>

        </div>


        {/* SAVE / CANCEL */}
        <div className="settings-actions">

          <button
            className="save-button"
            onClick={handleSave}
          >
            Save Changes
          </button>

          <button
            className="cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>

        </div>

      </main>


      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (

        <div className="modal-overlay">

          <div className="password-modal">

            <div className="modal-header">

              <h2>Change Password</h2>

              <button
                className="modal-cancel"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>

            </div>


            {/* CURRENT PASSWORD */}
            <div className="modal-field">

              <label>Current Password</label>

              <div className="password-input">

                <input
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                />

                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>

              </div>

            </div>


            {/* NEW PASSWORD */}
            <div className="modal-field">

              <label>New Password</label>

              <div className="password-input">

                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                />

                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>

              </div>

            </div>


            {/* PASSWORD TIP */}
            <div className="password-tip">

              <strong>💡 Keep it up!</strong>

              <p>
                Remember: the longer and more random your
                password, the better!
              </p>

            </div>


            {/* CONFIRM PASSWORD */}
            <div className="modal-field">

              <label>Confirm New Password</label>

              <div className="password-input">

                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>

              </div>

            </div>


            {/* CHANGE PASSWORD */}
            <button className="modal-change-button">
              Change Password
            </button>


            {/* KEEP CURRENT PASSWORD */}
            <button
              className="keep-password-button"
              onClick={() => setShowPasswordModal(false)}
            >
              Keep Current Password
            </button>

          </div>

        </div>

      )}

    </div>
  );
};


/* NOTIFICATION ROW */
const NotificationRow = ({
  title,
  description,
  checked,
  onChange,
}) => {
  return (
    <div className="notification-row">

      <div>

        <h3>{title}</h3>

        <p>{description}</p>

      </div>

      <label className="switch">

        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />

        <span className="slider"></span>

      </label>

    </div>
  );
};


export default Setting;