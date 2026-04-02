import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { getUser, getUserFromToken, hasToken } from "../services/api";
import EventCard from "../components/EventCard.jsx";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";

export default function Events() {
  const { t } = useTranslation();
  const tokenUser = getUserFromToken();
  const cachedUser = getUser();
  const authRole = tokenUser?.role;
  const authUserId = tokenUser?.id || tokenUser?._id || cachedUser?.id;
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("any");
  const [skills] = useState("");
  const [radiusKm] = useState("10");
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
        setEvents(Array.isArray(res.data) ? res.data : []);
        setStatus("ready");
      } catch (err) {
        setStatus("ready");
        setMessage(
          err?.response?.status === 401
            ? t('events.signin_req')
            : t('events.load_error')
        );
        setEvents([]);
      }
    };
    load();
  }, [debounced, t]);

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
    <PageShell maxWidth="max-w-[1600px]">
      <PageMeta 
        title={t('events.title')} 
        description={t('events.subtitle')} 
      />
      {/* header */}
      <section className="nepal-card p-8 md:p-12 mb-10">
        <div className="max-w-[800px] mb-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl leading-[1.1]">
            {t('events.title')}
          </h1>
          <p className="mt-4 text-lg text-muted/90 font-medium">
            {t('events.subtitle')}
          </p>
        </div>

        {/* filters */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div className="nepal-field sm:col-span-2 lg:col-span-2">
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
          <div className="flex items-end gap-2">
            <button className="nepal-button-secondary w-full h-11 text-xs font-bold shadow-sm" onClick={requestLocation} type="button">
              📍 {t('events.my_location')}
            </button>
          </div>
        </div>
      </section>

      {/* loading skeletons */}
      {status === "loading" && (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`sk-${i}`} className="nepal-card p-8">
              <div className="skeleton h-6 w-2/3 rounded-xl mb-4" />
              <div className="skeleton h-4 w-1/3 rounded-lg mb-8" />
              <div className="skeleton h-4 w-full rounded-lg mb-2" />
              <div className="skeleton h-4 w-5/6 rounded-lg mb-8" />
              <div className="skeleton h-10 w-28 rounded-2xl" />
            </div>
          ))}
        </div>
      )}

      {message && (
        <div className="nepal-card border-amber-200 bg-amber-50 p-6 text-[15px] font-bold text-amber-700 mb-10 animate-fadeUp" role="status">
          {message}
        </div>
      )}

      {/* mission grid */}
      <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Mission listings">
        {events.map((event) => (
          <EventCard
            key={event._id || event.id}
            id={event._id || event.id}
            title={event.title}
            location={event.location || "Location TBD"}
            date={event.date ? new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : "Date TBD"}
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
                <Link className="nepal-button-secondary h-10 px-5 text-xs font-bold" to={`/events/${event._id || event.id}`}>
                  {t('events.view_details')}
                </Link>
                {(() => {
                  const isVolunteer = authRole === "volunteer";
                  const hasJoined = event.volunteers?.some(
                    (v) => (v.user?._id || v.user) === authUserId
                  );

                  if (!hasToken()) {
                    return (
                      <Link className="nepal-button h-10 px-5 text-xs font-bold" to="/login">
                        {t('auth.signin')}
                      </Link>
                    );
                  }
                  if (isVolunteer) {
                    return hasJoined ? (
                      <button className="nepal-button-secondary h-10 px-5 text-xs font-bold opacity-50 cursor-not-allowed" disabled>
                        {t('events.joined')}
                      </button>
                    ) : (
                      <button 
                        className="nepal-button h-10 px-5 text-xs font-bold" 
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
        <div className="nepal-card flex flex-col items-center gap-6 p-20 text-center animate-fadeUp">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-4xl shadow-inner">
            🔍
          </div>
          <div className="max-w-[420px]">
            <h3 className="text-xl font-bold text-ink mb-2">No missions found</h3>
            <p className="text-md text-muted leading-relaxed">{t('events.no_events')}</p>
          </div>
        </div>
      )}
    </PageShell>
  );
}
