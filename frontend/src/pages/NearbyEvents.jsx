import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import EventCard from "../components/EventCard.jsx";

export default function NearbyEvents() {
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setMessage("Unable to access your location.")
    );
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!coords) return;
      try {
        const res = await api.get("/events/nearby", {
          params: { lat: coords.lat, lng: coords.lng },
        });
        setEvents(res.data || []);
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
            { to: "/events", label: "Events" },
            { to: "/recommended-events", label: "AI Matches" },
            { to: "/map", label: "Map" },
          ]}
        />

        <Hero
          badge="Nearby Events"
          title="Closest opportunities"
          subtitle="Smart volunteer routing based on your current location."
        />

        {message ? <div className="nepal-card p-4 text-sm text-brandRed">{message}</div> : null}

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event._id}
              id={event._id}
              title={event.title}
              location={event.location || "Location TBD"}
              date={event.date ? new Date(event.date).toLocaleString() : "Date TBD"}
              badge={`${event.distanceKm.toFixed(1)} km`}
              tags={event.tags || event.skills || ["Community"]}
              actions={
                <Link className="nepal-button-secondary" to={`/events/${event._id}`}>
                  View event
                </Link>
              }
            />
          ))}
          {events.length === 0 ? (
            <p className="text-sm text-muted">No nearby events found.</p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
