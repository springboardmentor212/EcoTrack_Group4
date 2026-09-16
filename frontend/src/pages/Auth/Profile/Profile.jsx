import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("User JSON parse error:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <aside className="sidebar">
        <div className="logo">
          <span>EcoTrack</span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/home">Home</Link>
          <a href="#">Carbon Tracker</a>
          {/* <Link to="/carbon-footprint">Carbon Tracker</Link> */}
          <Link to="/goals">Goals</Link>
          <Link to="/challenges">Challenges</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/reports" >Reports</Link>
          <Link to="/profile" className="active">Profile</Link>
        </nav>
      </aside>

      <main className="profile-main">
        <header className="profile-header">
          <h1>User Profile</h1>
          <p>Manage your account settings & Eco details</p>
        </header>

        <div className="content-columns">
          <div className="left-column">
            <div className="card profile-card">
              <div className="avatar">👤</div>
              <h2>{user?.fullName || user?.name || "Eco Tracker User"}</h2>
              <p className="email">{user?.email || "No email available"}</p>
              <span className="badge">ECO TRACKER MEMBER</span>

              <button
                className="edit-btn"
                onClick={handleLogout}
                style={{
                  marginTop: "20px",
                  backgroundColor: "#e53e3e",
                  color: "#fff",
                  cursor: "pointer",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px"
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;