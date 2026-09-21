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
} from "lucide-react";
import "./CarbonFootPrintTracker.css";

const CATEGORY_OPTIONS = {
  Transport: [
    { label: "Car (Petrol/Diesel)", factor: 0.192 },
    { label: "Bus", factor: 0.089 },
    { label: "Bike / Scooter", factor: 0.05 },
    { label: "Electric Car", factor: 0.053 },
  ],
  Energy: [
    { label: "Electricity (kWh)", factor: 0.85 },
    { label: "LPG Gas Cylinder", factor: 2.98 },
  ],
  Food: [
    { label: "Non-Vegetarian Meals", factor: 2.5 },
    { label: "Vegetarian Meals", factor: 0.5 },
  ],
  Waste: [
    { label: "General Household Waste (kg)", factor: 0.5 },
    { label: "Plastic Waste (kg)", factor: 1.8 },
  ],
  Water: [
    { label: "Water Consumption (Liters)", factor: 0.001 },
  ],
};

const CATEGORY_COLORS = {
  Transport: "#2f6fed",
  Energy: "#f0883e",
  Food: "#2f7d4f",
  Waste: "#687386",
  Water: "#0284c7",
};

const CarbonFootPrintTracker = () => {
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

  const [loggeduser, setLoggeduser] = useState("User");

  const [historyRecords, setHistoryRecords] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState({
    Transport: 0,
    Energy: 0,
    Food: 0,
    Waste: 0,
    Water: 0,
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
      Transport: 0,
      Energy: 0,
      Food: 0,
      Waste: 0,
      Water: 0,
    };

    records.forEach((rec) => {
      const cat = rec.category;
      const co2 = parseFloat(rec.carbonOutput || rec.co2) || 0;
      if (breakdown[cat] !== undefined) {
        breakdown[cat] += co2;
      }
    });

    setCategoryBreakdown(breakdown);
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
    setCurrentFactor(factor);

    const val = parseFloat(usageValue) || 0;

    let total = val * factor;
    if (selectedCategory === "Transport" && passengers > 0) {
      total = total / Number(passengers);
    }

    setCalculatedCO2(total.toFixed(2));
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

      const payload = {
        category: selectedCategory,
        activityType: selectedOption,
        value: Number(usageValue),
        passengers: Number(passengers),
        carbonOutput: Number(calculatedCO2),
        activityDate: selectedDate,
      };

      const res = await axios.post(
        "http://localhost:5000/api/tracker/log",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Activity logged successfully!");

      const newRecord = res.data?.data
        ? res.data.data
        : { _id: Date.now(), ...payload };

      const updatedHistory = [newRecord, ...historyRecords];
      setHistoryRecords(updatedHistory);
      calculateBreakdown(updatedHistory);

      setUsageValue("");
    } catch (error) {
      console.error("Error logging activity:", error);
      alert("Failed to log activity record.");
    }
  };

  const totalEmissions = Object.values(categoryBreakdown).reduce(
    (a, b) => a + b,
    0
  );

  const getFormulaText = () => {
    const val = usageValue ? usageValue : "0";
    if (selectedCategory === "Transport" && passengers > 1) {
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
            <p>Log & Calculate Activity Emissions</p>
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
                  className={`category-tab ${
                    selectedCategory === cat ? "active" : ""
                  }`}
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
                          {opt.label} (Factor: {opt.factor})
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

                  {selectedCategory === "Transport" && (
                    <div className="form-group">
                      <label>Number of Passengers</label>
                      <input
                        type="number"
                        min="1"
                        value={passengers}
                        onChange={(e) =>
                          setPassengers(Math.max(1, Number(e.target.value)))
                        }
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
                    <p>Estimated Carbon Emission Output</p>
                    <strong>{calculatedCO2} kg CO₂e</strong>
                  </div>
                  <span className="formula">
                    {getFormulaText()}
                  </span>
                </div>

                <button type="submit" className="log-button">
                  + Log Activity Record
                </button>
              </form>

              <div className="breakdown">
                <h2>Category Emissions Breakdown</h2>
                {Object.entries(categoryBreakdown).map(([cat, amount]) => {
                  const pct =
                    totalEmissions > 0
                      ? ((amount / totalEmissions) * 100).toFixed(1)
                      : "0.0";
                  return (
                    <div key={cat} className="breakdown-item">
                      <div>
                        <span>{cat}</span>
                        <strong>
                          {amount.toFixed(1)} kg ({pct}%)
                        </strong>
                      </div>
                      <div className="breakdown-track">
                        <div
                          className="breakdown-fill"
                          style={{
                            width: `${pct}%`,
                            backgroundColor:
                              CATEGORY_COLORS[cat] || "var(--carbon-green-600)",
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
              <p className="panel-subtitle">Recent activity footprint logs</p>
            </div>

            <div className="records-scroll-list">
              {loading ? (
                <p style={{ fontSize: "12px", color: "var(--carbon-text-muted)" }}>
                  Loading records...
                </p>
              ) : historyRecords.length === 0 ? (
                <p style={{ fontSize: "12px", color: "var(--carbon-text-muted)" }}>
                  No records logged yet.
                </p>
              ) : (
                historyRecords.map((item, idx) => {
                  const emissionVal =
                    item.carbonOutput !== undefined
                      ? item.carbonOutput
                      : item.co2 || 0;
                  const activityName =
                    item.activityType || item.category || "Activity";
                  const displayDate = item.activityDate
                    ? item.activityDate.split("T")[0]
                    : item.date || "";

                  return (
                    <div key={item._id || idx} className="history-item">
                      <div className="history-icon blue">🍃</div>
                      <div className="history-content">
                        <strong>{activityName}</strong>
                        <span>
                          {displayDate} • {item.category}
                        </span>
                      </div>
                      <div className="history-emission positive">
                        +{Number(emissionVal).toFixed(2)} kg
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
                <strong>{totalEmissions.toFixed(1)} kg CO₂e</strong>
              </div>
              <div className="summary-row reduction-row">
                <span>Target Status</span>
                <span className="reduction-value">On Track</span>
              </div>
              <div className="summary-progress">
                <div
                  style={{
                    width: `${Math.min(
                      ((totalEmissions / 500) * 100).toFixed(0),
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CarbonFootPrintTracker;