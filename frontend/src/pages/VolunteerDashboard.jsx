import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api, { hasToken } from "../services/api";
import StatCard from "../components/StatCard.jsx";
import EventCard from "../components/EventCard.jsx";
import ActivityFeed from "../components/ActivityFeed.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";

export default function VolunteerDashboard({ user }) {
  const [stats, setStats] = useState({});
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [hours, setHours] = useState("");
  const [eventId, setEventId] = useState("");
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    const load = async () => {
      if (!hasToken()) {
        setMessage("Please sign in to load your dashboard.");
        setLoading(false);
        return;
      }
      try {
        const [statsRes, eventsRes, notifRes] = await Promise.all([
          api.get("/volunteer/stats"),
          api.get("/events"),
          api.get("/notifications"),
        ]);
        setStats(statsRes.data);
        setEvents(eventsRes.data);
        const items = (notifRes.data.data || []).slice(0, 5).map((item) => ({
          id: item._id,
          title: item.message,
          subtitle: item.type.replaceAll("_", " "),
          time: new Date(item.createdAt).toLocaleTimeString(),
        }));
        setActivity(items);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          setMessage("Please sign in again to load your dashboard.");
        } else if (status === 403) {
          setMessage("You don't have access to volunteer stats.");
        } else {
          setMessage(err?.response?.data?.message || "Unable to load dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const join = async (id) => {
    try {
      await api.post(`/events/${id}/join`);
      setMessage("Request sent to the organization.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Unable to join event.");
    }
  };

  const logHours = async () => {
    if (!eventId || !hours) {
      setMessage("Select an event and enter hours.");
      return;
    }
    try {
      await api.post("/volunteer/log", {
        eventId,
        hours: Number(hours),
      });
      setMessage("Hours logged successfully.");
      setHours("");
      const statsRes = await api.get("/volunteer/stats");
      setStats(statsRes.data);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Unable to log hours.");
    }
  };

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Volunteer dashboard"
        subtitle="Track your impact, stay on top of opportunities, and keep your public profile moving forward."
        actions={
          <>
            {user?.id ? (
              <Link className="nepal-button-secondary" to={`/volunteer/${user.id}`}>
                View public profile
              </Link>
            ) : null}
            {user?.id ? (
              <Link className="nepal-button-secondary" to={`/impact-profile/${user.id}`}>
                Impact profile
              </Link>
            ) : null}
            <Link className="nepal-button-secondary" to="/recommended-events">
              AI recommendations
            </Link>
            <Link className="nepal-button-secondary" to="/notifications">
              Notifications
            </Link>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={`stat-skeleton-${idx}`} className="nepal-card h-[120px] w-[260px] p-6">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton mt-4 h-8 w-24 rounded" />
              <div className="skeleton mt-4 h-3 w-28 rounded" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              label="Hours"
              value={stats.totalHours ?? 0}
              trend="+0%"
              helper="Total logged"
            />
            <StatCard
              label="Points"
              value={stats.points ?? 0}
              trend="+0%"
              helper="Impact points"
            />
            <StatCard
              label="Impact score"
              value={stats.impactScore ?? 0}
              trend="+0%"
              helper={stats.impactLevel || "Volunteer"}
            />
            <StatCard
              label="Badges"
              value={stats.badges?.length || 0}
              helper={stats.badges && stats.badges.length ? stats.badges.join(", ") : "No badges yet"}
            />
          </>
        )}
      </div>

      {message ? <div className="nepal-card p-4 text-sm text-brandRed">{message}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="nepal-card p-6">
          <p className="eyebrow">Operations</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">Log volunteer hours</h3>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <select
              className="nepal-input"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            >
              <option value="">Select event</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
            <input
              className="nepal-input"
              type="number"
              min="1"
              placeholder="Hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
            <button className="nepal-button" onClick={logHours} type="button">
              Log hours
            </button>
          </div>
          <p className="mt-4 text-xs text-muted">
            Select a completed event and record your contributed hours.
          </p>
        </div>

        <ActivityFeed items={activity} />
      </div>

      <section>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Pipeline</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">Upcoming events</h3>
          </div>
          <Link className="nepal-button-secondary" to="/events">
            Browse all
          </Link>
        </div>
        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={`event-skeleton-${idx}`} className="nepal-card h-[220px] w-full max-w-[360px] p-6">
                <div className="skeleton h-4 w-40 rounded" />
                <div className="skeleton mt-3 h-3 w-24 rounded" />
                <div className="skeleton mt-6 h-3 w-full rounded" />
                <div className="skeleton mt-2 h-3 w-5/6 rounded" />
                <div className="skeleton mt-8 h-9 w-28 rounded-xl" />
              </div>
            ))
          ) : null}
          {!loading && events.slice(0, 3).map((event) => (
            <EventCard
              key={event._id}
              id={event._id}
              title={event.title}
              location={event.location || "Location TBD"}
              date={event.date ? new Date(event.date).toLocaleString() : "TBA"}
              tags={event.tags || event.skills || ["Community"]}
              volunteerCount={event.volunteers?.length}
              actions={
                <button
                  className="nepal-button-secondary"
                  onClick={() => join(event._id)}
                  type="button"
                >
                  Request to join
                </button>
              }
            />
          ))}
          {!loading && events.length === 0 ? (
            <div className="nepal-card p-6">
              <p className="text-sm text-muted">No upcoming events right now.</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
