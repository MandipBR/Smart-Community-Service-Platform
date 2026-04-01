import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { setAuth } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleRole, setGoogleRole] = useState(
    localStorage.getItem("google_role") || "volunteer"
  );
  const [csrfToken, setCsrfToken] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/dashboard";

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

  useEffect(() => {
    localStorage.setItem("google_role", googleRole);
  }, [googleRole]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let attempts = 0;
    const tryInit = () => {
      if (!window.google?.accounts?.id) {
        attempts += 1;
        if (attempts < 20) {
          setTimeout(tryInit, 150);
        }
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const res = await api.post("/auth/google", {
              credential: response.credential,
              csrfToken,
              role: googleRole,
            });
            setAuth(res.data.token, res.data.user);
            navigate(from, { replace: true });
          } catch (err) {
            setError(
              err?.response?.data?.message ||
                "Google sign-in failed. Please try again."
            );
          }
        },
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignIn"),
        { theme: "outline", size: "large", width: 260 }
      );
    };

    tryInit();
  }, [navigate, csrfToken, googleRole, from]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        csrfToken,
      });
      setAuth(res.data.token, res.data.user);
      navigate(from, { replace: true });
    } catch (err) {
      if (err?.response?.status === 429) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError(
          err?.response?.data?.message || "Login failed. Please try again."
        );
      }
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
          <div className="relative z-10 space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              Welcome back
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight">
              Community Portal
            </h1>
            <p className="text-sm leading-6 text-white/85">
              Jump into local events, track your impact, and help your community
              thrive.
            </p>
            <div className="rounded-xl bg-white/10 p-4 text-xs text-white/80">
              For new volunteers: create an account to build your impact story.
            </div>
          </div>
        </section>

        <section className="nepal-card p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-semibold">Sign in</h2>
            <span className="rounded-full bg-brandBlue/10 px-3 py-1 text-xs font-semibold text-brandBlue">
              Volunteer
            </span>
          </div>
          <p className="mt-3 text-sm text-muted">
            Use your email and password. New here?{" "}
            <Link className="text-brandRed" to="/signup-choice">
              Create an account
            </Link>
            .
          </p>
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <input
              className="nepal-input"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="nepal-input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error ? <div className="text-sm text-brandRed">{error}</div> : null}
            <button className="nepal-button w-full" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <div className="my-6 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="space-y-3">
            <select
              className="nepal-input"
              value={googleRole}
              onChange={(e) => setGoogleRole(e.target.value)}
            >
              <option value="volunteer">Volunteer</option>
              <option value="organization">Organization</option>
            </select>
            <div id="googleSignIn" />
            <p className="text-xs text-muted">
              This role will be used for your Google account.
            </p>
          </div>
          <div className="mt-6 text-xs text-muted">
            <Link className="text-brandRed" to="/org-login">
              Organization sign in
            </Link>
            <span className="mx-2">•</span>
            <Link className="text-brandRed" to="/org-signup">
              Organization signup
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
