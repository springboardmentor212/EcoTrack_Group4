import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

// Admin API Call
async function loginRequest(email, password) {
  const res = await fetch("http://localhost:5000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || "Invalid email or password");
  }

  const data = await res.json();
  if (data.token) {
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminUser", JSON.stringify(data.admin));
  }
  return data;
}

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* ---------- Icons ---------- */
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

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@ecotrack.com");
  const [password, setPassword] = useState("adminpassword123");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email.trim()) errs.email = "Enter admin email.";
    else if (!emailOk(email.trim())) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Enter password.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await loginRequest(email.trim(), password);
      // Login success dynamic navigation to Admin Users page
      navigate("/Admin/users");
    } catch (err) {
      setErrors({ form: err.message || "Login failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <div className="login-logo">
          <GlobeIcon size={30} />
          <span>EcoTrack</span>
        </div>

        <p className="login-module">ADMIN MODULE</p>
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
              placeholder="admin@ecotrack.com"
              onChange={(e) => setEmail(e.target.value)} />
          </div>
          {errors.email && <span className="login-error">{errors.email}</span>}
        </div>

        <div className="login-field">
          <label htmlFor="password">Password</label>
          <div className={`login-input ${errors.password ? "invalid" : ""}`}>
            <LockIcon className="lead" />
            <input id="password" type={showPw ? "text" : "password"} value={password}
              autoComplete="current-password" placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="login-eye" onClick={() => setShowPw((v) => !v)}>
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
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? <span className="login-spinner" aria-label="Signing in" /> : (
            <>Login <ArrowIcon size={16} /></>
          )}
        </button>

        <p className="login-foot">Keep current environment secure.</p>
      </form>
    </div>
  );
}