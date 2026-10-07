import { useEffect, useMemo, useRef, useState } from "react";
import "./Challenges.css";

/* ---------- helpers ---------- */
const TOTAL_LEVELS = 10;

const levelDate = (level) => new Date(2026, 9, 6 + 7 * (level - 1)); // Level 1 = Oct 06, 2026
const fmt = (d) =>
  d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
const statusFor = (level) => (levelDate(level) <= new Date() ? "Unlocked" : "Locked");

const SEED = [
  ["Bring Cloth Bag for Shopping", "Say No to Plastic Straws", "Use Reusable Water Bottle", "Avoid Plastic Food Containers"],
  ["Carry a Reusable Cup", "Segregate Household Waste", "Switch Off Unused Lights", "Take a Shorter Shower"],
  ["Walk or Cycle to College", "Carpool for a Day", "Plant a Sapling", "Avoid Single-Use Cutlery"],
  ["Compost Kitchen Waste", "Buy Local Produce", "Go Meatless for a Day", "Unplug Idle Chargers"],
  ["Repair Instead of Replace", "Donate Old Clothes", "Use Both Sides of Paper", "Carry Your Own Cutlery"],
  ["Use Public Transport", "Air-Dry Your Laundry", "Switch to LED Bulbs", "Collect Rainwater"],
  ["Digital Declutter Day", "Skip Bottled Drinks", "Thrift an Outfit", "Clean Up a Public Spot"],
  ["Start a Balcony Garden", "Cook with Leftovers", "Fix a Leaky Tap", "Say No to Receipts"],
  ["Host a Swap Meet", "Track Your Energy Use", "Choose Refill Stores", "Make Eco-Bricks"],
  ["Teach a Friend", "Plastic-Free Day", "Join a Cleanup Drive", "Share Your Eco Pledge"],
];

let nextId = 1;
const initialChallenges = SEED.flatMap((titles, i) =>
  titles.map((title) => ({ id: nextId++, level: i + 1, title, points: 50 }))
);

/* ---------- icons ---------- */
const Svg = ({ children, size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
);
const LeafIcon = (p) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="M20 3c-9 0-15 4-15 11 0 1.6.4 3 1.2 4.2C7.5 14.5 10 11.5 14 9.5c-3 2.7-5 5.7-6 9.5 1.2.6 2.5 1 4 1 6 0 8-5.500 8-17Z" />
  </Svg>
);
const UsersIcon = (p) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.600 3.100-6 7-6s7 2.400 7 6v1H2z" />
    <circle cx="17.500" cy="9" r="2.600" /><path d="M17.500 14c2.800 0 4.500 1.800 4.500 4.500V20h-4v-1.500c0-1.800-.5-3.200-1.600-4.200.3-.2.7-.3 1.100-.3Z" />
  </Svg>
);
const SproutIcon = (p) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="M12 12c0-3.500-2.200-5.500-6-5.500 0 3.500 2.200 5.500 6 5.500Zm0 0c0-4 2.500-6.500 7-6.500 0 4-2.500 6.500-7 6.500Zm-1 1h2v3h-2z" />
    <path d="M4 17h16l-1.500 4h-13z" />
  </Svg>
);
const BarsIcon = (p) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <rect x="3" y="12" width="4.500" height="9" rx="1.200" /><rect x="9.800" y="7" width="4.500" height="14" rx="1.200" />
    <rect x="16.500" y="3" width="4.500" height="18" rx="1.200" />
  </Svg>
);
const CalendarIcon = (p) => (
  <Svg {...p} strokeWidth="2.200"><rect x="3.500" y="5" width="17" height="15.500" rx="3" />
    <path d="M3.500 10h17M8 3v4M16 3v4" /></Svg>
);
const TrophyIcon = (p) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="M7 3h10v6a5 5 0 0 1-10 0V3Z" /><path d="M7 5H3.500v1.500A4 4 0 0 0 7.500 10.500L7 8.500c-1.200-.2-2-1-2-2H7V5Zm10 0h3.500v1.500a4 4 0 0 1-4 4L17 8.500c1.200-.2 2-1 2-2h-2V5Z" />
    <path d="M11 14h2v3h3v3H8v-3h3z" />
  </Svg>
);
const PlusIcon = (p) => (<Svg {...p} strokeWidth="2.600"><path d="M12 5v14M5 12h14" /></Svg>);
const ChevronDown = (p) => (<Svg {...p} strokeWidth="2.600"><path d="m6 9 6 6 6-6" /></Svg>);
const ChevronLeft = (p) => (<Svg {...p} strokeWidth="2.600"><path d="m15 6-6 6 6 6" /></Svg>);
const ChevronRight = (p) => (<Svg {...p} strokeWidth="2.600"><path d="m9 6 6 6-6 6" /></Svg>);
const CloseIcon = (p) => (<Svg {...p} strokeWidth="2.200"><path d="M6 6l12 12M18 6 6 18" /></Svg>);
const BoltIcon = (p) => (<Svg {...p} fill="currentColor" stroke="none"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></Svg>);
const MenuIcon = (p) => (<Svg {...p} strokeWidth="2.400"><path d="M4 7h16M4 12h16M4 17h16" /></Svg>);
const UserCircle = (p) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path fillRule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a3.200 3.200 0 1 1 0 6.400A3.200 3.200 0 0 1 12 6Zm0 14.200a8 8 0 0 1-6-2.700c.2-2 3.100-3.100 6-3.100s5.800 1.100 6 3.100a8 8 0 0 1-6 2.700Z" />
  </Svg>
);

/* ---------- Challenge modal (create + edit) ---------- */
function ChallengeModal({ challenge, defaultLevel, onClose, onSave }) {
  const editing = Boolean(challenge);
  const [level, setLevel] = useState(challenge?.level ?? defaultLevel);
  const [title, setTitle] = useState(challenge?.title ?? "");
  const [points, setPoints] = useState(challenge ? String(challenge.points) : "");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!title.trim()) errs.title = "Enter a challenge title.";
    const pts = parseInt(points, 10);
    if (!points.trim() || Number.isNaN(pts) || pts <= 0) errs.points = "Enter reward points above 0.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ id: challenge?.id, level: Number(level), title: title.trim(), points: pts });
  };

  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="modal-title" noValidate>
        <div className="modal-head">
          <div>
            <h2 id="modal-title">{editing ? "Edit Challenge" : "Create New Challenge"}</h2>
            <p>{editing ? "Update the details of this challenge" : "Add a new challenge to any existing level"}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><CloseIcon size={22} /></button>
        </div>

        <div className="modal-body">
          <label className="field">
            <span className="label">Select Level / Week</span>
            <span className="select-wrap">
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((l) => (
                  <option key={l} value={l}>Level {l} (Week {l} - {fmt(levelDate(l))})</option>
                ))}
              </select>
              <ChevronDown size={18} />
            </span>
          </label>

          <label className="field">
            <span className="label">Challenge Title</span>
            <input type="text" value={title} placeholder="e.g., Plastic-Free Shopping"
              onChange={(e) => setTitle(e.target.value)} className={errors.title ? "invalid" : ""} autoFocus />
            {errors.title && <span className="error">{errors.title}</span>}
          </label>

          <label className="field">
            <span className="label">Reward Points</span>
            <input type="text" inputMode="numeric" value={points} placeholder="e.g., 50 XP"
              onChange={(e) => setPoints(e.target.value.replace(/[^\d]/g, ""))} className={errors.points ? "invalid" : ""} />
            {errors.points && <span className="error">{errors.points}</span>}
          </label>

          <div className="info"><BoltIcon size={18} /> Start Date &amp; Status will be auto-calculated!</div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">{editing ? "Save Changes" : "Save Task"}</button>
        </div>
      </form>
    </div>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [challenges, setChallenges] = useState(initialChallenges);
  const [page, setPage] = useState(1); // 1 page = 1 level
  const [nav, setNav] = useState("Challenges");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [modal, setModal] = useState(null); // null | { challenge? }
  const [toast, setToast] = useState("");
  const userRef = useRef(null);

  useEffect(() => {
    const close = (e) => userRef.current && !userRef.current.contains(e.target) && setUserMenu(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const total = challenges.length;
  const perLevel = Math.round(total / TOTAL_LEVELS);
  const rows = useMemo(() => challenges.filter((c) => c.level === page), [challenges, page]);

  // sliding window of page numbers (max 5)
  const pages = useMemo(() => {
    const start = Math.max(1, Math.min(page - 2, TOTAL_LEVELS - 4));
    return Array.from({ length: Math.min(5, TOTAL_LEVELS) }, (_, i) => start + i);
  }, [page]);

  const handleSave = ({ id, level, title, points }) => {
    if (id) {
      setChallenges((list) => list.map((c) => (c.id === id ? { ...c, level, title, points } : c)));
      setToast("Challenge updated");
    } else {
      setChallenges((list) => [...list, { id: nextId++, level, title, points }]);
      setToast(`Challenge added to Level ${level}`);
    }
    setPage(level);
    setModal(null);
  };

  const navItems = [
    { name: "Users", icon: <UsersIcon size={20} /> },
    { name: "Challenges", icon: <SproutIcon size={20} /> },
    { name: "Reports", icon: <BarsIcon size={20} /> },
  ];

  return (
    <div className="app">
      {sidebarOpen && <div className="scrim" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-logo"><LeafIcon size={22} /></span>
          <span className="brand-name">EcoTrack</span>
        </div>
        <span className="role-pill">ADMIN</span>
        <nav>
          {navItems.map((item) => (
            <button key={item.name} className={`nav-item ${nav === item.name ? "active" : ""}`}
              onClick={() => { setNav(item.name); setSidebarOpen(false); }}>
              {item.icon}<span>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><MenuIcon size={22} /></button>

          <div className="title-block">
            <div className="crumbs">Admin / <b>{nav}</b></div>
            {nav === "Challenges" && <div className="crumbs-sub">{TOTAL_LEVELS} Levels • {total} Challenges Total</div>}
            <h1>{nav === "Challenges" ? "Challenge Management" : `${nav} Management`}</h1>
          </div>

          <div className="actions">
            {nav === "Challenges" && (
              <button className="btn btn-primary btn-lg" onClick={() => setModal({})}>
                <PlusIcon size={18} /> <span className="btn-label">New Challenge</span>
              </button>
            )}
            <div className="user" ref={userRef}>
              <button className="user-chip" onClick={() => setUserMenu((v) => !v)} aria-haspopup="menu" aria-expanded={userMenu}>
                <span className="avatar"><UserCircle size={30} /></span>
                <span className="user-name">Admin</span>
                <ChevronDown size={16} />
              </button>
              {userMenu && (
                <div className="menu" role="menu">
                  <button role="menuitem" onClick={() => setUserMenu(false)}>Profile</button>
                  <button role="menuitem" onClick={() => setUserMenu(false)}>Settings</button>
                  <button role="menuitem" onClick={() => setUserMenu(false)}>Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {nav !== "Challenges" ? (
          <section className="panel empty">{nav} page coming soon.</section>
        ) : (
          <>
            <section className="stats">
              <div className="stat">
                <span className="stat-icon"><LeafIcon size={22} /></span>
                <div><strong>{total}</strong><span>Total Challenges</span></div>
              </div>
              <div className="stat">
                <span className="stat-icon"><CalendarIcon size={22} /></span>
                <div><strong>{TOTAL_LEVELS}</strong><span>Total Levels (Weeks)</span></div>
              </div>
              <div className="stat">
                <span className="stat-icon"><TrophyIcon size={22} /></span>
                <div><strong>{perLevel}</strong><span>Challenges / Level</span></div>
              </div>
            </section>

            <section className="panel">
              <h2 className="panel-title">Level {page} Challenges Schedule</h2>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Level / Week</th><th>Challenge Title</th><th>Start Date</th><th>Default Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr><td colSpan="5" className="no-rows">No challenges in this level yet.</td></tr>
                    )}
                    {rows.map((c) => {
                      const status = statusFor(c.level);
                      return (
                        <tr key={c.id}>
                          <td data-label="Level / Week"><span className="level-pill">Level {c.level}</span></td>
                          <td data-label="Challenge" className="c-title">{c.title}</td>
                          <td data-label="Start Date">{fmt(levelDate(c.level))}</td>
                          <td data-label="Status">
                            <span className={`badge ${status === "Unlocked" ? "ok" : "lock"}`}>{status}</span>
                          </td>
                          <td data-label="Action">
                            <button className="link-btn" onClick={() => setModal({ challenge: c })}>Edit / View</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <footer className="panel-foot">
                <span className="foot-text">Showing Level {page} challenges (Page {page} of {TOTAL_LEVELS} Levels)</span>
                <div className="pager">
                  <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
                  {pages.map((n) => (
                    <button key={n} className={`page-btn ${n === page ? "current" : ""}`} onClick={() => setPage(n)}
                      aria-current={n === page ? "page" : undefined}>{n}</button>
                  ))}
                  <button className="page-btn" onClick={() => setPage((p) => Math.min(TOTAL_LEVELS, p + 1))} disabled={page === TOTAL_LEVELS} aria-label="Next page"><ChevronRight size={16} /></button>
                </div>
              </footer>
            </section>
          </>
        )}
      </main>

      {modal && (
        <ChallengeModal
          challenge={modal.challenge}
          defaultLevel={Math.min(TOTAL_LEVELS, page + 1)}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}