import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { getUser, getUserFromToken } from "../services/api";
import PageShell from "../components/PageShell.jsx";
import ProfileHero from "../components/ProfileHero.jsx";
import MetricCard from "../components/MetricCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import TimelineList from "../components/TimelineList.jsx";
import BadgePill from "../components/BadgePill.jsx";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import ErrorState from "../components/ErrorState.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function ProfileHub() {
  const authUser = getUserFromToken();
  const cachedUser = getUser();
  const userId = authUser?.id || authUser?._id || cachedUser?.id;
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get(`/volunteer/${userId}/profile`),
          api.get("/volunteer/stats"),
        ]);
        setProfile(profileRes.data);
        setStats(statsRes.data);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load your profile hub.");
      }
    };
    if (userId) load();
  }, [userId]);

  const achievementSummary = useMemo(() => {
    if (!stats) return [];
    return [
      `${stats.impactLevel}`,
      `${stats.eventsCompleted} events completed`,
      `${stats.badges?.length || 0} badges earned`,
    ];
  }, [stats]);

  return (
    <PageShell
      maxWidth="max-w-[1100px]"
      links={[
        { to: "/dashboard", label: "Dashboard" },
        { to: "/my-events", label: "My Events" },
        { to: "/recommended-events", label: "Matches" },
      ]}
    >
      {!profile && !message ? (
        <div className="space-y-6">
          <LoadingSkeleton className="h-[220px] w-full" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <LoadingSkeleton className="h-[120px] w-full" count={4} />
          </div>
        </div>
      ) : null}

      {message ? <ErrorState message={message} /> : null}

      {profile && stats ? (
        <>
          <ProfileHero
            name={profile.name}
            subtitle="Volunteer profile hub"
            bio={profile.bio || "Build a visible record of the causes you support and the impact you create."}
            badge={stats.impactLevel}
            meta={achievementSummary}
            tags={[...(profile.causes || []), ...(profile.skills || [])].slice(0, 8)}
          />

          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Total hours" value={stats.totalHours} helper="Verified service hours" />
            <MetricCard label="Points" value={stats.points} helper="Engagement score" />
            <MetricCard label="Level" value={stats.level} helper={stats.impactLevel} />
            <MetricCard label="Badges" value={stats.badges?.length || 0} helper="Milestones earned" />
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="nepal-card p-8">
              <SectionHeader eyebrow="Event History" title="Your contribution timeline" subtitle="A clear timeline of work already completed through the platform." />
              <div className="mt-8">
                <TimelineList
                  items={(profile.eventsParticipated || []).map((event) => ({
                    id: event.id,
                    title: event.title,
                    meta: event.date ? new Date(event.date).toLocaleDateString() : "Date pending",
                    description: `Worked with ${event.organization || "an organization"}`,
                  }))}
                />
              </div>
            </div>

            <div className="space-y-6">
              <section className="nepal-card p-8">
                <SectionHeader eyebrow="Achievements" title="What this profile signals" subtitle="Badges and milestone markers make your community work easier to understand at a glance." />
                <div className="mt-6 flex flex-wrap gap-2">
                  {(profile.badges?.length ? profile.badges : ["Community Starter", "Active Volunteer", "Impact Leader"]).map((badge) => (
                    <BadgePill key={badge} tone="red">{badge}</BadgePill>
                  ))}
                </div>
              </section>

              <section className="nepal-card p-8">
                <SectionHeader eyebrow="Quick Links" title="Useful next steps" />
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link className="nepal-button" to={`/volunteer/${profile.id}`}>Public Profile</Link>
                  <Link className="nepal-button-secondary" to="/notifications">Notifications</Link>
                  <Link className="nepal-button-secondary" to="/recommended-events">Find matches</Link>
                </div>
              </section>
            </div>
          </section>
        </>
      ) : null}

      {profile && !(profile.eventsParticipated || []).length ? (
        <EmptyState
          title="No event history yet"
          message="Join your first opportunity to start building a public service record."
          action={<Link className="nepal-button" to="/events">Browse events</Link>}
        />
      ) : null}
    </PageShell>
  );
}
