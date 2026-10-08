import { useState } from "react";
import "./Login.css";

/* ---------- API placeholder: replace with your real backend call ---------- */
async function loginRequest(email, password) {
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/login`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ email, password }),
  // });
  // if (!res.ok) throw new Error("Invalid email or password");
  // return res.json();
  await new Promise((r) => setTimeout(r, 800));
  return { token: "demo-token" };
}

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* ---------- icons ---------- */
const Svg = ({ size = 16, children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>{children}</svg>
);
const GlobeIcon = (p) => (
  <Svg {...p} strokeWidth="1.8"><circle cx="12" cy="12" r="9.5" />
    <path d="M2.500 12h19M12 2.500c2.800 3 4.200 6.200 4.200 9.500S14.800 18.500 12 21.500C9.200 18.500 7.800 15.300 7.800 12S9.200 5.500 12 2.500Z" /></Svg>
);
const MailIcon = (p) => (<Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2.500" /><path d="m3.500 7.500 8.500 6 8.500-6" /></Svg>);
const LockIcon = (p) => (<Svg {...p}><rect x="4.500" y="10.500" width="15" height="10" rx="2.500" /><path d="M8 10.500V7.500a4 4 0 0 1 8 0v3" /></Svg>);
const EyeIcon = (p) => (<Svg {...p}><path d="M2 12s3.600-7 10-7 10 7 10 7-3.600 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Svg>);
const EyeOffIcon = (p) => (<Svg {...p}><path d="M3 3l18 18M10.600 5.100A9.900 9.900 0 0 1 12 5c6.400 0 10 7 10 7a17 17 0 0 1-3.200 4.100M6.600 6.600C3.700 8.500 2 12 2 12s3.600 7 10 7c1.600 0 3-.4 4.300-1M9.900 9.900a3 3 0 0 0 4.200 4.200" /></Svg>);
const ArrowIcon = (p) => (<Svg {...p} strokeWidth="2.200"><path d="M5 12h14M13 6l6 6-6 6" /></Svg>);

/* ---------- component ---------- */
export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem("ecotrack_admin_email") || ""; } catch { return ""; }
  });
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(() => {
    try { return Boolean(localStorage.getItem("ecotrack_admin_email")); } catch { return false; }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email.trim()) errs.email = "Enter your admin email.";
    else if (!emailOk(email.trim())) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Enter your password.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const data = await loginRequest(email.trim(), password);
      try {
        if (remember) localStorage.setItem("ecotrack_admin_email", email.trim());
        else localStorage.removeItem("ecotrack_admin_email");
      } catch { /* storage blocked: ignore */ }
      onLoginSuccess?.(data);
    } catch (err) {
      setErrors({ form: err.message || "Login failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    // TODO: navigate("/forgot-password") or open your reset flow
    alert("Password reset flow goes here.");
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <div className="login-logo">
          <GlobeIcon size={30} />
          <span>EcoTrack</span>
        </div>

        <p className="login-module">Admin Module</p>
        <h1 className="login-title">Welcome back</h1>
        <p className="login-sub">
          Please log in to your admin account to manage Users, Challenges, and Reports
        </p>

        {errors.form && <div className="login-alert" role="alert">{errors.form}</div>}

        <div className="login-field">
          <label htmlFor="email">Admin Email</label>
          <div className={`login-input ${errors.email ? "invalid" : ""}`}>
            <MailIcon className="lead" />
            <input id="email" type="email" value={email} autoComplete="username"
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.target.value)} />
          </div>
          {errors.email && <span className="login-error">{errors.email}</span>}
        </div>

        <div className="login-field">
          <label htmlFor="password">Password</label>
          <div className={`login-input ${errors.password ? "invalid" : ""}`}>
            <LockIcon className="lead" />
            <input id="password" type={showPw ? "text" : "password"} value={password}
              autoComplete="current-password" placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="login-eye" onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}>
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.password && <span className="login-error">{errors.password}</span>}
        </div>

        <div className="login-row">
          <label className="login-check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Remember this device</span>
          </label>
          <a href="#forgot" className="login-link" onClick={handleForgot}>Forgot Password?</a>
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? <span className="login-spinner" aria-label="Signing in" /> : (
            <>Login to Dashboard <ArrowIcon size={16} /></>
          )}
        </button>

        <p className="login-foot">Keep current environment secure.</p>
      </form>
    </div>
  );
}