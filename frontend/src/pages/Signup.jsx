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
  const [showPw, setShowPw] = useState(false);
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
    document.cookie = `g_csrf_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax${secureFlag}`;
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await api.post("/auth/signup", { ...data, csrfToken });
      setMessage("Account created. Please check your email to verify.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* left visual panel */}
      <section className="hidden flex-1 items-center justify-center bg-gradient-to-br from-brandRed to-brandBlue p-12 lg:flex">
        <div className="max-w-md space-y-6 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <span className="text-lg font-bold">SC</span>
          </div>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            Start your service journey
          </h1>
          <p className="text-sm leading-7 text-white/80">
            Join a community of active volunteers building a stronger Nepal through verified action and smart matching.
          </p>
          <div className="space-y-4 pt-4">
            {['Track verified service hours', 'Earn impact badges & rank', 'Connect with local organizations'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-medium text-white/90">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* right form panel */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px] space-y-8 animate-fadeUp">
          {/* mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brandRed to-brandBlue shadow-sm">
              <span className="text-xs font-bold text-white">SC</span>
            </div>
            <p className="font-heading text-lg font-semibold text-ink">Smart Community</p>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-semibold text-ink">Volunteer Signup</h2>
            <p className="mt-1 text-sm text-muted">
              Already have an account?{" "}
              <Link className="font-medium text-brandRed hover:underline" to="/login">
                Sign in
              </Link>
            </p>
          </div>

          {message && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700" role="status">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-brandRed" role="alert">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={submit}>
            <div className="nepal-field">
              <label htmlFor="reg-name" className="nepal-label">Full Name</label>
              <input
                id="reg-name"
                className="nepal-input"
                placeholder="John Doe"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                required
                autoComplete="name"
              />
            </div>

            <div className="nepal-field">
              <label htmlFor="reg-email" className="nepal-label">Email Address</label>
              <input
                id="reg-email"
                className="nepal-input"
                type="email"
                placeholder="name@example.com"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div className="nepal-field">
              <label htmlFor="reg-password" className="nepal-label">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  className="nepal-input pr-12"
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted hover:text-ink transition-colors"
                >
                  {showPw ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <button className="nepal-button w-full mt-2" type="submit" disabled={loading}>
              {loading ? "Creating Profile..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-[11px] text-muted leading-relaxed">
            By creating an account, you agree to our{" "}
            <a href="/terms" className="underline hover:text-ink">Terms of Service</a> and{" "}
            <a href="/privacy" className="underline hover:text-ink">Privacy Policy</a>.
          </p>

          <div className="border-t border-slate-100 pt-6 text-center">
            <p className="text-sm text-muted">
              Registering for a non-profit?{" "}
              <Link className="font-bold text-brandRed hover:underline" to="/org-signup">
                Organization signup
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
