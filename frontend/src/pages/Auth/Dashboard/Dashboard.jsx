import React, { useState, useEffect } from "react";
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
  X,
  RotateCw
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
  const totalSavedKg = Number(carbonStats?.totalSavedKg || 0);
  const netFootprintKg = Number(carbonStats?.netFootprintKg || 0);

  const calculatedScore = Math.max(
    10,
    Math.min(100, Math.round(100 - netFootprintKg * 0.35))
  );

  const scoreStatus = calculatedScore > 75 ? "Good" : calculatedScore > 40 ? "Average" : "Needs Action";
  const scoreClass = calculatedScore > 75 ? "good" : calculatedScore > 40 ? "avg" : "bad";

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
              const catKey = String(cat.name || "").toLowerCase().replace(/\s+/g, "");
              return (
                <div className="legend-chip" key={idx}>
                  <span className={`legend-dot-indicator cat-${catKey}`} />
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

// Net Savings Unified Progress Goal Card
function GoalProgressCard({ goals = [] }) {
  const activeGoals = goals.filter(g => !g.isCompleted).slice(0, 3);

  return (
    <section className="dashboard-card goal-progress-card">
      <CardHeader kicker="GOAL MANAGEMENT" title="Goal Progress" subtitle="Net Savings (Saved − Emitted)" />

      <div className="goal-progress-list">
        {activeGoals.length > 0 ? (
          activeGoals.map((goal, index) => {
            const title = goal.title || "Goal";
            const category = goal.category || "Overall";
            const percent = Number(goal.percent) || 0;
            const currentProgress = Number(goal.currentProgress) || 0;
            const targetValue = Number(goal.targetValue) || 0;
            const remaining = Number(goal.remainingBalance || goal.remaining) || 0;
            const totalSaved = Number(goal.totalSaved) || 0;
            const totalEmitted = Number(goal.totalEmitted) || 0;

            return (
              <div className="goal-progress-item" key={goal._id || index}>
                <div className="goal-progress-top">
                  <div className="goal-title-wrap">
                    <strong className="goal-title">{title}</strong>
                    <span className="goal-category">Category: {category}</span>
                  </div>
                  <span className="goal-badge">{percent}% Complete</span>
                </div>

                <ProgressBar value={percent} />

                <div className="goal-progress-details">
                  <span>Net Progress: <b>{currentProgress} kg</b> / {targetValue} kg</span>
                  <span><b>{remaining} kg</b> needed</span>
                </div>
                <div style={{ fontSize: "9px", color: "#64748b", marginTop: "2px" }}>
                  Saved: {totalSaved} kg | Emitted: {totalEmitted} kg
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
        <button onClick={onRefresh} className="icon-refresh-btn">
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

      <div className="activity-list">
        {displayActivities.length > 0 ? (
          displayActivities.map((act, index) => {
            const mode = act.activityMode || (act.carbonSaved > 0 ? "saving" : "emission");
            const val = mode === "saving" ? (act.carbonSaved || act.co2 || 0) : (act.carbonOutput || act.co2 || 0);

            return (
              <div className="activity-row" key={act._id || index}>
                <div className="activity-icon"><Icon name={act.category?.toLowerCase() || "bolt"} /></div>
                <div className="activity-main">
                  <strong>{act.activityType || act.category}</strong>
                  <span>{act.activityDate || "Recently"}</span>
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

function CommunityChallengesCard() {
  const [joinedState, setJoinedState] = useState({});

  const challenges = [
    { id: 1, icon: "tree", title: "Tree Planting Drive", subtitle: "Plant 2 trees this month", status: "Active" },
    { id: 2, icon: "flag", title: "Plastic-Free Week", subtitle: "Active, Rank: 14/150", status: "Active" },
    { id: 3, icon: "bolt", title: "Energy Saving Challenge", subtitle: "Join now and earn rewards", status: "Join now" },
  ];

  const toggleJoin = (id) => {
    setJoinedState(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="dashboard-card challenge-list-card">
      <CardHeader kicker="CHALLENGE CATEGORIES" title="Community Challenges" subtitle="Connect, compete and make an impact" />
      <div className="challenge-list">
        {challenges.map((challenge) => {
          const isJoined = joinedState[challenge.id];
          return (
            <div className="challenge-row" key={challenge.id}>
              <div className="challenge-row-icon"><Icon name={challenge.icon} /></div>
              <div className="challenge-row-copy">
                <strong>{challenge.title}</strong>
                <span>{challenge.subtitle}</span>
              </div>
              {challenge.status === "Join now" ? (
                <button 
                  type="button" 
                  className={`join-button ${isJoined ? "joined" : ""}`} 
                  onClick={() => toggleJoin(challenge.id)}
                >
                  {isJoined ? "Joined" : "Join now"}
                </button>
              ) : (
                <span className="challenge-status-badge">{challenge.status}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ImpactGamificationCard() {
  return (
    <section className="dashboard-card impact-card">
      <CardHeader kicker="BADGES & ACHIEVEMENT LEVELS" title="Your Impact & Gamification" subtitle="Your achievements and progress" />
      <div className="badge-list">
        <div className="achievement-badge">
          <div className="badge-shape green-badge"><Icon name="leaf" size="large" /></div>
          <strong>Eco Warrior</strong>
          <span>Badge earned</span>
        </div>
      </div>
      <div className="next-level">
        <div className="next-level-header">
          <strong>Next Level Progress</strong>
          <span>68%</span>
        </div>
        <ProgressBar value={68} />
      </div>
    </section>
  );
}

const RECOMMENDATIONS_POOL = [
  { icon: "transport", title: "Try biking to work on Tuesdays", subtitle: "Potential saving: 0.8 tons CO₂e" },
  { icon: "energy", title: "Optimize home heating schedule", subtitle: "Potential saving: 0.5 tons CO₂e" },
  { icon: "water", title: "Optimize shower habits", subtitle: "Potential saving: 0.2 tons CO₂e" },
  { icon: "bolt", title: "Switch to cold water laundry wash", subtitle: "Potential saving: 0.4 tons CO₂e" },
];

export default function Dashboard() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loggeduser, setLoggeduser] = useState(null);

  const [goalsList, setGoalsList] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [recommendationsList, setRecommendationsList] = useState(RECOMMENDATIONS_POOL);
  const [carbonStats, setCarbonStats] = useState({ totalEmissionsKg: 0, totalSavedKg: 0, netFootprintKg: 0, categories: [] });

  useEffect(() => {
    const fetchDashboardData = async () => {
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

        const trackerRes = await axios.get("http://localhost:5000/api/tracker/history", { headers });
        const logs = Array.isArray(trackerRes.data) ? trackerRes.data : trackerRes.data.logs || [];
        setActivitiesList(logs);

        let totalEmitted = 0;
        let totalSaved = 0;
        let categoriesMap = {};

        logs.forEach((log) => {
          const mode = log.activityMode || (log.carbonSaved > 0 ? "saving" : "emission");
          const emittedVal = mode === "emission" ? Number(log.carbonOutput || log.co2 || 0) : 0;
          const savedVal = mode === "saving" ? Number(log.carbonSaved || log.co2 || 0) : 0;

          totalEmitted += emittedVal;
          totalSaved += savedVal;

          const cat = log.category || "General";
          categoriesMap[cat] = (categoriesMap[cat] || 0) + emittedVal;
        });

        const categoriesArray = Object.keys(categoriesMap).map((catName) => {
          const catValue = categoriesMap[catName];
          const pct = totalEmitted > 0 ? Math.round((catValue / totalEmitted) * 100) : 0;
          return { name: catName, percentage: pct, emission: Number(catValue.toFixed(1)) };
        });

        setCarbonStats({
          totalEmissionsKg: Number(totalEmitted.toFixed(1)),
          totalSavedKg: Number(totalSaved.toFixed(1)),
          netFootprintKg: Number(Math.max(0, totalEmitted - totalSaved).toFixed(1)),
          categories: categoriesArray
        });

        const goalsRes = await axios.get("http://localhost:5000/api/goals", { headers });
        setGoalsList(Array.isArray(goalsRes.data) ? goalsRes.data : goalsRes.data.goals || []);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      }
    };

    fetchDashboardData();
  }, []);

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
          <RecommendationsCard recommendations={recommendationsList} />
        </div>
        <div className="dashboard-grid bottom-grid">
          <CommunityChallengesCard />
          <RecentActivityCard activities={activitiesList} />
          <ImpactGamificationCard />
        </div>
      </main>
    </div>
  );
}