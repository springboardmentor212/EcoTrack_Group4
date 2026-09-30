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
  Edit3,
  PlusCircle,
  X,
} from "lucide-react";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  const [profileDetails, setProfileDetails] = useState({
    location: "",
    primaryTransport: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const [stats, setStats] = useState({
    co2Emitted: 0,
    co2Saved: 0,
    netFootprint: 0,
    treesEquivalent: 0,
    activeStreak: 0,
  });

  const [displayGoals, setDisplayGoals] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No authentication token found.");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch User Info
      try {
        const userRes = await axios.get("http://localhost:5000/api/auth/me", { headers });
        if (userRes.data) {
          const userData = userRes.data.user || userRes.data;
          setUser({
            name: userData.fullName || userData.name || userData.username || "User",
            email: userData.email || "No email",
          });
        }
      } catch (err) {
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        setUser({
          name: localUser.fullName || localUser.name || localUser.username || "User",
          email: localUser.email || localUser.userEmail || "No email",
        });
      }

      // 2. Fetch Profile Info
      try {
        const profileRes = await axios.get("http://localhost:5000/api/profile", { headers });
        if (profileRes.data) {
          setProfileDetails({
            location: profileRes.data.location || "",
            primaryTransport: profileRes.data.primaryTransport || "",
          });
        }
      } catch (err) {
        console.log("Using default profile details");
      }

      // 3. Fetch Carbon Logs
      try {
        const trackerRes = await axios.get("http://localhost:5000/api/tracker/history", { headers });
        if (trackerRes.data) {
          const logs = Array.isArray(trackerRes.data) ? trackerRes.data : trackerRes.data.logs || [];
          
          if (logs.length > 0) {
            setRecentLogs(logs.slice(0, 3));

            let totalEmissions = 0;
            let totalSaved = 0;

            logs.forEach((log) => {
              const mode = log.activityMode || (log.carbonSaved > 0 ? "saving" : "emission");
              if (mode === "saving") {
                totalSaved += Number(log.carbonSaved || log.co2 || 0);
              } else {
                totalEmissions += Number(log.carbonOutput || log.co2 || 0);
              }
            });

            const netFootprint = Math.max(0, totalEmissions - totalSaved);
            const trees = Math.round(totalSaved / 21);

            const uniqueDates = new Set(
              logs.map((log) => {
                const d = log.activityDate || log.date || log.createdAt;
                return d ? new Date(d).toDateString() : null;
              }).filter(Boolean)
            );

            setStats({
              co2Emitted: Number(totalEmissions.toFixed(1)),
              co2Saved: Number(totalSaved.toFixed(1)),
              netFootprint: Number(netFootprint.toFixed(1)),
              treesEquivalent: trees,
              activeStreak: uniqueDates.size,
            });
          }
        }
      } catch (err) {
        console.error("Tracker Logs Fetch Error:", err);
      }

      // 4. Fetch Goals (Max 3 Goals: 1 recent completed + 2 active)
      try {
        const goalsRes = await axios.get("http://localhost:5000/api/goals", { headers });
        if (goalsRes.data) {
          const allGoals = goalsRes.data.goals || (Array.isArray(goalsRes.data) ? goalsRes.data : []);
          
          const completed = goalsRes.data.completedGoals || allGoals.filter((g) => g.isCompleted);
          const active = goalsRes.data.activeGoals || allGoals.filter((g) => !g.isCompleted);

          let selectedGoals = [];

          if (completed.length > 0) {
            selectedGoals.push(completed[0]);
            selectedGoals = selectedGoals.concat(active.slice(0, 2));
          } else {
            selectedGoals = active.slice(0, 3);
          }

          setDisplayGoals(selectedGoals);
        }
      } catch (err) {
        console.error("Goals Fetch Error:", err);
      }

    } catch (err) {
      console.error("Fetch Data Error:", err);
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
    localStorage.clear();
    navigate("/login");
  };

  const hasInfo = Boolean(profileDetails.location || profileDetails.primaryTransport);

  return (
    <div className="profile-app">
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

      <main className="main-content">
        <header className="page-header">
          <h1>User Profile</h1>
          <p>Manage your personal information, impact metrics, and app settings.</p>
        </header>

        <div className="profile-figma-grid">
          {/* LEFT COLUMN */}
          <div className="left-column">
            <div className="profile-card">
              <div className="avatar-wrapper">
                <div className="avatar">
                  <User size={38} />
                </div>
              </div>
              <h3 className="user-name">{user.name || "User"}</h3>
              <p className="user-email">{user.email || "No email"}</p>
             

              <div className="info-details">
                <div className="info-row">
                  <span>Location</span>
                  <strong>{profileDetails.location || "Not Set"}</strong>
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

          {/* RIGHT COLUMN */}
          <div className="right-column">
            {/* 4 METRIC CARDS ROW */}
            <div className="metrics-row">
              <div className="metric-card">
                <p className="metric-label">CO₂ Emitted</p>
                <h2 className="metric-value">{stats.co2Emitted} kg</h2>
                <span className="metric-sub text-gray">Gross Output</span>
              </div>

              <div className="metric-card">
                <p className="metric-label">CO₂ Saved</p>
                <h2 className="metric-value" style={{ color: "#10b981" }}>
                  {stats.co2Saved} kg
                </h2>
                <span className="metric-sub text-green">Total Avoided</span>
              </div>

              <div className="metric-card">
                <p className="metric-label">Net Footprint</p>
                <h2 className="metric-value">{stats.netFootprint} kg</h2>
                <span className="metric-sub text-gray">Emitted − Saved</span>
              </div>

              <div className="metric-card">
                <p className="metric-label">Trees Equivalent</p>
                <h2 className="metric-value" style={{ color: "#10b981" }}>
                  {stats.treesEquivalent}
                </h2>
                <span className="metric-sub text-green">Based on CO₂ Saved</span>
              </div>
            </div>

            {/* GOALS SUMMARY PANEL */}
            <div className="panel-card goal-summary-panel">
              <h3>Goal Progress Summary</h3>
              <div className="item-list">
                {displayGoals.length === 0 ? (
                  <p className="item-sub" style={{ textAlign: "center", padding: "10px 0" }}>
                    No goals found.
                  </p>
                ) : (
                  displayGoals.map((goal) => {
                    const isDone = Boolean(goal.isCompleted);
                    const targetVal = Number(goal.targetValue || 0);
                    const rawProgress = Number(goal.currentProgress || 0);
                    const displayProgress = isDone 
                      ? targetVal 
                      : Math.min(rawProgress, targetVal);

                    return (
                      <div
                        key={goal._id}
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          background: isDone ? "#f0fdf4" : "#f8fafc",
                          border: isDone ? "1px solid #10b981" : "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                          <span>
                            {isDone ? `✓ ${goal.title}` : goal.title} ({goal.category || "Overall"})
                          </span>
                          <span style={{ color: isDone ? "#10b981" : "#2563eb" }}>
                            {isDone ? "100% Completed ✅" : `${goal.percent || 0}%`}
                          </span>
                        </div>

                        <div
                          className="progress-track"
                          style={{
                            height: "6px",
                            background: "#e2e8f0",
                            borderRadius: "99px",
                            margin: "6px 0",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            className="progress-fill"
                            style={{
                              width: `${goal.percent || 0}%`,
                              background: isDone ? "#10b981" : "#2563eb",
                              height: "100%",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>

                        <div className="goal-progress-details">
                          <span>
                            Progress: {displayProgress} / {targetVal} kg
                          </span>
                          <span>
                            Saved: {Number(goal.totalSaved || 0).toFixed(1)} kg &nbsp;|&nbsp; Emitted: {Number(goal.totalEmitted || 0).toFixed(1)} kg
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RECENT ACTIVITY PANEL */}
            <div className="panel-card">
              <h3>Recent Activity</h3>
              <div className="item-list">
                {recentLogs.length === 0 ? (
                  <p className="item-sub" style={{ textAlign: "center", padding: "10px 0" }}>
                    No recent carbon tracker logs found.
                  </p>
                ) : (
                  recentLogs.map((log, idx) => {
                    const mode = log.activityMode || (log.carbonSaved > 0 ? "saving" : "emission");
                    const co2Val = mode === "saving" 
                      ? (log.carbonSaved || log.co2 || 0) 
                      : (log.carbonOutput || log.co2 || 0);
                    const activityName = log.activityType || log.subType || log.category || "Eco Activity";
                    const dateStr = log.activityDate || log.date || "Recent";

                    return (
                      <div className="activity-item" key={log._id || idx}>
                        <div>
                          <p className="item-title">{activityName}</p>
                          <p className="item-sub">{dateStr} • {log.category}</p>
                        </div>
                        <span className="tag-saved" style={{ color: mode === "saving" ? "#10b981" : "#0f172a" }}>
                          {mode === "saving" ? `−${Number(co2Val).toFixed(1)} kg saved` : `+${Number(co2Val).toFixed(1)} kg`}
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

      {/* EDIT MODAL */}
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
                  placeholder="e.g. Tirunelveli, TN"
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