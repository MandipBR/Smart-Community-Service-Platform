import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { setAuth } from "../services/api";

export default function OrgLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [emailCheckHandle, setEmailCheckHandle] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token =
      window.crypto?.randomUUID?.() ||
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    setCsrfToken(token);
    const secureFlag = import.meta.env.MODE === "production" ? "; Secure" : "";
    document.cookie = `g_csrf_token=${encodeURIComponent(
      token
    )}; Path=/; SameSite=Lax${secureFlag}`;
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setStatusNote("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        csrfToken,
      });
      if (res.data.user?.role !== "organization") {
        setError("This account is not an organization.");
        return;
      }
      setAuth(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.status === 429
          ? "Too many attempts. Please wait a moment and try again."
          : err?.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
      if (msg.toLowerCase().includes("pending admin approval")) {
        setStatusNote("Status: Pending admin approval.");
      }
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = (value) => {
    if (emailCheckHandle) {
      clearTimeout(emailCheckHandle);
    }
    const handle = setTimeout(async () => {
      if (!value || !value.includes("@")) {
        setEmailStatus("");
        return;
      }
      try {
        const res = await api.get(
          `/auth/org-status?email=${encodeURIComponent(value)}`
        );
        const status = res.data.orgApprovalStatus;
        setEmailStatus(
          status === "approved"
            ? "Approved"
            : status === "rejected"
            ? "Rejected"
            : "Pending"
        );
      } catch {
        setEmailStatus("");
      }
    }, 350);
    setEmailCheckHandle(handle);
  };

  useEffect(() => {
    return () => {
      if (emailCheckHandle) clearTimeout(emailCheckHandle);
    };
  }, [emailCheckHandle]);

  return (
    <div className="nepal-page">
      <div className="mx-auto grid min-h-screen w-full max-w-[1280px] gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden rounded-[20px] bg-hero-glow p-10 text-white shadow-soft">
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 800 400" className="h-full w-full">
              <path
                d="M0 260 C160 180 260 260 380 210 C520 150 620 240 800 180 V400 H0 Z"
                fill="#fff"
              />
            </svg>
          </div>
          <div className="relative z-10 space-y-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              Organization Portal
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight">
              Manage community impact.
            </h1>
            <p className="text-sm leading-6 text-white/85">
              Publish events, approve volunteers, and report verified impact.
            </p>
          </div>
        </section>

        <section className="nepal-card p-8">
          <h2 className="font-heading text-2xl font-semibold">Sign in as an organization</h2>
          <p className="mt-3 text-sm text-muted">
            Don't have an org account?{" "}
            <Link className="text-brandRed" to="/org-signup">
              Create one
            </Link>
            .
          </p>
          <p className="mt-2 text-xs text-muted">
            Organization accounts require email verification and admin approval.
          </p>
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <input
              className="nepal-input"
              placeholder="Organization email"
              type="email"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                checkStatus(value);
              }}
              required
            />
            {emailStatus ? (
              <div className="rounded-full bg-brandBlue/10 px-3 py-1 text-xs text-brandBlue">
                {emailStatus}
              </div>
            ) : null}
            <input
              className="nepal-input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error ? <div className="text-sm text-brandRed">{error}</div> : null}
            {statusNote ? <div className="text-sm text-brandRed">{statusNote}</div> : null}
            <button className="nepal-button w-full" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
