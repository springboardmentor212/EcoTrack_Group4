import React, { useState } from "react";
import {
  Users,
  Trophy,
  FileText,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Flame,
  Globe,
} from "lucide-react";
import "./Report.css";

const users = [
  {
    name: "Aarav Sharma",
    email: "aarav@example.com",
    co2: "42.5 kg",
    streak: "12 days",
    goal: "Completed",
    date: "Oct 6, 2026",
  },
  {
    name: "Priya Singh",
    email: "priya@example.com",
    co2: "38.2 kg",
    streak: "9 days",
    goal: "Completed",
    date: "Oct 6, 2026",
  },
  {
    name: "Rahul Verma",
    email: "rahul@example.com",
    co2: "31.8 kg",
    streak: "7 days",
    goal: "In Progress",
    date: "Oct 5, 2026",
  },
  {
    name: "Ananya Gupta",
    email: "ananya@example.com",
    co2: "28.4 kg",
    streak: "14 days",
    goal: "Completed",
    date: "Oct 5, 2026",
  },
  {
    name: "Kabir Mehta",
    email: "kabir@example.com",
    co2: "24.7 kg",
    streak: "5 days",
    goal: "In Progress",
    date: "Oct 4, 2026",
  },
];

function AdminReports() {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-report-page">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="logo-circle">
             <Globe size={21} strokeWidth={1.8} />
            </div>
          <span>EcoTrack</span>
        </div>

        <div className="admin-label">ADMIN</div>

        <nav>
          <a href="/admin/users">
            <Users size={17} />
            Users
          </a>

          <a href="/admin/challenges">
            <Trophy size={17} />
            Challenges
          </a>

          <a href="/admin/reports" className="active">
            <FileText size={17} />
            Reports
          </a>
        </nav>
      </aside>

      <main className="admin-report-main">
        <header className="admin-report-header">
          <div>
            <h1>Impact & Activity Reports</h1>
            <p>
              Monitor sustainability performance and user activity across
              EcoTrack.
            </p>
          </div>

          <button className="export-csv">
            <Download size={16} />
            Export CSV
          </button>
        </header>

        <section className="admin-stats">
          <div className="admin-stat-card">
            <div className="stat-icon green">CO₂</div>
            <div>
              <p>Total CO₂ Reduced</p>
              <h2>1,240 kg</h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon blue">🌳</div>
            <div>
              <p>Trees Saved Eq.</p>
              <h2>56</h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon purple">✓</div>
            <div>
              <p>Goals Completed</p>
              <h2>85%</h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon orange">
              <Flame size={18} />
            </div>
            <div>
              <p>Avg Active Streak</p>
              <h2>14 Days</h2>
            </div>
          </div>
        </section>

        <section className="activity-panel">
          <div className="activity-header">
            <div>
              <h2>User Performance & Activity Log</h2>
              <p>Track individual user sustainability activity.</p>
            </div>

            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>CO₂ Saved</th>
                  <th>Current Streak</th>
                  <th>Goal Status</th>
                  <th>Last Logged</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.email}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <strong>{user.name}</strong>
                          <small>{user.email}</small>
                        </div>
                      </div>
                    </td>

                    <td className="co2-value">{user.co2}</td>
                    <td>{user.streak}</td>

                    <td>
                      <span
                        className={
                          user.goal === "Completed"
                            ? "status completed"
                            : "status progress"
                        }
                      >
                        {user.goal}
                      </span>
                    </td>

                    <td>{user.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span>Showing 1–5 of 56 users</span>

            <div className="page-buttons">
              <button>
                <ChevronLeft size={15} />
              </button>
              <button className="selected">1</button>
              <button>2</button>
              <button>3</button>
              <button>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminReports;