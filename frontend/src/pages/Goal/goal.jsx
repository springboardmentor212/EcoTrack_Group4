import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./goal.css";
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
} from "lucide-react";

const statCards = [
  {
    label: "Active Goals",
    value: "4",
    unit: "in progress",
    valueClass: "",
    icon: CircleDot,
    iconClass: "bg-icon-green text-green",
  },
  {
    label: "Completed Goals",
    value: "12",
    unit: "achieved",
    valueClass: "green",
    icon: CheckCircle2,
    iconClass: "bg-icon-green text-green",
  },
  {
    label: "Current Goal Streak",
    value: "18",
    unit: "Days",
    valueClass: "amber",
    icon: Flame,
    iconClass: "bg-orange text-amber",
  },
  {
    label: "Avg. Success Rate",
    value: "78%",
    unit: "",
    valueClass: "blue",
    icon: TrendingUp,
    iconClass: "bg-icon-blue text-blue",
  },
];

const activeGoals = [
  {
    title: "Reduce Electricity Consumption",
    category: "Energy Usage",
    target: "30 kWh / month",
    icon: Zap,
    color: "green",
    percent: 75,
    progressLabel: "22.5 / 30 kWh saved",
    deadline: "Sep 15, 2026",
  },
  {
    title: "Use Public Transport 3x / Week",
    category: "Transportation",
    target: "12 Commutes",
    icon: MoveHorizontal,
    color: "blue",
    percent: 50,
    progressLabel: "6 / 12 Commutes",
    deadline: "Sep 30, 2026",
  },
  {
    title: "Plant 5 Trees in Community Drive",
    category: "Carbon Offset",
    target: "5 Trees",
    icon: Sprout,
    color: "amber",
    percent: 40,
    progressLabel: "2 / 5 Trees Planted",
    deadline: "Oct 15, 2026",
  },
  {
    title: "Zero Single-Use Plastic Bags",
    category: "Waste Reduction",
    target: "30 Days",
    icon: Ban,
    color: "teal",
    percent: 90,
    progressLabel: "27 / 30 Days Completed",
    deadline: "Sep 05, 2026",
  },
];

export default function GoalsPage() {
  const [goalTitle, setGoalTitle] = useState("Use Public Transport Weekly");
  const [goalCategory, setGoalCategory] = useState("Green Transportation");
  const [targetValue, setTargetValue] = useState("50");
  const [targetUnit, setTargetUnit] = useState("kg CO2e / mo");
  const [targetDate, setTargetDate] = useState("2026-09-30");

  return (
    <div className="goals-app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Globe size={19} className="w-4 h-4" strokeWidth={2} />
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

          <Link to="/goals" className="menu-item active">
            <Target size={16} />
            <span>Goals</span>
          </Link>

          <Link to="/challenges" className="menu-item">
            <ShieldCheck size={16} />
            <span>Challenges</span>
          </Link>

          <a href="#" className="menu-item">
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

      {/* Main content */}
      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Sustainability Goals</h1>
            <p>Set targets, track progress, and monitor achievements</p>
          </div>
          <div className="header-actions">
            <button className="icon-button">
              <Bell size={16} strokeWidth={2} />
            </button>
            <div className="user-chip">
              <span className="user-chip-avatar">
                <User size={12} strokeWidth={2.5} />
              </span>
              User
              <ChevronDown size={14} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="stat-grid">
          {statCards.map(
            ({ label, value, unit, valueClass, icon: Icon, iconClass }) => (
              <div className="stat-card" key={label}>
                <div>
                  <p className="stat-label">{label}</p>
                  <p className={`stat-value ${valueClass}`}>
                    {value}
                    {unit && <span className="unit">{unit}</span>}
                  </p>
                </div>
                <div className={`stat-icon ${iconClass}`}>
                  <Icon size={16} strokeWidth={2} />
                </div>
              </div>
            )
          )}
        </div>

        {/* Body: form + progress list, divided into two columns */}
        <div className="content-grid">
          {/* Create New Goal */}
          <section className="panel">
            <h2>Create New Goal</h2>
            <p className="panel-subtitle">
              Define targets to lower your footprint
            </p>

            <div className="goal-form">
              <div className="form-group">
                <label>Goal Title</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Goal Category</label>
                <div className="select-wrap">
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                  >
                    <option>Green Transportation</option>
                    <option>Energy Usage</option>
                    <option>Waste Reduction</option>
                    <option>Carbon Offset</option>
                  </select>
                  <ChevronDown size={16} />
                </div>
              </div>

              <div className="form-group">
                <label>Target Reduction / Value</label>
                <div className="form-row-split">
                  <input
                    type="text"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                  />
                  <input
                    type="text"
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Target Completion Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>

              <button className="btn-primary">+ Add New Goal</button>

              <div className="ai-callout">
                <div className="ai-callout-title">
                  <Sparkles size={14} strokeWidth={2} />
                  AI Goal Recommendation
                </div>
                <p>
                  Based on your carbon footprint, setting a goal to reduce
                  electricity usage by 15% could save 22 kg CO2e monthly.
                </p>
                <button className="ai-callout-link">
                  Auto-fill Goal Details →
                </button>
              </div>
            </div>
          </section>

          {/* Active Goal Progress */}
          <section className="panel">
            <h2>Active Goal Progress</h2>
            <p className="panel-subtitle">
              Track live achievements and update milestone values
            </p>

            <div className="goal-list">
              {activeGoals.map(
                ({
                  title,
                  category,
                  target,
                  icon: Icon,
                  color,
                  percent,
                  progressLabel,
                  deadline,
                }) => (
                  <div className="goal-item" key={title}>
                    <div className={`goal-item-icon bg-icon-${color} text-${color}`}>
                      <Icon size={16} strokeWidth={2} />
                    </div>
                    <div className="goal-item-body">
                      <div className="goal-item-top">
                        <p className="goal-item-title">{title}</p>
                        <span className={`goal-item-percent text-${color}`}>
                          {percent}% Done
                        </span>
                      </div>
                      <p className="goal-item-meta">
                        Category: {category} • Target: {target}
                      </p>

                      <div className="progress-track">
                        <div
                          className={`progress-fill fill-${color}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="goal-item-footer">
                        <span>Progress: {progressLabel}</span>
                        <span>Deadline: {deadline}</span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
