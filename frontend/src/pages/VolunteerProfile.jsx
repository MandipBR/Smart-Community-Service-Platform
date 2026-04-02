import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import StatCard from "../components/StatCard.jsx";
import EventCard from "../components/EventCard.jsx";

const initialsFrom = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function VolunteerProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");
  const badge = useMemo(() => {
    if (!profile) return "Starter";
    if (profile.totalHours >= 100) return "Gold";
    if (profile.totalHours >= 50) return "Silver";
    if (profile.totalHours >= 10) return "Bronze";
    return "Starter";
  }, [profile]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/volunteer/${id}/profile`);
        setProfile(res?.data && typeof res.data === "object" ? res.data : null);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Volunteer not found.");
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
            { to: "/leaderboard", label: "Leaderboard" },
            { to: "/map", label: "Map" },
            { to: "/profile", label: "My Hub" },
          ]}
        />

        <Hero
          badge="Volunteer"
          title={profile?.name || "Volunteer profile"}
          subtitle="Public reputation and impact history."
        />
        <div>
          <Link className="nepal-button-secondary h-10 px-4 text-xs btn-back" to="/leaderboard" aria-label="Go Back">
            Back to leaderboard
          </Link>
        </div>

        {message ? <div className="nepal-card p-4 text-sm text-brandRed">{message}</div> : null}

        {profile ? (
          <div className="space-y-8">
            <section className="nepal-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brandRed/10 text-lg font-semibold text-brandRed">
                    {initialsFrom(profile.name)}
                  </div>
                  <div>
                    <h2 className="section-title">{profile.name}</h2>
                    <p className="text-sm text-muted">Public volunteer profile</p>
                  </div>
                </div>
                <span className="rounded-full bg-brandBlue/10 px-3 py-1 text-xs text-brandBlue">
                  {badge} badge
                </span>
              </div>
              <p className="mt-4 text-sm text-muted">{profile.bio || "No bio yet."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(Array.isArray(profile?.causes) ? profile.causes : Array.isArray(profile?.skills) ? profile.skills : ["Community"]).map((tag) => (
                  <span
                    key={`${profile.id}-${tag}`}
                    className="rounded-full bg-brandRed/10 px-3 py-1 text-xs text-brandRed"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Total hours" value={profile.totalHours} />
              <StatCard label="Points" value={profile.points} />
              <StatCard
                label="Badges"
                value={profile.badges?.length ? profile.badges.length : 0}
                helper={profile.badges?.length ? profile.badges.join(", ") : "No badges yet"}
              />
            </section>

            <section className="nepal-card p-6">
              <h3 className="text-lg font-semibold text-ink">Event history</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {profile.eventsParticipated?.length ? (
                  profile.eventsParticipated.map((event, idx) => (
                    <EventCard
                      key={event?.id || `event-${idx}`}
                      id={event.id}
                      title={event?.title || "Event"}
                      location={event.organization || "Organization"}
                      date={event.date ? new Date(event.date).toLocaleDateString() : "Date TBD"}
                      tags={["Completed"]}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted">No events yet.</p>
                )}
              </div>
            </section>

            <section className="nepal-card p-6">
              <h3 className="text-lg font-semibold text-ink">Recommended opportunities</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {profile.recommendedEvents?.length ? (
                  profile.recommendedEvents.map((event, idx) => (
                    <EventCard
                      key={event?._id || `rec-${idx}`}
                      id={event._id}
                      title={event?.title || "Event"}
                      location={event.location || "Location"}
                      date={event.date ? new Date(event.date).toLocaleDateString() : "Date TBD"}
                      tags={Array.isArray(event?.tags) ? event.tags : Array.isArray(event?.skills) ? event.skills : ["Community"]}
                      actions={
                        <Link className="nepal-button-secondary" to={`/events/${event._id}`}>
                          View event
                        </Link>
                      }
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted">No recommendations yet.</p>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
