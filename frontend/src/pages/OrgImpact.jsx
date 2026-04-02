import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";
import Hero from "../components/Hero.jsx";
import ImpactSummaryCard from "../components/ImpactSummaryCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import BadgePill from "../components/BadgePill.jsx";
import dashboardPreview from "../assets/i18n/dashboard-preview.png";

export default function OrgImpact() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [orgRes, eventsRes, reviewsRes] = await Promise.all([
          api.get(`/orgs/${id}`),
          api.get("/events"),
          api.get(`/org/${id}/reviews`).catch(() => ({ data: { reviews: [] } })),
        ]);
        const safeEvents = Array.isArray(eventsRes?.data) ? eventsRes.data : [];
        const safeReviews = Array.isArray(reviewsRes?.data?.reviews)
          ? reviewsRes.data.reviews
          : [];
        setOrg(orgRes.data);
        setEvents(safeEvents.filter((event) => (event.organization?._id || event.organization) === id));
        setReviews(safeReviews);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Sync failed.");
      }
    };
    if (id) load();
  }, [id, t]);

  const summary = useMemo(() => {
    const volunteersServed = events.reduce((sum, event) => sum + (event.volunteers?.length || 0), 0);
    const volunteerHours = events.reduce(
      (sum, event) => sum + ((event.volunteers || []).filter((entry) => entry.approved).length * (event.hours || 0)),
      0
    );
    const supportedCauses = Array.from(new Set(events.flatMap((event) => event.tags || [])));
    return { volunteersServed, volunteerHours, supportedCauses };
  }, [events]);

  return (
    <PageShell
      maxWidth="max-w-[1600px]"
      links={[
        { to: `/org/${id}`, labelKey: "nav.profile" },
        { to: "/events", labelKey: "nav.events" },
        { to: "/impact", labelKey: "common.impact" },
      ]}
    >
      <PageMeta title={t('org.impact_summary')} description={t('org.impact_summary')} />
      <Hero
        badge={t('common.impact')}
        title={org?.organizationName || org?.name || t('org.impact_summary')}
        subtitle={t('org.impact_summary')}
        height="min-h-[420px]"
        image={dashboardPreview}
      />

      {message ? <ErrorState message={message} /> : null}

      {org ? (
        <div className="mt-12 space-y-12 animate-fadeUp">
          <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <ImpactSummaryCard label={t('org.events_hosted')} value={events.length} helper={t('org.live_feed')} icon="📅" />
            <ImpactSummaryCard label={t('org.volunteers_served')} value={summary.volunteersServed} helper={t('org.staffing')} icon="👥" />
            <ImpactSummaryCard label={t('dashboard.total_hours')} value={summary.volunteerHours} helper={t('dashboard.verified_time')} icon="⏱️" />
            <ImpactSummaryCard label={t('org.trust_signals')} value="Verified" helper={t('org.trust_signals')} icon="🎗️" />
          </section>

          <section className="grid gap-12 lg:grid-cols-[1fr_420px]">
             
            {/* Left Column: Causes & Initiatives */}
            <div className="nepal-card p-10 relative overflow-hidden group">
               <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brandRed/5 blur-3xl transition-transform group-hover:scale-125" />
               
               <div className="relative z-10">
                  <SectionHeader eyebrow={t('org.supported_causes')} title={t('org.supported_causes')} />
                  <div className="mt-8 flex flex-wrap gap-3">
                    {summary.supportedCauses.length ? (
                      summary.supportedCauses.map((cause) => (
                        <span key={cause} className="rounded-2xl border border-brandRed/10 bg-brandRed/5 px-4 py-2 text-[12px] font-bold text-brandRed uppercase tracking-widest transition-all hover:bg-brandRed hover:text-white">
                          {cause}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm font-bold text-muted/40 uppercase tracking-widest">{t('org.no_events')}</p>
                    )}
                  </div>

                  <div className="mt-12 space-y-6">
                    {events.slice(0, 5).map((event) => (
                      <div key={event._id} className="nepal-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-slate-50 shadow-soft">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-ink leading-tight">{event.title}</h3>
                          <p className="mt-2 text-sm font-medium text-muted/60">{event.location || t('events.location')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-1">Impact Factor</p>
                              <p className="text-sm font-bold text-ink">{event.volunteers?.length || 0} Engagee</p>
                           </div>
                           <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg shadow-sm border border-slate-100 italic">pts</div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* Right Column: Social Signals */}
            <aside className="space-y-10">
               <section className="nepal-card p-10 bg-slate-50/50 border-slate-100">
                  <SectionHeader eyebrow="Reputation" title={t('org.trust_signals')} />
                  <div className="mt-10 space-y-8">
                    {reviews.length ? reviews.slice(0, 4).map((review) => (
                      <div key={review.id} className="group border-l-4 border-slate-100 pl-6 transition-all hover:border-brandBlue">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <p className="text-sm font-bold text-ink">{review.volunteer}</p>
                          <span className="rounded-xl bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-700 border border-amber-100">⭐ {review.rating} / 5</span>
                        </div>
                        <p className="text-sm leading-relaxed text-muted/80 font-medium">{review.comment || t('map.no_events')}</p>
                      </div>
                    )) : (
                      <div className="py-20 text-center rounded-[28px] border-4 border-dashed border-slate-100">
                         <div className="text-4xl mb-6 opacity-10">⭐</div>
                         <p className="text-xs font-bold text-muted/40 uppercase tracking-[0.3em]">No verified reviews yet</p>
                      </div>
                    )}
                  </div>
               </section>

               <section className="nepal-card p-10 bg-brandBlue text-white border-0 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-hero-glow opacity-30 transition-opacity group-hover:opacity-50" />
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold leading-tight">Strategic Reporting</h3>
                    <p className="mt-4 text-[15px] font-medium text-white/90 leading-relaxed">
                      Download your organization's quarterly community impact reports and data manifests.
                    </p>
                    <button className="mt-10 w-full h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-brandBlue transition-all duration-500">
                      Generate PDF Report
                    </button>
                  </div>
               </section>
            </aside>
          </section>
        </div>
      ) : (
        <div className="flex items-center justify-center py-40">
           <div className="h-10 w-10 animate-spin rounded-full border-4 border-brandRed border-t-transparent" />
        </div>
      )}
    </PageShell>
  );
}
