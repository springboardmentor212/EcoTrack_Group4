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
        <Link to="/home" className="menu-item">
          <HomeIcon size={18} />
          <span>Home</span>
        </Link>
        <Link to="/carbon-footprint-tracker" className="menu-item">
          <Leaf size={18} />
          <span>Carbon Tracker</span>
        </Link>
        <Link to="/goals" className="menu-item">
          <Target size={18} />
          <span>Goals</span>
        </Link>
        <Link to="/challenges" className="menu-item">
          <ShieldCheck size={18} />
          <span>Challenges</span>
        </Link>
        <Link to="/dashboard" className="menu-item active">
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        <Link to="/reports" className="menu-item">
          <FileText size={18} />
          <span>Reports</span>
        </Link>
        <Link to="/profile" className="menu-item">
          <User size={18} />
          <span>Profile</span>
        </Link>
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
          <button
            type="button"
            className="notification-button"
            onClick={onNotification}
            aria-label="View notifications"
          >
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

// 1. DYNAMIC DONUT CARBON FOOTPRINT CARD
function CarbonFootprintCard({ carbonStats }) {
  const categories = carbonStats?.categories || [];

  const totalEmissionsKg = Number(carbonStats?.totalEmissionsKg || 0);
  const totalEmissionsTons = (totalEmissionsKg / 1000).toFixed(2);

  const calculatedScore = Math.max(
    10,
    Math.min(100, Math.round(100 - totalEmissionsKg * 0.35))
  );

  const scoreStatus =
    calculatedScore > 75
      ? "Good"
      : calculatedScore > 40
      ? "Average"
      : "Needs Action";

  const scoreClass =
    calculatedScore > 75
      ? "good"
      : calculatedScore > 40
      ? "avg"
      : "bad";

  // Category colors
  const categoryColors = {
    transport: "#3b82f6",
    food: "#10b981",
    water: "#06b6d4",
    energy: "#f59e0b",
    waste: "#8b5cf6",
  };

  // Create dynamic donut segments
  let currentPercentage = 0;

  const donutSegments = categories
    .filter((cat) => Number(cat.percentage) > 0)
    .map((cat) => {
      const key = String(cat.name || "")
        .toLowerCase()
        .trim();

      const percentage = Number(cat.percentage) || 0;
      const color = categoryColors[key] || "#64748b";

      const start = currentPercentage;
      const end = currentPercentage + percentage;

      currentPercentage = end;

      return `${color} ${start}% ${end}%`;
    });

  const donutBackground =
    donutSegments.length > 0
      ? `conic-gradient(${donutSegments.join(", ")})`
      : "#e2e8f0";

  return (
    <section className="dashboard-card carbon-card">
      <CardHeader
        kicker="YOUR CARBON FOOTPRINT"
        title="Carbon Overview"
        subtitle="Sustainability tracking system"
      />

      <div className="carbon-centered-wrapper">
        {/* DONUT */}
        <div
          className="carbon-donut-large"
          style={{
            background: donutBackground,
          }}
        >
          <div className="carbon-donut-inner">
            <span className="donut-label">Eco Score</span>
            <strong>{calculatedScore}</strong>
            <span className={`donut-status ${scoreClass}`}>
              {scoreStatus}
            </span>
          </div>
        </div>

        {/* LEGEND */}
        <div className="carbon-legend-grid">
          {categories.length > 0 ? (
            categories.map((cat, idx) => {
              const catKey = String(cat.name || "")
                .toLowerCase()
                .replace(/\s+/g, "");

              return (
                <div className="legend-chip" key={idx}>
                  <span className={`legend-dot-indicator cat-${catKey}`} />
                  <span className="legend-name">{cat.name}</span>
                  <strong className="legend-val">
                    {cat.percentage || 0}% ({cat.emission || 0}kg)
                  </strong>
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

      <div className="emissions-summary">
        <div>
          <span>Total emissions: </span>
          <strong>
            {totalEmissionsKg.toFixed(1)} kg ({totalEmissionsTons} tons CO₂e)
          </strong>
        </div>

        <span className="summary-arrow">
          <Icon name="arrow" />
        </span>
      </div>
    </section>
  );
}

function GoalProgressCard({ goals = [] }) {
  const displayGoals = goals.slice(0, 3);

  return (
    <section className="dashboard-card goal-progress-card">
      <CardHeader
        kicker="GOAL MANAGEMENT"
        title="Goal Progress"
        subtitle="Track your goal allowance usage"
      />

      <div className="goal-progress-list">
        {displayGoals.length > 0 ? (
          displayGoals.map((goal, index) => {
            const title = goal.title || goal.goalTitle || "Sustainability Goal";
            const category = goal.category || "General";

            const remainingPercent = Math.min(
              100,
              Math.max(0, Number(goal.percent) || 0)
            );

            const usedPercent = Number((100 - remainingPercent).toFixed(1));
            const targetValue = Number(goal.targetValue) || 0;
            const currentEmitted = Number(goal.currentProgress) || 0;
            const remainingBalance = Number(goal.remainingBalance) || 0;

            return (
              <div className="goal-progress-item" key={goal._id || index}>
                <div className="goal-progress-top">
                  <div className="goal-title-wrap">
                    <strong className="goal-title">{title}</strong>
                    <span className="goal-category">Category: {category}</span>
                  </div>
                  <span className={`goal-badge ${goal.isLimitExceeded ? "exceeded" : ""}`}>
                    {goal.isLimitExceeded ? "Exceeded" : `${usedPercent}% Used`}
                  </span>
                </div>

                <ProgressBar value={goal.isLimitExceeded ? 100 : usedPercent} />

                <div className="goal-progress-details">
                  <span>Emitted: <b>{currentEmitted} kg</b> / {targetValue} kg</span>
                  <span className="remaining-text"><b>{remainingBalance} kg</b> left</span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-data">No goals found. Add goals in Goals Page!</p>
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
          <h2>AI-Powered Recommendations</h2>
          <p>Personalized sustainability insights</p>
        </div>
        <button 
          onClick={onRefresh} 
          title="Refresh AI Recommendations"
          className="icon-refresh-btn"
        >
          <RotateCw size={16} />
        </button>
      </div>

      <div className="recommendation-list">
        {displayRecs.length > 0 ? (
          displayRecs.map((rec, index) => (
            <div className="recommendation-item" key={index}>
              <div className="recommendation-icon">
                <Icon name={rec.icon || "leaf"} />
              </div>
              <div className="recommendation-copy">
                <strong>{rec.title}</strong>
                <span>{rec.subtitle}</span>
              </div>
              <span className="recommendation-arrow">
                <Icon name="arrow" />
              </span>
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
      <CardHeader kicker="HISTORICAL ACTIVITY RECORDS" title="Recent Activity" subtitle="Your latest sustainability actions" />

      <div className="activity-list">
        {displayActivities.length > 0 ? (
          displayActivities.map((act, index) => {
            const actTitle = act.activityType || act.title || act.category || "Logged Activity";
            const actSub = act.activityDate || act.date || "Recently";
            const co2Val = act.carbonOutput || act.co2 || act.emission || 0;

            return (
              <div className="activity-row" key={act._id || index}>
                <div className="activity-icon">
                  <Icon name={act.category?.toLowerCase() || act.type || "bolt"} />
                </div>
                <div className="activity-main">
                  <strong>{actTitle}</strong>
                  <span>{actSub}</span>
                </div>
                <div className="activity-result">
                  <strong className="positive">+{Number(co2Val).toFixed(2)} kg</strong>
                  <span className="status-label">Completed</span>
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
  { icon: "tree", title: "Plant native shrubs in garden", subtitle: "Potential saving: 0.3 tons CO₂e" },
  { icon: "transport", title: "Use Public Transport 3x/week", subtitle: "Potential saving: 1.2 tons CO₂e" },
];

export default function Dashboard() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [loggeduser, setLoggeduser] = useState(null);

  const [goalsList, setGoalsList] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [recommendationsList, setRecommendationsList] = useState([]);
  const [carbonStats, setCarbonStats] = useState({ totalEmissionsKg: 0, categories: [] });

  const [actType, setActType] = useState("Transport");
  const [actDetails, setActDetails] = useState("");

  const getRandomRecommendations = () => {
    const shuffled = [...RECOMMENDATIONS_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  };

  const refreshRecommendations = () => {
    setRecommendationsList(getRandomRecommendations());
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        if (storedUser && storedUser !== "undefined") {
          try {
            const parsed = JSON.parse(storedUser);
            setLoggeduser(parsed.fullName || parsed.name || parsed.email || "User");
          } catch (e) {
            console.error(e);
          }
        }

        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        const trackerRes = await axios.get("http://localhost:5000/api/tracker/history", { headers });
        const logs = Array.isArray(trackerRes.data) ? trackerRes.data : trackerRes.data.logs || [];
        setActivitiesList(logs);

        let total = 0;
        let categoriesMap = {};

        logs.forEach((log) => {
          const val = Number(log.carbonOutput || log.co2 || log.emission || 0);
          total += val;
          const cat = log.category || "General";
          categoriesMap[cat] = (categoriesMap[cat] || 0) + val;
        });

        const categoriesArray = Object.keys(categoriesMap).map((catName) => {
          const catValue = categoriesMap[catName];
          const pct = total > 0 ? Math.round((catValue / total) * 100) : 0;
          return {
            name: catName,
            percentage: pct,
            emission: Number(catValue.toFixed(1))
          };
        });

        setCarbonStats({
          totalEmissionsKg: Number(total.toFixed(1)),
          categories: categoriesArray
        });

        const goalsRes = await axios.get("http://localhost:5000/api/goals", { headers });
        const fetchedGoals = Array.isArray(goalsRes.data) ? goalsRes.data : goalsRes.data.goals || [];
        setGoalsList(fetchedGoals);

        setRecommendationsList(getRandomRecommendations());

      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSaveActivity = async (e) => {
    e.preventDefault();
    if (!actDetails.trim()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        "http://localhost:5000/api/tracker/log",
        {
          category: actType,
          subType: actType,
          activityType: actDetails,
          usageValue: 10,
          activityDate: new Date().toISOString().split("T")[0]
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setActDetails("");
      setShowActivityModal(false);

      window.location.reload();
    } catch (err) {
      console.error("Error saving activity:", err);
    }
  };

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
          <RecommendationsCard recommendations={recommendationsList} onRefresh={refreshRecommendations} />
        </div>

        <div className="dashboard-grid bottom-grid">
          <CommunityChallengesCard />
          <RecentActivityCard activities={activitiesList} />
          <ImpactGamificationCard />
        </div>

        <footer className="dashboard-footer">
          <span>© 2026 EcoTrack. Sustainability at a glance.</span>
        </footer>
      </main>

      {showActivityModal && (
        <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
          <div className="activity-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Log Sustainability Activity</h2>
              <button type="button" className="modal-close" onClick={() => setShowActivityModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveActivity}>
              <label htmlFor="activity-type">Activity Category</label>
              <select
                id="activity-type"
                value={actType}
                onChange={(e) => setActType(e.target.value)}
              >
                <option value="Transport">Transport (Biking/Bus)</option>
                <option value="Energy">Energy Saving</option>
                <option value="Water">Water Conservation</option>
                <option value="Waste">Waste Management</option>
              </select>

              <label htmlFor="activity-value">Activity Details</label>
              <input
                id="activity-value"
                type="text"
                placeholder="e.g. Travelled 5km by cycle"
                value={actDetails}
                onChange={(e) => setActDetails(e.target.value)}
                required
              />

              <button type="submit" className="primary-action-btn modal-submit">
                <Icon name="check" /> Save & Update Dashboard
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}