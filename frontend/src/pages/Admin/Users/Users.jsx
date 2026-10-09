import { useMemo, useState } from "react";
import "./Users.css";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import "../AdminLayout.css";

const initialUsers = [
  {
    id: 1,
    name: "Manpreet Singh",
    email: "manpreet@example.com",
    joinedDate: "Aug 10, 2026",
  },
  {
    id: 2,
    name: "Aman Sharma",
    email: "aman.sharma@gmail.com",
    joinedDate: "Aug 14, 2026",
  },
  {
    id: 3,
    name: "Rohit Verma",
    email: "rohit.verma@outlook.com",
    joinedDate: "Sep 02, 2026",
  },
  {
    id: 4,
    name: "Priya Mehta",
    email: "priya.mehta@yahoo.com",
    joinedDate: "Sep 15, 2026",
  },
  {
    id: 5,
    name: "Rahul Kumar",
    email: "rahul.kumar@gmail.com",
    joinedDate: "Sep 18, 2026",
  },
  {
    id: 6,
    name: "Ananya Gupta",
    email: "ananya.gupta@gmail.com",
    joinedDate: "Sep 20, 2026",
  },
  {
    id: 7,
    name: "Arjun Singh",
    email: "arjun.singh@gmail.com",
    joinedDate: "Sep 22, 2026",
  },
  {
    id: 8,
    name: "Neha Verma",
    email: "neha.verma@gmail.com",
    joinedDate: "Sep 25, 2026",
  },
];

const USERS_PER_PAGE = 4;

export default function Users() {
  const [users] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search users by name or email
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
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
    name
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

        {/* Statistics */}
        <section className="admin-stats">
          <div className="admin-stat">
            <div>
              <strong>138</strong>
              <span>Total Enrolled</span>
            </div>
          </div>

          <div className="admin-stat">
            <div>
              <strong>24</strong>
              <span>New This Month</span>
            </div>
          </div>

          <div className="admin-stat">
            <div>
              <strong>89</strong>
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
                {currentUsers.length === 0 ? (
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
              {filteredUsers.length} users
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