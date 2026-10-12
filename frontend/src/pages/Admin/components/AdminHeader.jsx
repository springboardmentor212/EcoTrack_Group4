import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminHeader.css";

// Admin Icon SVG
const AdminShieldIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function AdminHeader({ title, subtitle, onMenuClick, action }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/Admin/login");
  };

  return (
    <header className="admin-header">
      <button
        className="admin-menu-button"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        ☰
      </button>

      <div className="admin-header-title">
        <div className="admin-breadcrumb">
          Admin / <b>{title}</b>
        </div>

        {subtitle && (
          <div className="admin-header-subtitle">{subtitle}</div>
        )}

        <h1>
          {title === "Challenges"
            ? "Challenge Management"
            : title === "Users"
            ? "User Management"
            : `${title} Management`}
        </h1>
      </div>

      <div className="admin-header-actions">
        {action}

        <div className="admin-profile" ref={dropdownRef}>
          <button
            className="admin-profile-button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
          >
            <span className="admin-profile-avatar">
              <AdminShieldIcon />
            </span>
            <span className="admin-profile-name">Admin</span>
            <span>⌄</span>
          </button>

          {menuOpen && (
            <div className="admin-profile-menu">
              <button className="logout-btn" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}