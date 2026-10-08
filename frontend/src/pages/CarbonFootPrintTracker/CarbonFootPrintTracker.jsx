import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
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
  X,
} from "lucide-react";
import "./CarbonFootPrintTracker.css";

const CATEGORY_OPTIONS = {
  Transport: [
    { label: "Car (Petrol/Diesel)", factor: 0.192, type: "emission" },
    { label: "Bus", factor: 0.089, type: "emission" },
    { label: "Bike / Scooter", factor: 0.05, type: "emission" },
    { label: "Electric Car", factor: 0.053, type: "emission" },
    { label: "Cycling", factor: 0.192, type: "saving" },
    { label: "Walking", factor: 0.192, type: "saving" },
  ],
  Energy: [
    { label: "Electricity (kWh)", factor: 0.85, type: "emission" },
    { label: "LPG Gas Cylinder", factor: 2.98, type: "emission" },
    { label: "Energy Saving (kWh)", factor: 0.85, type: "saving" },
  ],
  Food: [
    { label: "Non-Vegetarian Meals", factor: 2.5, type: "emission" },
    { label: "Vegetarian Meals", factor: 0.5, type: "emission" },
    { label: "Plant-Based Meal", factor: 2.0, type: "saving" },
  ],
  Waste: [
    { label: "General Household Waste (kg)", factor: 0.5, type: "emission" },
    { label: "Plastic Waste (kg)", factor: 1.8, type: "emission" },
    { label: "Recycling (kg)", factor: 0.5, type: "saving" },
  ],
  Water: [
    { label: "Water Consumption (Liters)", factor: 0.001, type: "emission" },
    { label: "Water Saving (Liters)", factor: 0.001, type: "saving" },
  ],
};

const CATEGORY_COLORS = {
  Transport: "#2f6fed",
  Energy: "#f0883e",
  Food: "#2f7d4f",
  Waste: "#687386",
  Water: "#0284c7",
};

export default function CarbonFootPrintTracker() {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("Transport");
  const [selectedOption, setSelectedOption] = useState("Car (Petrol/Diesel)");
  const [usageValue, setUsageValue] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [calculatedCO2, setCalculatedCO2] = useState(0.0);
  const [currentFactor, setCurrentFactor] = useState(0.192);
  const [activeMode, setActiveMode] = useState("emission");

  const [loggeduser, setLoggeduser] = useState("User");
  const [historyRecords, setHistoryRecords] = useState([]);

  // Gamification Reward Modal State
  const [unlockedReward, setUnlockedReward] = useState(null);

  const [categoryBreakdown, setCategoryBreakdown] = useState({
    Transport: { emitted: 0, saved: 0 },
    Energy: { emitted: 0, saved: 0 },
    Food: { emitted: 0, saved: 0 },
    Waste: { emitted: 0, saved: 0 },
    Water: { emitted: 0, saved: 0 },
  });

  const [summaryData, setSummaryData] = useState({
    totalEmissions: 0,
    totalSaved: 0,
    netFootprint: 0,
  });

  const [loading, setLoading] = useState(false);

  const isActive = (path) => location.pathname === path;

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

  const calculateBreakdown = useCallback((records) => {
    const breakdown = {
      Transport: { emitted: 0, saved: 0 },
      Energy: { emitted: 0, saved: 0 },
      Food: { emitted: 0, saved: 0 },
      Waste: { emitted: 0, saved: 0 },
      Water: { emitted: 0, saved: 0 },
    };

    let totalEmitted = 0;
    let totalSaved = 0;

    records.forEach((rec) => {
      const cat = rec.category;
      const mode = rec.activityMode || (rec.carbonSaved > 0 ? "saving" : "emission");
      const emitted = mode === "emission" ? (parseFloat(rec.carbonOutput || rec.co2) || 0) : 0;
      const saved = mode === "saving" ? (parseFloat(rec.carbonSaved || rec.co2) || 0) : 0;

      if (breakdown[cat]) {
        breakdown[cat].emitted += emitted;
        breakdown[cat].saved += saved;
      }

      totalEmitted += emitted;
      totalSaved += saved;
    });

    setCategoryBreakdown(breakdown);
    setSummaryData({
      totalEmissions: Number(totalEmitted.toFixed(2)),
      totalSaved: Number(totalSaved.toFixed(2)),
      netFootprint: Number(Math.abs(totalEmitted - totalSaved).toFixed(2)),
    });
  }, []);

  const fetchTrackerData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const historyRes = await axios.get(
        "http://localhost:5000/api/tracker/history",
        config
      );

      const records = Array.isArray(historyRes.data)
        ? historyRes.data
        : historyRes.data?.logs || historyRes.data?.history || [];

      setHistoryRecords(records);
      calculateBreakdown(records);
    } catch (err) {
      console.error("Error fetching tracker data:", err);
    } finally {
      setLoading(false);
    }
  }, [calculateBreakdown]);

  useEffect(() => {
    fetchTrackerData();
  }, [fetchTrackerData]);

  useEffect(() => {
    const options = CATEGORY_OPTIONS[selectedCategory] || [];
    const activeOption = options.find((opt) => opt.label === selectedOption);
    const factor = activeOption ? activeOption.factor : 0.192;
    const mode = activeOption ? activeOption.type : "emission";

    setCurrentFactor(factor);
    setActiveMode(mode);

    const val = parseFloat(usageValue) || 0;
    let carbonOutput = 0;
    let carbonSaved = 0;

    if (mode === "saving") {
      carbonSaved = val * factor;
    } else {
      carbonOutput = val * factor;
      if (selectedCategory === "Transport" && passengers > 0) {
        carbonOutput /= Number(passengers);
      }
    }

    setCalculatedCO2(mode === "saving" ? carbonSaved.toFixed(2) : carbonOutput.toFixed(2));
  }, [selectedCategory, selectedOption, usageValue, passengers]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const defaultOption = CATEGORY_OPTIONS[category]?.[0]?.label || "";
    setSelectedOption(defaultOption);
  };

  const handleLogActivity = async (e) => {
    e.preventDefault();
    if (!usageValue || parseFloat(usageValue) <= 0) {
      alert("Please enter a valid usage value!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expired. Please log in again.");
        return;
      }

      const options = CATEGORY_OPTIONS[selectedCategory] || [];
      const activeOption = options.find((opt) => opt.label === selectedOption);
      const mode = activeOption?.type || "emission";

      const payload = {
        category: selectedCategory,
        activityType: selectedOption,
        activityMode: mode,
        value: Number(usageValue),
        passengers: Number(passengers),
        carbonOutput: mode === "emission" ? Number(calculatedCO2) : 0,
        carbonSaved: mode === "saving" ? Number(calculatedCO2) : 0,
        activityDate: selectedDate,
      };

      const res = await axios.post(
        "http://localhost:5000/api/tracker/log",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Check if Challenge Reward Modal is triggered
      if (res.data.triggerModal && res.data.rewardsUnlocked?.length > 0) {
        setUnlockedReward(res.data.rewardsUnlocked[0]);
      } else {
        alert("Activity logged successfully!");
      }

      const newRecord = res.data?.data ? res.data.data : { _id: Date.now(), ...payload };
      const updatedHistory = [newRecord, ...historyRecords];
      setHistoryRecords(updatedHistory);
      calculateBreakdown(updatedHistory);

      setUsageValue("");
    } catch (error) {
      console.error("Error logging activity:", error);
      alert("Failed to log activity record.");
    }
  };

  const getFormulaText = () => {
    const val = usageValue ? usageValue : "0";
    if (selectedCategory === "Transport" && activeMode === "emission" && passengers > 1) {
      return `Formula: (${val} × ${currentFactor}) ÷ ${passengers} passengers`;
    }
    return `Formula: ${val} × ${currentFactor} factor`;
  };

  return (
    <div className="carbon-tracker-app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Globe size={22} color="#059669" strokeWidth={2.2} />
          <span>EcoTrack</span>
        </div>

        <nav className="sidebar-menu">
          <Link to="/home" className={`menu-item ${isActive("/home") ? "active" : ""}`}>
            <Home size={16} />
            <span>Home</span>
          </Link>
          <Link to="/carbon-footprint-tracker" className={`menu-item ${isActive("/carbon-footprint-tracker") ? "active" : ""}`}>
            <Leaf size={16} />
            <span>Carbon Tracker</span>
          </Link>
          <Link to="/goals" className={`menu-item ${isActive("/goals") ? "active" : ""}`}>
            <Target size={16} />
            <span>Goals</span>
          </Link>
          <Link to="/challenges" className={`menu-item ${isActive("/challenges") ? "active" : ""}`}>
            <ShieldCheck size={16} />
            <span>Challenges</span>
          </Link>
          <Link to="/dashboard" className={`menu-item ${isActive("/dashboard") ? "active" : ""}`}>
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </Link>

          <Link to="/reports" className={`menu-item ${isActive("/reports") ? "active" : ""}`}>
            <FileText size={16} />
            <span>Reports</span>
          </Link>

          <Link to="/profile" className={`menu-item ${isActive("/profile") ? "active" : ""}`}>
            <User size={16} />
            <span>Profile</span>
          </Link>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>Carbon Footprint Tracker</h1>
            <p>Log & Calculate Activity Emissions & CO₂ Savings</p>
          </div>
          <div className="header-actions">
            <div className="icon-button">🔥</div>
            <div className="user-chip">
              <div className="user-chip-avatar">🌱</div>
              <span>{loggeduser}</span>
            </div>
          </div>
        </header>

        <div className="tracker-grid">
          <div className="tracker-panel">
            <h2>Log New Activity</h2>
            <p className="panel-subtitle">
              Select category, option type, and enter consumption details
            </p>

            <div className="category-tabs">
              {Object.keys(CATEGORY_OPTIONS).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`category-tab ${selectedCategory === cat ? "active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="activity-area">
              <form onSubmit={handleLogActivity}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Activity Option / Type</label>
                    <select
                      value={selectedOption}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    >
                      {CATEGORY_OPTIONS[selectedCategory]?.map((opt) => (
                        <option key={opt.label} value={opt.label}>
                          {opt.label} ({opt.type === "saving" ? "Saving" : "Emission"} Factor: {opt.factor})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Usage Value</label>
                    <input
                      type="number"
                      placeholder="Enter value"
                      value={usageValue}
                      onChange={(e) => setUsageValue(e.target.value)}
                    />
                  </div>

                  {selectedCategory === "Transport" && activeMode === "emission" && (
                    <div className="form-group">
                      <label>Number of Passengers</label>
                      <input
                        type="number"
                        min="1"
                        value={passengers}
                        onChange={(e) => setPassengers(Math.max(1, Number(e.target.value)))}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Activity Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="emission-box">
                  <div>
                    <p>{activeMode === "saving" ? "Estimated CO₂ Saved" : "Estimated Carbon Emission Output"}</p>
                    <strong>{calculatedCO2} kg CO₂e</strong>
                  </div>
                  <span className="formula">{getFormulaText()}</span>
                </div>

                <button type="submit" className="log-button">
                  + Log Activity Record
                </button>
              </form>

              <div className="breakdown">
                <h2>Category Breakdown</h2>
                {Object.entries(categoryBreakdown).map(([cat, data]) => {
                  const pct = summaryData.totalEmissions > 0 
                    ? ((data.emitted / summaryData.totalEmissions) * 100).toFixed(1)
                    : "0.0";

                  return (
                    <div key={cat} className="breakdown-item">
                      <div>
                        <span>{cat}</span>
                        <strong>
                          Emitted: {data.emitted.toFixed(1)}kg | Saved: {data.saved.toFixed(1)}kg
                        </strong>
                      </div>
                      <div className="breakdown-track">
                        <div
                          className="breakdown-fill"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: CATEGORY_COLORS[cat] || "var(--carbon-green-600)",
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="history-panel">
            <div className="history-header">
              <h2>Historical Activity Records</h2>
              <p className="panel-subtitle">Recent activity logs</p>
            </div>

            <div className="records-scroll-list">
              {loading ? (
                <p style={{ fontSize: "12px", color: "var(--carbon-text-muted)" }}>Loading records...</p>
              ) : historyRecords.length === 0 ? (
                <p style={{ fontSize: "12px", color: "var(--carbon-text-muted)" }}>No records logged yet.</p>
              ) : (
                historyRecords.map((item, idx) => {
                  const mode = item.activityMode || (item.carbonSaved > 0 ? "saving" : "emission");
                  const val = mode === "saving" 
                    ? (item.carbonSaved || item.co2 || 0) 
                    : (item.carbonOutput || item.co2 || 0);

                  const activityName = item.activityType || item.category || "Activity";
                  const displayDate = item.activityDate ? item.activityDate.split("T")[0] : item.date || "";

                  return (
                    <div key={item._id || idx} className="history-item">
                      <div className={`history-icon ${mode === "saving" ? "green" : "blue"}`}>
                        {mode === "saving" ? "🌱" : "🍃"}
                      </div>
                      <div className="history-content">
                        <strong>{activityName}</strong>
                        <span>{displayDate} • {item.category}</span>
                      </div>
                      <div className={`history-emission ${mode === "saving" ? "negative" : "positive"}`}>
                        {mode === "saving" ? `−${Number(val).toFixed(2)} kg saved` : `+${Number(val).toFixed(2)} kg`}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="monthly-summary">
              <h2>Monthly Impact Summary</h2>
              <div className="summary-row">
                <span>Total Emissions</span>
                <strong>{summaryData.totalEmissions.toFixed(1)} kg CO₂e</strong>
              </div>
              <div className="summary-row">
                <span>CO₂ Saved</span>
                <strong style={{ color: "#10b981" }}>{summaryData.totalSaved.toFixed(1)} kg CO₂e</strong>
              </div>
              <div className="summary-row">
                <span>Net Footprint</span>
                <strong>{summaryData.netFootprint.toFixed(1)} kg CO₂e</strong>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Challenge Reward Popup Modal */}
      {unlockedReward && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "16px"
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "24px",
            padding: "28px",
            maxWidth: "380px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            position: "relative"
          }}>
            <button
              onClick={() => setUnlockedReward(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b"
              }}
            >
              <X size={20} />
            </button>

            <span style={{
              backgroundColor: "#d1fae5",
              color: "#065f46",
              fontSize: "11px",
              fontWeight: "bold",
              padding: "4px 12px",
              borderRadius: "9999px",
              textTransform: "uppercase"
            }}>
              Challenge Complete! 🎉
            </span>

            <div style={{ margin: "20px 0", display: "flex", justifyContent: "center" }}>
              <div style={{
                width: "80px",
                height: "80px",
                backgroundColor: "#ecfdf5",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
                border: "2px solid #a7f3d0"
              }}>
                {unlockedReward.badgeIcon || "🏆"}
              </div>
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
              {unlockedReward.title}
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
              Goal Reached Successfully!
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              margin: "20px 0"
            }}>
              <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "12px" }}>
                <span style={{ fontSize: "11px", color: "#b45309", display: "block", fontWeight: "600" }}>Eco Points</span>
                <span style={{ fontSize: "18px", fontWeight: "900", color: "#d97706" }}>🪙 +{unlockedReward.rewardPoints}</span>
              </div>
              <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px", padding: "12px" }}>
                <span style={{ fontSize: "11px", color: "#1d4ed8", display: "block", fontWeight: "600" }}>Level XP</span>
                <span style={{ fontSize: "18px", fontWeight: "900", color: "#2563eb" }}>✨ +{unlockedReward.rewardXP}</span>
              </div>
            </div>

            <button
              onClick={() => setUnlockedReward(null)}
              style={{
                width: "100%",
                backgroundColor: "#10b981",
                color: "#fff",
                fontWeight: "bold",
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.3)"
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