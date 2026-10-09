import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Globe,
  Home as HomeIcon,
  Leaf,
  Target,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  User,
  Info,
  ChevronUp,
} from "lucide-react";

import treeImage from "../../assets/tree.jpeg";
import "./home.css";

function Home() {
  const [todayEmissions, setTodayEmissions] = useState(0);

  useEffect(() => {
    const fetchEmissionData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          "http://localhost:5000/api/tracker/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const records = Array.isArray(response.data)
          ? response.data
          : response.data.logs || response.data.history || [];

        // Exact profile co2Emitted calculation logic sync
        let totalEmissions = 0;

        records.forEach((item) => {
          const mode =
            item.activityMode ||
            (Number(item.carbonSaved) > 0 ? "saving" : "emission");

          if (mode === "emission") {
            totalEmissions += Number(item.carbonOutput || item.co2 || 0);
          }
        });

        setTodayEmissions(totalEmissions);
      } catch (error) {
        console.error("Error calculating gross emissions for home:", error);
      }
    };

    fetchEmissionData();
  }, []);

  return (
    <div className="home-page">
      <div className="home-layout">
        <aside className="sidebar">
          <div className="brand">
            <Globe size={18} strokeWidth={2} />
            <span>EcoTrack</span>
          </div>

          <nav className="sidebar-menu">
            <Link to="/home" className="menu-item active">
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

            <Link to="/reports" className="menu-item">
              <FileText size={16} />
              <span>Reports</span>
            </Link>

            <Link to="/profile" className="menu-item">
              <User size={16} />
              <span>Profile</span>
            </Link>
          </nav>
        </aside>

        <div className="main-viewport">
          <main className="main-content">
            <div className="welcome">
              <h2>Home</h2>
              <p>Welcome back! Ready to track your green impact today?</p>
            </div>

            <section className="carbon-banner">
              <span className="help-text">HOW TO HELP</span>
              <h1>Calculate Your Carbon Footprint</h1>
              <p>
                Understand your environmental impact and take simple, measurable
                steps toward reducing emissions.
              </p>
            </section>

            <section className="stats">
              <div className="stat-card">
                <span>US AVERAGE</span>
                <div>
                  <strong>16</strong>
                  <small>tons/yr</small>
                </div>
              </div>

              <div className="stat-card">
                <span>GLOBAL AVERAGE</span>
                <div>
                  <strong>4</strong>
                  <small>tons/yr</small>
                </div>
              </div>

              <div className="stat-card target">
                <span>2050 TARGET</span>
                <div>
                  <strong>&lt; 2</strong>
                  <small>tons/yr</small>
                </div>
              </div>

              <div className="stat-card">
                <span>TODAY'S EMISSIONS</span>
                <div>
                  <strong>{todayEmissions.toFixed(2)}</strong>
                  <small>kg CO₂e</small>
                </div>
              </div>
            </section>

            <section className="info-card">
              <div className="tree-box">
                <img
                  src={treeImage}
                  alt="Realistic tree"
                  className="tree-image"
                />

                <div className="image-info">
                  <Info size={13} />
                </div>
              </div>

              <div className="info-content">
                <h2>What is a carbon footprint?</h2>
                <p>
                  A carbon footprint is the <strong>total amount of greenhouse gases</strong> (including CO₂ and methane) generated by our actions.
                </p>
                <p>
                  The average US footprint is 16 tons, while global average is 4 tons. To avoid a 2°C temperature rise, we must lower the global average to <strong>under 2 tons per year by 2050</strong>.
                </p>

                <div className="calculate-box">
                  <h3>How We Calculate Your Impact</h3>
                  <p>
                    Curious about how your carbon footprint is calculated? We use standardized formulas based on your daily activities, energy usage, and travel habits.
                  </p>
                  <Link to="/carbon-footprint" className="learn-more">
                    Learn More →
                  </Link>
                </div>
              </div>
            </section>

            <footer className="footer">
              <div className="footer-grid">
                <div className="footer-brand">
                  <div className="footer-logo">
                    <Globe size={18} />
                    <span>EcoTrack</span>
                  </div>
                  <p>Empowering sustainable daily living.</p>
                  <span className="active-badge">• Carbon Analytics Active</span>
                </div>

                <div className="footer-column">
                  <h4>PLATFORM</h4>
                  <span>Emission Calculator</span>
                  <span>Personal Goals & Streaks</span>
                  <span>Community Challenges</span>
                  <span>Analytics & Reports</span>
                </div>

                <div className="footer-column">
                  <h4>RESOURCES</h4>
                  <span>Sustainability Guides</span>
                  <span>Offset Methodology</span>
                  <span>API Documentation</span>
                  <span>Help & Support</span>
                </div>
              </div>

              <div className="footer-bottom-bar">
                <small className="copyright">
                  © 2026 EcoTrack. All rights reserved.
                </small>
                <div className="footer-bottom-links">
                  <span>Privacy Policy</span>
                  <span>Terms of Service</span>
                  <span>Security</span>
                </div>
                <button
                  className="back-to-top"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  <ChevronUp size={12} /> BACK TO TOP
                </button>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Home;