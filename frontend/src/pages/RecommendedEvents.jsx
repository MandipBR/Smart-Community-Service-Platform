import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { hasToken } from "../services/api";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import EventCard from "../components/EventCard.jsx";

export default function RecommendedEvents() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords(null)
    );
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!hasToken()) {
        setMessage(t("recommended.signin_required", "Sign in to unlock personalized recommendations."));
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/events/recommended", {
          params: coords ? { lat: coords.lat, lng: coords.lng } : {},
        });
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 403) {
          setMessage(t("recommended.forbidden", "Recommendations are only available for eligible signed-in accounts."));
        } else {
          setMessage(
            err?.response?.data?.message || t("recommended.load_error", "Unable to load recommendations.")
          );
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [coords, t]);

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <Navbar
          links={[
            { to: "/events", label: t("common.nav_events", "Events") },
            { to: "/nearby-events", label: t("common.nearby", "Nearby") },
            { to: "/map", label: t("common.map", "Map") },
          ]}
        />

        <Hero
          badge={t("recommended.badge", "AI Match")}
          title={t("recommended.title", "Recommended for you")}
          subtitle={t("recommended.subtitle", "Personalized matches based on your skills, causes, and location.")}
        />

        {message ? <div className="nepal-card p-4 text-sm text-brandRed">{message}</div> : null}

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <div key={`recommended-skeleton-${idx}`} className="nepal-card h-[220px] w-full max-w-[360px] p-6">
                  <div className="skeleton h-4 w-40 rounded" />
                  <div className="skeleton mt-3 h-3 w-24 rounded" />
                  <div className="skeleton mt-6 h-3 w-full rounded" />
                  <div className="skeleton mt-2 h-3 w-5/6 rounded" />
                  <div className="skeleton mt-8 h-9 w-28 rounded-xl" />
                </div>
              ))
            : null}

          {!loading &&
            events.map((event) => (
              <EventCard
                key={event._id}
                id={event._id}
                title={event.title}
                location={event.location || t("common.location_tbd", "Location TBD")}
                date={event.date ? new Date(event.date).toLocaleString() : t("common.date_tbd", "Date TBD")}
                badge={`${event.matchScore}% ${t("common.match", "match")}`}
                tags={event.tags || event.skills || [t("common.community", "Community")]}
                actions={
                  <Link className="nepal-button-secondary" to={`/events/${event._id}`}>
                    {t("common.view_event", "View event")}
                  </Link>
                }
              />
            ))}

          {!loading && events.length === 0 ? (
            <p className="text-sm text-muted">{t("recommended.empty", "No recommendations yet.")}</p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
