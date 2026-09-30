import React, { useState } from "react";
import { Link } from "react-router-dom";
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

const statCards = [
  {
    label: "Total CO2 Reduced:",
    value: "48 kg",
    icon: Footprints,
    color: "green",
    trendUp: true,
  },
  {
    label: "Total Activities:",
    value: "24",
    icon: ClipboardList,
    color: "blue",
  },
  {
    label: "Average Daily Impact:",
    value: "1.6 kg",
    icon: Calculator,
    color: "gray",
  },
  {
    label: "Eco Score:",
    value: "72",
    icon: Gauge,
    color: "gauge",
  },
];

const co2Overview = [
  { date: "Jul 1", value: 0.9 },
  { date: "Jul 4", value: 1.6 },
  { date: "Jul 7", value: 1.4 },
  { date: "Jul 10", value: 2.0 },
  { date: "Jul 14", value: 3.1 },
  { date: "Jul 17", value: 2.3 },
  { date: "Jul 21", value: 2.6 },
  { date: "Jul 24", value: 3.4 },
  { date: "Jul 28", value: 4.3 },
];

const impactBreakdown = [
  { name: "Transport", value: 35, color: "#1f6b6b" },
  { name: "Energy", value: 25, color: "#8fd6c4" },
  { name: "Waste", value: 20, color: "#3fae6a" },
  { name: "Water", value: 20, color: "#4c8ff0" },
];

const topActivities = [
  {
    activity: "Public Transport (Bus)",
    co2: "2.1 kg CO2",
    date: "Jul 7, 2023",
    icon: Bus,
  },
  {
    activity: "Energy Saving",
    co2: "1.5 kg CO2",
    date: "Jul 15, 2023",
    icon: Lightbulb,
  },
  {
    activity: "Avoided Plastic",
    co2: "1.0 kg CO2",
    date: "Jul 20, 2023",
    icon: FileText,
  },
  {
    activity: "Water Saving",
    co2: "0.8 kg CO2",
    date: "Jul 22, 2023",
    icon: Droplet,
  },
  {
    activity: "Recycling",
    co2: "0.6 kg CO2",
    date: "Jul 28, 2023",
    icon: Recycle,
  },
];

const monthlyComparison = [
  { month: "Apr", value: 2.5 },
  { month: "May", value: 3.0 },
  { month: "Jun", value: 2.7 },
  { month: "Jul", value: 3.6, current: true },
];

export default function ReportsPage() {
  const [timePeriod, setTimePeriod] = useState("This Month");

  return (
    <div className="reports-app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Globe size={20} />
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

          <Link to="/goals" className="menu-item">
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

          <a href="#" className="menu-item active">
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
            <h1>Reports 📜</h1>
            <p>Detailed insights into your sustainability journey.</p>
          </div>

          <div className="header-actions">
            <div className="time-period">
              <span className="time-period-label">Time period:</span>
              <div className="select-wrap">
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                >
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>Last 3 Months</option>
                  <option>This Year</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>

            <button className="btn-export">Export Report</button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="stat-grid">
          {statCards.map(({ label, value, icon: Icon, color, trendUp }) => (
            <div className="stat-card" key={label}>
              <div className={`stat-icon bg-${color}`}>
                <Icon size={18} className={`text-${color}`} />
              </div>
              <div className="stat-text">
                <p className="stat-label">{label}</p>
                <p className="stat-value">
                  {value}
                  {trendUp && <span className="trend-up">↗</span>}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CO2 overview + impact breakdown */}
        <div className="charts-grid">
          <div className="panel">
            <h2>CO2 Reduction Overview</h2>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={co2Overview} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="co2Fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2f7d4f" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#2f7d4f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#eef0f2" />
                  <XAxis
                    dataKey="date"
                    ticks={["Jul 1", "Jul 7", "Jul 14", "Jul 21", "Jul 28"]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#a2a7ae" }}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}kg`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#a2a7ae" }}
                    width={36}
                  />
                  <Tooltip formatter={(v) => [`${v} kg`, "CO2 reduced"]} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2f7d4f"
                    strokeWidth={2}
                    fill="url(#co2Fill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel">
            <h2>Impact Breakdown</h2>
            <div className="donut-row">
              <div className="donut-wrap">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={impactBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {impactBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
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

        {/* Top activities + monthly comparison */}
        <div className="bottom-grid">
          <div className="panel">
            <h2>Top Activities</h2>
            <table className="activities-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>CO2 Saved</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {topActivities.map(({ activity, co2, date, icon: Icon }) => (
                  <tr key={activity}>
                    <td className="activity-name">{activity}</td>
                    <td>{co2}</td>
                    <td>{date}</td>
                    <td className="activity-icon">
                      <Icon size={16} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <h2>Monthly Comparison</h2>
            <p className="panel-subtitle">CO2 reduced</p>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyComparison} margin={{ top: 10, right: 0, left: 2, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#eef0f2" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={({ x, y, payload }) => (
                      <text
                        x={x}
                        y={y + 12}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={payload.value === "Jul" ? 700 : 400}
                        fill={payload.value === "Jul" ? "#1a1d1f" : "#a2a7ae"}
                      >
                        {payload.value}
                      </text>
                    )}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}kg`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#a2a7ae" }}
                    width={32}
                  />
                  <Tooltip formatter={(v) => [`${v} kg`, "CO2 reduced"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {monthlyComparison.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.current ? "#2f7d4f" : "#7fc79b"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}