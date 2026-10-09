
import { useEffect, useMemo, useState } from "react";
import "./Challenges.css";
import "../AdminLayout.css";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

const TOTAL_LEVELS = 10;

const levelDate = (level) =>
  new Date(2026, 9, 6 + 7 * (level - 1));

const fmt = (date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

const statusFor = (level) =>
  levelDate(level) <= new Date() ? "Unlocked" : "Locked";

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

const initialChallenges = SEED.flatMap((titles, index) =>
  titles.map((title) => ({
    id: nextId++,
    level: index + 1,
    title,
    points: 50,
  }))
);

function ChallengeModal({ challenge, defaultLevel, onClose, onSave }) {
  const editing = Boolean(challenge);

  const [level, setLevel] = useState(
    challenge?.level ?? defaultLevel
  );
  const [title, setTitle] = useState(challenge?.title ?? "");
  const [points, setPoints] = useState(
    challenge ? String(challenge.points) : ""
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const submit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!title.trim()) {
      nextErrors.title = "Enter a challenge title.";
    }

    const numericPoints = Number.parseInt(points, 10);

    if (!points.trim() || Number.isNaN(numericPoints) || numericPoints <= 0) {
      nextErrors.points = "Enter reward points above 0.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    onSave({
      id: challenge?.id,
      level: Number(level),
      title: title.trim(),
      points: numericPoints,
    });
  };

  return (
    <div
      className="backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        className="modal"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="challenge-modal-title"
        noValidate
      >
        <div className="modal-head">
          <div>
            <h2 id="challenge-modal-title">
              {editing ? "Edit Challenge" : "Create New Challenge"}
            </h2>
            <p>
              {editing
                ? "Update the details of this challenge"
                : "Add a new challenge to any existing level"}
            </p>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <label className="field">
            <span className="label">Select Level / Week</span>

            <span className="select-wrap">
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
              >
                {Array.from(
                  { length: TOTAL_LEVELS },
                  (_, index) => index + 1
                ).map((itemLevel) => (
                  <option key={itemLevel} value={itemLevel}>
                    Level {itemLevel} (Week {itemLevel} -{" "}
                    {fmt(levelDate(itemLevel))})
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className="field">
            <span className="label">Challenge Title</span>

            <input
              type="text"
              value={title}
              placeholder="e.g., Plastic-Free Shopping"
              onChange={(event) => setTitle(event.target.value)}
              className={errors.title ? "invalid" : ""}
              autoFocus
            />

            {errors.title && (
              <span className="error">{errors.title}</span>
            )}
          </label>

          <label className="field">
            <span className="label">Reward Points</span>

            <input
              type="text"
              inputMode="numeric"
              value={points}
              placeholder="e.g., 50 XP"
              onChange={(event) =>
                setPoints(event.target.value.replace(/[^\d]/g, ""))
              }
              className={errors.points ? "invalid" : ""}
            />

            {errors.points && (
              <span className="error">{errors.points}</span>
            )}
          </label>

          <div className="info">
            ⚡ Start Date &amp; Status will be auto-calculated!
          </div>
        </div>

        <div className="modal-foot">
          <button
            type="button"
            className="btn btn-light"
            onClick={onClose}
          >
            Cancel
          </button>

          <button type="submit" className="btn btn-primary">
            {editing ? "Save Changes" : "Save Task"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Challenges() {
  const [challenges, setChallenges] = useState(initialChallenges);
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");

  const total = challenges.length;
  const perLevel = Math.round(total / TOTAL_LEVELS);

  const rows = useMemo(
    () => challenges.filter((challenge) => challenge.level === page),
    [challenges, page]
  );

  const pages = useMemo(() => {
    const start = Math.max(
      1,
      Math.min(page - 2, TOTAL_LEVELS - 4)
    );

    return Array.from(
      { length: Math.min(5, TOTAL_LEVELS) },
      (_, index) => start + index
    );
  }, [page]);

  useEffect(() => {
    if (!toast) return undefined;

    const timeout = setTimeout(() => setToast(""), 2600);

    return () => clearTimeout(timeout);
  }, [toast]);

  const handleSave = ({ id, level, title, points }) => {
    if (id) {
      setChallenges((items) =>
        items.map((item) =>
          item.id === id
            ? { ...item, level, title, points }
            : item
        )
      );

      setToast("Challenge updated");
    } else {
      setChallenges((items) => [
        ...items,
        { id: nextId++, level, title, points },
      ]);

      setToast(`Challenge added to Level ${level}`);
    }

    setPage(level);
    setModal(null);
  };

  return (
    <div className="app admin-layout">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main admin-layout-main">
        <AdminHeader
          title="Challenges"
          subtitle={`${TOTAL_LEVELS} Levels • ${total} Challenges Total`}
          onMenuClick={() => setSidebarOpen(true)}
          action={
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setModal({})}
            >
              <span aria-hidden="true">＋</span>
              <span className="btn-label">New Challenge</span>
            </button>
          }
        />

        <section className="stats">
          <div className="stat">
            <span className="stat-icon" aria-hidden="true">♧</span>
            <div>
              <strong>{total}</strong>
              <span>Total Challenges</span>
            </div>
          </div>

          <div className="stat">
            <span className="stat-icon" aria-hidden="true">▦</span>
            <div>
              <strong>{TOTAL_LEVELS}</strong>
              <span>Total Levels (Weeks)</span>
            </div>
          </div>

          <div className="stat">
            <span className="stat-icon" aria-hidden="true">🏆</span>
            <div>
              <strong>{perLevel}</strong>
              <span>Challenges / Level</span>
            </div>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">
            Level {page} Challenges Schedule
          </h2>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Level / Week</th>
                  <th>Challenge Title</th>
                  <th>Start Date</th>
                  <th>Default Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan="5" className="no-rows">
                      No challenges in this level yet.
                    </td>
                  </tr>
                )}

                {rows.map((challenge) => {
                  const status = statusFor(challenge.level);

                  return (
                    <tr key={challenge.id}>
                      <td data-label="Level / Week">
                        <span className="level-pill">
                          Level {challenge.level}
                        </span>
                      </td>

                      <td data-label="Challenge" className="c-title">
                        {challenge.title}
                      </td>

                      <td data-label="Start Date">
                        {fmt(levelDate(challenge.level))}
                      </td>

                      <td data-label="Status">
                        <span
                          className={`badge ${
                            status === "Unlocked" ? "ok" : "lock"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td data-label="Action">
                        <button
                          className="link-btn"
                          onClick={() => setModal({ challenge })}
                        >
                          Edit / View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <footer className="panel-foot">
            <span className="foot-text">
              Showing Level {page} challenges (Page {page} of{" "}
              {TOTAL_LEVELS} Levels)
            </span>

            <div className="pager">
              <button
                className="page-btn"
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                disabled={page === 1}
                aria-label="Previous page"
              >
                ‹
              </button>

              {pages.map((number) => (
                <button
                  key={number}
                  className={`page-btn ${
                    number === page ? "current" : ""
                  }`}
                  onClick={() => setPage(number)}
                  aria-current={
                    number === page ? "page" : undefined
                  }
                >
                  {number}
                </button>
              ))}

              <button
                className="page-btn"
                onClick={() =>
                  setPage((current) =>
                    Math.min(TOTAL_LEVELS, current + 1)
                  )
                }
                disabled={page === TOTAL_LEVELS}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </footer>
        </section>
      </main>

      {modal && (
        <ChallengeModal
          challenge={modal.challenge}
          defaultLevel={Math.min(TOTAL_LEVELS, page + 1)}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
