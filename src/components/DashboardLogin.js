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
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyMsg, setVerifyMsg] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [showVerifyStep, setShowVerifyStep] = useState(false);
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
    setVerifyError("");
    setVerifyMsg("");
    if (e.target.name === "email") {
      setShowVerifyStep(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVerifyError("");
    setVerifyMsg("");

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
      const statusCode = Number(err.response?.status || 0);
      const message = String(err.response?.data?.message || "Unable to login");
      if (statusCode === 403 && /verify/i.test(message)) {
        const emailForVerify = String(form.email || "").trim().toLowerCase();
        setVerifyEmail(emailForVerify);
        setShowVerifyStep(true);
        setVerifyCode("");
        setVerifyMsg("Enter the code sent to your email to complete login.");
        setError("");
      } else {
        setError(message || "Unable to login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setVerifyError("");
    setVerifyMsg("");

    const emailForVerify = String(verifyEmail || form.email || "").trim().toLowerCase();
    if (!emailForVerify) {
      setVerifyError("Please enter your email first");
      return;
    }

    if (!verifyCode || verifyCode.trim().length < 6) {
      setVerifyError("Please enter the 6-digit verification code");
      return;
    }

    try {
      const res = await api.post("/verify-email", {
        email: emailForVerify,
        code: verifyCode.trim(),
      });
      setVerifyMsg(res.data?.message || "Email verified successfully. Please log in now.");
      setVerifyCode("");
      setShowVerifyStep(false);
      setError("");
      setForm((prev) => ({ ...prev, email: emailForVerify }));
    } catch (err) {
      setVerifyError(err.response?.data?.message || "Verification failed");
    }
  };

  const handleResendCode = async () => {
    setVerifyError("");
    setVerifyMsg("");

    const emailForVerify = String(verifyEmail || form.email || "").trim().toLowerCase();
    if (!emailForVerify) {
      setVerifyError("Please enter your email first");
      return;
    }

    try {
      const res = await api.post("/resend-verification", {
        email: emailForVerify,
      });
      setVerifyMsg(res.data?.message || "Verification code sent");
      setShowVerifyStep(true);
      setVerifyEmail(emailForVerify);
    } catch (err) {
      setVerifyError(err.response?.data?.message || "Unable to resend code");
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

        {showVerifyStep ? (
          <div style={{ marginTop: 12, border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#fafcff" }}>
            <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "#111" }}>Verify before login</p>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#6b7280" }}>Enter the 6-digit code sent to {verifyEmail || form.email}</p>
            {verifyError ? <p className="dash-auth-error" style={{ marginBottom: 10 }}>{verifyError}</p> : null}
            {verifyMsg ? <p style={{ color: "#16a34a", fontSize: 12, marginBottom: 10 }}>{verifyMsg}</p> : null}
            <input
              className="dash-auth-input"
              type="text"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="Enter verification code"
              maxLength={6}
            />
            <button className="dash-auth-btn" type="button" style={{ marginTop: 10 }} onClick={handleVerifyEmail}>
              Verify code
            </button>
            <button className="dash-auth-btn" type="button" style={{ marginTop: 8, background: "#fff", color: "#111", border: "1px solid #d1d5db" }} onClick={handleResendCode}>
              Resend code
            </button>
          </div>
        ) : null}
      </form>
    </div>
  );
};

export default DashboardLogin;
