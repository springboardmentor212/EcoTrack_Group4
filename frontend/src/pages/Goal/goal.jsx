import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
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
  RotateCw,
} from "lucide-react";

export default function GoalsPage() {
  const [goalTitle, setGoalTitle] = useState("Use Public Transport Weekly");
  const [goalCategory, setGoalCategory] = useState("Green Transportation");
  const [targetValue, setTargetValue] = useState("50");
  const [targetUnit, setTargetUnit] = useState("kg CO2e / mo");
  const [targetDate, setTargetDate] = useState("2026-09-30");

  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({
    activeCount: 0,
    completedCount: 0,
    streak: 0,
    successRate: "0%",
  });

  const [aiData, setAiData] = useState({
    title: "Reduce Electricity Usage by 15%",
    category: "Energy Usage",
    targetValue: "22",
    targetUnit: "kg CO2e / mo",
    targetDate: "2026-10-31",
    description:
      "Based on your carbon footprint, setting a goal to reduce electricity usage by 15% could save 22 kg CO2e monthly.",
  });
  const [loadingAi, setLoadingAi] = useState(false);

  const getCategoryDetails = (cat) => {
    switch (cat) {
      case "Energy Usage":
        return { icon: Zap, color: "green" };
      case "Green Transportation":
      case "Transportation":
        return { icon: MoveHorizontal, color: "blue" };
      case "Carbon Offset":
        return { icon: Sprout, color: "amber" };
      case "Waste Reduction":
        return { icon: Ban, color: "teal" };
      default:
        return { icon: Target, color: "green" };
    }
  };

  // Fetch Goals & Synchronize Stats
  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("http://localhost:5000/api/goals", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data) {
        const goalList = Array.isArray(res.data)
          ? res.data
          : res.data.goals || [];

        setGoals(goalList);

        const activeGoalsCount = goalList.filter(
          (g) => g.status !== "Completed"
        ).length;
        const completedGoalsCount = goalList.filter(
          (g) => g.status === "Completed"
        ).length;

        setStats({
          activeCount:
            res.data.activeCount !== undefined
              ? res.data.activeCount
              : activeGoalsCount,
          completedCount:
            res.data.completedCount !== undefined
              ? res.data.completedCount
              : completedGoalsCount,
          streak: res.data.streak || 0,
          successRate: res.data.successRate || "0%",
        });
      }
    } catch (err) {
      console.error("Fetch Goals Error:", err);
    }
  };

  const fetchAiRecommendation = async () => {
    try {
      setLoadingAi(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const timestamp = new Date().getTime();

      const res = await axios.get(
        `http://localhost:5000/api/goals/ai-recommendation?t=${timestamp}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data) {
        setAiData({
          title: res.data.title || "Reduce Electricity Usage by 15%",
          category: res.data.category || "Energy Usage",
          targetValue: res.data.targetValue || "22",
          targetUnit: res.data.targetUnit || "kg CO2e / mo",
          targetDate: res.data.targetDate || "2026-10-31",
          description:
            res.data.description ||
            "Based on your carbon footprint patterns, reducing electricity saves around 22 kg CO2e monthly.",
        });
      }
    } catch (err) {
      console.error("AI Recommendation Fetch Error:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchAiRecommendation();
  }, []);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle || !targetValue) {
      alert("Please fill in Goal Title and Target Value!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: goalTitle,
        category: goalCategory,
        targetValue,
        targetUnit,
        targetCompletionDate: targetDate,
      };

      await axios.post("http://localhost:5000/api/goals", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("New Goal Created Successfully!");
      setGoalTitle("");
      setTargetValue("");
      fetchGoals();
    } catch (err) {
      console.error("Create Goal Error:", err);
      alert("Failed to create goal.");
    }
  };

  const handleAiAutoFill = () => {
    setGoalTitle(aiData.title);
    setGoalCategory(aiData.category);
    setTargetValue(aiData.targetValue);
    setTargetUnit(aiData.targetUnit);
    setTargetDate(aiData.targetDate);
  };

  const statCards = [
    {
      label: "Active Goals",
      value: stats.activeCount,
      unit: "in progress",
      valueClass: "",
      icon: CircleDot,
      iconClass: "bg-icon-green text-green",
    },
    {
      label: "Completed Goals",
      value: stats.completedCount,
      unit: "achieved",
      valueClass: "green",
      icon: CheckCircle2,
      iconClass: "bg-icon-green text-green",
    },
    {
      label: "Current Goal Streak",
      value: stats.streak,
      unit: "Days",
      valueClass: "amber",
      icon: Flame,
      iconClass: "bg-orange text-amber",
    },
    {
      label: "Avg. Success Rate",
      value: stats.successRate,
      unit: "",
      valueClass: "blue",
      icon: TrendingUp,
      iconClass: "bg-icon-blue text-blue",
    },
  ];

  return (
    <div className="goals-app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Globe className="w-5 h-5" strokeWidth={2} />
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
          <Link to="/dashboard" className="menu-item">
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </Link>
          <Link to="/reports" className="menu-item">
            <FileText size={16} />
            <span>Reports</span>
          </Link>
          <Link to="/profile" className="menu-item">
            <User size={16} />
            <span>Profile</span>
          </Link>
        </nav>
      </aside>

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Sustainability Goals</h1>
            <p>Set targets, track progress, and monitor achievements</p>
          </div>
          <div className="header-actions">
            <button className="icon-button" type="button">
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

        <div className="stat-grid">
          {statCards.map(
            ({ label, value, unit, valueClass, icon: Icon, iconClass }) => (
              <div className="stat-card" key={label}>
                <div>
                  <p className="stat-label">{label}</p>
                  <p className={`stat-value ${valueClass}`}>
                    {value}
                    {unit && <span className="unit"> {unit}</span>}
                  </p>
                </div>
                <div className={`stat-icon ${iconClass}`}>
                  <Icon size={16} strokeWidth={2} />
                </div>
              </div>
            )
          )}
        </div>

        <div className="content-grid">
          <section className="panel">
            <h2>Create New Goal</h2>
            <p className="panel-subtitle">Define targets to lower your footprint</p>

            <form className="goal-form" onSubmit={handleAddGoal}>
              <div className="form-group">
                <label>Goal Title</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="Enter goal title"
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
                    placeholder="Value"
                  />
                  <input
                    type="text"
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    placeholder="Unit"
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

              <button type="submit" className="btn-primary">
                + Add New Goal
              </button>

              <div className="ai-callout">
                <div className="ai-callout-header">
                  <div className="ai-callout-title">
                    <Sparkles size={14} strokeWidth={2} />
                    AI Goal Recommendation
                  </div>
                  <button
                    type="button"
                    className="ai-refresh-btn"
                    onClick={fetchAiRecommendation}
                    disabled={loadingAi}
                    title="Get new AI recommendation"
                  >
                    <RotateCw
                      size={13}
                      className={loadingAi ? "spin-animation" : ""}
                    />
                  </button>
                </div>

                <p>{aiData.description}</p>

                <button
                  type="button"
                  className="ai-callout-link"
                  onClick={handleAiAutoFill}
                >
                  Auto-fill Goal Details →
                </button>
              </div>
            </form>
          </section>

          <section className="panel">
            <h2>Active Goal Progress</h2>
            <p className="panel-subtitle">
              Track live achievements and update milestone values
            </p>

            <div className="goal-list">
              {goals.length === 0 ? (
                <p className="no-goals" style={{ color: "#64748b", padding: "20px 0" }}>
                  No active goals set yet. Use the form to add your first goal!
                </p>
              ) : (
                goals.map((item, idx) => {
                  const { icon: CatIcon, color } = getCategoryDetails(item.category);
                  const percent = item.percent || 0;

                  return (
                    <div className="goal-item" key={item._id || idx}>
                      <div className={`goal-item-icon bg-icon-${color} text-${color}`}>
                        <CatIcon size={16} strokeWidth={2} />
                      </div>
                      <div className="goal-item-body">
                        <div className="goal-item-top">
                          <p className="goal-item-title">{item.title}</p>
                          <span className={`goal-item-percent text-${color}`}>
                            {percent}% Done
                          </span>
                        </div>
                        <p className="goal-item-meta">
                          Category: {item.category} • Target: {item.target || `${item.targetValue} ${item.targetUnit}`}
                        </p>

                        <div className="progress-track">
                          <div
                            className={`progress-fill fill-${color}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="goal-item-footer">
                          <span>Progress: {item.progressLabel || "0%"}</span>
                          <span>Deadline: {item.deadline || item.targetCompletionDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}