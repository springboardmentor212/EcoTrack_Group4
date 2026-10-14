import { useMemo, useState, useEffect } from "react";
import "./Users.css";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import "../AdminLayout.css";

const USERS_PER_PAGE = 4;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    newThisMonth: 0,
    completedGoals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch Users & Real-time Metrics from Backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/admin/users");
        const data = await res.json();

        if (data.success) {
          setUsers(data.users || []);
          setStats({
            totalEnrolled: data.totalEnrolled || 0,
            newThisMonth: data.newThisMonth || 0,
            completedGoals: data.completedGoals || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Search users by name or email safely
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter(
      (user) =>
        (user.name && user.name.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query))
    );
  }, [users, search]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  );

  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + USERS_PER_PAGE
  );

  // Generate initials for user avatars
  const getInitials = (name) =>
    (name || "User")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="admin-layout">
      {/* Shared Admin Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-layout-main">
        {/* Shared Admin Header */}
        <AdminHeader
          title="Users"
          subtitle="Enrolled Accounts"
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Statistics Cards */}
        <section className="admin-stats">
          <div className="admin-stat">
            <div>
              <strong>{stats.totalEnrolled}</strong>
              <span>Total Enrolled</span>
            </div>
          </div>

          <div className="admin-stat">
            <div>
              <strong>{stats.newThisMonth}</strong>
              <span>New This Month</span>
            </div>
          </div>

          <div className="admin-stat">
            <div>
              <strong>{stats.completedGoals}</strong>
              <span>Completed Goals</span>
            </div>
          </div>
        </section>

        {/* Users Table */}
        <section className="admin-panel">
          <div className="users-panel-header">
            <h2>Enrolled Users List</h2>

            <input
              type="search"
              className="admin-search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              aria-label="Search users by name or email"
            />
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email Address</th>
                  <th>Joined Date</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="admin-empty">
                      Loading enrolled users from database...
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="admin-empty">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.id}>
                      <td data-label="User Name">
                        <div className="users-name-cell">
                          <span className="users-avatar">
                            {getInitials(user.name)}
                          </span>

                          <strong>{user.name}</strong>
                        </div>
                      </td>

                      <td data-label="Email Address">{user.email}</td>

                      <td data-label="Joined Date">{user.joinedDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <footer className="users-panel-footer">
            <span className="users-result-count">
              Showing{" "}
              {filteredUsers.length === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(startIndex + USERS_PER_PAGE, filteredUsers.length)} of{" "}
              {filteredUsers.length} enrolled users
            </span>

            <div className="admin-pager">
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setPage((previous) => Math.max(1, previous - 1))
                }
                aria-label="Previous page"
              >
                ‹
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={
                    currentPage === pageNumber ? "active" : ""
                  }
                  onClick={() => setPage(pageNumber)}
                  aria-label={`Page ${pageNumber}`}
                  aria-current={
                    currentPage === pageNumber ? "page" : undefined
                  }
                >
                  {pageNumber}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage((previous) =>
                    Math.min(totalPages, previous + 1)
                  )
                }
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}