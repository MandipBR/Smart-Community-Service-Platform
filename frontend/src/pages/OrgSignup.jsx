import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function OrgSignup() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "organization",
    organizationType: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const allowOrgSignup =
    import.meta.env.VITE_ALLOW_ORG_SIGNUP?.toLowerCase() === "true";
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
    setMessage("");
    setLoading(true);
    try {
      await api.post("/auth/signup", { ...data, csrfToken });
      setMessage("Check your email to verify your organization account.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
              Organization signup
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight">
              Register your organization
            </h1>
            <p className="text-sm leading-6 text-white/85">
              Step 1: Create your account. Step 2: Verify your email. Step 3:
              Complete your organization profile.
            </p>
          </div>
        </section>

        <section className="nepal-card p-8">
          <h2 className="font-heading text-2xl font-semibold">Organization signup</h2>
          <p className="mt-3 text-sm text-muted">
            Already have an org account?{" "}
            <Link className="text-brandRed" to="/org-login">
              Sign in
            </Link>
            .
          </p>
          {!allowOrgSignup ? (
            <div className="mt-4 rounded-xl bg-brandRed/10 p-3 text-xs text-brandRed">
              Organization signup is currently disabled. Ask an admin to enable
              <code> ALLOW_ORG_SIGNUP=true</code>.
            </div>
          ) : null}
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <input
              className="nepal-input"
              placeholder="Organization name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              required
            />
            <input
              className="nepal-input"
              placeholder="Organization type (e.g., NGO, School)"
              value={data.organizationType}
              onChange={(e) =>
                setData({ ...data, organizationType: e.target.value })
              }
            />
            <input
              className="nepal-input"
              placeholder="Email"
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
            />
            <input
              className="nepal-input"
              type="password"
              placeholder="Password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              required
            />
            {message ? <div className="text-sm text-brandBlue">{message}</div> : null}
            {error ? <div className="text-sm text-brandRed">{error}</div> : null}
            <button
              className="nepal-button w-full"
              type="submit"
              disabled={loading || !allowOrgSignup}
            >
              {loading ? "Creating..." : "Create organization"}
            </button>
          </form>
          <p className="mt-4 text-xs text-muted">
            Note: Organization self-signup requires
            <code> ALLOW_ORG_SIGNUP=true</code> on the backend and admin approval
            after email verification.
          </p>
        </section>
      </div>
    </div>
  );
}
