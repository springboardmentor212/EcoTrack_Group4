import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./challenges.css";
import {
    Globe,
    Home as HomeIcon,
    Leaf,
    Target,
    ShieldCheck,
    LayoutDashboard,
    FileText,
    User,
    Bell,
    ChevronDown,
    Recycle,
    Bike,
    MapPin,
    Zap,
    TreePine,
    Award,
    Flame,
} from "lucide-react";

const TABS = [
    { key: "all", label: "All Challenges" },
    { key: "active", label: "Active (2)" },
    { key: "completed", label: "Completed" },
];

const challenges = [
    {
        id: "plastic-free-week",
        title: "Plastic-Free Week Challenge",
        tag: "Zero Waste",
        participants: "1,420 Participants",
        description:
            "Avoid using single-use plastics for 7 consecutive days to earn 250 Eco Points.",
        icon: Recycle,
        color: "green",
        percent: 70,
        progressLabel: "5/7 Days",
        status: "active",
    },
    {
        id: "cycle-to-work",
        title: "Cycle To Work Drive",
        tag: "Transportation",
        participants: "890 Participants",
        description:
            "Commute by bicycle or walk for at least 15 km total this week.",
        icon: Bike,
        color: "blue",
        percent: 40,
        progressLabel: "6/15 km",
        status: "active",
    },
    {
        id: "tree-plantation-2026",
        title: "Tree Plantation Drive 2026",
        tag: "Climate Action",
        participants: "2,150 Participants",
        description:
            "Plant 2 trees or sponsor a sapling through EcoTrack community partner network.",
        icon: MapPin,
        color: "amber",
        percent: 20,
        progressLabel: "1/5 Trees",
        status: "upcoming",
    },
    {
        id: "energy-saving",
        title: "Energy Saving Challenge",
        tag: "Energy Saving",
        participants: "640 Participants",
        description:
            "Lower household grid consumption by 10% during peak hours for 5 days.",
        icon: Zap,
        color: "orange",
        percent: 60,
        progressLabel: "3/5 Days",
        status: "upcoming",
    },
];

const badges = [
    { icon: TreePine, color: "green" },
    { icon: Bike, color: "blue" },
    { icon: Award, color: "amber" },
    { icon: Flame, color: "orange" },
];

const leaderboard = [
    { rank: 1, name: "Khushnood Khan", title: "Climate Elite", initials: "KK", points: "3,420 pts", highlight: "top" },
    { rank: 2, name: "Manpreet Sodhi", title: "Eco Warrior", initials: "MS", points: "2,980 pts" },
    { rank: 3, name: "Moazzam Husain", title: "Eco Warrior", initials: "MH", points: "2,540 pts" },
    { rank: 7, name: "Meenakshi", title: "Sustainability Champion", initials: "M", points: "1,850 pts", highlight: "me" },
];

export default function ChallengesPage() {
    const [activeTab, setActiveTab] = useState("all");

    const visibleChallenges = challenges.filter((c) => {
        if (activeTab === "all") return true;
        if (activeTab === "active") return c.status === "active";
        if (activeTab === "completed") return c.status === "completed";
        return true;
    });

    return (
        <div className="challenges-app">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <Globe size={19} />
                    <span>EcoTrack</span>
                </div>

                <nav className="sidebar-menu">
                    <Link to="/home" className="menu-item">
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

                    <Link to ="/challenges" className="menu-item active">
                        <ShieldCheck size={16} />
                        <span>Challenges</span>
                    </Link>

                    <a href="#" className="menu-item">
                        <LayoutDashboard size={16} />
                        <span>Dashboard</span>
                    </a>

                    <a href="#" className="menu-item">
                        <FileText size={16} />
                        <span>Reports</span>
                    </a>

                    <Link to="/profile" className="menu-item">
                        <User size={16} />
                        <span>Profile</span>
                    </Link>
                </nav>
            </aside>

            {/* Main content */}
            <main className="main-content">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1>Community Challenges</h1>
                        <p>Join eco-drives, earn badges, and climb the leaderboard</p>
                    </div>
                    <div className="header-actions">
                        <button className="icon-button">
                            <Bell size={16} />
                        </button>
                        <div className="user-chip">
                            <span className="user-chip-avatar">
                                <User size={12} />
                            </span>
                            User
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </div>

                {/* Body: challenges list + right rail, divided into two columns */}
                <div className="content-grid">
                    {/* Challenges column */}
                    <section>
                        <div className="tab-bar">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    className={`tab-btn${activeTab === tab.key ? " active" : ""}`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="challenge-list">
                            {visibleChallenges.map(
                                ({
                                    id,
                                    title,
                                    tag,
                                    participants,
                                    description,
                                    icon: Icon,
                                    color,
                                    percent,
                                    progressLabel,
                                }) => (
                                    <div className="challenge-card" key={id}>
                                        <div className={`challenge-icon bg-${color}`}>
                                            <Icon size={18} className={`text-${color}`} />
                                        </div>

                                        <div className="challenge-body">
                                            <div className="challenge-top">
                                                <h3>{title}</h3>
                                                <span className={`challenge-percent text-${color}`}>
                                                    {percent}% Done
                                                </span>
                                            </div>

                                            <div className="challenge-meta">
                                                <span className={`tag-pill bg-${color} text-${color}`}>
                                                    {tag}
                                                </span>
                                                <span className="dot">•</span>
                                                <span>{participants}</span>
                                            </div>

                                            <p className="challenge-desc">{description}</p>

                                            <div className="challenge-progress-row">
                                                <div className="progress-track">
                                                    <div
                                                        className={`progress-fill fill-${color}`}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <span className={`progress-label text-${color}`}>
                                                    {progressLabel}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                            {visibleChallenges.length === 0 && (
                                <p className="empty-state">No challenges in this category yet.</p>
                            )}
                        </div>
                    </section>

                    {/* Right rail */}
                    <aside className="right-rail">
                        {/* Eco Rewards */}
                        <div className="panel">
                            <h2>My Eco Rewards</h2>

                            <div className="score-box">
                                <div>
                                    <p className="score-label">Total Eco Score Points</p>
                                    <p className="score-value">
                                        1,850 <span className="score-unit">PTS</span>
                                    </p>
                                </div>
                                <span className="level-pill">Lvl 4 Eco</span>
                            </div>

                            <p className="badges-label">Earned Sustainability Badges</p>
                            <div className="badges-row">
                                {badges.map(({ icon: Icon, color }, i) => (
                                    <span key={i} className={`badge-circle bg-${color}`}>
                                        <Icon size={16} className={`text-${color}`} />
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Leaderboard */}
                        <div className="panel">
                            <h2>Community Leaderboard</h2>
                            <p className="panel-subtitle">Top individual eco-impact rankings</p>

                            <div className="leaderboard-list">
                                {leaderboard.map(({ rank, name, title, initials, points, highlight }) => (
                                    <div
                                        className={`leaderboard-row${highlight ? ` ${highlight}` : ""}`}
                                        key={rank}
                                    >
                                        <span className="lb-rank">#{rank}</span>
                                        <span
                                            className={`lb-avatar${highlight === "top" ? " gold" : ""}${highlight === "me" ? " me" : ""
                                                }`}
                                        >
                                            {initials}
                                        </span>
                                        <div className="lb-info">
                                            <p className="lb-name">{name}</p>
                                            <p className="lb-title">{title}</p>
                                        </div>
                                        <span className="lb-points">{points}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}