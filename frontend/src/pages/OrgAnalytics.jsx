import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import api, { getUserFromToken } from "../services/api";
import PageShell from "../components/PageShell.jsx";
import Hero from "../components/Hero.jsx";
import MetricCard from "../components/MetricCard.jsx";
import AnalyticsChartCard from "../components/AnalyticsChartCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const monthLabel = (value) =>
  new Date(value).toLocaleDateString(undefined, { month: "short", year: "2-digit" });

export default function OrgAnalytics() {
  const { t } = useTranslation();
  const authUser = getUserFromToken();
  const orgId = authUser?.id || authUser?._id;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/events");
        const allEvents = Array.isArray(res.data) ? res.data : [];
        const ownEvents = allEvents.filter((event) => {
          const owner = event.organization?._id || event.organization;
          return owner === orgId;
        });
        setEvents(ownEvents);
      } catch (err) {
        setMessage(err?.response?.data?.message || t("org.analytics_load_error"));
      } finally {
        setLoading(false);
      }
    };
    if (orgId) load();
  }, [orgId]);

  const stats = useMemo(() => {
    const totalEvents = events.length;
    const totalVolunteers = events.reduce((sum, event) => sum + (event.volunteers?.length || 0), 0);
    const approvedVolunteers = events.reduce(
      (sum, event) => sum + (event.volunteers || []).filter((volunteer) => volunteer.approved).length,
      0
    );
    const totalImpactHours = events.reduce(
      (sum, event) => sum + ((event.volunteers || []).filter((volunteer) => volunteer.approved).length * (event.hours || 0)),
      0
    );
    return { totalEvents, totalVolunteers, approvedVolunteers, totalImpactHours };
  }, [events]);

  const byMonth = useMemo(() => {
    const bucket = new Map();
    events.forEach((event) => {
      const key = new Date(event.date).toISOString().slice(0, 7);
      bucket.set(key, (bucket.get(key) || 0) + 1);
    });
    return Array.from(bucket.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [events]);

  const participationChart = {
    labels: events.map((event) => event.title).slice(0, 6),
    datasets: [
      {
        label: "Volunteers",
        data: events.map((event) => event.volunteers?.length || 0).slice(0, 6),
        backgroundColor: "rgba(30, 58, 138, 0.45)",
      },
    ],
  };

  const monthlyChart = {
    labels: byMonth.map(([key]) => monthLabel(`${key}-01`)),
    datasets: [
      {
        label: "Events hosted",
        data: byMonth.map(([, count]) => count),
        borderColor: "#D32F2F",
        backgroundColor: "rgba(211, 47, 47, 0.18)",
      },
    ],
  };

  return (
    <PageShell
      links={[
        { to: "/dashboard", label: t("nav.dashboard") },
        { to: "/org/profile", label: t("nav.profile") },
        { to: "/events", label: t("nav.events") },
      ]}
    >
      <Hero
        badge={t("org.analytics_badge")}
        title={t("org.analytics_title")}
        subtitle={t("org.analytics_subtitle")}
        height="min-h-[320px]"
      />

      {message ? <ErrorState message={message} /> : null}
      {!loading && events.length === 0 ? <EmptyState title={t("org.no_hosted_events_title")} message={t("org.no_hosted_events_message")} /> : null}

      {events.length > 0 ? (
        <>
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard label={t("org.total_events")} value={stats.totalEvents} helper={t("org.hosted_opportunities")} />
            <MetricCard label={t("org.volunteers")} value={stats.totalVolunteers} helper={t("org.requests_across_events")} />
            <MetricCard label={t("org.approved") } value={stats.approvedVolunteers} helper={t("org.confirmed_participants")} />
            <MetricCard label={t("org.impact_hours")} value={stats.totalImpactHours} helper={t("org.estimated_verified_hours")} />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <AnalyticsChartCard title={t("org.participation_per_event")} subtitle={t("org.participation_per_event_subtitle") }>
              <Bar data={participationChart} options={{ maintainAspectRatio: false }} />
            </AnalyticsChartCard>
            <AnalyticsChartCard title={t("org.monthly_hosting_trend")} subtitle={t("org.monthly_hosting_subtitle") }>
              <Line data={monthlyChart} options={{ maintainAspectRatio: false }} />
            </AnalyticsChartCard>
          </section>

          <section className="nepal-card p-8">
            <SectionHeader eyebrow={t("org.top_performing_events")} title={t("org.top_performing_events_title")} />
            <div className="mt-8 space-y-4">
              {[...events]
                .sort((a, b) => (b.volunteers?.length || 0) - (a.volunteers?.length || 0))
                .slice(0, 5)
                .map((event) => (
                  <div key={event._id} className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] bg-white/75 p-5">
                    <div>
                      <h3 className="font-semibold text-ink">{event.title}</h3>
                      <p className="mt-1 text-sm text-muted">{event.location || "Location TBD"}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted">
                      <span>{event.volunteers?.length || 0} volunteers</span>
                      <span>{event.hours || 0} hrs each</span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </>
      ) : null}
    </PageShell>
  );
}
