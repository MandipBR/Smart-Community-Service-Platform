import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Event not found.");
      }
    };
    if (id) load();
  }, [id]);

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
          badge="Community Event"
          title={event?.title || "Event details"}
          subtitle="See opportunity details, requirements, and impact goals."
        />

        {message ? <div className="nepal-card p-4 text-sm text-brandRed">{message}</div> : null}

        {event ? (
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="nepal-card p-6">
              <h2 className="section-title">Overview</h2>
              <p className="mt-3 text-sm text-muted">
                {event.description || "No description yet."}
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Location</p>
                  <p className="mt-2 text-sm text-ink">{event.location || "TBD"}</p>
                </div>
                <div className="rounded-xl bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Date</p>
                  <p className="mt-2 text-sm text-ink">
                    {event.date ? new Date(event.date).toLocaleString() : "TBD"}
                  </p>
                </div>
                <div className="rounded-xl bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Hours</p>
                  <p className="mt-2 text-sm text-ink">{event.hours || "Flexible"}</p>
                </div>
                <div className="rounded-xl bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Organization</p>
                  <p className="mt-2 text-sm text-ink">
                    {event.organization?.organizationName || event.organization?.name || "Community"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(event.tags || event.skills || ["Community"]).map((tag) => (
                  <span
                    key={`${event._id}-${tag}`}
                    className="rounded-full bg-brandRed/10 px-3 py-1 text-xs text-brandRed"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="nepal-card p-6">
              <h3 className="text-lg font-semibold text-ink">Join this event</h3>
              <p className="mt-3 text-sm text-muted">
                Sign in to request participation and track your impact score.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link className="nepal-button" to="/login">
                  Sign in to join
                </Link>
                <Link className="nepal-button-secondary" to="/signup">
                  Create volunteer account
                </Link>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
