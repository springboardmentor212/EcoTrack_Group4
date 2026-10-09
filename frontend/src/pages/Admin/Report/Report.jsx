import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf,
  Trees,
  Target,
  CalendarDays,
  Search,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import "./Report.css";

const usersData = [
  {
    id: 1,
    name: "Aarav Sharma",
    email: "aarav@example.com",
    co2: 42.5,
    streak: 12,
    status: "Completed",
    date: "Oct 6, 2026",
  },
  {
    id: 2,
    name: "Priya Singh",
    email: "priya@example.com",
    co2: 38.2,
    streak: 9,
    status: "Completed",
    date: "Oct 6, 2026",
  },
  {
    id: 3,
    name: "Rahul Verma",
    email: "rahul@example.com",
    co2: 31.8,
    streak: 7,
    status: "In Progress",
    date: "Oct 5, 2026",
  },
  {
    id: 4,
    name: "Ananya Gupta",
    email: "ananya@example.com",
    co2: 27.4,
    streak: 14,
    status: "Completed",
    date: "Oct 5, 2026",
  },
  {
    id: 5,
    name: "Arjun Mehta",
    email: "arjun@example.com",
    co2: 24.6,
    streak: 11,
    status: "In Progress",
    date: "Oct 4, 2026",
  },
  {
    id: 6,
    name: "Isha Kapoor",
    email: "isha@example.com",
    co2: 19.8,
    streak: 6,
    status: "Completed",
    date: "Oct 4, 2026",
  },
  {
    id: 7,
    name: "Kabir Malhotra",
    email: "kabir@example.com",
    co2: 16.3,
    streak: 8,
    status: "In Progress",
    date: "Oct 3, 2026",
  },
];

const ITEMS_PER_PAGE = 5;

function Report() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    return usersData.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const visibleUsers = filteredUsers.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const exportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "CO2 Reduced (kg)",
      "Active Streak (days)",
      "Goal Status",
      "Last Activity",
    ];

    const rows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.co2,
      user.streak,
      user.status,
      user.date,
    ]);

    const escapeCSV = (value) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ecotrack-impact-activity-report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="admin-report-page">
      <AdminSidebar />

      <main className="admin-report-main">
        {/* Header */}
        <header className="report-page-header">
          <div className="report-title-area">
            <div className="report-breadcrumb">
              Admin <span>/</span> Reports
            </div>

            <p className="report-subtitle">
              Impact Analytics &amp; User Progress
            </p>

            <h1>Impact &amp; Activity Reports</h1>
          </div>

          <div className="report-header-actions">
            <button
              type="button"
              className="export-csv"
              onClick={exportCSV}
            >
              <Download size={17} />
              Export CSV
            </button>

            {/* Admin profile dropdown */}
            <div className="admin-profile">
              <button
                type="button"
                className="admin-profile-button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
              >
                <span className="admin-profile-avatar">●</span>
                <span className="admin-profile-name">Admin</span>
                <ChevronDown size={16} />
              </button>

              {menuOpen && (
                <div className="admin-profile-menu">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/admin/profile");
                    }}
                  >
                    Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/admin/settings");
                    }}
                  >
                    Settings
                  </button>

                  <button type="button" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Statistics */}
        <section className="admin-stats">
          <article className="admin-stat-card">
            <div className="stat-icon green">
              <Leaf size={24} />
            </div>
            <div>
              <h2>1,240 kg</h2>
              <p>Total CO₂ Reduced</p>
            </div>
          </article>

          <article className="admin-stat-card">
            <div className="stat-icon blue">
              <Trees size={24} />
            </div>
            <div>
              <h2>56</h2>
              <p>Trees Saved Eq.</p>
            </div>
          </article>

          <article className="admin-stat-card">
            <div className="stat-icon purple">
              <Target size={24} />
            </div>
            <div>
              <h2>85%</h2>
              <p>Goals Completed</p>
            </div>
          </article>

          <article className="admin-stat-card">
            <div className="stat-icon orange">
              <CalendarDays size={24} />
            </div>
            <div>
              <h2>14 days</h2>
              <p>Avg Active Streak</p>
            </div>
          </article>
        </section>

        {/* User Activity */}
        <section className="activity-panel">
          <div className="activity-header">
            <div>
              <h2>User Activity</h2>
              <p>
                Review user progress, carbon savings, and recent activity.
              </p>
            </div>

            <div className="activity-filters">
              <label className="search-box">
                <Search size={18} />

                <input
                  type="search"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                />
              </label>

              <select
                className="status-filter"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by status"
              >
                <option value="All">All Status</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>CO₂ Reduced</th>
                  <th>Active Streak</th>
                  <th>Goal Status</th>
                  <th>Last Activity</th>
                </tr>
              </thead>

              <tbody>
                {visibleUsers.length > 0 ? (
                  visibleUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <span
                            className={`user-avatar avatar-${index % 4}`}
                          >
                            {user.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)}
                          </span>

                          <span>
                            <strong>{user.name}</strong>
                            <small>{user.email}</small>
                          </span>
                        </div>
                      </td>

                      <td className="co2-value">
                        {user.co2.toFixed(1)} kg
                      </td>

                      <td>
                        <span className="streak-value">
                          <CalendarDays size={15} />
                          {user.streak} days
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status ${
                            user.status === "Completed"
                              ? "completed"
                              : "progress"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td>{user.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-results">
                      No users found. Try another search or filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <span>
              Showing{" "}
              {filteredUsers.length > 0
                ? (safePage - 1) * ITEMS_PER_PAGE + 1
                : 0}
              –
              {Math.min(
                safePage * ITEMS_PER_PAGE,
                filteredUsers.length
              )}{" "}
              of {filteredUsers.length} users
            </span>

            <div className="page-buttons">
              <button
                type="button"
                aria-label="Previous page"
                disabled={safePage === 1}
                onClick={() => setCurrentPage(safePage - 1)}
              >
                <ChevronLeft size={17} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  type="button"
                  key={index + 1}
                  className={
                    safePage === index + 1 ? "selected" : ""
                  }
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                type="button"
                aria-label="Next page"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage(safePage + 1)}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Report;
