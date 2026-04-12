import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import MetricRing from "../components/MetricRing.jsx";

export default function ImpactProfile() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/volunteer/${id}/impact`);
        setProfile(res?.data && typeof res.data === "object" ? res.data : null);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load impact profile.");
      }
    };
    if (id) load();
  }, [id]);

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <Navbar
          links={[
            { to: "/dashboard", label: t('nav.dashboard') },
            { to: "/recommended-events", label: t('nav.ai_matches') },
            { to: "/impact", label: t('nav.impact') },
          ]}
        />

        <Hero
          badge={t('impact.impact_score')}
          title={profile ? t('impact.user_impact', { name: profile.name }) : t('impact.profile_title')}
          subtitle={profile ? t('impact.level', { level: profile.impactLevel }) : ""}
        />
        <div>
          <Link className="nepal-button-secondary h-10 px-4 text-xs btn-back" to="/dashboard" aria-label={t('impact.back_to_dashboard')}>
            {t('impact.back_to_dashboard')}
          </Link>
        </div>

        {message ? <div className="nepal-card p-4 text-sm text-brandRed">{t('impact.unable_to_load_profile', { message })}</div> : null}

        {profile ? (
          <>
            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="nepal-card p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">{t('impact.impact_score')}</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{profile.impactScore}</p>
              </div>
              <div className="nepal-card p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">{t('impact.total_hours')}</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{profile.totalHours}</p>
              </div>
              <div className="nepal-card p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">{t('impact.events_completed')}</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{profile.eventsCompleted}</p>
              </div>
              <div className="nepal-card p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">{t('impact.badges')}</p>
                <p className="mt-2 text-sm text-muted">
                  {profile.badges?.length ? profile.badges.join(", ") : t('impact.no_badges')}
                </p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="nepal-card p-6">
                <h3 className="text-lg font-semibold text-ink">{t('impact.contribution_timeline')}</h3>
                <div className="mt-4 space-y-3">
                  {profile.timeline?.length ? (
                    profile.timeline.map((item, idx) => (
                      <div key={item?.id || `${item?.eventTitle || "timeline"}-${idx}`} className="rounded-xl bg-white/70 p-4 dark:bg-slate-900/50">
                        <p className="font-medium text-ink">{item?.eventTitle || t('impact.event')}</p>
                        <p className="text-xs text-muted">
                          {item?.date ? new Date(item.date).toLocaleDateString() : t('impact.date_tbd')}
                        </p>
                        <span className="mt-2 inline-flex rounded-full bg-brandRed/10 px-3 py-1 text-xs text-brandRed">
                          {Number(item?.hours) || 0} {t('impact.hours_short')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted">No volunteer logs yet.</p>
                  )}
                </div>
              </div>

              <div className="nepal-card p-6">
                <MetricRing value={Math.min(100, Math.round((Number(profile?.impactScore) || 0) / 8))} label="Progress" />
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-ink">{t('impact.skill_gap_detection')}</h4>
                  {profile.skillGaps?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.skillGaps.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-brandBlue/10 px-3 py-1 text-xs text-brandBlue"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted">{t('impact.no_skill_gaps')}</p>
                  )}
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
