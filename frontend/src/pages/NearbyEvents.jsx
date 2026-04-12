import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import EventCard from "../components/EventCard.jsx";

export default function NearbyEvents() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState(() =>
    navigator.geolocation ? "" : t("nearby.geolocation_not_supported")
  );
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setMessage(t("nearby.unable_access_location"))
    );
  }, [t]);

  useEffect(() => {
    const load = async () => {
      if (!coords) return;
      try {
        const res = await api.get("/events/nearby", {
          params: { lat: coords.lat, lng: coords.lng },
        });
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load nearby events.");
      }
    };
    load();
  }, [coords]);

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <Navbar
          links={[
            { to: "/events", label: t("nav.events") },
            { to: "/recommended-events", label: t("nav.ai_matches") },
            { to: "/map", label: t("nav.map") },
          ]}
        />

        <Hero
          badge={t("nearby.badge")}
          title={t("nearby.title")}
          subtitle={t("nearby.subtitle")}
        />

        {message ? <div className="nepal-card p-4 text-sm text-brandRed">{message}</div> : null}

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event._id}
              id={event._id}
              title={event.title}
              location={event.location || t("common.location_tbd")}
              date={event.date ? new Date(event.date).toLocaleString() : t("common.date_tbd")}
              badge={typeof event.distanceKm === "number" ? `${event.distanceKm.toFixed(1)} km` : undefined}
              tags={event.tags || event.skills || [t("common.location_tbd")]}
              actions={
                <Link className="nepal-button-secondary" to={`/events/${event._id}`}>
                  {t("recommended.view_event")}
                </Link>
              }
            />
          ))}
          {events.length === 0 ? (
            <p className="text-sm text-muted">{t("nearby.no_events")}</p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
