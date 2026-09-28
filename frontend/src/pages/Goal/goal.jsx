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
  RotateCw,
  Droplet,
  Zap,
} from "lucide-react";

function GoalsPage() {
  const [goalTitle, setGoalTitle] = useState("Use Public Transport Weekly");
  const [goalCategory, setGoalCategory] = useState("Transport");
  const [targetValue, setTargetValue] = useState("20");
  const [targetUnit, setTargetUnit] = useState("kg CO2e");
  const [targetDate, setTargetDate] = useState("2026-10-31");

  const [loggeduser, setLoggeduser] = useState("User");
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({
    activeCount: 0,
    completedCount: 0,
    streak: 0,
    successRate: "0%",
  });

  const [aiData, setAiData] = useState({
    title: "Cycle for Short Commutes",
    category: "Transport",
    targetValue: "15",
    targetUnit: "kg CO2e",
    targetDate: "2026-10-31",
    description: "Cycling short distances instead of driving increases your net CO2 savings.",
  });
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const parsed = JSON.parse(storedUser);
        setLoggeduser(parsed.fullName || parsed.name || parsed.username || parsed.email || "User");
      } catch (e) {
        setLoggeduser(storedUser);
      }
    }
  }, []);

  const getCategoryDetails = (cat) => {
    const cleanCat = String(cat || "").toLowerCase();
    if (cleanCat.includes("energy") || cleanCat.includes("electric")) return { icon: Zap, color: "green" };
    if (cleanCat.includes("transport")) return { icon: Leaf, color: "blue" };
    if (cleanCat.includes("food")) return { icon: Globe, color: "amber" };
    if (cleanCat.includes("waste")) return { icon: ShieldCheck, color: "teal" };
    if (cleanCat.includes("water")) return { icon: Droplet, color: "blue" };
    return { icon: Target, color: "green" };
  };

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.get("http://localhost:5000/api/goals", config);

      if (res.data) {
        const allGoals = Array.isArray(res.data) ? res.data : res.data.goals || [];
        setGoals(allGoals);
        setStats({
          activeCount: res.data.activeCount || 0,
          completedCount: res.data.completedCount || 0,
          streak: res.data.streak || 0,
          successRate: res.data.successRate || "0%",
        });
      }
    } catch (err) {
      console.warn("Backend fetch issue.");
    }
  };

  const fetchAiRecommendation = async () => {
    try {
      setLoadingAi(true);
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const timestamp = new Date().getTime();

      const res = await axios.get(
        `http://localhost:5000/api/goals/ai-recommendation?t=${timestamp}`,
        config
      );

      if (res.data) {
        setAiData({
          title: res.data.title || "Cycle for Short Commutes",
          category: res.data.category || "Transport",
          targetValue: res.data.targetValue || "15",
          targetUnit: res.data.targetUnit || "kg CO2e",
          targetDate: res.data.targetDate || "2026-10-31",
          description: res.data.description || "Cycling short distances avoids emissions and drives goal progress.",
        });
      }
    } catch (err) {
      console.warn("AI recommendation offline.");
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
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const payload = {
        title: goalTitle,
        category: goalCategory,
        targetValue,
        targetUnit,
        targetCompletionDate: targetDate,
      };

      await axios.post("http://localhost:5000/api/goals", payload, config);

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
    { label: "Active Goals", value: stats.activeCount, unit: "in progress", icon: CircleDot, iconClass: "bg-icon-green text-green" },
    { label: "Completed Goals", value: stats.completedCount, unit: "achieved", valueClass: "green", icon: CheckCircle2, iconClass: "bg-icon-green text-green" },
    { label: "Current Goal Streak", value: stats.streak, unit: "Days", valueClass: "amber", icon: Flame, iconClass: "bg-orange text-amber" },
    { label: "Avg. Success Rate", value: stats.successRate, unit: "", valueClass: "blue", icon: TrendingUp, iconClass: "bg-icon-blue text-blue" },
  ];

  return (
    <div className="goals-app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          {/* <Globe className="w-5 h-5" strokeWidth={2} /> */}
          <Globe size={22} />
          <span>EcoTrack</span>
        </div>

        <nav className="sidebar-menu">
          <Link to="/home" className="menu-item"><HomeIcon size={16} /><span>Home</span></Link>
          <Link to="/carbon-footprint-tracker" className="menu-item"><Leaf size={16} /><span>Carbon Tracker</span></Link>
          <Link to="/goals" className="menu-item active"><Target size={16} /><span>Goals</span></Link>
          <Link to="/challenges" className="menu-item"><ShieldCheck size={16} /><span>Challenges</span></Link>
          <Link to="/dashboard" className="menu-item"><LayoutDashboard size={16} /><span>Dashboard</span></Link>
          <Link to="/reports" className="menu-item"><FileText size={16} /><span>Reports</span></Link>
          <Link to="/profile" className="menu-item"><User size={16} /><span>Profile</span></Link>
        </nav>
      </aside>

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Sustainability Goals</h1>
            <p>Net Savings Goal Progress = CO₂ Saved − CO₂ Emitted</p>
          </div>
          <div className="header-actions">
            <button className="icon-button" type="button"><Bell size={16} strokeWidth={2} /></button>
            <div className="user-chip">
              <span className="user-chip-avatar"><User size={12} strokeWidth={2.5} /></span>
              <span>{loggeduser}</span>
              <ChevronDown size={14} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="stat-grid">
          {statCards.map(({ label, value, unit, valueClass, icon: Icon, iconClass }) => (
            <div className="stat-card" key={label}>
              <div>
                <p className="stat-label">{label}</p>
                <p className={`stat-value ${valueClass}`}>{value}{unit && <span className="unit"> {unit}</span>}</p>
              </div>
              <div className={`stat-icon ${iconClass}`}><Icon size={16} strokeWidth={2} /></div>
            </div>
          ))}
        </div>

        <div className="content-grid">
          <section className="panel">
            <h2>Create New Goal</h2>
            <p className="panel-subtitle">Set net CO₂ saving target for a specific or overall category</p>

            <form className="goal-form" onSubmit={handleAddGoal}>
              <div className="form-group">
                <label>Goal Title</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="Enter goal title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Goal Category</label>
                <div className="select-wrap">
                  <select value={goalCategory} onChange={(e) => setGoalCategory(e.target.value)}>
                    <option value="Overall">Overall (All Categories)</option>
                    <option value="Transport">Transport</option>
                    <option value="Energy">Energy</option>
                    <option value="Food">Food</option>
                    <option value="Waste">Waste</option>
                    <option value="Water">Water</option>
                  </select>
                  <ChevronDown size={16} />
                </div>
              </div>

              <div className="form-group">
                <label>Target Value & Unit</label>
                <div className="form-row-split">
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="20"
                    required
                  />
                  <input
                    type="text"
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    placeholder="kg CO2e"
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

              <button type="submit" className="btn-primary">+ Add New Goal</button>

              <div className="ai-callout">
                <div className="ai-callout-header">
                  <div className="ai-callout-title">
                    <Sparkles size={14} strokeWidth={2} /> AI Goal Recommendation
                  </div>
                  <button
                    type="button"
                    className="ai-refresh-btn"
                    onClick={fetchAiRecommendation}
                    disabled={loadingAi}
                  >
                    <RotateCw size={13} className={loadingAi ? "spin-animation" : ""} />
                  </button>
                </div>
                <p>{aiData.description}</p>
                <button type="button" className="ai-callout-link" onClick={handleAiAutoFill}>
                  Auto-fill Goal Details →
                </button>
              </div>
            </form>
          </section>

          <section className="panel">
            <h2>Active Goals</h2>
            <p className="panel-subtitle">Progress increases with CO₂ saved, decreases with emissions</p>

            <div className="goal-list" style={{ maxHeight: "620px", overflowY: "auto", paddingRight: "4px" }}>
              {goals.length === 0 ? (
                <p className="no-goals" style={{ color: "#64748b", padding: "10px 0" }}>
                  No goals set yet. Use the form to add your first goal!
                </p>
              ) : (
                goals.map((item, idx) => {
                  const { icon: CatIcon, color } = getCategoryDetails(item.category);
                  const targetVal = Number(item.targetValue) || 0;
                  const currentProgress = Number(item.currentProgress) || 0;
                  const remainingBalance = Number(item.remainingBalance) || 0;
                  const percent = Number(item.percent) || 0;
                  const isDone = Boolean(item.isCompleted);

                  return (
                    <div 
                      className={`goal-item ${isDone ? "completed-card" : ""}`} 
                      key={item._id || idx}
                      style={isDone ? { borderLeft: "4px solid #10b981", background: "#f0fdf4" } : {}}
                    >
                      <div className={`goal-item-icon ${isDone ? "bg-icon-green text-green" : `bg-icon-${color} text-${color}`}`}>
                        {isDone ? <CheckCircle2 size={16} strokeWidth={2} /> : <CatIcon size={16} strokeWidth={2} />}
                      </div>
                      <div className="goal-item-body">
                        <div className="goal-item-top">
                          <p className="goal-item-title">{isDone ? `✓ ${item.title}` : item.title}</p>
                          <span className={`goal-item-percent ${isDone ? "text-green" : `text-${color}`}`}>
                            {isDone ? "100% Achieved ✅" : `${percent}% Complete`}
                          </span>
                        </div>
                        <p className="goal-item-meta">
                          Category: {item.category} • Target: {targetVal} {item.targetUnit}
                        </p>

                        <div className="progress-track">
                          <div
                            className={`progress-fill ${isDone ? "fill-green" : `fill-${color}`}`}
                            style={{ width: `${percent}%`, backgroundColor: isDone ? "#10b981" : undefined }}
                          />
                        </div>

                        <div className="goal-item-footer">
                          <span>
                            {isDone 
                              ? `Completed Target: ${currentProgress} kg CO₂e` 
                              : `Net Progress: ${currentProgress} kg / ${targetVal} kg (${remainingBalance} kg needed)`}
                          </span>
                          <span>Deadline: {item.deadline || "2026-10-31"}</span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                          Saved: {item.totalSaved} kg | Emitted: {item.totalEmitted} kg
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

export default GoalsPage;