import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { getUser, hasToken } from "../services/api";
import EventCard from "../components/EventCard.jsx";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";

const sampleEvents = [
  {
    id: "sample-1",
    title: "Riverbank Cleanup",
    location: "Riverside Park",
    date: "2026-02-22T09:00:00",
    hours: 3,
    organization: "Green City Alliance",
    tags: ["Environment", "Outdoors"],
  },
  {
    id: "sample-2",
    title: "Food Pantry Sorting",
    location: "Downtown Community Hub",
    date: "2026-02-25T14:00:00",
    hours: 2,
    organization: "Hope Pantry",
    tags: ["Food Security", "Warehouse"],
  },
  {
    id: "sample-3",
    title: "Neighborhood Tutoring",
    location: "Westside Learning Center",
    date: "2026-02-27T16:30:00",
    hours: 1.5,
    organization: "Bright Futures",
    tags: ["Education", "Youth"],
  },
];

export default function Events() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("any");
  const [skills, setSkills] = useState("");
  const [radiusKm, setRadiusKm] = useState("10");
  const [coords, setCoords] = useState(null);
  const [debounced, setDebounced] = useState({
    query: "",
    filter: "all",
    locationFilter: "all",
    dateFilter: "any",
    skills: "",
    radiusKm: "10",
    coords: null,
  });
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebounced({ query, filter, locationFilter, dateFilter, skills, radiusKm, coords });
    }, 350);
    return () => clearTimeout(handle);
  }, [query, filter, locationFilter, dateFilter, skills, radiusKm, coords]);

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (debounced.query) params.set("q", debounced.query);
        if (debounced.filter !== "all") params.set("cause", debounced.filter);
        if (debounced.locationFilter !== "all") params.set("location", debounced.locationFilter);
        if (debounced.skills.trim()) params.set("skills", debounced.skills);

        if (debounced.dateFilter !== "any") {
          const now = new Date();
          if (debounced.dateFilter === "week") {
            const d = new Date();
            d.setDate(now.getDate() + 7);
            params.set("from", now.toISOString());
            params.set("to", d.toISOString());
          } else if (debounced.dateFilter === "month") {
            const d = new Date();
            d.setDate(now.getDate() + 30);
            params.set("from", now.toISOString());
            params.set("to", d.toISOString());
          } else if (debounced.dateFilter === "past") {
            params.set("to", now.toISOString());
          }
        }

        if (debounced.coords?.lat && debounced.coords?.lng && debounced.radiusKm) {
          params.set("lat", debounced.coords.lat);
          params.set("lng", debounced.coords.lng);
          params.set("radiusKm", debounced.radiusKm);
        }

        const qs = params.toString();
        const res = await api.get(`/events${qs ? `?${qs}` : ""}`);
        setEvents(res.data || []);
        setStatus("ready");
      } catch (err) {
        setStatus("ready");
        setMessage(
          err?.response?.status === 401
            ? "Sign in to see live event listings."
            : "Unable to load live events right now."
        );
        setEvents(sampleEvents);
      }
    };
    load();
  }, [debounced]);

  const locationOptions = useMemo(() => {
    const map = new Map();
    events.forEach((e) => {
      if (!e.location) return;
      const key = e.location.toLowerCase();
      if (!map.has(key)) map.set(key, e.location);
    });
    return Array.from(map.values());
  }, [events]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setMessage("Unable to access your location.")
    );
  };

  const distanceKm = (event) => {
    if (!coords || event.locationLat == null || event.locationLng == null) return null;
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(event.locationLat - coords.lat);
    const dLng = toRad(event.locationLng - coords.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coords.lat)) * Math.cos(toRad(event.locationLat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  return (
    <PageShell>
      <PageMeta 
        title={t('events.title')} 
        description={t('events.subtitle')} 
      />
      {/* header */}
      <section className="nepal-card p-6 sm:p-8">
        <h1 className="font-heading text-2xl font-semibold text-ink sm:text-3xl">
          {t('events.title')}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {t('events.subtitle')}
        </p>

        {/* filters */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="nepal-field lg:col-span-2">
            <label htmlFor="ev-search" className="nepal-label">{t('events.search')}</label>
            <input
              id="ev-search"
              className="nepal-input"
              placeholder={t('events.search_placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="nepal-field">
            <label htmlFor="ev-cause" className="nepal-label">{t('nav.events')}</label>
            <select id="ev-cause" className="nepal-input" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">{t('events.filter_all')}</option>
              <option value="environment">{t('events.filter_env')}</option>
              <option value="education">{t('events.filter_edu')}</option>
              <option value="food">{t('events.filter_food')}</option>
            </select>
          </div>
          <div className="nepal-field">
            <label htmlFor="ev-loc" className="nepal-label">{t('events.location')}</label>
            <select id="ev-loc" className="nepal-input" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
              <option value="all">{t('events.filter_all')}</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc.toLowerCase()}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="nepal-field">
            <label htmlFor="ev-date" className="nepal-label">{t('events.date_range')}</label>
            <select id="ev-date" className="nepal-input" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="any">{t('events.any_date')}</option>
              <option value="week">{t('events.next_7_days')}</option>
              <option value="month">{t('events.next_30_days')}</option>
              <option value="past">{t('events.past_events')}</option>
            </select>
          </div>
          <div className="nepal-field">
            <label htmlFor="ev-skills" className="nepal-label">{t('events.skills')}</label>
            <input id="ev-skills" className="nepal-input" placeholder="Comma-separated" value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <button className="nepal-button-secondary h-11" onClick={requestLocation} type="button">
              📍 {t('events.my_location')}
            </button>
            <div className="nepal-field flex-1">
              <label htmlFor="ev-radius" className="nepal-label">{t('events.radius')}</label>
              <select id="ev-radius" className="nepal-input" value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} disabled={!coords}>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="25">25 km</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* loading skeletons */}
      {status === "loading" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`sk-${i}`} className="nepal-card p-6">
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="skeleton mt-3 h-3 w-1/3 rounded" />
              <div className="skeleton mt-6 h-3 w-full rounded" />
              <div className="skeleton mt-2 h-3 w-5/6 rounded" />
              <div className="skeleton mt-6 h-8 w-24 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {message && (
        <div className="nepal-card border-amber-200 bg-amber-50 p-4 text-sm text-amber-700" role="status">
          {message}
        </div>
      )}

      {/* event grid */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Event listings">
        {events.map((event) => (
          <EventCard
            key={event._id || event.id}
            id={event._id || event.id}
            title={event.title}
            location={event.location || "Location TBD"}
            date={event.date ? new Date(event.date).toLocaleString() : "Date TBD"}
            tags={
              event.tags && event.skills
                ? Array.from(new Set([...event.tags, ...event.skills]))
                : event.tags || event.skills || ["Community"]
            }
            hours={event.hours}
            badge={
              coords && event.locationLat && event.locationLng
                ? `${distanceKm(event)?.toFixed(1)} km`
                : undefined
            }
            volunteerCount={event.volunteers?.length}
            actions={
              <div className="flex items-center gap-2">
                <Link className="nepal-button-secondary h-9 px-4 text-[11px]" to={`/events/${event._id || event.id}`}>
                  {t('events.view_details')}
                </Link>
                {(() => {
                  const user = getUser();
                  const isVolunteer = user?.role === "volunteer";
                  const hasJoined = event.volunteers?.some(v => (v.user?._id || v.user) === user?.id);

                  if (!hasToken()) {
                    return (
                      <Link className="nepal-button h-9 px-4 text-[11px]" to="/login">
                        Sign In
                      </Link>
                    );
                  }
                  if (isVolunteer) {
                    return hasJoined ? (
                      <button className="nepal-button-secondary h-9 px-4 text-[11px] opacity-50 cursor-not-allowed" disabled>
                        {t('events.joined')}
                      </button>
                    ) : (
                      <button 
                        className="nepal-button h-9 px-4 text-[11px]" 
                        onClick={async (e) => {
                          e.preventDefault();
                          try {
                            await api.post(`/events/${event._id || event.id}/join`);
                            alert("Application sent!");
                            window.location.reload();
                          } catch (err) {
                            alert(err?.response?.data?.message || "Join failed.");
                          }
                        }}
                      >
                        {t('events.join_mission')}
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
            }
          />
        ))}
      </section>

      {status === "ready" && events.length === 0 && (
        <div className="nepal-card flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
            🔍
          </div>
          <p className="text-sm text-muted">No events match these filters. Try adjusting your criteria.</p>
        </div>
      )}
    </PageShell>
  );
}
