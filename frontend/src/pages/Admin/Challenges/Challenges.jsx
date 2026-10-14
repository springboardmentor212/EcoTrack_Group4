import { useEffect, useMemo, useState } from "react";
import "./Challenges.css";
import "../AdminLayout.css";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

const TOTAL_LEVELS = 10;

const statusFor = (level) => (level === 1 ? "Unlocked" : "Locked");

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

/* ----------------------------------------------------
   1. VIEW CHALLENGE DETAILS MODAL
---------------------------------------------------- */
function ViewChallengeModal({ challenge, onClose }) {
  if (!challenge) return null;

  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <h2>Challenge Details</h2>
            <p>{challenge.isWeekly ? "Weekly Drive Challenge" : `Level ${challenge.level} Schedule & Parameters`}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body" style={{ gap: "16px" }}>
          <div className="field">
            <span className="label">Challenge Title</span>
            <div className="detail-box">{challenge.title}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="field">
              <span className="label">Category</span>
              <div className="detail-box">{challenge.category || "Transport"}</div>
            </div>

            <div className="field">
              <span className="label">Target Requirement</span>
              <div className="detail-box">{challenge.targetGoal || 1} {challenge.targetUnit || "trips"}</div>
            </div>
          </div>

          {challenge.isWeekly && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="field">
                <span className="label">Start Date</span>
                <div className="detail-box">{formatDate(challenge.startDate)}</div>
              </div>

              <div className="field">
                <span className="label">End Date (Expiration)</span>
                <div className="detail-box">{formatDate(challenge.endDate)}</div>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="field">
              <span className="label">Reward Points / Badge</span>
              <div className="detail-box">🪙 {challenge.points} Points • {challenge.badgeName || "Eco Badge"}</div>
            </div>

            <div className="field">
              <span className="label">Challenge Type</span>
              <div className="detail-box">
                <span className={`badge ${challenge.isWeekly ? "ok" : "lock"}`}>
                  {challenge.isWeekly ? "Weekly Drive" : `Level ${challenge.level}`}
                </span>
              </div>
            </div>
          </div>

          <div className="info" style={{ marginTop: "6px" }}>
            🌱 Active eco-challenge bound to system carbon logs tracking.
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------
   2. CREATE WEEKLY CHALLENGE MODAL (With Date Controls)
---------------------------------------------------- */
function CreateChallengeModal({ onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Waste");
  const [targetGoal, setTargetGoal] = useState("5");
  const [targetUnit, setTargetUnit] = useState("trips");
  const [points, setPoints] = useState("100");
  const [badgeName, setBadgeName] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextWeekStr);
  const [errors, setErrors] = useState({});

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!title.trim()) nextErrors.title = "Enter a challenge title.";
    const numericPoints = Number.parseInt(points, 10);
    if (!points.trim() || Number.isNaN(numericPoints) || numericPoints <= 0) {
      nextErrors.points = "Enter reward points above 0.";
    }

    const numericGoal = Number.parseInt(targetGoal, 10);
    if (!targetGoal.trim() || Number.isNaN(numericGoal) || numericGoal <= 0) {
      nextErrors.targetGoal = "Enter valid target value.";
    }

    if (!startDate || !endDate) {
      nextErrors.dates = "Select valid start and end dates.";
    } else if (new Date(endDate) < new Date(startDate)) {
      nextErrors.dates = "End date must be after start date.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave({
      title: title.trim(),
      category,
      targetGoal: numericGoal,
      targetUnit,
      points: numericPoints,
      badgeName: badgeName.trim() || `${title.trim()} Badge`,
      startDate,
      endDate,
    });
  };

  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit} noValidate>
        <div className="modal-head">
          <div>
            <h2>Publish Weekly Drive Challenge</h2>
            <p>Creates a time-bound weekly challenge for all enrolled users</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <label className="field">
            <span className="label">Weekly Challenge Title</span>
            <input
              type="text"
              value={title}
              placeholder="e.g., Plastic Free Weekend Drive"
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? "invalid" : ""}
            />
            {errors.title && <span className="error">{errors.title}</span>}
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <label className="field">
              <span className="label">Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            <label className="field">
              <span className="label">End Date (Expiration)</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>
          {errors.dates && <span className="error" style={{ color: "#ef4444", fontSize: "12px" }}>{errors.dates}</span>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <label className="field">
              <span className="label">Category</span>
              <span className="select-wrap">
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Waste">Waste</option>
                  <option value="Transport">Transport</option>
                  <option value="Energy">Energy</option>
                  <option value="Food">Food</option>
                  <option value="Water">Water</option>
                </select>
              </span>
            </label>

            <label className="field">
              <span className="label">Target Unit</span>
              <span className="select-wrap">
                <select value={targetUnit} onChange={(e) => setTargetUnit(e.target.value)}>
                  <option value="trips">Trips / Logs</option>
                  <option value="km">Kilometers (km)</option>
                  <option value="liters">Liters (L)</option>
                  <option value="days">Days</option>
                  <option value="kg CO2e">kg CO2e</option>
                </select>
              </span>
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <label className="field">
              <span className="label">Target Goal ({targetUnit})</span>
              <input
                type="text"
                value={targetGoal}
                placeholder="e.g., 5"
                onChange={(e) => setTargetGoal(e.target.value.replace(/[^\d]/g, ""))}
                className={errors.targetGoal ? "invalid" : ""}
              />
              {errors.targetGoal && <span className="error">{errors.targetGoal}</span>}
            </label>

            <label className="field">
              <span className="label">Reward Eco Points</span>
              <input
                type="text"
                value={points}
                placeholder="e.g., 100"
                onChange={(e) => setPoints(e.target.value.replace(/[^\d]/g, ""))}
                className={errors.points ? "invalid" : ""}
              />
              {errors.points && <span className="error">{errors.points}</span>}
            </label>
          </div>

          <label className="field">
            <span className="label">Badge Name</span>
            <input
              type="text"
              value={badgeName}
              placeholder="e.g., Weekly Plastic Buster Badge"
              onChange={(e) => setBadgeName(e.target.value)}
            />
          </label>

          <div className="info">⚡ Weekly Drives will be active for users strictly between the specified Start & End Dates!</div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Publish Weekly Drive</button>
        </div>
      </form>
    </div>
  );
}

/* ----------------------------------------------------
   3. EDIT CHALLENGE MODAL
---------------------------------------------------- */
function EditChallengeModal({ challenge, onClose, onUpdate }) {
  const [title, setTitle] = useState(challenge.title || "");
  const [category, setCategory] = useState(challenge.category || "Transport");
  const [targetGoal, setTargetGoal] = useState(String(challenge.targetGoal || 5));
  const [targetUnit, setTargetUnit] = useState(challenge.targetUnit || "trips");
  const [points, setPoints] = useState(String(challenge.points || 50));
  const [badgeName, setBadgeName] = useState(challenge.badgeName || "");
  
  const [startDate, setStartDate] = useState(
    challenge.startDate ? new Date(challenge.startDate).toISOString().split("T")[0] : ""
  );
  const [endDate, setEndDate] = useState(
    challenge.endDate ? new Date(challenge.endDate).toISOString().split("T")[0] : ""
  );

  const submit = (e) => {
    e.preventDefault();
    onUpdate({
      _id: challenge.id,
      title,
      tag: category,
      targetGoal: Number(targetGoal),
      unit: targetUnit,
      rewardPoints: Number(points),
      rewardXP: challenge.isWeekly ? 0 : Number(points),
      badgeName,
      description: challenge.description || `Complete ${title} to earn points!`,
      startDate,
      endDate,
    });
  };

  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <h2>Edit Challenge</h2>
            <p>Modify parameters for "{challenge.title}"</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <label className="field">
            <span className="label">Challenge Title</span>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>

          {challenge.isWeekly && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <label className="field">
                <span className="label">Start Date</span>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </label>

              <label className="field">
                <span className="label">End Date (Expiration)</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </label>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <label className="field">
              <span className="label">Category Tag</span>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
            </label>

            <label className="field">
              <span className="label">Target Unit</span>
              <input type="text" value={targetUnit} onChange={(e) => setTargetUnit(e.target.value)} required />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <label className="field">
              <span className="label">Target Goal</span>
              <input type="number" value={targetGoal} onChange={(e) => setTargetGoal(e.target.value)} required />
            </label>

            <label className="field">
              <span className="label">Reward Points</span>
              <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} required />
            </label>
          </div>

          <label className="field">
            <span className="label">Badge Name</span>
            <input type="text" value={badgeName} onChange={(e) => setBadgeName(e.target.value)} required />
          </label>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
}

/* ----------------------------------------------------
   MAIN CHALLENGES COMPONENT
---------------------------------------------------- */
export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [viewChallenge, setViewChallenge] = useState(null);
  const [editChallenge, setEditChallenge] = useState(null);
  const [toast, setToast] = useState("");

  const fetchChallenges = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/challenges");
      const data = await res.json();
      if (data.success && data.challenges) {
        setChallenges(
          data.challenges.map((c) => ({
            id: c._id,
            level: c.levelRequired || 1,
            isWeekly: Boolean(c.isWeekly),
            title: c.title,
            category: c.category || c.tag || "Transport",
            targetGoal: c.targetGoal || 5,
            targetUnit: c.unit || c.targetUnit || "trips",
            points: c.rewardPoints || 50,
            badgeName: c.badgeName || `${c.title} Badge`,
            startDate: c.startDate,
            endDate: c.endDate,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching challenges:", err);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timeout);
  }, [toast]);

  const rows = useMemo(
    () => challenges.filter((c) => Number(c.level) === page || (page === 1 && c.isWeekly)),
    [challenges, page]
  );

  const handleCreateSave = async ({ title, category, targetGoal, targetUnit, points, badgeName, startDate, endDate }) => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, targetGoal, targetUnit, points, badgeName, startDate, endDate }),
      });

      if (res.ok) {
        setToast(`Weekly Challenge published successfully!`);
        fetchChallenges();
      }
    } catch (err) {
      console.error("Save error:", err);
    }

    setCreateModal(false);
  };

  const handleUpdateSave = async (updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/challenges/${updatedData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        setToast(`Challenge updated successfully!`);
        fetchChallenges();
      }
    } catch (err) {
      console.error("Update error:", err);
    }

    setEditChallenge(null);
  };

  const total = challenges.length;
  const weeklyTotal = challenges.filter((c) => c.isWeekly).length;

  return (
    <div className="app admin-layout">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main admin-layout-main">
        <AdminHeader
          title="Challenge"
          subtitle={`${TOTAL_LEVELS} Level Sets • ${weeklyTotal} Active Weekly Drives • ${total} Challenges Total`}
          onMenuClick={() => setSidebarOpen(true)}
          action={
            <button className="btn btn-primary btn-lg" onClick={() => setCreateModal(true)}>
              <span>＋</span>
              <span className="btn-label">New Weekly Drive</span>
            </button>
          }
        />

        <section className="admin-stats">
          <div className="admin-stat">
            <div>
              <strong>{total}</strong>
              <span>Total Challenges</span>
            </div>
          </div>

          <div className="admin-stat">
            <div>
              <strong>{weeklyTotal}</strong>
              <span>Weekly Drives</span>
            </div>
          </div>

          <div className="admin-stat">
            <div>
              <strong>{TOTAL_LEVELS}</strong>
              <span>Level Categories</span>
            </div>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">
            Level {page} Challenges & Weekly Drives
          </h2>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Level / Type</th>
                  <th>Challenge Title</th>
                  <th>Badge Name</th>
                  <th>Default Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-rows">
                      No challenges found for Level {page}.
                    </td>
                  </tr>
                ) : (
                  rows.map((challenge) => {
                    const isExpired = challenge.isWeekly && challenge.endDate && new Date(challenge.endDate) < new Date();

                    return (
                      <tr key={challenge.id}>
                        <td data-label="Level / Type">
                          <span className={`level-pill ${challenge.isWeekly ? "weekly-pill" : ""}`}>
                            {challenge.isWeekly ? "Weekly Drive" : `Level ${challenge.level}`}
                          </span>
                        </td>

                        <td data-label="Challenge Title" className="c-title">
                          <strong>{challenge.title}</strong>
                          {challenge.isWeekly && challenge.endDate && (
                            <div style={{ fontSize: "11px", color: isExpired ? "#ef4444" : "#64748b", marginTop: "2px" }}>
                              📅 {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                            </div>
                          )}
                        </td>

                        <td data-label="Badge Name">
                          🏅 {challenge.badgeName}
                        </td>

                        <td data-label="Default Status">
                          <span className={`badge ${isExpired ? "lock" : statusFor(challenge.level) === "Unlocked" || challenge.isWeekly ? "ok" : "lock"}`}>
                            {challenge.isWeekly ? (isExpired ? "Expired" : "Active Weekly") : statusFor(challenge.level)}
                          </span>
                        </td>

                        <td data-label="Action" style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            className="link-btn"
                            onClick={() => setViewChallenge(challenge)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="link-btn"
                            style={{ color: "#d97706" }}
                            onClick={() => setEditChallenge(challenge)}
                          >
                            ✏️ Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <footer className="panel-foot">
            <span className="foot-text">
              Showing Level {page} challenges (Page {page} of {TOTAL_LEVELS} Levels)
            </span>

            <div className="pager">
              <button
                type="button"
                className="page-btn"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
              >
                ‹
              </button>

              {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  type="button"
                  className={`page-btn ${number === page ? "current" : ""}`}
                  onClick={() => setPage(number)}
                >
                  {number}
                </button>
              ))}

              <button
                type="button"
                className="page-btn"
                onClick={() => setPage((current) => Math.min(TOTAL_LEVELS, current + 1))}
                disabled={page === TOTAL_LEVELS}
              >
                ›
              </button>
            </div>
          </footer>
        </section>
      </main>

      {viewChallenge && (
        <ViewChallengeModal
          challenge={viewChallenge}
          onClose={() => setViewChallenge(null)}
        />
      )}

      {editChallenge && (
        <EditChallengeModal
          challenge={editChallenge}
          onClose={() => setEditChallenge(null)}
          onUpdate={handleUpdateSave}
        />
      )}

      {createModal && (
        <CreateChallengeModal
          onClose={() => setCreateModal(false)}
          onSave={handleCreateSave}
        />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}