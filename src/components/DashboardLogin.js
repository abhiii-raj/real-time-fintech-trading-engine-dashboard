import React, { useState, useEffect } from "react";
import api from "../api";

const FALLBACK_API_URL = "https://real-time-fintech-trading-engine-backend-5ao3.onrender.com";
const resolveApiBaseUrl = () => {
  const configured = String(process.env.REACT_APP_API_URL || "").trim();
  if (!configured) {
    return FALLBACK_API_URL;
  }

  if (typeof window !== "undefined") {
    const isLocalApp = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
    const isLocalApi = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configured);
    if (!isLocalApp && isLocalApi) {
      return FALLBACK_API_URL;
    }
  }

  return configured;
};

const API_BASE_URL = resolveApiBaseUrl();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const DashboardLogin = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("oauthToken");
    if (oauthToken) {
      localStorage.setItem("authToken", oauthToken);
      if (typeof onLoginSuccess === "function") {
        onLoginSuccess();
      }
    }
  }, [onLoginSuccess]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please enter email and password");
      return;
    }

    if (!EMAIL_REGEX.test(String(form.email).trim())) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/login", form);
      localStorage.setItem("authToken", res.data.token);
      if (typeof onLoginSuccess === "function") {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = () => {
    window.location.href = `${API_BASE_URL}/auth/google/start?returnTo=${encodeURIComponent(window.location.origin + window.location.pathname)}`;
  };

  return (
    <div className="dash-auth-page">
      <form className="dash-auth-card" onSubmit={handleSubmit}>
        <p className="dash-auth-badge">Dashboard Access</p>
        <h2 className="dash-auth-title">Log in to RealTime Fintech Trading Engine</h2>
        <p className="dash-auth-sub">Use your existing account credentials.</p>

        {error && <p className="dash-auth-error">{error}</p>}

        <label className="dash-auth-label">Email</label>
        <input
          className="dash-auth-input"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          placeholder="Enter email"
        />

        <label className="dash-auth-label">Password</label>
        <input
          className="dash-auth-input"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          placeholder="Enter password"
        />

        <button className="dash-auth-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        <button className="dash-auth-btn" type="button" onClick={handleGoogleOAuth} style={{ marginTop: 10, background: "#fff", color: "#111", border: "1px solid #d1d5db" }}>
          Continue with Google
        </button>
      </form>
    </div>
  );
};

export default DashboardLogin;
