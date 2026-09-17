import React from "react";
import "./dashboard.css";

const stats = [
  {
    label: "Carbon Footprint",
    value: "2.84",
    unit: "tCO₂e",
    change: "-12.4%",
    positive: true,
    icon: "🌱",
  },
  {
    label: "Eco Score",
    value: "84",
    unit: "/100",
    change: "+8.2%",
    positive: true,
    icon: "✦",
  },
  {
    label: "Goals Progress",
    value: "72",
    unit: "%",
    change: "+14.5%",
    positive: true,
    icon: "◎",
  },
  {
    label: "Eco Points",
    value: "2,480",
    unit: "pts",
    change: "+320",
    positive: true,
    icon: "◆",
  },
];

const emissions = [
  { name: "Transportation", value: 38, icon: "🚗" },
  { name: "Electricity", value: 26, icon: "⚡" },
  { name: "Food", value: 18, icon: "🍃" },
  { name: "Waste", value: 11, icon: "♻️" },
  { name: "Water", value: 7, icon: "💧" },
];

const goals = [
  {
    title: "Reduce transportation emissions",
    progress: 78,
    current: "156 kg",
    target: "200 kg",
    icon: "🚲",
  },
  {
    title: "Reduce electricity consumption",
    progress: 64,
    current: "320 kWh",
    target: "500 kWh",
    icon: "⚡",
  },
  {
    title: "Reduce plastic usage",
    progress: 52,
    current: "24 items",
    target: "50 items",
    icon: "♻️",
  },
];

const activities = [
  {
    title: "Used public transport",
    category: "Transportation",
    value: "-4.8 kg CO₂",
    time: "Today, 9:42 AM",
    icon: "🚌",
  },
  {
    title: "Reduced electricity usage",
    category: "Energy",
    value: "-2.3 kg CO₂",
    time: "Yesterday, 7:20 PM",
    icon: "⚡",
  },
  {
    title: "Completed recycling goal",
    category: "Waste",
    value: "+50 pts",
    time: "Yesterday, 4:15 PM",
    icon: "♻️",
  },
  {
    title: "Cycle to work",
    category: "Transportation",
    value: "-6.2 kg CO₂",
    time: "Sep 4, 8:05 AM",
    icon: "🚲",
  },
];

function dashboard() {
  return (
    <div className="dashboard">

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-mark">E</div>

          <div>
            <h2>EcoTrack</h2>
            <span>Sustainability OS</span>
          </div>
        </div>

        <div className="nav-section">
          <p className="nav-label">OVERVIEW</p>

          <a className="nav-item active" href="#">
            <span>⌂</span>
            dashboard
          </a>

          <a className="nav-item" href="#">
            <span>◉</span>
            Carbon Tracker
          </a>

          <a className="nav-item" href="#">
            <span>◷</span>
            Activity History
          </a>
        </div>

        <div className="nav-section">
          <p className="nav-label">IMPROVE</p>

          <a className="nav-item" href="#">
            <span>◎</span>
            Goals
          </a>

          <a className="nav-item" href="#">
            <span>✦</span>
            AI Insights
            <span className="nav-badge">3</span>
          </a>

          <a className="nav-item" href="#">
            <span>♧</span>
            Challenges
          </a>

          <a className="nav-item" href="#">
            <span>♛</span>
            Leaderboard
          </a>
        </div>

        <div className="nav-section">
          <p className="nav-label">ACHIEVEMENTS</p>

          <a className="nav-item" href="#">
            <span>◆</span>
            Rewards
          </a>

          <a className="nav-item" href="#">
            <span>▥</span>
            Analytics
          </a>

          <a className="nav-item" href="#">
            <span>▤</span>
            Reports
          </a>
        </div>

        <div className="sidebar-bottom">

          <a className="nav-item" href="#">
            <span>⚙</span>
            Settings
          </a>

          <div className="profile-mini">
            <div className="avatar">J</div>

            <div className="profile-info">
              <strong>Jesin</strong>
              <span>Eco Warrior</span>
            </div>

            <span className="profile-more">•••</span>
          </div>

        </div>
      </aside>


      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">

        {/* TOP BAR */}
        <header className="topbar">

          <div>
            <p className="eyebrow">MONDAY, SEPTEMBER 7</p>

            <h1>
              Good morning, Jesin <span>👋</span>
            </h1>

            <p className="subtitle">
              Here's how your sustainability journey is going.
            </p>
          </div>

          <div className="topbar-actions">

            <button className="icon-button">
              🔔
              <span className="notification-dot"></span>
            </button>

            <button className="add-activity">
              <span>+</span>
              Add Activity
            </button>

          </div>

        </header>


        {/* ================= KPI CARDS ================= */}
        <section className="stats-grid">

          {stats.map((stat) => (
            <div className="stat-card" key={stat.label}>

              <div className="stat-top">
                <div className="stat-icon">
                  {stat.icon}
                </div>

                <span className="stat-change positive">
                  {stat.change}
                </span>
              </div>

              <p className="stat-label">
                {stat.label}
              </p>

              <div className="stat-value">
                {stat.value}
                <small>{stat.unit}</small>
              </div>

            </div>
          ))}

        </section>


        {/* ================= MAIN ANALYTICS ================= */}
        <section className="dashboard-grid">

          {/* CARBON CHART */}
          <div className="card carbon-card">

            <div className="card-header">

              <div>
                <p className="card-eyebrow">
                  YOUR IMPACT
                </p>

                <h2>
                  Carbon Footprint
                </h2>

                <p className="card-description">
                  Your emissions over the last 30 days
                </p>
              </div>

              <select className="period-select">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Last 3 months</option>
              </select>

            </div>


            <div className="chart-summary">
              <strong>2.84 tCO₂e</strong>
              <span className="chart-positive">
                ↓ 12.4% vs previous period
              </span>
            </div>


            <div className="chart-container">

              <div className="chart-y-axis">
                <span>4t</span>
                <span>3t</span>
                <span>2t</span>
                <span>1t</span>
                <span>0</span>
              </div>

              <svg
                viewBox="0 0 700 240"
                preserveAspectRatio="none"
                className="line-chart"
              >

                <defs>

                  <linearGradient
                    id="chartGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopOpacity="0.22"
                    />

                    <stop
                      offset="100%"
                      stopOpacity="0"
                    />
                  </linearGradient>

                </defs>


                {/* AREA */}
                <path
                  d="
                    M0 170
                    C50 160 70 150 110 158
                    C150 165 175 125 220 138
                    C270 150 290 105 335 120
                    C380 138 400 92 445 108
                    C490 122 520 70 555 90
                    C600 110 620 62 650 78
                    C675 88 690 65 700 58
                    L700 240
                    L0 240
                    Z
                  "
                  className="chart-fill"
                  fill="url(#chartGradient)"
                />


                {/* LINE */}
                <path
                  d="
                    M0 170
                    C50 160 70 150 110 158
                    C150 165 175 125 220 138
                    C270 150 290 105 335 120
                    C380 138 400 92 445 108
                    C490 122 520 70 555 90
                    C600 110 620 62 650 78
                    C675 88 690 65 700 58
                  "
                  className="chart-line"
                />

              </svg>

            </div>


            <div className="chart-x-axis">
              <span>Aug 10</span>
              <span>Aug 17</span>
              <span>Aug 24</span>
              <span>Aug 31</span>
              <span>Sep 7</span>
            </div>

          </div>


          {/* AI INSIGHT */}
          <div className="ai-card">

            <div className="ai-header">
              <div className="ai-icon">✦</div>

              <div>
                <span>AI INSIGHT</span>
                <h2>Your biggest opportunity</h2>
              </div>
            </div>

            <p className="ai-description">
              Your transportation emissions are 38% of your
              total footprint. Switching two weekly car trips
              to public transport could reduce your footprint
              by approximately <strong>48 kg CO₂</strong> per month.
            </p>

            <div className="ai-impact">
              <div>
                <span>Potential reduction</span>
                <strong>48 kg CO₂</strong>
              </div>

              <div>
                <span>Estimated impact</span>
                <strong>12%</strong>
              </div>
            </div>

            <button className="ai-button">
              View personalized recommendations
              <span>→</span>
            </button>

          </div>

        </section>


        {/* ================= SECOND ROW ================= */}
        <section className="dashboard-grid secondary-grid">

          {/* EMISSIONS */}
          <div className="card emissions-card">

            <div className="card-header">

              <div>
                <p className="card-eyebrow">
                  BREAKDOWN
                </p>

                <h2>
                  Emissions by Category
                </h2>
              </div>

              <button className="text-button">
                View details →
              </button>

            </div>


            <div className="emissions-content">

              <div className="donut-wrapper">

                <div className="donut-chart">
                  <div className="donut-center">
                    <strong>2.84</strong>
                    <span>tCO₂e</span>
                  </div>
                </div>

              </div>


              <div className="emission-list">

                {emissions.map((item) => (

                  <div
                    className="emission-item"
                    key={item.name}
                  >

                    <div className="emission-name">
                      <span className="emission-icon">
                        {item.icon}
                      </span>

                      <span>
                        {item.name}
                      </span>
                    </div>

                    <strong>
                      {item.value}%
                    </strong>

                  </div>

                ))}

              </div>

            </div>

          </div>


          {/* ECO SCORE */}
          <div className="card eco-score-card">

            <div className="card-header">

              <div>
                <p className="card-eyebrow">
                  YOUR SCORE
                </p>

                <h2>
                  Eco Score
                </h2>
              </div>

              <span className="score-trend">
                ↑ 8.2%
              </span>

            </div>


            <div className="score-content">

              <div className="score-ring">

                <div className="score-inner">
                  <strong>84</strong>
                  <span>/ 100</span>
                </div>

              </div>


              <div className="score-info">

                <div className="score-level">
                  <span className="status-dot"></span>
                  Excellent
                </div>

                <p>
                  You're performing better than
                  <strong> 78%</strong> of EcoTrack users.
                </p>

                <button className="text-button">
                  Improve your score →
                </button>

              </div>

            </div>

          </div>

        </section>


        {/* ================= GOALS + CHALLENGE ================= */}
        <section className="dashboard-grid tertiary-grid">

          {/* GOALS */}
          <div className="card goals-card">

            <div className="card-header">

              <div>
                <p className="card-eyebrow">
                  PROGRESS
                </p>

                <h2>
                  Active Goals
                </h2>
              </div>

              <button className="text-button">
                View all →
              </button>

            </div>


            <div className="goals-list">

              {goals.map((goal) => (

                <div
                  className="goal-item"
                  key={goal.title}
                >

                  <div className="goal-icon">
                    {goal.icon}
                  </div>

                  <div className="goal-main">

                    <div className="goal-title-row">

                      <strong>
                        {goal.title}
                      </strong>

                      <span>
                        {goal.progress}%
                      </span>

                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-value"
                        style={{
                          width: `${goal.progress}%`,
                        }}
                      ></div>
                    </div>

                    <div className="goal-meta">
                      <span>
                        {goal.current}
                      </span>

                      <span>
                        Target: {goal.target}
                      </span>
                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* CHALLENGE */}
          <div className="challenge-card">

            <div className="challenge-label">
              FEATURED CHALLENGE
            </div>

            <div className="challenge-icon">
              🚲
            </div>

            <h2>
              Cycle To Work
            </h2>

            <p>
              Replace short car trips with cycling
              and help reduce transportation emissions.
            </p>

            <div className="challenge-stats">

              <div>
                <strong>1,284</strong>
                <span>Participants</span>
              </div>

              <div>
                <strong>7 days</strong>
                <span>Remaining</span>
              </div>

            </div>

            <button className="challenge-button">
              Join Challenge
              <span>→</span>
            </button>

          </div>

        </section>


        {/* ================= RECENT ACTIVITY ================= */}
        <section className="card activity-card">

          <div className="card-header">

            <div>
              <p className="card-eyebrow">
                ACTIVITY
              </p>

              <h2>
                Recent Activity
              </h2>
            </div>

            <button className="text-button">
              View history →
            </button>

          </div>


          <div className="activity-list">

            {activities.map((activity) => (

              <div
                className="activity-item"
                key={`${activity.title}-${activity.time}`}
              >

                <div className="activity-icon">
                  {activity.icon}
                </div>

                <div className="activity-main">

                  <strong>
                    {activity.title}
                  </strong>

                  <span>
                    {activity.category}
                  </span>

                </div>

                <div className="activity-value">
                  <strong>
                    {activity.value}
                  </strong>

                  <span>
                    {activity.time}
                  </span>
                </div>

              </div>

            ))}

          </div>

        </section>

      </main>

    </div>
  );
}

export default dashboard;