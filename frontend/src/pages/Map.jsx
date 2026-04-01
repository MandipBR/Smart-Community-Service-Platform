import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import api from "../services/api";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";

const DEFAULT_CENTER = [27.7172, 85.324];

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MapView() {
  const [events, setEvents] = useState([]);
  const [cause, setCause] = useState("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/events", {
          params: { cause },
        });
        setEvents(res.data || []);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load events.");
      }
    };
    load();
  }, [cause]);

  const markers = useMemo(
    () =>
      events.filter(
        (event) => event.locationLat != null && event.locationLng != null
      ),
    [events]
  );

  const center = markers.length
    ? [markers[0].locationLat, markers[0].locationLng]
    : DEFAULT_CENTER;

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <Navbar
          links={[
            { to: "/events", label: "Events" },
            { to: "/leaderboard", label: "Leaderboard" },
            { to: "/notifications", label: "Notifications" },
          ]}
        />

        <Hero
          badge="Event Map"
          title="Find opportunities near you"
          subtitle="Explore community events on an interactive map and filter by cause."
        />

        {message ? <div className="nepal-card p-4 text-sm text-brandRed">{message}</div> : null}

        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="nepal-card p-6">
            <label className="text-xs uppercase tracking-[0.2em] text-muted">
              Filter by cause
            </label>
            <select
              className="nepal-input mt-3"
              value={cause}
              onChange={(e) => setCause(e.target.value)}
            >
              <option value="all">All</option>
              <option value="environment">Environment</option>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="community">Community</option>
            </select>

            <div className="mt-6 space-y-3 overflow-y-auto max-h-[420px]">
              {events.length === 0 ? (
                <p className="text-sm text-muted">No events to show.</p>
              ) : (
                events.map((event) => (
                  <div
                    key={event._id}
                    className="rounded-xl bg-white/70 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-soft"
                  >
                    <p className="text-sm font-semibold text-ink">{event.title}</p>
                    <p className="text-xs text-muted">{event.location || "Location TBD"}</p>
                    <Link className="text-xs text-brandRed" to={`/events/${event._id}`}>
                      View details
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="nepal-card p-3">
            <div className="h-[500px] overflow-hidden rounded-2xl">
              <MapContainer
                center={center}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((event) => (
                  <Marker
                    key={event._id}
                    position={[event.locationLat, event.locationLng]}
                  >
                    <Popup>
                      <div style={{ minWidth: 160 }}>
                        <strong>{event.title}</strong>
                        <p className="text-xs text-muted">{event.location}</p>
                        <Link to={`/events/${event._id}`}>View event</Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
