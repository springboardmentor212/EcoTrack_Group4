import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./dashboard.css";

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
  CircleDot,
  CheckCircle2,
  Zap,
  Sprout,
  Trophy,
  Plus,
  ArrowUpRight,
  Droplets,
  Bus,
  Plug,
  Sun,
  Calendar,
  MoreHorizontal,
  Flag,
  BarChart3,
  RotateCw,
  Award,
  Star,
  Medal,
  Flame
} from "lucide-react";

const icons = {
  home: HomeIcon,
  leaf: Leaf,
  target: Target,
  trophy: Trophy,
  grid: LayoutDashboard,
  chart: BarChart3,
  user: User,
  bell: Bell,
  plus: Plus,
  arrow: ArrowUpRight,
  check: CheckCircle2,
  bolt: Zap,
  water: Droplets,
  transport: Bus,
  energy: Plug,
  tree: Sprout,
  more: MoreHorizontal,
  sun: Sun,
  calendar: Calendar,
  flag: Flag,
  shield: ShieldCheck,
  award: Award,
  star: Star,
  medal: Medal,
  flame: Flame
};

function Icon({ name, size = "normal" }) {
  const LucideIcon = icons[name] || CircleDot;
  return (
    <span className={`icon icon-${size}`} aria-hidden="true">
      <LucideIcon size="1em" />
    </span>
  );
}

function CardHeader({ kicker, title, subtitle }) {
  return (
    <div className="card-heading">
      <div className="heading-copy">
        {kicker && <span className="section-kicker">{kicker}</span>}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <span className="heading-icon">
        <FileText />
      </span>
    </div>
  );
}

function ProgressBar({ value, className = "" }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className={`progress-track ${className}`}>
      <div className="progress-fill" style={{ width: `${safeValue}%` }} />
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Globe size={20} strokeWidth={2.5} />
        <span className="brand-name">EcoTrack</span>
      </div>

      <nav className="sidebar-menu">
        <Link to="/home" className="menu-item"><HomeIcon size={18} /><span>Home</span></Link>
        <Link to="/carbon-footprint-tracker" className="menu-item"><Leaf size={18} /><span>Carbon Tracker</span></Link>
        <Link to="/goals" className="menu-item"><Target size={18} /><span>Goals</span></Link>
        <Link to="/challenges" className="menu-item"><ShieldCheck size={18} /><span>Challenges</span></Link>
        <Link to="/dashboard" className="menu-item active"><LayoutDashboard size={18} /><span>Dashboard</span></Link>
        <Link to="/reports" className="menu-item"><FileText size={18} /><span>Reports</span></Link>
        <Link to="/profile" className="menu-item"><User size={18} /><span>Profile</span></Link>
      </nav>
    </aside>
  );
}

function DashboardHeader({ onNotification, notificationsOpen, loggeduser }) {
  return (
    <header className="dashboard-header">
      <div className="header-copy">
        <div className="header-date">OVERVIEW / DASHBOARD</div>
        <h1>
          Dashboard <span className="header-wave">👋</span>
        </h1>
        <p>Track your sustainability journey and make a positive impact on the planet.</p>
      </div>

      <div className="header-actions">
        <div className="notification-wrap">
          <button type="button" className="notification-button" onClick={onNotification}>
            <Icon name="bell" />
            <span className="notification-dot" />
          </button>

          {notificationsOpen && (
            <div className="notification-popover">
              <strong>Notifications</strong>
              <span>You have 3 new sustainability updates.</span>
              <span>Your weekly goal progress is ready.</span>
            </div>
          )}
        </div>

        <button type="button" className="user-menu">
          <span className="user-avatar">
            {loggeduser ? loggeduser.substring(0, 2).toUpperCase() : "US"}
          </span>
          <p className="user-menu-name">{loggeduser || "User"}</p>
          <span className="user-chevron">
            <ChevronDown size={16} />
          </span>
        </button>
      </div>
    </header>
  );
}

function CarbonFootprintCard({ carbonStats }) {
  const categories = carbonStats?.categories || [];
  const totalEmissionsKg = Number(carbonStats?.totalEmissionsKg || 0);
  const totalSavedKg = Number(carbonStats?.totalSavedKg || carbonStats?.totalCO2Reduced || 0);
  const netFootprintKg = Number(carbonStats?.netFootprintKg || carbonStats?.netFootprint || 0);

  // Dynamic Ratio Formula (Same as Reports)
  const totalActivity = totalSavedKg + totalEmissionsKg;
  const calculatedScore = carbonStats?.ecoScore ?? (
    totalActivity > 0 ? Math.round((totalSavedKg / totalActivity) * 100) : 50
  );

  const scoreStatus = calculatedScore >= 75 ? "Good" : calculatedScore >= 40 ? "Average" : "Needs Action";
  const scoreClass = calculatedScore >= 75 ? "good" : calculatedScore >= 40 ? "avg" : "bad";

  const categoryColors = {
    transport: "#3b82f6",
    food: "#10b981",
    water: "#06b6d4",
    energy: "#f59e0b",
    waste: "#8b5cf6",
  };

  let currentPercentage = 0;
  const donutSegments = categories
    .filter((cat) => Number(cat.percentage) > 0)
    .map((cat) => {
      const key = String(cat.name || "").toLowerCase().trim();
      const percentage = Number(cat.percentage) || 0;
      const color = categoryColors[key] || "#64748b";
      const start = currentPercentage;
      const end = currentPercentage + percentage;
      currentPercentage = end;
      return `${color} ${start}% ${end}%`;
    });

  const donutBackground = donutSegments.length > 0 ? `conic-gradient(${donutSegments.join(", ")})` : "#e2e8f0";

  return (
    <section className="dashboard-card carbon-card">
      <CardHeader kicker="YOUR CARBON FOOTPRINT" title="Carbon Overview" subtitle="Emissions, Savings & Net Footprint" />

      <div className="carbon-centered-wrapper">
        <div className="carbon-donut-large" style={{ background: donutBackground }}>
          <div className="carbon-donut-inner">
            <span className="donut-label">Eco Score</span>
            <strong>{calculatedScore}</strong>
            <span className={`donut-status ${scoreClass}`}>{scoreStatus}</span>
          </div>
        </div>

        <div className="carbon-legend-grid">
          {categories.length > 0 ? (
            categories.map((cat, idx) => {
              const catKey = String(cat.name || "").toLowerCase().trim();
              const dotColor = categoryColors[catKey] || "#64748b";
              return (
                <div className="legend-chip" key={idx}>
                  <span className="legend-dot-indicator" style={{ backgroundColor: dotColor }} />
                  <span className="legend-name">{cat.name}</span>
                  <strong className="legend-val">{cat.percentage || 0}% ({cat.emission || 0}kg)</strong>
                </div>
              );
            })
          ) : (
            <div className="legend-chip">
              <span className="legend-name">No Carbon Data Logged</span>
            </div>
          )}
        </div>
      </div>

      <div className="emissions-summary" style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-start" }}>
        <div>Emitted: <b>{totalEmissionsKg.toFixed(1)} kg</b> | Saved: <b style={{ color: "#10b981" }}>{totalSavedKg.toFixed(1)} kg</b></div>
        <div>Net Footprint: <b>{netFootprintKg.toFixed(1)} kg CO₂e</b></div>
      </div>
    </section>
  );
}

function GoalProgressCard({ goals = [] }) {
  const displayGoals = goals.slice(0, 3);

  return (
    <section className="dashboard-card goal-progress-card">
      <CardHeader kicker="GOAL MANAGEMENT" title="Goal Progress" subtitle="Net Savings (Saved − Emitted)" />

      <div className="goal-progress-list no-scrollbar">
        {displayGoals.length > 0 ? (
          displayGoals.map((goal, index) => {
            const title = goal.title || "Goal";
            const category = goal.category || "Overall";
            const targetValue = Number(goal.targetValue || goal.target) || 0;
            const currentProgress = Number(goal.currentProgress) || 0;
            
            const isCompleted = Boolean(goal.isCompleted) || (targetValue > 0 && currentProgress >= targetValue);
            
            const rawPercent = targetValue > 0 ? Math.round((currentProgress / targetValue) * 100) : 0;
            const percent = isCompleted ? 100 : Math.max(0, Math.min(99, rawPercent));
            const remaining = Math.max(0, targetValue - currentProgress);

            return (
              <div className="goal-progress-item" key={goal._id || index}>
                <div className="goal-progress-top">
                  <div className="goal-title-wrap">
                    <strong className="goal-title">{title}</strong>
                    <span className="goal-category">Category: {category}</span>
                  </div>
                  <span className={`goal-badge ${isCompleted ? "completed-badge" : ""}`}>
                    {isCompleted ? "Completed" : `${percent}% Complete`}
                  </span>
                </div>

                <ProgressBar value={percent} />

                <div className="goal-progress-details">
                  <span>Net Progress: <b>{currentProgress} kg</b> / {targetValue} kg</span>
                  <span><b>{isCompleted ? 0 : remaining} kg</b> needed</span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-data">No active goals found. Add goals in Goals Page!</p>
        )}
      </div>
    </section>
  );
}

function RecommendationsCard({ recommendations = [], onRefresh }) {
  const displayRecs = recommendations.slice(0, 4);

  return (
    <section className="dashboard-card ai-card">
      <div className="card-heading-split">
        <div className="heading-copy">
          <span className="section-kicker">RECOMMENDATION FACTORS</span>
          <h2>AI Recommendations</h2>
          <p>Personalized sustainability insights</p>
        </div>
        <button onClick={onRefresh} className="icon-refresh-btn" type="button">
          <RotateCw size={16} />
        </button>
      </div>

      <div className="recommendation-list">
        {displayRecs.length > 0 ? (
          displayRecs.map((rec, index) => (
            <div className="recommendation-item" key={index}>
              <div className="recommendation-icon"><Icon name={rec.icon || "leaf"} /></div>
              <div className="recommendation-copy">
                <strong>{rec.title}</strong>
                <span>{rec.subtitle}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">No recommendations available.</p>
        )}
      </div>
    </section>
  );
}

function RecentActivityCard({ activities = [] }) {
  const displayActivities = activities.slice(0, 3);

  return (
    <section className="dashboard-card activity-card">
      <CardHeader kicker="HISTORICAL ACTIVITY RECORDS" title="Recent Activity" subtitle="Your latest logged actions" />

      <div className="activity-list no-scrollbar">
        {displayActivities.length > 0 ? (
          displayActivities.map((act, index) => {
            const mode = act.activityMode || (act.carbonSaved > 0 ? "saving" : "emission");
            const val = mode === "saving" ? (act.carbonSaved || act.co2 || 0) : (act.carbonOutput || act.co2 || 0);

            return (
              <div className="activity-row" key={act._id || index}>
                <div className="activity-icon"><Icon name={act.category?.toLowerCase() || "bolt"} /></div>
                <div className="activity-main">
                  <strong>{act.activityType || act.category}</strong>
                  <span>{act.activityDate || act.date ? new Date(act.activityDate || act.date).toLocaleDateString() : "Recently"}</span>
                </div>
                <div className="activity-result">
                  <strong style={{ color: mode === "saving" ? "#10b981" : "#ef4444" }}>
                    {mode === "saving" ? `−${Number(val).toFixed(2)} kg` : `+${Number(val).toFixed(2)} kg`}
                  </strong>
                  <span className="status-label">{mode === "saving" ? "Saved" : "Emitted"}</span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-data">No recent activity logged yet.</p>
        )}
      </div>
    </section>
  );
}

function CommunityChallengesCard({ challenges = [], onJoinChallenge }) {
  return (
    <section className="dashboard-card challenge-list-card">
      <CardHeader kicker="CHALLENGE CATEGORIES" title="Community Challenges" subtitle="Connect, compete and make an impact" />
      <div className="challenge-list no-scrollbar">
        {challenges.length > 0 ? (
          challenges.slice(0, 3).map((ch) => {
            const isJoined = ch.userStatus && ch.userStatus !== "AVAILABLE";

            return (
              <div className="challenge-row" key={ch.challengeId || ch._id}>
                <div className="challenge-row-icon"><Icon name={ch.iconName?.toLowerCase() || "flag"} /></div>
                <div className="challenge-row-copy">
                  <strong>{ch.title}</strong>
                  <span>{ch.description || ch.subtitle}</span>
                </div>
                {isJoined ? (
                  <span className="challenge-status-badge active-badge" style={{ padding: "6px 12px", borderRadius: "12px", backgroundColor: "#e6f4ea", color: "#137333", fontWeight: "bold", fontSize: "12px" }}>
                    {ch.userStatus === "CLAIMED" ? "Claimed ✓" : ch.userStatus === "COMPLETED" ? "Completed" : "Active"}
                  </span>
                ) : (
                  <button 
                    type="button" 
                    className="join-button" 
                    onClick={() => onJoinChallenge && onJoinChallenge(ch.challengeId || ch._id)}
                  >
                    Join now
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <p className="no-data">No active community challenges found.</p>
        )}
      </div>
    </section>
  );
}

function ImpactGamificationCard({ levelDetails, earnedBadges = [] }) {
  const currentLevelTitle = `Level ${levelDetails.level}: ${levelDetails.title} ${levelDetails.icon || "🌱"}`;
  const currentXP = Number(levelDetails.currentXP || 0);
  const nextLevelXP = Number(levelDetails.levelMaxXP || 500);
  const xpPercent = Number(levelDetails.progressPercent || 0);

  return (
    <section className="dashboard-card impact-card">
      <CardHeader kicker="BADGES & ACHIEVEMENT LEVELS" title="Your Impact & Gamification" subtitle="Your achievements and progress" />
      
      <div className="level-summary-box">
        <div className="level-header-row">
          <span className="level-name-tag">{currentLevelTitle}</span>
          <span className="xp-text">{currentXP.toLocaleString()} / {nextLevelXP === Infinity ? "Max" : nextLevelXP.toLocaleString()} XP</span>
        </div>
        <ProgressBar value={xpPercent} />
      </div>

      <div className="earned-badges-title">
        <span>EARNED BADGES ({earnedBadges.length})</span>
      </div>

      <div className="badge-grid">
        {earnedBadges.length > 0 ? (
          earnedBadges.map((badge, idx) => (
            <div className="achievement-badge-card" key={badge.challengeId || idx}>
              <div className="badge-symbol-circle green">
                <span className="badge-emoji">🏅</span>
              </div>
              <strong className="badge-title">{badge.title}</strong>
            </div>
          ))
        ) : (
          <p className="no-data" style={{ gridColumn: "span 3" }}>No badges earned yet. Complete challenges to earn badges!</p>
        )}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loggeduser, setLoggeduser] = useState(null);

  const [goalsList, setGoalsList] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [challengesList, setChallengesList] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [levelDetails, setLevelDetails] = useState({
    level: 1,
    title: "Eco Starter",
    icon: "🌱",
    currentXP: 0,
    levelMaxXP: 500,
    progressPercent: 0,
  });
  const [recommendationsList, setRecommendationsList] = useState([]);
  const [carbonStats, setCarbonStats] = useState({ totalEmissionsKg: 0, totalSavedKg: 0, netFootprintKg: 0, categories: [] });

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setLoggeduser(parsed.fullName || parsed.name || parsed.email || "User");
        } catch (e) {}
      }

      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const goalsRes = await axios.get("http://localhost:5000/api/goals", { headers });
        const fetchedGoals = Array.isArray(goalsRes.data) ? goalsRes.data : goalsRes.data.goals || [];
        setGoalsList(fetchedGoals);
      } catch (e) {
        console.warn("Goals sync error:", e);
      }

      try {
        const challengeRes = await axios.get("http://localhost:5000/api/challenges/available", { headers });
        if (challengeRes.data) {
          const fetchedChallenges = challengeRes.data.challenges || [];
          if (challengeRes.data.userLevelDetails) {
            setLevelDetails(challengeRes.data.userLevelDetails);
          }

          let myParticipations = [];
          try {
            const statusRes = await axios.get("http://localhost:5000/api/challenges/my-status", { headers });
            myParticipations = statusRes.data || [];
          } catch (err) {}

          const mergedChallenges = fetchedChallenges.map((ch) => {
            const part = myParticipations.find((p) => p.challengeId === ch.challengeId);
            return {
              ...ch,
              userStatus: part ? part.status : "AVAILABLE",
            };
          });

          setChallengesList(mergedChallenges);

          const claimedBadges = mergedChallenges.filter((c) => c.userStatus === "CLAIMED");
          setEarnedBadges(claimedBadges);
        }
      } catch (e) {
        console.warn("Challenges sync error:", e);
      }

      try {
        const dashboardRes = await axios.get("http://localhost:5000/api/dashboard", { headers });
        const data = dashboardRes.data;
        if (data) {
          if (data.carbonFootprint) setCarbonStats(data.carbonFootprint);
          if (data.recentActivity) setActivitiesList(data.recentActivity);
          if (data.aiRecommendations) setRecommendationsList(data.aiRecommendations);
        }
      } catch (e) {}

    } catch (err) {
      console.error("Dashboard Sync Fetch Error:", err);
    }
  }, []);

  const handleJoinChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/challenges/join",
        { challengeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchDashboardData();
    } catch (e) {
      console.error("Error joining challenge from Dashboard:", e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        <DashboardHeader
          loggeduser={loggeduser}
          onNotification={() => setNotificationsOpen(!notificationsOpen)}
          notificationsOpen={notificationsOpen}
        />
        <div className="dashboard-grid top-grid">
          <CarbonFootprintCard carbonStats={carbonStats} />
          <GoalProgressCard goals={goalsList} />
          <RecommendationsCard recommendations={recommendationsList} onRefresh={fetchDashboardData} />
        </div>
        <div className="dashboard-grid bottom-grid">
          <CommunityChallengesCard 
            challenges={challengesList} 
            onJoinChallenge={handleJoinChallenge} 
          />
          <RecentActivityCard activities={activitiesList} />
          <ImpactGamificationCard levelDetails={levelDetails} earnedBadges={earnedBadges} />
        </div>
      </main>
    </div>
  );
}