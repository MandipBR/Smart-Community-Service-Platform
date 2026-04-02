import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import authVibe from "../assets/i18n/auth-vibe.png";

export default function OrgSignup() {
  const { t } = useTranslation();
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "organization",
    organizationType: "",
  });
  const [showPw, setShowPw] = useState(false);
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
    document.cookie = `g_csrf_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax${secureFlag}`;
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await api.post("/auth/signup", { ...data, csrfToken });
      setMessage(t('org.org_verification_desc'));
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* left visual panel */}
      <section className="relative hidden flex-1 items-center justify-center overflow-hidden lg:flex">
        <img 
          src={authVibe} 
          alt="Organization Connection" 
          className="absolute inset-0 h-full w-full object-cover brightness-[0.85]" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brandBlue/40 to-brandRed/40 mix-blend-multiply" />
        
        <div className="relative z-10 max-w-md space-y-8 p-12 text-white animate-fadeUp">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30">
            <span className="text-lg font-bold">SC</span>
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">
            {t('auth.org_scale_impact')}
          </h1>
          <p className="text-sm leading-8 text-white/90">
            {t('auth.org_infra_desc')}
          </p>
          <div className="space-y-4 pt-4">
            {[t('auth.org_benefit_reg'), t('auth.org_benefit_track'), t('auth.org_benefit_dash')].map((item) => (
              <div key={item} className="flex items-center gap-4 text-sm font-bold text-white/95">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[10px] backdrop-blur-sm border border-white/10">✓</span>
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
            <h2 className="font-heading text-3xl font-bold text-ink">{t('auth.org_partner_title')}</h2>
            <p className="mt-2 text-sm text-muted">
              {t('auth.org_workspace_link')}{" "}
              <Link className="font-bold text-brandRed hover:underline" to="/login">
                {t('auth.signin')}
              </Link>
            </p>
          </div>

          {message && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-bold" role="status">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-brandRed font-bold" role="alert">
              {error}
            </div>
          )}

          {!allowOrgSignup && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700 font-bold">
              {t('auth.org_reg_restricted')}
            </div>
          )}

          <form className="space-y-4" onSubmit={submit}>
            <div className="nepal-field">
              <label htmlFor="org-name" className="nepal-label">{t('auth.org_name_label')}</label>
              <input
                id="org-name"
                className="nepal-input"
                placeholder="e.g. Kathmandu Clean-Up Crew"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                required
                autoComplete="organization"
                disabled={!allowOrgSignup}
              />
            </div>

            <div className="nepal-field">
              <label htmlFor="org-type" className="nepal-label">{t('auth.org_type_label')}</label>
              <select
                id="org-type"
                className="nepal-input"
                value={data.organizationType}
                onChange={(e) => setData({ ...data, organizationType: e.target.value })}
                required
                disabled={!allowOrgSignup}
              >
                <option value="">{t('org.no_events')}</option>
                <option value="NGO">Non-Profit / NGO</option>
                <option value="School">School / University</option>
                <option value="Community">Community Group</option>
                <option value="Government">Government Body</option>
                <option value="Business">Social Enterprise</option>
              </select>
            </div>

            <div className="nepal-field">
              <label htmlFor="reg-email" className="nepal-label">{t('auth.org_admin_email')}</label>
              <input
                id="reg-email"
                className="nepal-input"
                type="email"
                placeholder="admin@organization.org"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                required
                autoComplete="email"
                disabled={!allowOrgSignup}
              />
            </div>

            <div className="nepal-field">
              <label htmlFor="reg-password" className="nepal-label">{t('auth.password')}</label>
              <div className="relative">
                <input
                  id="reg-password"
                  className="nepal-input pr-12 font-medium"
                  type={showPw ? "text" : "password"}
                  placeholder={t('auth.password_min')}
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={!allowOrgSignup}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-widest text-muted hover:text-ink transition-colors"
                >
                  {showPw ? t('auth.hide') : t('auth.show')}
                </button>
              </div>
            </div>

            <button className="nepal-button w-full mt-4 shadow-lift" type="submit" disabled={loading || !allowOrgSignup}>
              {loading ? t('auth.creating_profile') : t('auth.org_register_btn')}
            </button>
          </form>

          <p className="text-center text-[10px] font-medium text-muted/60 leading-relaxed">
            {t('auth.org_verification_desc')}
          </p>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 text-center">
            <p className="text-sm font-bold text-muted/60">
              {t('auth.signup_link')}{" "}
              <Link className="text-brandRed hover:underline" to="/signup">
                Volunteer signup
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
