import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  Car,
  Zap,
  Utensils,
  Trash2,
  Droplets,
} from "lucide-react";
import "./CarbonFootPrintTracker.css";
function CarbonFootPrintTracker() {
  const [activeCategory, setActiveCategory] = useState("Transport");
  // Transport
  const [transportType, setTransportType] =
    useState("Gasoline Car (Medium)");
  const [distance, setDistance] = useState("45.5");
  const [passengers, setPassengers] = useState("1");
  // Energy
  const [electricity, setElectricity] = useState("14");
  // Food
  const [meals, setMeals] = useState("3");
  const [foodType, setFoodType] = useState("Vegetarian");
  // Waste
  const [wasteAmount, setWasteAmount] = useState("2.5");
  const [wasteType, setWasteType] = useState("Recycled Household Waste");
  // Water
  const [waterAmount, setWaterAmount] = useState("120");
  const categories = [
    {
      name: "Transport",
      icon: Car,
    },
    {
      name: "Energy",
      icon: Zap,
    },
    {
      name: "Food",
      icon: Utensils,
    },
    {
      name: "Waste",
      icon: Trash2,
    },
    {
      name: "Water Usage",
      icon: Droplets,
    },
  ];
  const emission = useMemo(() => {
    if (activeCategory === "Transport") {
      const km = Number(distance) || 0;
      let factor = 0.192;
      if (transportType === "Gasoline Car (Small)") {
        factor = 0.15;
      } else if (transportType === "Gasoline Car (Medium)") {
        factor = 0.192;
      } else if (transportType === "Gasoline Car (Large)") {
        factor = 0.25;
      } else if (transportType === "Motorcycle") {
        factor = 0.103;
      } else if (transportType === "Bus") {
        factor = 0.089;
      }
      const passengerCount = Number(passengers) || 1;
      return (km * factor) / passengerCount;
    }
    if (activeCategory === "Energy") {
      const kwh = Number(electricity) || 0;
      return kwh * 0.371;
    }
    if (activeCategory === "Food") {
      const mealCount = Number(meals) || 0;
      if (foodType === "Vegetarian") {
        return mealCount * 0.6;
      }
      if (foodType === "Mixed") {
        return mealCount * 1.2;
      }
      return mealCount * 2.0;
    }
    if (activeCategory === "Waste") {
      const kg = Number(wasteAmount) || 0;
      if (wasteType === "Recycled Household Waste") {
        return -(kg * 0.48);
      }
      if (wasteType === "General Household Waste") {
        return kg * 0.57;
      }
      if (wasteType === "Organic Waste") {
        return kg * 0.35;
      }
      return kg * 0.8;
    }
    if (activeCategory === "Water Usage") {
      const litres = Number(waterAmount) || 0;
      return litres * 0.0033;
    }
    return 0;
  }, [
    activeCategory,
    transportType,
    distance,
    passengers,
    electricity,
    meals,
    foodType,
    wasteAmount,
    wasteType,
    waterAmount,
  ]);
  const formattedEmission = emission.toFixed(1);
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };
  const handleLogActivity = () => {
    alert(
      `${activeCategory} activity logged successfully.\nEstimated emission: ${formattedEmission} kg CO₂e`
    );
  };
  return (
    <div className="carbon-tracker-app">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Globe size={18} strokeWidth={2} />
          <span>EcoTrack</span>
        </div>
        <nav className="sidebar-menu">
          <Link to="/home" className="menu-item">
            <HomeIcon size={16} />
            <span>Home</span>
          </Link>
          <Link to="/carbon-footprint-tracker"className="menu-item active">
            <Leaf size={16} />
            <span>Carbon Tracker</span>
          </Link>
          <Link to="/goals" className="menu-item">
            <Target size={16} />
            <span>Goals</span>
          </Link>
          <a href="#" className="menu-item">
            <ShieldCheck size={16} />
            <span>Challenges</span>
          </a>

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
      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">
        {/* ================= HEADER ================= */}
        <div className="page-header">
          <div>
            <h1>Carbon Footprint Tracker</h1>
            <p>
              Log & Calculate Activity Emissions
            </p>
          </div>
          <div className="header-actions">
            <button className="icon-button">
              <Bell size={16} strokeWidth={2} />
            </button>
            <div className="user-chip">
              <span className="user-chip-avatar">
                <User size={12} strokeWidth={2.5} />
              </span>
              <span>User</span>
              <ChevronDown
                size={14}
                strokeWidth={2.5}
              />
            </div>
          </div>
        </div>
        {/* ================= MAIN GRID ================= */}
        <div className="tracker-grid">
          {/* ================= LEFT PANEL ================= */}
          <section className="tracker-panel">
            <h2>Log Daily Activity</h2>
            <p className="panel-subtitle">
              Select a tracking category to calculate carbon output
            </p>
            {/* CATEGORY TABS */}
            <div className="category-tabs">
              {categories.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  className={`category-tab ${
                    activeCategory === name ? "active" : ""
                  }`}
                  onClick={() => handleCategoryChange(name)}
                >
                  <Icon size={15} />
                  <span>{name}</span>
                </button>
              ))}
            </div>
            {/* ================= ACTIVITY FORM ================= */}
            <div className="activity-area">
              {/* TRANSPORT */}
              {activeCategory === "Transport" && (
                <>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Transportation Type</label>
                      <div className="select-wrap">
                        <select
                          value={transportType}
                          onChange={(e) =>
                            setTransportType(e.target.value)
                          }
                        >
                          <option>
                            Gasoline Car (Small)
                          </option>
                          <option>
                            Gasoline Car (Medium)
                          </option>
                          <option>
                            Gasoline Car (Large)
                          </option>
                          <option>
                            Motorcycle
                          </option>
                          <option>
                            Bus
                          </option>
                        </select>
                        <ChevronDown size={15} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Distance Traveled (km)</label>
                      <input
                        type="number"
                        min="0"
                        value={distance}
                        onChange={(e) =>
                          setDistance(e.target.value)
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Activity Date</label>
                      <input
                        type="date"
                        defaultValue="2026-08-29"
                      />
                    </div>
                    <div className="form-group">
                      <label>Number of Passengers</label>
                      <div className="select-wrap">
                        <select
                          value={passengers}
                          onChange={(e) =>
                            setPassengers(e.target.value)
                          }
                        >
                          <option value="1">
                            1 (Solo)
                          </option>
                          <option value="2">
                            2 Passengers
                          </option>
                          <option value="3">
                            3 Passengers
                          </option>
                          <option value="4">
                            4 Passengers
                          </option>
                        </select>
                        <ChevronDown size={15} />
                      </div>
                    </div>
                  </div>
                </>
              )}
              {/* ENERGY */}
              {activeCategory === "Energy" && (
                <div className="single-form">
                  <div className="form-group">
                    <label>Electricity Consumption (kWh)</label>
                    <input
                      type="number"
                      min="0"
                      value={electricity}
                      onChange={(e) =>
                        setElectricity(e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Activity Date</label>
                    <input
                      type="date"
                      defaultValue="2026-08-29"
                    />
                  </div>
                  <div className="category-info energy-info">
                    <Zap size={20} />
                    <div>
                      <strong>Energy Usage</strong>
                      <p>
                        Enter the electricity consumed during
                        the selected activity period.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* FOOD */}
              {activeCategory === "Food" && (
                <div className="single-form">
                  <div className="form-group">
                    <label>Number of Meals</label>
                    <input
                      type="number"
                      min="0"
                      value={meals}
                      onChange={(e) =>
                        setMeals(e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Food Type</label>
                    <div className="select-wrap">
                      <select
                        value={foodType}
                        onChange={(e) =>
                          setFoodType(e.target.value)
                        }
                      >
                        <option>
                          Vegetarian
                        </option>
                        <option>
                          Mixed
                        </option>
                        <option>
                          Non-Vegetarian
                        </option>
                      </select>
                      <ChevronDown size={15} />
                    </div>
                  </div>
                  <div className="category-info food-info">
                    <Utensils size={20} />
                    <div>
                      <strong>Food & Diet</strong>
                      <p>
                        Record your meals to estimate the
                        associated food-related emissions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* WASTE */}
              {activeCategory === "Waste" && (
                <div className="single-form">
                  <div className="form-group">
                    <label>Waste Amount (kg)</label>
                    <input
                      type="number"
                      min="0"
                      value={wasteAmount}
                      onChange={(e) =>
                        setWasteAmount(e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Waste Type</label>
                    <div className="select-wrap">
                      <select
                        value={wasteType}
                        onChange={(e) =>
                          setWasteType(e.target.value)
                        }
                      >
                        <option>
                          Recycled Household Waste
                        </option>
                        <option>
                          General Household Waste
                        </option>
                        <option>
                          Organic Waste
                        </option>
                        <option>
                          Plastic Waste
                        </option>
                      </select>
                      <ChevronDown size={15} />
                    </div>
                  </div>
                  <div className="category-info waste-info">
                    <Trash2 size={20} />
                    <div>
                      <strong>Waste Management</strong>
                      <p>
                        Recycled waste can result in avoided
                        emissions, represented as a negative value.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* WATER */}
              {activeCategory === "Water Usage" && (
                <div className="single-form">
                  <div className="form-group">
                    <label>Water Consumption (Litres)</label>
                    <input
                      type="number"
                      min="0"
                      value={waterAmount}
                      onChange={(e) =>
                        setWaterAmount(e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Activity Date</label>
                    <input
                      type="date"
                      defaultValue="2026-08-29"
                    />
                  </div>
                  <div className="category-info water-info">
                    <Droplets size={20} />
                    <div>
                      <strong>Water Consumption</strong>
                      <p>
                        Record your water usage to estimate its
                        associated carbon impact.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* ================= EMISSION OUTPUT ================= */}
            <div className="emission-box">
              <div>
                <p>Estimated Carbon Emission Output</p>
                <strong>
                  {formattedEmission}
                </strong>
                <span> kg CO₂e</span>
              </div>
              <div className="formula">
                Formula based on selected activity
              </div>
            </div>
            {/* ================= LOG BUTTON ================= */}
            <button
              className="log-button"
              onClick={handleLogActivity}
            >
              + Log Activity Record
            </button>
            {/* ================= BREAKDOWN ================= */}
            <div className="breakdown">
              <h2>Category Emissions Breakdown</h2>
              <div className="breakdown-item">
                <div>
                  <span>Transportation</span>
                  <strong>45%</strong>
                </div>
                <div className="breakdown-track">
                  <div
                    className="breakdown-fill"
                    style={{ width: "45%" }}
                  />
                </div>
              </div>
              <div className="breakdown-item">
                <div>
                  <span>Energy Consumption</span>
                  <strong>30%</strong>
                </div>
                <div className="breakdown-track">
                  <div
                    className="breakdown-fill"
                    style={{ width: "30%" }}
                  />
                </div>
              </div>
              <div className="breakdown-item">
                <div>
                  <span>Food & Diet</span>
                  <strong>15%</strong>
                </div>
                <div className="breakdown-track">
                  <div
                    className="breakdown-fill"
                    style={{ width: "15%" }}
                  />
                </div>
              </div>
              <div className="breakdown-item">
                <div>
                  <span>Water & Waste</span>
                  <strong>10%</strong>
                </div>
                <div className="breakdown-track">
                  <div
                    className="breakdown-fill"
                    style={{ width: "10%" }}
                  />
                </div>
              </div>
            </div>
          </section>
          {/* ================= RIGHT PANEL ================= */}
          <section className="history-panel">
            <h2>Historical Activity Records</h2>
            <p className="panel-subtitle">
              Recent entries logged into backend
            </p>
            {/* RECORD 1 */}
            <div className="history-item">
              <div className="history-icon green">
                <Car size={18} />
              </div>
              <div className="history-content">
                <strong>
                  Car Commute (Gasoline)
                </strong>
                <span>
                  45.5 km • Today
                </span>
              </div>
              <strong className="history-emission positive">
                +8.7 kg
              </strong>
            </div>
            {/* RECORD 2 */}
            <div className="history-item">
              <div className="history-icon green">
                <Zap size={18} />
              </div>
              <div className="history-content">
                <strong>
                  Electricity Usage
                </strong>
                <span>
                  14 kWh • Yesterday
                </span>
              </div>
              <strong className="history-emission positive">
                +5.2 kg
              </strong>
            </div>
            {/* RECORD 3 */}
            <div className="history-item">
              <div className="history-icon blue">
                <Droplets size={18} />
              </div>
              <div className="history-content">
                <strong>
                  Water Consumption
                </strong>
                <span>
                  120 L • 2 days ago
                </span>
              </div>
              <strong className="history-emission positive">
                +0.4 kg
              </strong>
            </div>
            {/* RECORD 4 */}
            <div className="history-item">
              <div className="history-icon orange">
                <Utensils size={18} />
              </div>
              <div className="history-content">
                <strong>
                  Vegetarian Meal Log
                </strong>
                <span>
                  3 Meals • 3 days ago
                </span>
              </div>
              <strong className="history-emission positive">
                +1.8 kg
              </strong>
            </div>
            {/* RECORD 5 */}
            <div className="history-item">
              <div className="history-icon gray">
                <Trash2 size={18} />
              </div>
              <div className="history-content">
                <strong>
                  Recycled Household Waste
                </strong>
                <span>
                  2.5 kg • 4 days ago
                </span>
              </div>
              <strong className="history-emission negative">
                -1.2 kg
              </strong>
            </div>
            {/* ================= MONTHLY SUMMARY ================= */}
            <div className="monthly-summary">
              <h2>Monthly Impact Summary</h2>
              <div className="summary-row">
                <span>Total Logged Emissions</span>
                <strong>
                  148.5 kg CO₂e
                </strong>
              </div>
              <div className="summary-row">
                <span>Avg. Daily Emissions</span>
                <strong>
                  4.95 kg/day
                </strong>
              </div>
              <div className="summary-row">
                <span>Reduction vs. Last Month</span>
                <strong className="reduction">
                  -12.4%
                </strong>
              </div>
              <div className="summary-progress">
                <div />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
export default CarbonFootPrintTracker;
