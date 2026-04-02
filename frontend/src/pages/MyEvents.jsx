import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { getUserFromToken } from "../services/api";
import PageShell from "../components/PageShell.jsx";
import Hero from "../components/Hero.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import EventCard from "../components/EventCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import BadgePill from "../components/BadgePill.jsx";

const statusTabs = ["all", "pending", "approved", "completed"];

export default function MyEvents() {
  const { t } = useTranslation();
  const authUser = getUserFromToken();
  const userId = authUser?.id || authUser?._id;
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/events");
        const own = (res.data || []).filter((event) =>
          (event.volunteers || []).some((entry) => entry.user === userId || entry.user?._id === userId)
        );
        setEvents(own);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load your events.");
      } finally {
        setLoading(false);
      }
    };
    if (userId) load();
  }, [userId]);

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const volunteer = (event.volunteers || []).find((entry) => entry.user === userId || entry.user?._id === userId);
      const eventStatus = new Date(event.date) < new Date() ? "completed" : volunteer?.approved ? "approved" : "pending";
      const matchesStatus = status === "all" || eventStatus === status;
      const matchesQuery = !query.trim() || `${event.title} ${event.location || ""}`.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [events, query, status, userId]);

  return (
    <PageShell
      links={[
        { to: "/dashboard", label: t("nav.dashboard") },
        { to: "/profile", label: t("nav.profile") },
        { to: "/events", label: t("nav.events") },
      ]}
    >
      <Hero
        badge={t("nav.my_missions")}
        title={t("my_events.hero_title")}
        subtitle={t("my_events.hero_subtitle")}
        height="min-h-[320px]"
      />

      <section className="nepal-card p-8">
        <SectionHeader
          eyebrow={t("my_events.activity_history")}
          title={t("my_events.activity_title")}
          actions={<input className="nepal-input w-full min-w-[240px] sm:w-[280px]" placeholder={t("my_events.search_placeholder")} value={query} onChange={(e) => setQuery(e.target.value)} />}
        />
        <div className="mt-6 flex flex-wrap gap-3">
          {statusTabs.map((tab) => (
            <button key={tab} type="button" className={status === tab ? "nepal-button-secondary border-brandBlue/40 bg-brandBlue/[0.08]" : "nepal-button-secondary"} onClick={() => setStatus(tab)}>
              {t(`my_events.status.${tab}`)}
            </button>
          ))}
        </div>
      </section>

      {loading ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><LoadingSkeleton className="h-[220px] w-full" count={3} /></div> : null}
      {message ? <ErrorState message={message} /> : null}
      {!loading && !message && filtered.length === 0 ? (
        <EmptyState title={t("my_events.empty_title")} message={t("my_events.empty_message")} action={<Link className="nepal-button" to="/events">{t("my_events.browse_cta")}</Link>} />
      ) : null}

      {!loading && filtered.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => {
            const volunteer = (event.volunteers || []).find((entry) => entry.user === userId || entry.user?._id === userId);
            const eventStatus = new Date(event.date) < new Date() ? "completed" : volunteer?.approved ? "approved" : "pending";
            return (
              <div key={event._id} className="space-y-3">
                <BadgePill tone={eventStatus === "completed" ? "green" : eventStatus === "approved" ? "blue" : "amber"}>{eventStatus}</BadgePill>
                <EventCard
                  id={event._id}
                  title={event.title}
                  location={event.location || "Location TBD"}
                  date={new Date(event.date).toLocaleDateString()}
                  tags={event.tags || event.skills || []}
                  volunteerCount={event.volunteers?.length || 0}
                  actions={<Link className="nepal-button-secondary" to={`/events/${event._id}`}>View details</Link>}
                />
              </div>
            );
          })}
        </section>
      ) : null}
    </PageShell>
  );
}
