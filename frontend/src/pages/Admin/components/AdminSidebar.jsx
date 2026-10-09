import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

const navItems = [
  { name: "Users", path: "/Admin/users", icon: "♙" },
  { name: "Challenges", path: "/Admin/challenges", icon: "♧" },
  { name: "Reports", path: "/Admin/reports", icon: "▥" },
];

export default function AdminSidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="admin-sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="admin-brand">
          <svg
            className="admin-brand-logo"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="admin-brand-name">EcoTrack</span>
        </div>

        <span className="admin-role-pill">ADMIN</span>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}