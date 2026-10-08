import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./challenges.css";
import {
  Globe,
  Home as HomeIcon,
  Leaf,
  Target,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  User,
  Bell,
  ChevronDown,
  Recycle,
  Bike,
  Zap,
  TreePine,
  X,
  Trophy,
  Award,
  Droplet,
  Flame,
} from "lucide-react";

const TABS = [
  { key: "all", label: "All Challenges" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

const ICON_MAP = {
  Recycle: Recycle,
  Bike: Bike,
  TreePine: TreePine,
  Zap: Zap,
  Droplet: Droplet,
};

// Category Based Dynamic Unit Logic
const getChallengeUnit = (item) => {
  if (item.unit && item.unit.toLowerCase() !== "days") {
    return item.unit;
  }

  const category = (item.tag || item.category || "").toLowerCase();
  const title = (item.title || "").toLowerCase();

  if (category.includes("transport") || category.includes("travel") || category.includes("commute")) {
    return title.includes("bike") || title.includes("walk") || title.includes("bus") ? "Trips" : "Km";
  }
  if (category.includes("water") || category.includes("conservation")) {
    return "Litres";
  }
  if (category.includes("energy") || category.includes("electricity") || category.includes("power")) {
    return title.includes("light") || title.includes("appliance") ? "Hours" : "kWh";
  }
  if (category.includes("waste") || category.includes("plastic") || category.includes("recycling")) {
    return "Items";
  }
  if (category.includes("food") || category.includes("compost") || category.includes("diet")) {
    return "Meals";
  }
  if (category.includes("tree") || category.includes("nature") || category.includes("greenery") || category.includes("forest")) {
    return "Trees";
  }

  return "Units";
};

// Category Based Dynamic Progress Bar Color
const getCategoryColor = (item) => {
  const category = (item.tag || item.category || "").toLowerCase();

  if (category.includes("waste") || category.includes("plastic") || category.includes("recycling")) {
    return "#10b981"; // Green
  }
  if (category.includes("transport") || category.includes("travel") || category.includes("commute")) {
    return "#3b82f6"; // Blue
  }
  if (category.includes("energy") || category.includes("electricity") || category.includes("power")) {
    return "#f59e0b"; // Yellow / Amber
  }
  if (category.includes("water") || category.includes("conservation")) {
    return "#06b6d4"; // Cyan / Water Blue
  }
  if (category.includes("food") || category.includes("compost") || category.includes("diet")) {
    return "#ec4899"; // Pink
  }
  return "#8b5cf6"; // Purple (Default)
};

export default function Challenges() {
  const [activeTab, setActiveTab] = useState("all");
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userParticipations, setUserParticipations] = useState([]);
  const [weekStreak, setWeekStreak] = useState(0);

  const [userInfo, setUserInfo] = useState({
    id: "",
    email: "",
    name: "User",
    points: 0,
    xp: 0,
    level: 1,
  });

  const [levelDetails, setLevelDetails] = useState({
    level: 1,
    title: "Eco Starter",
    icon: "🌱",
    currentXP: 0,
    levelMaxXP: 500,
    progressPercent: 0,
    nextLevelTitle: "Eco Learner",
  });

  const [activeRewardModal, setActiveRewardModal] = useState(null);

  // Dynamic Week Streak Logic calculation
  const calculateWeekStreak = (logs) => {
    if (!logs || logs.length === 0) return 0;

    const uniqueDays = new Set(
      logs
        .map((log) => {
          const d = log.activityDate || log.date || log.createdAt;
          return d ? new Date(d).toLocaleDateString("en-CA") : null;
        })
        .filter(Boolean)
    );

    const activeDaysCount = uniqueDays.size;
    const computedWeeks = Math.floor(activeDaysCount / 7);
    return computedWeeks > 0 ? computedWeeks : activeDaysCount > 0 ? 1 : 0;
  };

  // 1. Fetch Leaderboard & Sync Current User
  const fetchLeaderboard = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("http://localhost:5000/api/leaderboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.leaderboard) {
        setLeaderboard(res.data.leaderboard);

        const meRes = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const meData = meRes.data.user || meRes.data;
        const currentPts = meData.ecoPoints !== undefined ? meData.ecoPoints : meData.points || 0;

        setUserInfo({
          id: meData._id || meData.id,
          email: meData.email || "",
          name: meData.fullName || meData.name || "User",
          points: Number(currentPts),
          xp: Number(meData.xp || 0),
          level: Number(meData.level || 1),
        });
      }
    } catch (err) {
      console.error("Error fetching leaderboard/user info:", err);
    }
  }, []);

  // 2. Load Challenges, Tracker Logs & Participation Status
  const loadDataAndCalculate = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch dynamic tracker logs for week streak
      try {
        const trackerRes = await axios.get("http://localhost:5000/api/tracker/history", { headers });
        const logs = Array.isArray(trackerRes.data) ? trackerRes.data : trackerRes.data.logs || [];
        setWeekStreak(calculateWeekStreak(logs));
      } catch (err) {
        console.warn("Tracker history endpoint warning:", err);
      }

      const challengeRes = await axios.get("http://localhost:5000/api/challenges/available", { headers });

      if (challengeRes.data) {
        const fetchedChallenges = challengeRes.data.challenges || [];
        if (challengeRes.data.userLevelDetails) {
          setLevelDetails(challengeRes.data.userLevelDetails);
        }

        if (challengeRes.data.ecoPoints !== undefined) {
          setUserInfo((prev) => ({
            ...prev,
            points: Number(challengeRes.data.ecoPoints),
          }));
        }

        let myParticipations = [];
        try {
          const statusRes = await axios.get("http://localhost:5000/api/challenges/my-status", { headers });
          myParticipations = statusRes.data || [];
        } catch (err) {
          console.warn("My-status endpoint warning:", err);
        }
        setUserParticipations(myParticipations);

        const countsMap = {};
        try {
          const countsRes = await axios.get("http://localhost:5000/api/challenges/counts");
          const countsArray = countsRes.data || [];
          countsArray.forEach((c) => {
            countsMap[c._id] = c.count;
          });
        } catch (err) {
          console.warn("Counts endpoint warning:", err);
        }

        let modalToTrigger = null;
        const mergedChallenges = fetchedChallenges.map((ch) => {
          const part = myParticipations.find((p) => p.challengeId === ch.challengeId);

          let status = "AVAILABLE";
          let progress = 0;

          if (part) {
            status = part.status;
            progress = part.progress || 0;
          }

          if (status === "COMPLETED" && !modalToTrigger) {
            modalToTrigger = {
              id: ch.challengeId,
              title: ch.title,
              rewardPoints: ch.rewardPoints,
              rewardXP: ch.rewardXP,
            };
          }

          return {
            ...ch,
            userStatus: status,
            userProgress: progress,
            participantsCount: countsMap[ch.challengeId] || 0,
          };
        });

        setChallenges(mergedChallenges);

        if (modalToTrigger) {
          setActiveRewardModal(modalToTrigger);
        }
      }
    } catch (err) {
      console.error("Error loading challenge data:", err);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (userInfo.id) {
      loadDataAndCalculate();
    }
  }, [userInfo.id, loadDataAndCalculate]);

  const handleJoinChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/challenges/join",
        { challengeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadDataAndCalculate();
      await fetchLeaderboard();
    } catch (err) {
      console.error("Error joining challenge:", err);
    }
  };

  const handleClaimReward = async () => {
    if (!activeRewardModal) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/challenges/claim-reward",
        { challengeId: activeRewardModal.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data) {
        setUserInfo((prev) => ({
          ...prev,
          points: Number(res.data.ecoPoints),
        }));
      }

      setActiveRewardModal(null);
      await loadDataAndCalculate();
      await fetchLeaderboard();
    } catch (err) {
      console.error("Error claiming reward:", err);
    }
  };

  const claimedBadgesCount = userParticipations.filter((p) => p.status === "CLAIMED").length;

  const visibleChallenges = challenges.filter((c) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return c.userStatus === "JOINED";
    if (activeTab === "completed") return c.userStatus === "COMPLETED" || c.userStatus === "CLAIMED";
    return true;
  });

  return (
    <div className="challenges-app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Globe size={19} />
          <span>EcoTrack</span>
        </div>

        <nav className="sidebar-menu">
          <Link to="/home" className="menu-item"><HomeIcon size={16} /><span>Home</span></Link>
          <Link to="/carbon-footprint-tracker" className="menu-item"><Leaf size={16} /><span>Carbon Tracker</span></Link>
          <Link to="/goals" className="menu-item"><Target size={16} /><span>Goals</span></Link>
          <Link to="/challenges" className="menu-item active"><ShieldCheck size={16} /><span>Challenges</span></Link>
          <Link to="/dashboard" className="menu-item"><LayoutDashboard size={16} /><span>Dashboard</span></Link>
          <Link to="/reports" className="menu-item"><FileText size={16} /><span>Reports</span></Link>
          <Link to="/profile" className="menu-item"><User size={16} /><span>Profile</span></Link>
        </nav>
      </aside>

      <main className="main-content">
        <div
          className="page-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "16px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
              Community Challenges 🏆
            </h1>
            <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
              Join eco-drives, earn badges, and climb the leaderboard
            </p>
          </div>
          <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className="icon-button"
              style={{
                background: "#f1f5f9",
                border: "none",
                padding: "8px",
                borderRadius: "50%",
                cursor: "pointer",
              }}
            >
              <Bell size={18} color="#475569" />
            </button>
            <div
              className="user-chip"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                padding: "6px 12px",
                borderRadius: "20px",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              <span
                className="user-chip-avatar"
                style={{
                  background: "#10b981",
                  color: "#fff",
                  padding: "4px",
                  borderRadius: "50%",
                  display: "flex",
                }}
              >
                <User size={12} />
              </span>
              {userInfo.name}
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* Eco Journey Header */}
        <div className="eco-journey-card">
          <div className="journey-left">
            <div className="journey-title-row">
              <div>
                <span className="journey-small-title">YOUR ECO JOURNEY</span>
                <h2>
                  Level {levelDetails.level} — {levelDetails.title} {levelDetails.icon}
                </h2>
              </div>
              <div className="journey-level-badge">LVL {levelDetails.level}</div>
            </div>

            <div className="xp-info" style={{ marginTop: "12px" }}>
              <span>
                <strong>{levelDetails.currentXP?.toLocaleString()}</strong> /{" "}
                {levelDetails.levelMaxXP === Infinity ? "Max" : levelDetails.levelMaxXP?.toLocaleString()} XP
              </span>
              <span>
                {levelDetails.progressPercent}% to {levelDetails.nextLevelTitle}
              </span>
            </div>

            <div className="xp-progress" style={{ marginTop: "6px" }}>
              <div
                className="xp-progress-fill"
                style={{
                  width: `${levelDetails.progressPercent}%`,
                  backgroundColor: "#10b981",
                  transition: "width 0.4s ease-in-out",
                }}
              />
            </div>
          </div>

          <div className="journey-stats">
            <div className="journey-stat">
              <span className="journey-stat-icon">🔥</span>
              <div>
                <strong>{weekStreak}</strong>
                <small>Week Streak</small>
              </div>
            </div>

            <div className="journey-stat">
              <span className="journey-stat-icon">🏅</span>
              <div>
                <strong>{claimedBadgesCount}</strong>
                <small>Badges</small>
              </div>
            </div>

            <div className="journey-stat">
              <span className="journey-stat-icon">🪙</span>
              <div>
                <strong>{userInfo.points.toLocaleString()}</strong>
                <small>Eco Points</small>
              </div>
            </div>
          </div>
        </div>

        <div className="content-grid">
          <section>
            <div className="tab-bar">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  className={`tab-btn${activeTab === tab.key ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="challenge-list">
              {visibleChallenges.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  No challenges found in this section.
                </div>
              ) : (
                visibleChallenges.map((item) => {
                  const CategoryIcon = ICON_MAP[item.iconName] || Recycle;
                  const calculatedPercent = Math.min(
                    100,
                    Math.round(((item.userProgress || 0) / (item.targetGoal || 1)) * 100)
                  );

                  const displayUnit = getChallengeUnit(item);
                  const progressColor = getCategoryColor(item);

                  return (
                    <div className="challenge-card" key={item.challengeId}>
                      <div className="challenge-icon bg-green">
                        <CategoryIcon size={18} className="text-green" />
                      </div>

                      <div className="challenge-body">
                        <div className="challenge-top">
                          <h3>{item.title}</h3>
                          <span
                            className="challenge-percent"
                            style={{ color: progressColor, fontWeight: "bold" }}
                          >
                            {item.userStatus !== "AVAILABLE" ? `${calculatedPercent}% Done` : "0% Done"}
                          </span>
                        </div>

                        <div className="challenge-meta">
                          <span
                            className="tag-pill"
                            style={{
                              backgroundColor: `${progressColor}15`,
                              color: progressColor,
                              fontWeight: "600",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              fontSize: "12px",
                            }}
                          >
                            {item.tag || item.category || "Eco"}
                          </span>
                          <span className="dot">•</span>
                          <span>👥 {item.participantsCount} Participants</span>
                          <span className="dot">•</span>
                          <span style={{ color: "#d97706", fontWeight: "bold" }}>
                            🏆 +{item.rewardPoints} Points
                          </span>
                        </div>

                        <p className="challenge-desc">{item.description}</p>

                        <div className="challenge-progress-row" style={{ marginTop: "12px" }}>
                          {item.userStatus === "AVAILABLE" ? (
                            <button
                              onClick={() => handleJoinChallenge(item.challengeId)}
                              style={{
                                backgroundColor: "#059669",
                                color: "#fff",
                                border: "none",
                                padding: "8px 20px",
                                borderRadius: "8px",
                                fontWeight: "bold",
                                cursor: "pointer",
                              }}
                            >
                              Join Challenge
                            </button>
                          ) : (
                            <div style={{ width: "100%" }}>
                              <div
                                className="progress-track"
                                style={{
                                  height: "8px",
                                  borderRadius: "4px",
                                  backgroundColor: "#E2E8F0",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  className="progress-fill"
                                  style={{
                                    width: `${calculatedPercent}%`,
                                    height: "100%",
                                    borderRadius: "4px",
                                    backgroundColor: progressColor,
                                    transition: "width 0.4s ease",
                                  }}
                                />
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginTop: "6px",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                }}
                              >
                                <span style={{ color: "#475569" }}>
                                  {item.userProgress || 0} / {item.targetGoal} {displayUnit}
                                </span>
                                <span style={{ color: progressColor }}>
                                  {item.userStatus === "CLAIMED"
                                    ? "Claimed ✓"
                                    : item.userStatus === "COMPLETED"
                                    ? "Completed!"
                                    : "Joined & Active"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <aside className="right-rail">
            <div className="panel">
              <h2>My Eco Rewards</h2>

              <div className="score-box">
                <div>
                  <p className="score-label">Total Eco Score Points</p>
                  <p className="score-value">
                    {userInfo.points.toLocaleString()} <span className="score-unit">PTS</span>
                  </p>
                </div>
                <span className="level-pill">Lvl {levelDetails.level} Eco</span>
              </div>

              <p className="badges-label">Earned Sustainability Badges</p>
              <div
                className="badges-row"
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "10px",
                }}
              >
                {challenges.map((ch) => {
                  const part = userParticipations.find((p) => p.challengeId === ch.challengeId);
                  const isUnlocked = part && part.status === "CLAIMED";
                  const BadgeIcon = ICON_MAP[ch.iconName] || Award;

                  return (
                    <div
                      key={ch.challengeId}
                      title={isUnlocked ? ch.title : "Locked Badge"}
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isUnlocked ? "#d1fae5" : "#f1f5f9",
                        border: isUnlocked ? "2px solid #10b981" : "2px dashed #cbd5e1",
                        opacity: isUnlocked ? 1 : 0.4,
                        transition: "all 0.3s ease",
                      }}
                    >
                      <BadgeIcon size={20} color={isUnlocked ? "#059669" : "#94a3b8"} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="panel">
              <h2>Community Leaderboard</h2>
              <p className="panel-subtitle">Top individual eco-impact rankings</p>

              <div
                className="leaderboard-list"
                style={{
                  maxHeight: "380px",
                  overflowY: "auto",
                  paddingRight: "6px",
                }}
              >
                {leaderboard.map((item, index) => {
                  const isCurrentUser =
                    (item._id && item._id === userInfo.id) ||
                    (item.email && item.email === userInfo.email);

                  return (
                    <div
                      key={index}
                      className="leaderboard-row"
                      style={{
                        backgroundColor: isCurrentUser ? "#ecfdf5" : "#ffffff",
                        border: isCurrentUser ? "1px solid #10b981" : "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "8px 10px",
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="lb-rank" style={{ color: "#059669", fontWeight: "bold", width: "24px" }}>
                          #{index + 1}
                        </span>
                        <span
                          className="lb-avatar"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: isCurrentUser ? "#10b981" : "#cbd5e1",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {(item.fullName || item.name || "U").substring(0, 2).toUpperCase()}
                        </span>
                        <div className="lb-info">
                          <p className="lb-name" style={{ fontWeight: "bold", margin: 0, fontSize: "13px" }}>
                            {item.fullName || item.name} {isCurrentUser && "(You)"}
                          </p>
                          <p className="lb-title" style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>
                            Lvl {item.level || 1} Champion
                          </p>
                        </div>
                      </div>
                      <span className="lb-points" style={{ color: "#059669", fontWeight: "bold", fontSize: "13px" }}>
                        {Number(item.ecoPoints !== undefined ? item.ecoPoints : item.points || 0).toLocaleString()} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Claim Reward Popup Modal */}
      {activeRewardModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "28px",
              maxWidth: "380px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setActiveRewardModal(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              <X size={20} />
            </button>

            <span
              style={{
                backgroundColor: "#d1fae5",
                color: "#065f46",
                fontSize: "11px",
                fontWeight: "bold",
                padding: "4px 12px",
                borderRadius: "9999px",
                textTransform: "uppercase",
              }}
            >
              Challenge Completed! 🎉
            </span>

            <div style={{ margin: "20px 0", display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#fef3c7",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #fde68a",
                }}
              >
                <Trophy size={40} color="#d97706" />
              </div>
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
              {activeRewardModal.title}
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "6px" }}>
              Congratulations on reaching your eco target!
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                margin: "20px 0",
              }}
            >
              <div
                style={{
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "12px",
                  padding: "12px",
                }}
              >
                <span style={{ fontSize: "11px", color: "#b45309", display: "block", fontWeight: "600" }}>
                  Reward Points
                </span>
                <span style={{ fontSize: "18px", fontWeight: "900", color: "#d97706" }}>
                  🪙 +{activeRewardModal.rewardPoints}
                </span>
              </div>
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "12px",
                  padding: "12px",
                }}
              >
                <span style={{ fontSize: "11px", color: "#1d4ed8", display: "block", fontWeight: "600" }}>
                  Bonus XP
                </span>
                <span style={{ fontSize: "18px", fontWeight: "900", color: "#2563eb" }}>
                  ✨ +{activeRewardModal.rewardXP}
                </span>
              </div>
            </div>

            <button
              onClick={handleClaimReward}
              style={{
                width: "100%",
                backgroundColor: "#10b981",
                color: "#ffffff",
                fontWeight: "bold",
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.3)",
              }}
            >
              CLAIM REWARDS 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}