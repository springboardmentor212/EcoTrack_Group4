import { useEffect, useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Report.css";
import "../AdminLayout.css";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

export default function Report() {
  const [reports, setReports] = useState([]);
  const [userLevelWise, setUserLevelWise] = useState([]);
  const [weeklyDrives, setWeeklyDrives] = useState([]);
  const [levelChallenges, setLevelChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({
    totalCO2Reduced: 0,
    treesSavedEq: 0,
    goalsCompletedPercent: "0%",
    avgActiveStreak: "0 days",
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/admin/reports");
        const data = await res.json();

        if (data.success) {
          setReports(data.reports || []);
          setStats(data.stats || {});
          setWeeklyDrives(data.weeklyDrives || []);
          setLevelChallenges(data.levelChallenges || []);
          setUserLevelWise(data.userLevelWiseSummary || []);
          setLeaderboard(data.leaderboard || []);
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || item.goalStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  // Export Professional PDF Document Functionality
  const handleExportPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");
    const totalUsers = reports.length;

    // PDF Title Banner
    doc.setFillColor(16, 185, 129); // Eco Green
    doc.rect(0, 0, 595, 60, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("EcoTrack - Impact & Challenge Analytics Report", 40, 38);

    let currentY = 80;

    // SECTION 1: EXECUTIVE REPORT SUMMARY
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("1. Executive Report Summary", 40, currentY);

    const summaryRows = [
      ["Total Level Challenges", levelChallenges.length],
      ["Total Active Weekly Drives (Created by Admin)", weeklyDrives.length],
      ["Total Enrolled Users", totalUsers],
      ["Total CO₂ Impact Saved", `${stats.totalCO2Reduced || 0} kg`],
    ];

    autoTable(doc, {
      startY: currentY + 10,
      head: [["Metric Header", "Value"]],
      body: summaryRows,
      theme: "striped",
      headStyles: { fillStyle: "F", fillColor: [16, 185, 129] },
      margin: { left: 40, right: 40 },
    });

    currentY = doc.lastAutoTable.finalY + 25;

    // SECTION 2: ADMIN WEEKLY DRIVES & COMMUNITY CHALLENGES
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("2. Admin Weekly Drives & Dynamic Challenges", 40, currentY);

    const weeklyRows = weeklyDrives.map((w) => [
      w.title,
      w.category,
      w.totalParticipants,
      w.completedParticipants,
      w.completionRate,
      w.badgeName,
    ]);

    autoTable(doc, {
      startY: currentY + 10,
      head: [
        [
          "Weekly Drive Title",
          "Category",
          "Joined",
          "Completed",
          "Completion Rate",
          "Badge Name",
        ],
      ],
      body: weeklyRows.length > 0 ? weeklyRows : [["No Weekly Drives Created Yet", "-", "-", "-", "-", "-"]],
      theme: "grid",
      headStyles: { fillStyle: "F", fillColor: [217, 119, 6] },
      styles: { fontSize: 8 },
      margin: { left: 40, right: 40 },
    });

    currentY = doc.lastAutoTable.finalY + 25;

    if (currentY > 700) {
      doc.addPage();
      currentY = 40;
    }

    // SECTION 3: USER LEVEL-WISE SUMMARY
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("3. User Level-Wise Performance Summary", 40, currentY);

    const userLevelRows = userLevelWise.map((ul) => [
      ul.userName,
      ul.userEmail,
      `Level ${ul.level}`,
      ul.totalInLevel,
      ul.joined,
      ul.completed,
      ul.completionRate,
    ]);

    autoTable(doc, {
      startY: currentY + 10,
      head: [
        [
          "User Name",
          "Email",
          "Level",
          "Total",
          "Joined",
          "Completed",
          "Completion Rate",
        ],
      ],
      body: userLevelRows,
      theme: "striped",
      headStyles: { fillStyle: "F", fillColor: [51, 65, 85] },
      styles: { fontSize: 8 },
      margin: { left: 40, right: 40 },
    });

    currentY = doc.lastAutoTable.finalY + 25;

    if (currentY > 700) {
      doc.addPage();
      currentY = 40;
    }

    // SECTION 4: LEVEL CHALLENGES ANALYTICS
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("4. Default Level Challenges Analytics", 40, currentY);

    const challengeRows = levelChallenges.map((ch) => [
      `Lvl ${ch.level}`,
      ch.title,
      ch.category,
      ch.totalParticipants,
      ch.completedParticipants,
      ch.completionRate,
      ch.badgeName,
    ]);

    autoTable(doc, {
      startY: currentY + 10,
      head: [
        [
          "Level",
          "Challenge Title",
          "Category",
          "Joined",
          "Done",
          "Completion Rate",
          "Badge Name",
        ],
      ],
      body: challengeRows,
      theme: "striped",
      headStyles: { fillStyle: "F", fillColor: [16, 185, 129] },
      styles: { fontSize: 8 },
      margin: { left: 40, right: 40 },
    });

    currentY = doc.lastAutoTable.finalY + 25;

    if (currentY > 700) {
      doc.addPage();
      currentY = 40;
    }

    // SECTION 5: LEADERBOARD SUMMARY
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("5. Leaderboard Summary", 40, currentY);

    const leaderboardRows = leaderboard.map((lb, idx) => [
      `#${idx + 1}`,
      lb.name,
      lb.ecoPoints,
      lb.xp,
      `Lvl ${lb.level}`,
      lb.challengesCompleted,
      lb.badgesEarned,
    ]);

    autoTable(doc, {
      startY: currentY + 10,
      head: [
        [
          "Rank",
          "User Name",
          "Eco Points",
          "XP",
          "Level",
          "Completed",
          "Badges",
        ],
      ],
      body: leaderboardRows,
      theme: "grid",
      headStyles: { fillStyle: "F", fillColor: [51, 65, 85] },
      styles: { fontSize: 8 },
      margin: { left: 40, right: 40 },
    });

    doc.save(`EcoTrack_Analytics_Report_${Date.now()}.pdf`);
  };

  const getInitials = (name) =>
    (name || "User")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="admin-layout">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-layout-main">
        <AdminHeader
          title="Reports"
          subtitle="Impact Analytics & User Progress"
          onMenuClick={() => setSidebarOpen(true)}
          action={
            <button
              className="btn btn-secondary btn-md"
              onClick={handleExportPDF}
            >
              📄 Export Report PDF
            </button>
          }
        />

        <section className="admin-stats">
          <div className="admin-stat">
            <div>
              <strong>{stats.totalCO2Reduced || 0} kg</strong>
              <span>Total CO₂ Reduced</span>
            </div>
          </div>

          <div className="admin-stat">
            <div>
              <strong>{weeklyDrives.length || 0}</strong>
              <span>Active Weekly Drives</span>
            </div>
          </div>

          <div className="admin-stat">
            <div>
              <strong>{stats.goalsCompletedPercent || "0%"}</strong>
              <span>Goals Completed</span>
            </div>
          </div>

          <div className="admin-stat">
            <div>
              <strong>{stats.avgActiveStreak || "0 days"}</strong>
              <span>Avg Active Streak</span>
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <div className="users-panel-header">
            <div>
              <h2>User Activity</h2>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                Review user progress, carbon savings, and recent activity.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="search"
                className="admin-search"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="admin-search"
                style={{ width: "130px" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>CO₂ REDUCED</th>
                  <th>ACTIVE STREAK</th>
                  <th>COMPLETED GOALS</th>
                  <th>GOAL STATUS</th>
                  <th>LAST ACTIVITY</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="admin-empty">
                      Loading activity reports...
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="admin-empty">
                      No activity logs found.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((user) => (
                    <tr key={user.id}>
                      <td data-label="USER">
                        <div className="users-name-cell">
                          <span className="users-avatar">
                            {getInitials(user.name)}
                          </span>
                          <div>
                            <strong>{user.name}</strong>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td data-label="CO₂ REDUCED">
                        <strong>{user.co2Reduced} kg</strong>
                      </td>

                      <td data-label="ACTIVE STREAK">
                        📅 {user.activeStreak} days
                      </td>

                      <td data-label="COMPLETED GOALS">
                        <span style={{ fontWeight: "bold", color: "#059669" }}>
                          🎯 {user.completedGoalsCount || 0} / {user.totalGoalsCount || 0}
                        </span>
                      </td>

                      <td data-label="GOAL STATUS">
                        <span
                          className={`badge ${
                            user.goalStatus === "Completed" ? "ok" : "lock"
                          }`}
                        >
                          {user.goalStatus}
                        </span>
                      </td>

                      <td data-label="LAST ACTIVITY">{user.lastActivity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}