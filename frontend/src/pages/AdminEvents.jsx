import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PageShell from "../components/PageShell.jsx";
import Hero from "../components/Hero.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import ErrorState from "../components/ErrorState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import BadgePill from "../components/BadgePill.jsx";
import { useTranslation } from "react-i18next";

export default function AdminEvents() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/admin/events");
        setEvents(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load moderated events.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <PageShell
      links={[
        { to: "/admin", label: t('nav.approvals') },
        { to: "/admin/users", label: t('nav.users') },
        { to: "/admin/analytics", label: t('nav.analytics') },
      ]}
    >
      <Hero badge={t('admin.admin_events')} title={t('admin.monitor_events_title')} subtitle={t('admin.monitor_events_desc')} height="min-h-[320px]" />

      <section className="nepal-card p-8">
        <SectionHeader eyebrow={t('admin.event_moderation')} title={t('admin.recent_events_title')} subtitle={t('admin.recent_events_desc')} />
      </section>

      {loading ? <div className="grid gap-6 md:grid-cols-2"><LoadingSkeleton className="h-[180px] w-full" count={4} /></div> : null}
      {message ? <ErrorState message={message} /> : null}
      {!loading && !message && !events.length ? <EmptyState title="No events available" message="When organizations begin publishing events, moderation insights will appear here." /> : null}

      {!loading && events.length ? (
        <section className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <div key={event.id} className="nepal-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{event.title}</h3>
                  <p className="mt-1 text-sm text-muted">{event.organization}</p>
                </div>
                <BadgePill tone={event.status === "completed" ? "green" : event.status === "reviewing" ? "amber" : "blue"}>{event.status}</BadgePill>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-muted">
                <div className="rounded-[14px] bg-white/75 p-4">
                  <p className="text-xs uppercase tracking-[0.18em]">{t('admin.date')}</p>
                  <p className="mt-2 text-sm font-medium text-ink">{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <div className="rounded-[14px] bg-white/75 p-4">
                  <p className="text-xs uppercase tracking-[0.18em]">{t('admin.location')}</p>
                  <p className="mt-2 text-sm font-medium text-ink">{event.location || "TBD"}</p>
                </div>
                <div className="rounded-[14px] bg-white/75 p-4">
                  <p className="text-xs uppercase tracking-[0.18em]">{t('admin.total_volunteers')}</p>
                  <p className="mt-2 text-sm font-medium text-ink">{event.volunteerCount}</p>
                </div>
                <div className="rounded-[14px] bg-white/75 p-4">
                  <p className="text-xs uppercase tracking-[0.18em]">{t('admin.total_hours')}</p>
                  <p className="mt-2 text-sm font-medium text-ink">{event.hoursGenerated}</p>
                </div>
              </div>
              <div className="mt-5">
                <Link className="nepal-button-secondary" to={`/events/${event.id}`}>{t('nav.events')}</Link>
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </PageShell>
  );
}
