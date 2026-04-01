import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import EventCard from "../components/EventCard.jsx";

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
      setDebounced({
        query,
        filter,
        locationFilter,
        dateFilter,
        skills,
        radiusKm,
        coords,
      });
    }, 350);
    return () => clearTimeout(handle);
  }, [query, filter, locationFilter, dateFilter, skills, radiusKm, coords]);

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (debounced.query) params.set("q", debounced.query);
        if (debounced.filter !== "all") params.set("cause", debounced.filter);
        if (debounced.locationFilter !== "all") {
          params.set("location", debounced.locationFilter);
        }
        if (debounced.skills.trim()) params.set("skills", debounced.skills);

        if (debounced.dateFilter !== "any") {
          const now = new Date();
          if (debounced.dateFilter === "week") {
            const in7days = new Date();
            in7days.setDate(now.getDate() + 7);
            params.set("from", now.toISOString());
            params.set("to", in7days.toISOString());
          } else if (debounced.dateFilter === "month") {
            const in30days = new Date();
            in30days.setDate(now.getDate() + 30);
            params.set("from", now.toISOString());
            params.set("to", in30days.toISOString());
          } else if (debounced.dateFilter === "past") {
            params.set("to", now.toISOString());
          }
        }

        if (debounced.coords?.lat && debounced.coords?.lng && debounced.radiusKm) {
          params.set("lat", debounced.coords.lat);
          params.set("lng", debounced.coords.lng);
          params.set("radiusKm", debounced.radiusKm);
        }

        const queryString = params.toString();
        const res = await api.get(
          `/events${queryString ? `?${queryString}` : ""}`
        );
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
    events.forEach((event) => {
      if (!event.location) return;
      const key = event.location.toLowerCase();
      if (!map.has(key)) map.set(key, event.location);
    });
    return Array.from(map.values());
  }, [events]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => setMessage("Unable to access your location.")
    );
  };

  const distanceKm = (event) => {
    if (!coords || event.locationLat == null || event.locationLng == null) {
      return null;
    }
    const toRad = (value) => (value * Math.PI) / 180;
    const earthKm = 6371;
    const dLat = toRad(event.locationLat - coords.lat);
    const dLng = toRad(event.locationLng - coords.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coords.lat)) *
        Math.cos(toRad(event.locationLat)) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthKm * c;
  };

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 shadow-soft">
              <span className="text-sm font-semibold text-brandRed">SC</span>
            </div>
            <span className="font-heading text-lg font-semibold">Events</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/">Home</Link>
            <Link to="/map">Map</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/login" className="nepal-button-secondary">
              Sign in
            </Link>
            <Link className="nepal-button" to="/signup">
              Join now
            </Link>
          </nav>
        </header>

        <section className="nepal-card p-8">
          <h1 className="font-heading text-3xl font-semibold">Find a service opportunity</h1>
          <p className="mt-2 text-sm text-muted">
            Browse upcoming events, filter by cause, and join in minutes.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            <input
              className="nepal-input lg:col-span-2"
              placeholder="Search by title or location"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="nepal-input"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All causes</option>
              <option value="environment">Environment</option>
              <option value="education">Education</option>
              <option value="food">Food security</option>
            </select>
            <select
              className="nepal-input"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">All locations</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc.toLowerCase()}>
                  {loc}
                </option>
              ))}
            </select>
            <select
              className="nepal-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="any">Any date</option>
              <option value="week">Next 7 days</option>
              <option value="month">Next 30 days</option>
              <option value="past">Past events</option>
            </select>
            <input
              className="nepal-input"
              placeholder="Skills (comma-separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <div className="flex items-center gap-2 lg:col-span-2">
              <button className="nepal-button-secondary" onClick={requestLocation}>
                Use my location
              </button>
              <select
                className="nepal-input"
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                disabled={!coords}
              >
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
              </select>
            </div>
          </div>
        </section>

        {status === "loading" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="nepal-card h-[220px] w-full max-w-[360px] p-6">
                <div className="skeleton h-4 w-2/3 rounded" />
                <div className="skeleton mt-3 h-3 w-1/3 rounded" />
                <div className="skeleton mt-6 h-3 w-full rounded" />
                <div className="skeleton mt-2 h-3 w-5/6 rounded" />
                <div className="skeleton mt-6 h-8 w-24 rounded-full" />
              </div>
            ))}
          </div>
        ) : null}
        {message ? <div className="nepal-card p-4 text-sm text-brandRed">{message}</div> : null}

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <>
                  <Link className="nepal-button-secondary" to={`/events/${event._id || event.id}`}>
                    View details
                  </Link>
                  <Link className="nepal-button" to="/login">
                    Sign in to join
                  </Link>
                </>
              }
            />
          ))}
        </section>
        {status === "ready" && events.length === 0 ? (
          <p className="text-sm text-muted">No events match these filters.</p>
        ) : null}
      </div>
    </div>
  );
}
