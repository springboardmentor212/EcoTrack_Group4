import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./report.css";
import {
  Globe,
  Home as HomeIcon,
  Leaf,
  Target,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  User,
  ChevronDown,
  Footprints,
  ClipboardList,
  Calculator,
  Gauge,
  Bus,
  Lightbulb,
  Droplet,
  Recycle,
  Utensils,
  AlertCircle,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const CATEGORY_COLORS = {
  Transport: "#1f6b6b",
  Energy: "#8fd6c4",
  Food: "#2f7d4f",
  Waste: "#3fae6a",
  Water: "#4c8ff0",
  Other: "#a2a7ae",
};

export default function ReportsPage() {
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState("This Month");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [authError, setAuthError] = useState(false);

  const [stats, setStats] = useState({
    totalCO2: "0 kg",
    totalActivities: "0",
    avgDailyImpact: "0 kg",
    ecoScore: "0",
  });

  const [co2Overview, setCo2Overview] = useState([]);
  const [impactBreakdown, setImpactBreakdown] = useState([]);
  const [topActivities, setTopActivities] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState([]);

  const mapPeriodToQuery = (periodLabel) => {
    switch (periodLabel) {
      case "This Month":
        return "this_month";
      case "Last Month":
        return "last_month";
      case "Last 3 Months":
        return "last_3_months";
      case "This Year":
        return "this_year";
      default:
        return "this_month";
    }
  };

  const getCategoryIcon = (category = "", activityName = "") => {
    const key = `${category} ${activityName}`.toLowerCase();
    if (key.includes("transport") || key.includes("bus") || key.includes("car")) return Bus;
    if (key.includes("energy") || key.includes("light") || key.includes("plug")) return Lightbulb;
    if (key.includes("water") || key.includes("shower")) return Droplet;
    if (key.includes("waste") || key.includes("recycling")) return Recycle;
    if (key.includes("food") || key.includes("meal") || key.includes("plant")) return Utensils;
    return FileText;
  };

  const fetchReportDetails = useCallback(async () => {
    setLoading(true);
    setAuthError(false);

    setCo2Overview([]);
    setImpactBreakdown([]);
    setTopActivities([]);
    setMonthlyComparison([]);
    setStats({
      totalCO2: "0 kg",
      totalActivities: "0",
      avgDailyImpact: "0 kg",
      ecoScore: "0",
    });

    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Token missing in localStorage!");
      setAuthError(true);
      setLoading(false);
      return;
    }

    try {
      const periodQuery = mapPeriodToQuery(timePeriod);
      const response = await fetch(
        `http://localhost:5000/api/reports/summary?period=${encodeURIComponent(periodQuery)}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        console.error("Session expired or Unauthorized.");
        setAuthError(true);
        setLoading(false);
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        console.error("Non-JSON Response received from server");
        setLoading(false);
        return;
      }

      const resData = await response.json();

      if (resData.success && resData.data) {
        const { data } = resData;

        const co2Value =
          data.totalCO2Reduced > 0
            ? data.totalCO2Reduced
            : data.totalEmissions || 0;

        setStats({
          totalCO2: `${co2Value} kg`,
          totalActivities: `${data.totalActivities || 0}`,
          avgDailyImpact: `${data.avgDailyImpact || 0} kg`,
          ecoScore: `${data.ecoScore || 0}`,
        });

        if (data.timelineData) setCo2Overview(data.timelineData);

        if (data.impactBreakdown) {
          setImpactBreakdown(
            data.impactBreakdown.map((item) => ({
              name: item.name,
              value: item.value,
              color: CATEGORY_COLORS[item.name] || "#1f6b6b",
            }))
          );
        }

        if (data.topActivities) {
          setTopActivities(
            data.topActivities.map((act) => ({
              activity: act.activityName,
              co2: `${act.co2SavedKg} kg CO2`,
              date: new Date(act.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              icon: getCategoryIcon(act.category, act.activityName),
            }))
          );
        }

        if (data.monthlyComparison) setMonthlyComparison(data.monthlyComparison);
      }
    } catch (err) {
      console.error("Error loading report summary:", err);
    } finally {
      setLoading(false);
    }
  }, [timePeriod]);

  useEffect(() => {
    fetchReportDetails();
  }, [fetchReportDetails]);

  const handleExportReport = async () => {
    setExporting(true);
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token missing. Please log in again.");
      setExporting(false);
      return;
    }

    try {
      const periodQuery = mapPeriodToQuery(timePeriod);
      const response = await fetch(
        `http://localhost:5000/api/reports/export?period=${encodeURIComponent(periodQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export PDF report");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `EcoTrack_Impact_Report_${periodQuery}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("PDF Download Error:", error);
      alert("PDF Report download cheyyunnathil prashnamund. Thulliyayi meendum sramikkuka.");
    } finally {
      setExporting(false);
    }
  };

  const statCards = [
    { label: "Total CO2 Reduced:", value: stats.totalCO2, icon: Footprints, color: "green" },
    { label: "Total Activities:", value: stats.totalActivities, icon: ClipboardList, color: "blue" },
    { label: "Average Daily Impact:", value: stats.avgDailyImpact, icon: Calculator, color: "gray" },
    { label: "Eco Score:", value: stats.ecoScore, icon: Gauge, color: "gauge" },
  ];

  return (
    <div className="reports-app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Globe size={20} />
          <span>EcoTrack</span>
        </div>
        <nav className="sidebar-menu">
          <Link to="/home" className="menu-item"><HomeIcon size={16} /><span>Home</span></Link>
          <Link to="/carbon-footprint-tracker" className="menu-item"><Leaf size={16} /><span>Carbon Tracker</span></Link>
          <Link to="/goals" className="menu-item"><Target size={16} /><span>Goals</span></Link>
          <Link to="/challenges" className="menu-item"><ShieldCheck size={16} /><span>Challenges</span></Link>
          <Link to="/dashboard" className="menu-item"><LayoutDashboard size={16} /><span>Dashboard</span></Link>
          <Link to="/reports" className="menu-item active"><FileText size={16} /><span>Reports</span></Link>
          <Link to="/profile" className="menu-item"><User size={16} /><span>Profile</span></Link>
        </nav>
      </aside>

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Reports 📜</h1>
            <p>Detailed insights into your sustainability journey.</p>
          </div>
          <div className="header-actions">
            <div className="time-period">
              <span className="time-period-label">Time period:</span>
              <div className="select-wrap">
                <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>Last 3 Months</option>
                  <option>This Year</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <button className="btn-export" onClick={handleExportReport} disabled={exporting}>
              <Download size={14} style={{ marginRight: "6px" }} />
              {exporting ? "Generating PDF..." : "Export Report"}
            </button>
          </div>
        </div>

        {authError ? (
          <div className="panel" style={{ textAlign: "center", padding: "40px", marginTop: "20px" }}>
            <AlertCircle size={48} color="#e53e3e" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ color: "#2d3748", marginBottom: "8px" }}>Session Expired or Unauthorized (401)</h2>
            <p style={{ color: "#718096", marginBottom: "20px" }}>
              Your session has expired or authentication token is invalid. Please log in again to continue.
            </p>
            <button
              className="btn-export"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              style={{ cursor: "pointer", padding: "10px 24px" }}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <>
            <div className="stat-grid">
              {statCards.map(({ label, value, icon: Icon, color }) => (
                <div className="stat-card" key={label}>
                  <div className={`stat-icon bg-${color}`}>
                    <Icon size={18} className={`text-${color}`} />
                  </div>
                  <div className="stat-text">
                    <p className="stat-label">{label}</p>
                    <p className="stat-value">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="charts-grid">
              <div className="panel">
                <h2>CO2 Reduction Overview</h2>
                <div className="chart-wrap">
                  {loading ? (
                    <p style={{ textAlign: "center", paddingTop: "80px", color: "#a2a7ae" }}>Loading graph...</p>
                  ) : co2Overview.length === 0 ? (
                    <p style={{ textAlign: "center", paddingTop: "80px", color: "#a2a7ae" }}>No activity logs found for this period.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={co2Overview} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="co2Fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2f7d4f" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#2f7d4f" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#eef0f2" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#a2a7ae" }} />
                        <YAxis 
                          tickFormatter={(v) => `${Math.round(v)}kg`} 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{ fontSize: 11, fill: "#a2a7ae" }} 
                          width={50} 
                        />
                        <Tooltip formatter={(v) => [`${v} kg`, "CO2 impact"]} />
                        <Area type="monotone" dataKey="value" stroke="#2f7d4f" strokeWidth={2} fill="url(#co2Fill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="panel">
                <h2>Impact Breakdown</h2>
                <div className="donut-row">
                  <div className="donut-wrap">
                    {impactBreakdown.length === 0 ? (
                      <p style={{ textAlign: "center", paddingTop: "60px", color: "#a2a7ae" }}>No category data available.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={impactBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2} stroke="none">
                            {impactBreakdown.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <ul className="legend-list">
                    {impactBreakdown.map(({ name, value, color }) => (
                      <li key={name}>
                        <span className="legend-dot" style={{ background: color }} />
                        {name} ({value}%)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bottom-grid">
              <div className="panel">
                <h2>Top Activities</h2>
                {topActivities.length === 0 ? (
                  <p style={{ textAlign: "center", paddingTop: "40px", color: "#a2a7ae" }}>No savings activities logged yet.</p>
                ) : (
                  <table className="activities-table">
                    <thead>
                      <tr><th>Activity</th><th>CO2 Impact</th><th>Date</th><th /></tr>
                    </thead>
                    <tbody>
                      {topActivities.map(({ activity, co2, date, icon: Icon }, idx) => (
                        <tr key={idx}>
                          <td className="activity-name">{activity}</td>
                          <td>{co2}</td>
                          <td>{date}</td>
                          <td className="activity-icon">{Icon && <Icon size={16} />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="panel">
                <h2>Monthly Comparison</h2>
                <p className="panel-subtitle">CO2 impact</p>
                <div className="chart-wrap">
                  {monthlyComparison.length === 0 ? (
                    <p style={{ textAlign: "center", paddingTop: "60px", color: "#a2a7ae" }}>No monthly comparison data.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={monthlyComparison} margin={{ top: 10, right: 0, left: 10, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#eef0f2" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#a2a7ae" }} />
                        <YAxis 
                          tickFormatter={(v) => `${Math.round(v)}kg`} 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{ fontSize: 11, fill: "#a2a7ae" }} 
                          width={50} 
                        />
                        <Tooltip formatter={(v) => [`${v} kg`, "CO2 impact"]} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {monthlyComparison.map((entry, i) => (
                            <Cell key={i} fill={entry.current ? "#2f7d4f" : "#7fc79b"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}