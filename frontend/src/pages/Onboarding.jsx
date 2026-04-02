import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getUser, getUserFromToken } from "../services/api";
import { useTranslation } from "react-i18next";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";

export default function Onboarding() {
  const { t } = useTranslation();
  const [data, setData] = useState({
    phone: "",
    location: "",
    bio: "",
    availability: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const tokenUser = getUserFromToken();
  const cachedUser = getUser() || {};
  const isOrg = (tokenUser?.role || cachedUser.role) === "organization";

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/onboarding", data);
      setMessage(t('onboarding.redirecting'));
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell maxWidth="max-w-[1600px]">
      <PageMeta 
        title={t('onboarding.complete_profile')} 
        description={t('onboarding.match_subtitle')} 
      />
      
      <div className="mx-auto max-w-[1200px] flex flex-col items-center justify-center min-h-[80vh] py-20 animate-fadeUp">
        <div className="w-full max-w-[640px] space-y-12">
          
          <header className="text-center">
             <div className="inline-flex items-center gap-2 rounded-full bg-brandRed/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-brandRed mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brandRed opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brandRed"></span>
                </span>
                {isOrg ? t('onboarding.org_title') : t('onboarding.volunteer_title')}
             </div>
             <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-ink leading-tight">
                {t('onboarding.complete_profile')}
             </h1>
             <p className="mt-4 text-lg text-muted font-medium max-w-md mx-auto">
                {t('onboarding.match_subtitle')}
             </p>
          </header>

          <form className="nepal-card p-10 sm:p-16 space-y-10 relative overflow-hidden group" onSubmit={submit}>
            {/* Design accents */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brandRed/5 blur-3xl transition-transform group-hover:scale-125" />
            
            <div className="relative z-10 space-y-10">
              {message && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-8 py-5 text-[15px] font-bold text-emerald-700 animate-fadeUp flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {message}
                </div>
              )}
              {error && (
                <div className="rounded-2xl bg-red-50 border border-red-100 px-8 py-5 text-[15px] font-bold text-brandRed animate-fadeUp">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
                <div className="nepal-field">
                  <label className="nepal-label">{t('onboarding.phone')}</label>
                  <input
                    className="nepal-input h-14"
                    placeholder={t('onboarding.phone_placeholder')}
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="nepal-field">
                  <label className="nepal-label">{t('onboarding.location')}</label>
                  <input
                    className="nepal-input h-14"
                    placeholder={t('onboarding.location_placeholder')}
                    value={data.location}
                    onChange={(e) => setData({ ...data, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="nepal-field">
                <label className="nepal-label">{t('onboarding.bio')}</label>
                <textarea
                  className="nepal-input min-h-[160px] py-6 resize-none leading-relaxed"
                  placeholder={isOrg ? t('onboarding.bio_placeholder_org') : t('onboarding.bio_placeholder_vol')}
                  value={data.bio}
                  onChange={(e) => setData({ ...data, bio: e.target.value })}
                  required
                />
              </div>

              <div className="nepal-field">
                <label className="nepal-label">{t('onboarding.availability')}</label>
                <input
                  className="nepal-input h-14"
                  placeholder={t('onboarding.availability_placeholder')}
                  value={data.availability}
                  onChange={(e) => setData({ ...data, availability: e.target.value })}
                  required={!isOrg}
                />
              </div>

              <div className="pt-6 flex flex-col items-center gap-8">
                <button className="nepal-button w-full h-16 shadow-lift text-lg tracking-tight" type="submit" disabled={loading}>
                  {loading ? t('common.loading') : t('onboarding.save_profile')}
                </button>
                <div className="flex items-center gap-4">
                   <div className="h-1 w-12 rounded-full bg-brandRed" />
                   <p className="text-xs font-bold text-muted/40 uppercase tracking-[0.3em]">{t('onboarding.step_count')}</p>
                   <div className="h-1 w-12 rounded-full bg-slate-100" />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
