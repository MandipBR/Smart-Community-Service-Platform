import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import PageMeta from "../components/PageMeta.jsx";

const DEFAULT_CENTER = [27.7172, 85.324];

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MapView() {
  const { t } = useTranslation();
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
    <div className="nepal-page dark:bg-slate-950">
      <PageMeta title={t('nav.map')} description={t('map.hero_subtitle')} />
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-8 px-6 py-10">
        <Navbar
          links={[
            { to: "/events", labelKey: "nav.events" },
            { to: "/leaderboard", labelKey: "nav.leaderboard" },
            { to: "/dashboard", labelKey: "nav.dashboard" },
          ]}
        />

        <Hero
          badge={t('nav.map')}
          title={t('map.hero_title')}
          subtitle={t('map.hero_subtitle')}
        />

        {message ? <div className="nepal-card p-4 text-sm text-brandRed">{message}</div> : null}

        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="nepal-card p-6 dark:bg-slate-900/50">
            <label className="text-xs uppercase tracking-[0.2em] text-muted">
              {t('map.filter_by_cause')}
            </label>
            <select
              className="nepal-input mt-3"
              value={cause}
              onChange={(e) => setCause(e.target.value)}
            >
              <option value="all">{t('events.filter_all')}</option>
              <option value="environment">{t('events.filter_env')}</option>
              <option value="education">{t('events.filter_edu')}</option>
              <option value="health">{t('map.cause_health')}</option>
              <option value="community">{t('map.cause_comm')}</option>
            </select>

            <div className="mt-6 space-y-3 overflow-y-auto max-h-[600px] scrollbar-thin">
              {events.length === 0 ? (
                <p className="text-sm text-muted">{t('map.no_events')}</p>
              ) : (
                events.map((event) => (
                  <div
                    key={event._id}
                    className="rounded-xl bg-white/70 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-soft dark:bg-slate-800/40"
                  >
                    <p className="text-sm font-semibold text-ink">{event.title}</p>
                    <p className="text-xs text-muted">{event.location || "Location TBD"}</p>
                    <Link className="text-xs text-brandRed font-medium mt-1 inline-block" to={`/events/${event._id}`}>
                      {t('events.view_details')}
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="nepal-card p-3 dark:bg-slate-900/50">
            <div className="h-[700px] overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
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
                      <div className="p-1" style={{ minWidth: 160 }}>
                        <strong className="text-sm block mb-1">{event.title}</strong>
                        <p className="text-xs text-muted mb-2">{event.location}</p>
                        <Link className="text-xs text-brandRed underline font-bold" to={`/events/${event._id}`}>
                          {t('map.view_event')}
                        </Link>
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
