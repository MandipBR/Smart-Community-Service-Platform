import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Signup() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "volunteer",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
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
      setMessage("Check your email to verify your account.");
      setTimeout(() => navigate("/"), 1500);
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
          <div className="absolute inset-0 opacity-15">
            <svg viewBox="0 0 800 400" className="h-full w-full">
              <path
                d="M0 260 C160 180 260 260 380 210 C520 150 620 240 800 180 V400 H0 Z"
                fill="#fff"
              />
            </svg>
          </div>
          <div className="relative z-10 space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              Volunteer with heart
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight">
              Build a brighter block.
            </h1>
            <p className="text-sm leading-6 text-white/85">
              Whether you volunteer or organize events, you’ll earn impact points
              and see your community grow.
            </p>
          </div>
        </section>

        <section className="nepal-card p-8">
          <h2 className="font-heading text-2xl font-semibold">Create account</h2>
          <p className="mt-3 text-sm text-muted">
            Already verified?{" "}
            <Link className="text-brandRed" to="/login">
              Sign in
            </Link>
            .
          </p>
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <input
              className="nepal-input"
              placeholder="Full name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              required
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
            <button className="nepal-button w-full" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
          <div className="mt-4 text-xs text-muted">
            Want to register an organization?{" "}
            <Link className="text-brandRed" to="/org-signup">
              Organization signup
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
