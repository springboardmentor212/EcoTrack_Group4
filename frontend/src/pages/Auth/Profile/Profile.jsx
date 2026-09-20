import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Globe,
  Home,
  Leaf,
  Target,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  CheckCircle2,
  Clock,
  Edit3,
  PlusCircle,
  X,
} from "lucide-react";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profileDetails, setProfileDetails] = useState({
    location: "",
    primaryTransport: "",
    memberSince: "January 2024",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Dynamic calculated stats
  const [stats, setStats] = useState({
    co2Saved: 0,
    treesEquivalent: 0,
    activeStreak: 0,
  });

  const [achievements, setAchievements] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(localUser);

      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Saved Profile Details
      try {
        const profileRes = await axios.get("http://localhost:5000/api/profile", { headers });
        if (profileRes.data) {
          setProfileDetails({
            location: profileRes.data.location || "",
            primaryTransport: profileRes.data.primaryTransport || "",
            memberSince: profileRes.data.memberSince || "January 2024",
          });
        }
      } catch (err) {
        console.log("Profile info fetch note: using default state");
      }

      // 2. Fetch Carbon Tracker Logs - FIX: Correct API URL to /api/tracker/history
      try {
        const trackerRes = await axios.get("http://localhost:5000/api/tracker/history", { headers });
        if (trackerRes.data) {
          const logs = Array.isArray(trackerRes.data) ? trackerRes.data : trackerRes.data.logs || [];
          
          if (logs.length > 0) {
            // Set recent 3 logs
            setRecentLogs(logs.slice(0, 3));

            // Dynamic Total CO2 Saved Calculation
            const totalCO2 = logs.reduce((sum, log) => {
              const val = Number(log.carbonOutput || log.co2 || log.co2Saved || 0);
              return sum + val;
            }, 0);

            // Dynamic Trees Equivalent (1 Tree absorbs approx 21kg CO2/year)
            const trees = Math.round(totalCO2 / 21);

            // Dynamic Active Streak (Count unique logging dates)
            const uniqueDates = new Set(
              logs.map((log) => {
                const d = log.activityDate || log.date || log.createdAt;
                return d ? new Date(d).toDateString() : null;
              }).filter(Boolean)
            );

            setStats({
              co2Saved: Number(totalCO2.toFixed(1)),
              treesEquivalent: trees,
              activeStreak: uniqueDates.size,
            });
          }
        }
      } catch (err) {
        console.error("Tracker Logs Fetch Error:", err);
      }

      // 3. Fetch Goals for Recent Achievements
      try {
        const goalsRes = await axios.get("http://localhost:5000/api/goals", { headers });
        if (goalsRes.data) {
          const goalList = goalsRes.data.goals || (Array.isArray(goalsRes.data) ? goalsRes.data : []);
          setAchievements(goalList.slice(0, 3));
        }
      } catch (err) {
        console.error("Goals Fetch Error:", err);
      }

    } catch (err) {
      console.error("General Fetch Profile Data Error:", err);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/profile",
        profileDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditing(false);
      fetchProfileData();
    } catch (err) {
      console.error("Save Profile Error:", err);
      setIsEditing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const hasInfo = Boolean(profileDetails.location || profileDetails.primaryTransport);

  return (
    <div className="profile-app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Globe size={20} className="brand-icon" />
          <span>EcoTrack</span>
        </div>
        <nav className="sidebar-menu">
          <Link to="/home" className="menu-item"><Home size={16} /><span>Home</span></Link>
          <Link to="/carbon-footprint-tracker" className="menu-item"><Leaf size={16} /><span>Carbon Tracker</span></Link>
          <Link to="/goals" className="menu-item"><Target size={16} /><span>Goals</span></Link>
          <Link to="/challenges" className="menu-item"><ShieldCheck size={16} /><span>Challenges</span></Link>
          <Link to="/dashboard" className="menu-item"><LayoutDashboard size={16} /><span>Dashboard</span></Link>
          <Link to="/reports" className="menu-item"><FileText size={16} /><span>Reports</span></Link>
          <Link to="/profile" className="menu-item active"><User size={16} /><span>Profile</span></Link>
        </nav>
      </aside>

      {/* Main Container */}
      <main className="main-content">
        <header className="page-header">
          <h1>User Profile</h1>
          <p>Manage your personal information, impact metrics, and app settings.</p>
        </header>

        <div className="profile-figma-grid">
          
          {/* Left Column */}
          <div className="left-column">
            <div className="profile-card">
              <div className="avatar-wrapper">
                <div className="avatar">
                  <User size={38} />
                </div>
              </div>
              <h3 className="user-name">{user?.name || user?.username || "User"}</h3>
              <p className="user-email">{user?.email || "user@ecotrack.io"}</p>
              <span className="user-badge">ECO HERO LEVEL 4</span>

              <div className="info-details">
                <div className="info-row">
                  <span>Location</span>
                  <strong>{profileDetails.location || "Not Set"}</strong>
                </div>
                <div className="info-row">
                  <span>Member Since</span>
                  <strong>{profileDetails.memberSince}</strong>
                </div>
                <div className="info-row">
                  <span>Primary Transport</span>
                  <strong>{profileDetails.primaryTransport || "Not Set"}</strong>
                </div>
              </div>

              {hasInfo ? (
                <button className="btn-secondary" onClick={() => setIsEditing(true)}>
                  <Edit3 size={14} /> Edit Personal Info
                </button>
              ) : (
                <button className="btn-secondary" onClick={() => setIsEditing(true)}>
                  <PlusCircle size={14} /> Create Personal Info
                </button>
              )}

              <button className="btn-logout" onClick={handleLogout}>
                <LogOut size={14} /> Log Out
              </button>
            </div>

            <div className="settings-card">
              <h4>Account & App Settings</h4>
              <p>Manage notification preferences, privacy controls, and application options.</p>
              <button className="btn-settings" onClick={() => navigate("/settings")}>
                Go to Settings
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            
            {/* Metrics */}
            <div className="metrics-row">
              <div className="metric-card">
                <p className="metric-label">CO₂ Saved</p>
                <h2 className="metric-value">{stats.co2Saved} kg</h2>
                <span className="metric-sub text-green">Dynamic total impact</span>
              </div>

              <div className="metric-card">
                <p className="metric-label">Trees Equivalent</p>
                <h2 className="metric-value">{stats.treesEquivalent} Trees</h2>
                <span className="metric-sub text-gray">Lifetime impact</span>
              </div>

              <div className="metric-card">
                <p className="metric-label">Active Streak</p>
                <h2 className="metric-value">{stats.activeStreak} Days</h2>
                <span className="metric-sub text-gray">Active activity days</span>
              </div>
            </div>

            {/* Achievements */}
            <div className="panel-card">
              <h3>Recent Achievements</h3>
              <div className="item-list">
                {achievements.length === 0 ? (
                  <p className="item-sub" style={{ textAlign: "center", padding: "10px 0" }}>
                    No goals created or completed yet.
                  </p>
                ) : (
                  achievements.map((item, idx) => {
                    const isDone = item.percent === 100 || item.isCompleted;
                    return (
                      <div className="achievement-item" key={item._id || idx}>
                        <div className={`icon-box ${isDone ? "green" : "gray"}`}>
                          {isDone ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                        </div>
                        <div>
                          <p className="item-title">
                            {item.title} {!isDone && "(In Progress)"}
                          </p>
                          <p className="item-sub">
                            Category: {item.category || "General"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="panel-card">
              <h3>Recent Activity</h3>
              <div className="item-list">
                {recentLogs.length === 0 ? (
                  <p className="item-sub" style={{ textAlign: "center", padding: "10px 0" }}>
                    No recent carbon tracker logs found.
                  </p>
                ) : (
                  recentLogs.map((log, idx) => {
                    const co2Val = log.carbonOutput || log.co2 || 0;
                    const activityName = log.activityType || log.category || "Eco Activity";
                    const dateStr = log.activityDate || log.date || "Recent";

                    return (
                      <div className="activity-item" key={log._id || idx}>
                        <div>
                          <p className="item-title">{activityName}</p>
                          <p className="item-sub">{dateStr} • {log.category}</p>
                        </div>
                        <span className="tag-saved">
                          +{Number(co2Val).toFixed(1)} kg CO₂
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{hasInfo ? "Edit Personal Info" : "Create Personal Info"}</h3>
              <button className="modal-close" onClick={() => setIsEditing(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="modal-form">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="e.g. Chennai, TN"
                  value={profileDetails.location}
                  onChange={(e) => setProfileDetails({ ...profileDetails, location: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Primary Transport</label>
                <input
                  type="text"
                  placeholder="e.g. Bus / Scooter"
                  value={profileDetails.primaryTransport}
                  onChange={(e) =>
                    setProfileDetails({ ...profileDetails, primaryTransport: e.target.value })
                  }
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}