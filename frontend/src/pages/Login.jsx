import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { setAuth } from "../services/api";
import { useTranslation } from "react-i18next";
import PageMeta from "../components/PageMeta.jsx";
import authVibe from "../assets/i18n/auth-vibe.png";

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("credentials"); // 'credentials' | 'otp'
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleRole, setGoogleRole] = useState(
    localStorage.getItem("google_role") || "volunteer"
  );
  const [csrfToken, setCsrfToken] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/dashboard";

  /* CSRF token */
  useEffect(() => {
    const token =
      window.crypto?.randomUUID?.() ||
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    setCsrfToken(token);
    const secureFlag = import.meta.env.MODE === "production" ? "; Secure" : "";
    document.cookie = `g_csrf_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax${secureFlag}`;
  }, []);

  useEffect(() => {
    localStorage.setItem("google_role", googleRole);
  }, [googleRole]);

  /* Google Sign-In SDK */
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let attempts = 0;
    const tryInit = () => {
      if (!window.google?.accounts?.id) {
        attempts += 1;
        if (attempts < 20) setTimeout(tryInit, 150);
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
              err?.response?.data?.message || "Google sign-in failed. Please try again."
            );
          }
        },
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignIn"),
        { theme: "outline", size: "large", width: "full" }
      );
    };

    tryInit();
  }, [navigate, csrfToken, googleRole, from]);

  /* Step 1: Submit credentials */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password, csrfToken });
      if (res.data.step === "otp") {
        setStep("otp");
      } else {
        // Fallback or old behavior if OTP is disabled server-side
        setAuth(res.data.token, res.data.user);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* Step 2: Verify OTP */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      setAuth(res.data.token, res.data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <PageMeta 
        title={step === "otp" ? t('auth.otp_header') : t('auth.signin')} 
        description={t('auth.welcome_subtitle')} 
      />
      {/* left visual panel */}
      <section className="relative hidden flex-1 items-center justify-center overflow-hidden lg:flex">
        <img 
          src={authVibe} 
          alt="Community Connection" 
          className="absolute inset-0 h-full w-full object-cover brightness-[0.85]" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brandRed/40 to-brandBlue/40 mix-blend-multiply" />
        
        <div className="relative z-10 max-w-md space-y-6 p-12 text-white animate-fadeUp">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30">
            <span className="text-lg font-bold">SC</span>
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">
            {step === "otp" ? t('auth.otp_header') : t('auth.welcome')}
          </h1>
          <p className="text-sm leading-8 text-white/90">
            {step === "otp" ? t('auth.otp_desc') : t('auth.welcome_subtitle')}
          </p>
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
            <h2 className="font-heading text-3xl font-bold text-ink">
              {step === "otp" ? t('auth.otp_header') : t('auth.signin')}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {step === "otp" ? (
                <>
                  {t('auth.resend')} <span className="font-medium text-ink">{email}</span>.{" "}
                  <button
                    onClick={() => setStep("credentials")}
                    className="text-brandRed hover:underline font-bold"
                  >
                    {t('auth.change_email')}
                  </button>
                </>
              ) : (
                <>
                  {t('auth.signup_link')}{" "}
                  <Link className="font-bold text-brandRed hover:underline" to="/signup-choice">
                    {t('auth.create_one')}
                  </Link>
                </>
              )}
            </p>
          </div>

          {error && (
            <div
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-brandRed"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          {step === "credentials" ? (
            <>
              {/* Google sign-in */}
              <div className="space-y-4">
                <div className="nepal-field">
                  <label htmlFor="google-role" className="nepal-label">{t('auth.signin_as')}</label>
                  <select
                    id="google-role"
                    className="nepal-input"
                    value={googleRole}
                    onChange={(e) => setGoogleRole(e.target.value)}
                  >
                    <option value="volunteer">Volunteer</option>
                    <option value="organization">Organization</option>
                  </select>
                </div>
                <div id="googleSignIn" className="flex justify-center" />
              </div>
 
              {/* divider */}
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-300">
                <span className="h-px flex-1 bg-slate-100" />
                {t('auth.signin_with_email')}
                <span className="h-px flex-1 bg-slate-100" />
              </div>

              {/* email / password form */}
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="nepal-field">
                  <label htmlFor="login-email" className="nepal-label">{t('auth.email')}</label>
                  <input
                    id="login-email"
                    className="nepal-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="nepal-field">
                  <label htmlFor="login-password" className="nepal-label">{t('auth.password')}</label>
                  <div className="relative">
                    <input
                      id="login-password"
                      className="nepal-input pr-12 font-medium"
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-widest text-muted hover:text-ink transition-colors"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? t('auth.hide') : t('auth.show')}
                    </button>
                  </div>
                </div>
 
                <button className="nepal-button w-full shadow-lift" type="submit" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {t('auth.connecting')}
                    </span>
                  ) : (
                    t('common.continue')
                  )}
                </button>
              </form>
            </>
          ) : (
            /* OTP step */
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div className="nepal-field">
                <label htmlFor="otp-input" className="nepal-label">{t('auth.otp_label')}</label>
                <input
                  id="otp-input"
                  className="nepal-input text-center text-2xl tracking-[0.5em] font-bold h-14"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  autoFocus
                  autoComplete="one-time-code"
                  placeholder="000000"
                />
              </div>
 
              <div className="space-y-3">
                <button className="nepal-button w-full" type="submit" disabled={loading}>
                  {loading ? t('common.loading') : t('auth.otp_verify')}
                </button>
                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full text-[11px] font-bold uppercase tracking-widest text-muted hover:text-ink transition-colors"
                  disabled={loading}
                >
                  {t('auth.resend')}
                </button>
              </div>
            </form>
          )}

          {/* footer links */}
          <div className="text-center text-[13px] font-bold text-muted/60">
            <Link className="text-brandRed hover:underline" to="/org-login">
              {t('auth.org_portal')}
            </Link>
            <span className="mx-3 opacity-20">|</span>
            <Link className="text-brandRed hover:underline" to="/org-signup">
              {t('auth.become_partner')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
