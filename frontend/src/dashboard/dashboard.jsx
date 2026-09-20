import { Link } from "react-router-dom";  
import React, { useState, useEffect } from 'react';
import "./dashboard.css";

/* =========================================
   ICONS
========================================= */
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
  Flame,
  TrendingUp,
  Sparkles,
  Zap,
  MoveHorizontal,
  Sprout,
  Ban,
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
  trend: TrendingUp,
  flag: Flag,
  shield: ShieldCheck,
};

/* =========================================
   DATA
   Replace mock values with backend data
   when your API integration is ready.
========================================= */

const navigation = [
  { label: "Home", icon: "Home", path: "/home" },
  { label: "Carbon Tracker", icon: "Leaf", path: "/carbon-footprint-tracker" },
  { label: "Goals", icon: "Target", path: "/goals" },
  { label: "Challenges", icon: "Trophy", path: "/home" }, 
  { label: "Dashboard", icon: "Grid", path: "/dashboard", active: true },
  { label: "Reports", icon: "Chart", path: "/home" },
  { label: "Profile", icon: "User", path: "/profile" },
];

const goals = [
  {
    title: "Reduce Water Usage",
    subtitle: "Goal: 20L/day",
    progress: 65,
  },
  {
    title: "Use Public Transport",
    subtitle: "Goal: 3 days/week",
    progress: 65,
  },
  {
    title: "Reduce Electricity Usage",
    subtitle: "Goal: 1 bag/day",
    progress: 30,
  },
  {
    title: "Reduce Water Usage",
    subtitle: "Goal: 3 days/week",
    progress: 20,
  },
];

const recommendations = [
  {
    icon: "transport",
    title: "Try biking to work on Tuesdays",
    subtitle: "Potential saving: 0.2 tons CO₂e",
  },
  {
    icon: "energy",
    title: "Optimize home heating schedule",
    subtitle: "Potential saving: 0.3 tons CO₂e",
  },
  {
    icon: "water",
    title: "Optimize shower habits",
    subtitle: "Potential saving: 0.2 tons CO₂e",
  },
  {
    icon: "leaf",
    title: "Optimize thermostat settings",
    subtitle: "Potential saving: 1.2 tons CO₂e",
  },
];

const challenges = [
  {
    icon: "flag",
    title: "Plastic-Free Week",
    subtitle: "Active, Rank: 14/150",
    status: "Active",
  },
  {
    icon: "bolt",
    title: "Energy Saving Challenge",
    subtitle: "Join now and earn rewards",
    status: "Join now",
  },
  {
    icon: "shield",
    title: "Energy Saving Challenge",
    subtitle: "Active, Rank: 14/150",
    status: "Active",
  },
  {
    icon: "shield",
    title: "Energy-Free Week",
    subtitle: "Active, Rank: 13/150",
    status: "Active",
  },
];

const activities = [
  {
    icon: "transport",
    title: "Public Transport (Bus)",
    subtitle: "Today, 9:30 AM",
    result: "- 2.1 tons CO₂e saved",
    type: "positive",
  },
  {
    icon: "bolt",
    title: "Electricity Usage",
    subtitle: "Daily update",
    result: "Updated",
    type: "points",
  },
  {
    icon: "energy",
    title: "Electricity Usage",
    subtitle: "Daily update",
    result: "Updated",
    type: "points",
  },
  {
    icon: "bolt",
    title: "Electricity Usage",
    subtitle: "Daily update",
    result: "Updated",
    type: "points",
  },
  {
    icon: "energy",
    title: "Electricity Usage",
    subtitle: "Daily update",
    result: "Updated",
    type: "points",
  },
];

/* =========================================
   REUSABLE COMPONENTS
========================================= */

function Icon({ name, size = "normal" }) {
  const LucideIcon = icons[name] || CircleDot;

  return (
    <span
      className={`icon icon-${size}`}
      aria-hidden="true"
    >
      <LucideIcon size="1em" />
    </span>
  );
}

function CardHeader({
  kicker,
  title,
  subtitle,
  action,
  icon,
}) {
  return (
    <div className="card-heading">
      <div className="heading-copy">
        {kicker && (
          <span className="section-kicker">{kicker}</span>
        )}

        <h2>{title}</h2>

        {subtitle && <p>{subtitle}</p>}
      </div>

      {action || (
        <span className="heading-icon">
          <FileText />
        </span>
      )}
    </div>
  );
}

function ProgressBar({ value, className = "" }) {
  return (
    <div className={`progress-track ${className}`}>
      <div
        className="progress-fill"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

/* =========================================
   SIDEBAR
========================================= */

function Sidebar({ activePage, setActivePage }) {
  return ( <aside className="sidebar">
          <div className="sidebar-brand">
            <Globe size={18} strokeWidth={2} />
            <span>EcoTrack</span>
          </div>
  
          <nav className="sidebar-menu">
            <Link to="/home" className="menu-item">
              <HomeIcon size={16} />
              <span>Home</span>
            </Link>
  
            <Link to="/carbon-footprint-tracker" className="menu-item">
              <Leaf size={16} />
              <span>Carbon Tracker</span>
            </Link>
  
            <Link to="/goals" className="menu-item ">
              <Target size={16} />
              <span>Goals</span>
            </Link>
  
            <a href="#" className="menu-item">
              <ShieldCheck size={16} />
              <span>Challenges</span>
            </a>
  
            <a href="/dashboard" className="menu-item active">
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </a>
  
            <a href="#" className="menu-item">
              <FileText size={16} />
              <span>Reports</span>
            </a>
  
            <Link to="/profile" className="menu-item">
              <User size={16} />
              <span>Profile</span>
            </Link>
          </nav>
        </aside>
  
);
}

/* =========================================
   HEADER
========================================= */

function DashboardHeader({
  onNotification,
  notificationsOpen,
  onPrimaryAction,
  loggeduser
}) {
  
  return (
    <header className="dashboard-header">
      <div className="header-copy">
        <div className="header-date">
          OVERVIEW / DASHBOARD
        </div>

        <h1>
          Dashboard <span></span>
          <span className="header-wave"> 👋</span>
        </h1>

        <p>
          Track your sustainability journey and make a
          positive impact on the planet.
        </p>
      </div>

      <div className="header-actions">
        <div className="notification-wrap">
          <button
            type="button"
            className="notification-button"
            onClick={onNotification}
            aria-label="View notifications"
            aria-expanded={notificationsOpen}
          >
            <Icon name="bell" />
            <span className="notification-dot" />
          </button>

          {notificationsOpen && (
            <div className="notification-popover">
              <strong>Notifications</strong>
              <span>
                You have 3 new sustainability updates.
              </span>
              <span>
                Your weekly goal progress is ready.
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="user-menu"
          aria-label="Open user menu"
        >
          <span className="user-avatar">{loggeduser.substring(0,2).toUpperCase()}</span>
          <p className="user-menu-name">{loggeduser}</p>
          <span className="user-chevron"><ChevronDown size={16} /></span>
        </button>

        <button
          type="button"
          className="primary-action"
          onClick={onPrimaryAction}
        >
          <Icon name="plus" />
          Log Activity
        </button>
      </div>
    </header>
  );
}

/* =========================================
   CARBON FOOTPRINT CARD
========================================= */

function CarbonFootprintCard() {
  return (
    <section className="dashboard-card carbon-card">
     <CardHeader
        kicker="YOUR CARBON FOOTPRINT"
        title="Carbon Overview"
        subtitle="Sustainability tracking system"
        icon="chart"
      />

      <div className="carbon-content">
        <div className="carbon-donut">
          <div className="carbon-donut-inner">
            <span className="donut-label">Eco Score</span>
            <strong>72</strong>
            <span className="donut-status">Good</span>
          </div>
        </div>

        <div className="carbon-legend">
          <div className="legend-item">
            <span className="legend-dot transport-color" />
            <span>Transport</span>
            <strong>38%</strong>
          </div>

          <div className="legend-item">
            <span className="legend-dot energy-color" />
            <span>Energy</span>
            <strong>26%</strong>
          </div>

          <div className="legend-item">
            <span className="legend-dot food-color" />
            <span>Food</span>
            <strong>18%</strong>
          </div>

          <div className="legend-item">
            <span className="legend-dot waste-color" />
            <span>Waste</span>
            <strong>11%</strong>
          </div>
        </div>
      </div>

      <div className="emissions-summary">
        <div>
          <span>Total emissions</span>
          <strong>4.8 tons CO₂e</strong>
        </div>

        <span className="summary-arrow"><Icon name="arrow" /></span>
      </div>
    </section>
  );
}

/* =========================================
   GOAL PROGRESS
========================================= */

function GoalProgressCard() {
  return (
    <section className="dashboard-card goal-progress-card">
      <CardHeader
        kicker="GOAL MANAGEMENT"
        title="Goal Progress"
        subtitle="Sustainability goal management"
        icon="target"
      />

      <div className="goal-progress-list">
        {goals.map((goal, index) => (
          <div className="goal-progress-item" key={`${goal.title}-${index}`}>
            <div className="goal-progress-top">
              <div>
                <strong>{goal.title}</strong>
                <span>{goal.subtitle}</span>
              </div>

              <b>{goal.progress}%</b>
            </div>

            <ProgressBar value={goal.progress} />
            <span className="progress-caption">
              {goal.progress}% Complete
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================
   AI RECOMMENDATIONS
========================================= */

function RecommendationsCard() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="dashboard-card ai-card">
      <CardHeader
        kicker="RECOMMENDATION FACTORS"
        title="AI-Powered Recommendations"
        subtitle="Personalized sustainability insights"
        icon="chart"
      />

      <div className="recommendation-list">
        {recommendations
          .slice(0, expanded ? 4 : 3)
          .map((recommendation, index) => (
            <div className="recommendation-item" key={index}>
              <div className="recommendation-icon">
                <Icon name={recommendation.icon} />
              </div>

              <div className="recommendation-copy">
                <strong>{recommendation.title}</strong>
                <span>{recommendation.subtitle}</span>
              </div>

              <span className="recommendation-arrow"><Icon name="arrow" /></span>
            </div>
          ))}
      </div>

      <button
        type="button"
        className="secondary-action full"
        onClick={() => setExpanded((current) => !current)}
      >
        {expanded ? "Show Less" : "View All Recommendations"}
        <Icon name="arrow" />
      </button>
    </section>
  );
}

/* =========================================
   COMMUNITY CHALLENGES
========================================= */

function CommunityChallengesCard() {
  const [joined, setJoined] = useState(false);

  return (
    <section className="dashboard-card challenge-list-card">
      <CardHeader
        kicker="CHALLENGE CATEGORIES"
        title="Community Challenges"
        subtitle="Connect, compete and make an impact"
        icon="chart"
      />

      <div className="challenge-list">
        {challenges.map((challenge, index) => (
          <div className="challenge-row" key={index}>
            <div className="challenge-row-icon">
              <Icon name={challenge.icon} />
            </div>

            <div className="challenge-row-copy">
              <strong>{challenge.title}</strong>
              <span>{challenge.subtitle}</span>
            </div>

            {index === 1 ? (
              <button
                type="button"
                className={`join-button ${
                  joined ? "joined" : ""
                }`}
                onClick={() => setJoined((current) => !current)}
              >
                {joined ? "Joined" : "Join now"}
              </button>
            ) : (
              <span className="challenge-status">
                {challenge.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================
   RECENT ACTIVITY
========================================= */

function RecentActivityCard() {
  return (
    <section className="dashboard-card activity-card">
      <CardHeader
        kicker="HISTORICAL ACTIVITY RECORDS"
        title="Recent Activity"
        subtitle="Your latest sustainability actions"
        icon="chart"
      />

      <div className="activity-list">
        {activities.map((activity, index) => (
          <div className="activity-row" key={index}>
            <div className="activity-icon">
              <Icon name={activity.icon} />
            </div>

            <div className="activity-main">
              <strong>{activity.title}</strong>
              <span>{activity.subtitle}</span>
            </div>

            <div className="activity-result">
              <strong className={activity.type}>
                {activity.result}
              </strong>
              <span>Completed</span>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="text-action">
        View all activity <Icon name="arrow" />
      </button>
    </section>
  );
}

/* =========================================
   IMPACT AND GAMIFICATION
========================================= */

function ImpactGamificationCard() {
  return (
    <section className="dashboard-card impact-card">
      <CardHeader
        kicker="BADGES & ACHIEVEMENT LEVELS"
        title="Your Impact & Gamification"
        subtitle="Your achievements and progress"
        icon="target"
      />

      <div className="badge-list">
        <div className="achievement-badge">
          <div className="badge-shape green-badge">
            <Icon name="leaf" size="large" />
          </div>
          <strong>Eco Warrior</strong>
          <span>Badge earned</span>
        </div>

        <div className="achievement-badge">
          <div className="badge-shape blue-badge">
            <Icon name="water" size="large" />
          </div>
          <strong>Water Saver</strong>
          <span>Badge earned</span>
        </div>
      </div>

      <div className="next-level">
        <div className="next-level-header">
          <strong>Next Level</strong>
          <span>68%</span>
        </div>

        <ProgressBar value={68} />

        <div className="level-label">
          <strong>Green Beginner to Eco Hero</strong>
          <span>120 points needed</span>
        </div>
      </div>

      <div className="impact-stats">
        <div>
          <strong>240</strong>
          <span>Points earned</span>
        </div>
        <div>
          <strong>12</strong>
          <span>Actions completed</span>
        </div>
      </div>
    </section>
  );
}

/* =========================================
   DASHBOARD
========================================= */

export default function Dashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [notificationsOpen, setNotificationsOpen] =
    useState(false);
  const [showActivityModal, setShowActivityModal] =
    useState(false);
    const [loggeduser, setLoggeduser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        setLoggeduser(JSON.parse(storedUser));
        console.log(loggeduser.fullName)
      } catch (err) {
        console.error("User JSON parse error:", err);
      }
    }
  }, []);

    
  const handlePageChange = (page) => {
    setActivePage(page);
  };

  const handlePrimaryAction = () => {
    setShowActivityModal(true);
  };

  return (
    <div className="dashboard-shell">
      <Sidebar
        activePage={activePage}
        setActivePage={handlePageChange}
      />

      <main className="dashboard-main">
        <DashboardHeader
        loggeduser={loggeduser?.fullName || loggeduser?.name || "User"}
          onNotification={() =>
            setNotificationsOpen((current) => !current)
          }
          notificationsOpen={notificationsOpen}
          onPrimaryAction={handlePrimaryAction}
        />

        <div className="dashboard-overview">
          <div className="overview-label">
            <span>PERSONAL OVERVIEW</span>
            <span>Updated today</span>
          </div>

          <div className="overview-line" />
        </div>

        <div className="dashboard-grid top-grid">
          <CarbonFootprintCard />
          <GoalProgressCard />
          <RecommendationsCard />
        </div>

        <div className="dashboard-grid bottom-grid">
          <CommunityChallengesCard />
          <RecentActivityCard />
          <ImpactGamificationCard />
        </div>

        <footer className="dashboard-footer">
          <span>© 2026 EcoTrack. Sustainability at a glance.</span>
          <span>Made for a greener tomorrow 🌱</span>
        </footer>
      </main>

      {showActivityModal && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => setShowActivityModal(false)}
        >
          <div
            className="activity-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="section-kicker">
                  SUSTAINABILITY TRACKER
                </span>
                <h2 id="activity-modal-title">
                  Log Activity
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowActivityModal(false)}
                aria-label="Close activity form"
              >
                <X size={18} />
              </button>
            </div>

            <p>
              Record a sustainability action to keep your
              EcoTrack dashboard up to date.
            </p>

            <label htmlFor="activity-type">Activity Type</label>
            <select id="activity-type" defaultValue="transport">
              <option value="transport">Public Transport</option>
              <option value="energy">Energy Saving</option>
              <option value="water">Water Conservation</option>
              <option value="waste">Waste Reduction</option>
            </select>

            <label htmlFor="activity-value">Activity Details</label>
            <input
              id="activity-value"
              type="text"
              placeholder="Enter activity details"
            />

            <button
              type="button"
              className="primary-action modal-submit"
              onClick={() => setShowActivityModal(false)}
            >
              <Icon name="check" />
              Save Activity
            </button>

            <p className="modal-note">
              Demo form: connect this button to your backend
              activity endpoint to persist records.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}