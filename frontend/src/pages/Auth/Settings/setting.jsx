import React, { useState } from "react";
import {
  Globe,
  Mail,
  Lock,
  User,
  Upload,
  Trash2,
} from "lucide-react";
import "./Settings.css";

const Settings = () => {
  const [profileImage, setProfileImage] = useState(null);

  const [notifications, setNotifications] = useState({
    daily: true,
    weekly: true,
    goal: true,
    challenge: true,
  });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Please upload a JPG or PNG image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    setProfileImage(URL.createObjectURL(file));
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="settings-page">

      <aside className="sidebar">

        <div className="logo">
          <Globe size={21} strokeWidth={1.8} />
          <span>EcoTrack</span>
        </div>

        <nav className="sidebar-nav">
          <a href="/home">Home</a>
          <a href="/carbon-footprint-tracker">Carbon Tracker</a>
          <a href="/goals">Goals</a>
          <a href="/challenges">Challenges</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/reports">Reports</a>
          <a href="/profile">Profile</a>
          <a href="/settings" className="active">Settings</a>
        </nav>

      </aside>

      <main className="settings-content">

        <div className="page-header">
          <h1>Settings</h1>
          <p>
            Manage your account and notification preferences.
          </p>
        </div>

        <div className="settings-grid">

          <section className="settings-card">

            <h2>Account Settings</h2>

            <label className="field-label">
              Profile Photo
            </label>

            <div className="profile-photo-row">

              <div className="avatar">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-image"
                  />
                ) : (
                  <User size={24} strokeWidth={1.8} />
                )}
              </div>

              <label className="upload-btn">
                <Upload size={16} strokeWidth={1.8} />
                Upload Image

                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleImageUpload}
                  hidden
                />
              </label>

              <span className="file-info">
                JPG, PNG up to 5MB
              </span>

            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input type="text" />
            </div>

            <div className="form-group">
              <label>Email Address</label>

              <div className="input-wrapper">
                <input type="email" />
                <Mail size={17} strokeWidth={1.8} />
              </div>
            </div>

            <div className="form-group">
              <label>Password & Security</label>

              <button className="password-btn">
                <Lock size={16} strokeWidth={1.8} />
                Change Password
              </button>
            </div>

            <button className="delete-btn">
              <Trash2 size={16} strokeWidth={1.8} />
              Delete Account
            </button>

          </section>

          <section className="settings-card notifications-card">

            <h2>Notification Preferences</h2>

            <NotificationItem
              title="Daily Activity Reminder"
              description="Receive daily reminders to log your eco-actions"
              enabled={notifications.daily}
              onToggle={() => toggleNotification("daily")}
            />

            <NotificationItem
              title="Weekly Carbon Footprint Report"
              description="Receive a summary of your emissions and reductions"
              enabled={notifications.weekly}
              onToggle={() => toggleNotification("weekly")}
            />

            <NotificationItem
              title="Goal Achievement Notification"
              description="Get alerts when you reach your sustainability goals"
              enabled={notifications.goal}
              onToggle={() => toggleNotification("goal")}
            />

            <NotificationItem
              title="Challenge Updates"
              description="Receive updates about active challenges"
              enabled={notifications.challenge}
              onToggle={() => toggleNotification("challenge")}
            />

          </section>

        </div>

        <div className="settings-actions">
          <button className="save-btn">
            Save Changes
          </button>

          <button className="cancel-btn">
            Cancel
          </button>
        </div>

      </main>

    </div>
  );
};

const NotificationItem = ({
  title,
  description,
  enabled,
  onToggle,
}) => {
  return (
    <div className="notification-item">

      <div className="notification-text">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <button
        type="button"
        className={`toggle ${enabled ? "active" : ""}`}
        onClick={onToggle}
        aria-label={`Toggle ${title}`}
      >
        <span></span>
      </button>

    </div>
  );
};

export default Settings;