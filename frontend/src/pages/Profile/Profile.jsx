import React from 'react';
import './Profile.css';

function Profile() {
  return (
    <div className="profile-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <span>🌿 EcoTrack</span>
        </div>
        <nav className="sidebar-nav">
          <a href="/home">Home</a>
          <a href="/carbon-tracker">Carbon Tracker</a>
          <a href="/goals">Goals</a>
          <a href="/challenges">Challenges</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/reports">Reports</a>
          <a href="/profile" className="active">Profile</a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="profile-main">
        <header className="profile-header">
          <h1>User Profile</h1>
          <p>Manage your personal information, impact metrics, and app settings.</p>
        </header>

        <div className="top-row">
          {/* Profile card */}
          <div className="card profile-card">
            <div className="avatar">👤</div>
            <h2>Alex Morgan</h2>
            <p className="email">alex.morgan@ecotrack.io</p>
            <span className="badge">ECO HERO LEVEL 4</span>

            <div className="info-list">
              <div className="info-row">
                <span>Location</span>
                <strong>San Francisco, CA</strong>
              </div>
              <div className="info-row">
                <span>Member Since</span>
                <strong>January 2024</strong>
              </div>
              <div className="info-row">
                <span>Primary Transport</span>
                <strong>Bicycle / Transit</strong>
              </div>
            </div>

            <button className="edit-btn">Edit Personal Info</button>
          </div>

          {/* Stat cards */}
          <div className="stats-grid">
            <div className="card stat-card">
              <span className="stat-label">CO₂ Saved</span>
              <h3>428 kg</h3>
              <span className="stat-sub">↑ 12% this month</span>
            </div>
            <div className="card stat-card">
              <span className="stat-label">Trees Equivalent</span>
              <h3>19 Trees</h3>
              <span className="stat-sub">Lifetime impact</span>
            </div>
            <div className="card stat-card">
              <span className="stat-label">Active Streak</span>
              <h3>24 Days</h3>
              <span className="stat-sub">Personal best!</span>
            </div>
          </div>
        </div>

        <div className="bottom-row">
          <div className="left-col">
            <div className="card">
              <h4>Account &amp; App Settings</h4>
              <p>Manage notification preferences, privacy controls, and application options.</p>
              <button className="settings-btn">Go to Settings</button>
            </div>
          </div>

          <div className="right-col">
            <div className="card">
              <h4>Recent Achievements</h4>
              <ul className="achievements-list">
                <li className="done">
                  <span className="check">✓</span>
                  <div>
                    <strong>Commute Champion</strong>
                    <p>Logged 20 public transit trips in a single month.</p>
                  </div>
                </li>
                <li className="done">
                  <span className="check">✓</span>
                  <div>
                    <strong>Zero Waste Week</strong>
                    <p>Completed all weekly sustainability challenges.</p>
                  </div>
                </li>
                <li>
                  <span className="check pending">○</span>
                  <div>
                    <strong>Energy Saver (In Progress)</strong>
                    <p>Reduce home energy consumption by 15%.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="card">
              <h4>Recent Activity</h4>
              <div className="activity-row">
                <div>
                  <strong>Bicycle Commute (12 km)</strong>
                  <p>Today at 8:30 AM</p>
                </div>
                <span className="activity-value">-2.4 kg CO₂</span>
              </div>
              <div className="activity-row">
                <div>
                  <strong>Plant-Based Meal</strong>
                  <p>Yesterday at 1:15 PM</p>
                </div>
                <span className="activity-value">-1.1 kg CO₂</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;