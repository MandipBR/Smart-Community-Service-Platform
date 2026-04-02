import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { setAuth } from "../services/api";
import PageMeta from "../components/PageMeta.jsx";

export default function OrgLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [emailCheckHandle, setEmailCheckHandle] = useState(null);
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
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password, csrfToken });
      if (res.data.user?.role !== "organization") {
        setError("This account is not configured as an organization.");
        return;
      }
      setAuth(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = (value) => {
    if (emailCheckHandle) clearTimeout(emailCheckHandle);
    const handle = setTimeout(async () => {
      if (!value || !value.includes("@")) {
        setEmailStatus("");
        return;
      }
      try {
        const res = await api.get(`/auth/org-status?email=${encodeURIComponent(value)}`);
        const status = res.data.orgApprovalStatus;
        if (status) setEmailStatus(status.charAt(0).toUpperCase() + status.slice(1));
      } catch {
        setEmailStatus("");
      }
    }, 400);
    setEmailCheckHandle(handle);
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <PageMeta
        title="Partner Login"
        description="Access your organization workspace to manage community events and volunteers."
      />

      {/* left visual panel - reversed gradient for Org branding */}
      <section className="hidden flex-1 items-center justify-center bg-gradient-to-br from-brandBlue to-brandRed p-12 lg:flex">
        <div className="max-w-md space-y-6 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <span className="text-lg font-bold">SC</span>
          </div>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            Partner Workspace
          </h1>
          <p className="text-sm leading-7 text-white/80">
            Smart Community provides the infrastructure for verified community action. Log in to manage your events, verify volunteer hours, and report social impact.
          </p>
          <div className="space-y-4 pt-4">
            {['Manage volunteer applications', 'Verify attendance & award points', 'Generate impact dashboards'].map((item) => (
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brandBlue to-brandRed shadow-sm">
              <span className="text-xs font-bold text-white">SC</span>
            </div>
            <p className="font-heading text-lg font-semibold text-ink">Smart Community</p>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-semibold text-ink">Organization Sign In</h2>
            <p className="mt-1 text-sm text-muted">
              Need to register your team?{" "}
              <Link className="font-medium text-brandRed hover:underline" to="/org-signup">
                Partner signup
              </Link>
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-brandRed" role="alert">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={submit}>
            <div className="nepal-field">
              <label htmlFor="login-email" className="nepal-label">Organization Email</label>
              <div className="relative">
                <input
                  id="login-email"
                  className="nepal-input pr-24"
                  type="email"
                  placeholder="admin@organization.org"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    checkStatus(e.target.value);
                  }}
                  required
                  autoComplete="email"
                />
                {emailStatus && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted border border-slate-200">
                    {emailStatus}
                  </div>
                )}
              </div>
            </div>

            <div className="nepal-field">
              <label htmlFor="login-password" className="nepal-label">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  className="nepal-input pr-12"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted hover:text-ink transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <button className="nepal-button w-full mt-2 btn-submit" type="submit" disabled={loading} aria-label="Submit organization sign in">
              {loading ? "Authenticating..." : "Sign In to Workspace"}
            </button>
          </form>

          <div className="border-t border-slate-100 pt-6 text-center">
            <p className="text-sm text-muted">
              First time here?{" "}
              <Link className="font-bold text-brandRed hover:underline" to="/signup-choice">
                Choose your role
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
