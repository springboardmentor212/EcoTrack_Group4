import { useState } from "react";
import "./AdminHeader.css";

export default function AdminHeader({
  title,
  subtitle,
  onMenuClick,
  action,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <div className="admin-header-subtitle">
            {subtitle}
          </div>
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

        <div className="admin-profile">
          <button
            className="admin-profile-button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
          >
            <span className="admin-profile-avatar">●</span>
            <span className="admin-profile-name">Admin</span>
            <span>⌄</span>
          </button>

          {menuOpen && (
            <div className="admin-profile-menu">
              <button onClick={() => setMenuOpen(false)}>
                Profile
              </button>
              <button onClick={() => setMenuOpen(false)}>
                Settings
              </button>
              <button onClick={() => setMenuOpen(false)}>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}