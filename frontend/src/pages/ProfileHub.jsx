import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { getUser, getUserFromToken, setAuth } from "../services/api";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";
import AvatarUpload from "../components/AvatarUpload.jsx";
import StatCard from "../components/StatCard.jsx";

export default function ProfileHub() {
  const authUser = getUserFromToken();
  const cachedUser = getUser();
  const userId = authUser?.id || authUser?._id || cachedUser?.id;
  
  const [user, setUser] = useState(cachedUser);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, profileRes, statsRes] = await Promise.all([
          api.get("/auth/me"),
          api.get(`/volunteer/${userId}/profile`),
          api.get("/volunteer/stats"),
        ]);
        setUser(meRes.data);
        setAuth(localStorage.getItem("token"), meRes.data);
        setProfile(profileRes.data);
        setStats(statsRes.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load your profile hub.");
      } finally {
        setLoading(false);
      }
    };
    if (userId) load();
  }, [userId]);

  const handleAvatarSuccess = (url) => {
    const updated = { ...user, avatar: url };
    setUser(updated);
    setAuth(localStorage.getItem("token"), updated);
  };

  if (loading) {
    return (
      <PageShell withSidebar maxWidth="max-w-[1000px]">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brandRed border-t-transparent" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell withSidebar maxWidth="max-w-[1000px]">
      <PageMeta 
        title="Profile Hub" 
        description="Manage your volunteer profile, track your service history, and showcase your community impact." 
      />
      {/* Header section with Avatar */}
      <section className="nepal-card relative overflow-hidden p-8 sm:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brandRed/5 blur-3xl opacity-50" aria-hidden="true" />
        
        <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:items-start">
          <AvatarUpload 
            currentAvatar={user?.avatar} 
            onUploadSuccess={handleAvatarSuccess} 
          />
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <h1 className="font-heading text-3xl font-bold tracking-tight text-ink md:text-4xl">
                {user?.name}
              </h1>
              <span className="rounded-full bg-brandRed/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brandRed">
                {stats?.impactLevel || "Aspirant"}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-muted">
              Volunteer Community Member • Joined {new Date(user?.createdAt).getFullYear()}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted/90">
              {profile?.bio || "Building a visible record of community service and social impact. Start participating to grow your service story."}
            </p>
            
            <div className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
              {profile?.causes?.map(cause => (
                <span key={cause} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-muted shadow-sm">
                  {cause}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-label="Volunteer metrics">
        <StatCard label="Total hours" value={stats?.totalHours || 0} helper="Verified time" icon="⏱️" />
        <StatCard label="Points" value={stats?.points || 0} helper="Service score" icon="⚡" />
        <StatCard label="Rank" value={`#${stats?.rank || "—"}`} helper="Global placement" icon="🏆" />
        <StatCard label="Events" value={stats?.eventsCompleted || 0} helper="Completed" icon="📅" />
      </section>

      {/* Activity & Badges */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Experience Timeline */}
        <section className="nepal-card p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink">Service Timeline</h2>
              <p className="mt-1 text-sm text-muted">A chronicle of your community impact.</p>
            </div>
            <Link to="/my-events" className="text-xs font-bold text-brandRed hover:underline">
              View all
            </Link>
          </div>

          <div className="mt-8 space-y-6">
            {(profile?.eventsParticipated || []).length > 0 ? (
              profile.eventsParticipated.map((event, idx) => (
                <div key={event.id || idx} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="h-4 w-4 rounded-full border-2 border-brandRed bg-white transition-colors group-hover:bg-brandRed" />
                    {idx < profile.eventsParticipated.length - 1 && (
                      <div className="w-px flex-1 bg-slate-100" />
                    )}
                  </div>
                  <div className="pb-6">
                    <h4 className="text-[15px] font-bold text-ink">{event.title}</h4>
                    <p className="mt-1 text-xs font-medium text-muted">{new Date(event.date).toLocaleDateString()} • {event.organization}</p>
                    <p className="mt-1 text-xs text-muted/80">{event.hours} hours contributed</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-muted">No events in your timeline yet.</p>
                <Link to="/events" className="mt-3 inline-block text-sm font-bold text-brandRed hover:underline">
                  Find your first event →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar widgets */}
        <aside className="space-y-6">
          {/* Badges Widget */}
          <section className="nepal-card p-8">
            <h3 className="text-lg font-bold text-ink">Achievements</h3>
            <p className="mt-1 text-xs text-muted">Recognition earned through verified action.</p>
            
            <div className="mt-6 flex flex-wrap gap-2">
              {(profile?.badges || []).length > 0 ? (
                profile.badges.map(badge => (
                  <span key={badge} className="rounded-xl bg-brandRed/5 px-3 py-1.5 text-xs font-bold text-brandRed">
                    {badge}
                  </span>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                    No badges yet
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Social Proof Widget */}
          <section className="nepal-card p-8">
            <h3 className="text-lg font-bold text-ink">Privacy & Identity</h3>
            <p className="mt-1 text-xs text-muted">Manage how others see your work.</p>
            
            <div className="mt-6 space-y-3">
              <Link to={`/volunteer/${userId}`} className="nepal-button-secondary w-full text-xs h-10">
                View Public Profile
              </Link>
              <Link to="/settings" className="nepal-button-secondary w-full text-xs h-10">
                Security Settings
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
