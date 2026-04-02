import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { hasToken, getUserFromToken } from "../services/api";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";
import StatCard from "../components/StatCard.jsx";
import EventCard from "../components/EventCard.jsx";

export default function VolunteerDashboard({ user: propUser }) {
  const { t } = useTranslation();
  const tokenUser = getUserFromToken();
  const user = propUser || tokenUser;
  const [stats, setStats] = useState({});
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [logData, setLogData] = useState({ eventId: "", hours: "" });
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    
    const loadData = async () => {
      try {
        const [statsRes, eventsRes, notifRes] = await Promise.all([
          api.get("/volunteer/stats"),
          api.get("/events"),
          api.get("/notifications"),
        ]);
        const safeEvents = Array.isArray(eventsRes?.data) ? eventsRes.data : [];
        const safeNotifications = Array.isArray(notifRes?.data?.data)
          ? notifRes.data.data
          : [];
        setStats(statsRes.data);
        setEvents(safeEvents);
        setNotifications(safeNotifications.slice(0, 5));
      } catch (err) {
        setMessage(err?.response?.data?.message || "Failed to sync dashboard.");
      } finally {
        setLoading(false);
      }
    };

    if (hasToken()) loadData();
    else setLoading(false);
  }, []);

  const handleJoin = async (id) => {
    try {
      await api.post(`/events/${id}/join`);
      setMessage("Application sent successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Join request failed.");
    }
  };

  const handleLogHours = async (e) => {
    e.preventDefault();
    if (!logData.eventId || !logData.hours) return;
    try {
      await api.post("/volunteer/log", {
        eventId: logData.eventId,
        hours: Number(logData.hours),
      });
      setMessage("Hours logged and pending verification.");
      setLogData({ eventId: "", hours: "" });
      const statsRes = await api.get("/volunteer/stats");
      setStats(statsRes.data);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Logging failed.");
    }
  };

  if (loading) {
    return (
      <PageShell maxWidth="max-w-[1600px]">
        <div className="flex items-center justify-center py-40">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brandRed border-t-transparent" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="max-w-[1600px]">
      <PageMeta 
        title={t('dashboard.title')} 
        description={t('dashboard.subtitle')} 
      />
      {/* Header */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-12">
        <div className="max-w-[640px]">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl leading-[1.1]">{t('dashboard.title')}</h1>
          <p className="mt-4 text-lg text-muted font-medium">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/events" className="nepal-button text-sm h-12 px-8 shadow-lift">{t('dashboard.explore_cta')}</Link>
          <Link to="/notifications" className="nepal-button-secondary text-sm h-12 px-6 relative border-slate-200">
            {t('dashboard.notif_cta')}
            {notifications.some(n => !n.read) && (
              <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-brandRed shadow-sm" />
            )}
          </Link>
        </div>
      </header>

      {/* Primary Stats Grid */}
      <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        <StatCard 
          label={t('dashboard.total_hours')} 
          value={stats.totalHours || 0} 
          helper={t('dashboard.verified_time')} 
          icon="⏱️" 
          trend="+12%" 
        />
        <StatCard 
          label={t('dashboard.points')} 
          value={stats.points || 0} 
          helper={t('dashboard.reward_balance')} 
          icon="⚡" 
          trend="+5%" 
        />
        <StatCard 
          label={t('dashboard.impact_level')} 
          value={stats.impactLevel || "Member"} 
          helper={t('dashboard.rank_progression')} 
          icon="✨" 
        />
        <StatCard 
          label={t('dashboard.rank')} 
          value={`#${stats.rank || "—"}`} 
          helper={t('dashboard.global_placement')} 
          icon="🏆" 
        />
      </section>

      {message && (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 px-8 py-5 text-[15px] font-bold text-emerald-700 animate-fadeUp mb-12 flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px]">✓</span>
          {message}
        </div>
      )}

      {/* Main Content Modules */}
      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        
        {/* Left: Operations & Recommendations */}
        <div className="space-y-12">
          
          {/* Enhanced Action Center */}
          <section className="nepal-card p-10 relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brandRed/5 blur-3xl transition-transform group-hover:scale-125" />
            
            <div className="relative z-10">
              <div className="mb-10">
                <p className="eyebrow Onboarding mb-4">Operations</p>
                <h3 className="text-2xl font-bold text-ink">{t('dashboard.action_center')}</h3>
                <p className="mt-2 text-md text-muted font-medium">{t('dashboard.action_center_subtitle')}</p>
              </div>
              
              <form onSubmit={handleLogHours} className="grid gap-6 md:grid-cols-[1fr_160px_180px]">
                <div className="nepal-field">
                  <select 
                    className="nepal-input h-14 font-bold"
                    value={logData.eventId}
                    onChange={(e) => setLogData({ ...logData, eventId: e.target.value })}
                    required
                  >
                    <option value="">{t('dashboard.select_event')}...</option>
                    {events.map(ev => (
                      <option key={ev._id} value={ev._id}>{ev.title}</option>
                    ))}
                  </select>
                </div>
                <div className="nepal-field">
                  <input 
                    type="number" 
                    className="nepal-input h-14 font-bold" 
                    placeholder={t('dashboard.hours_input')}
                    value={logData.hours}
                    onChange={(e) => setLogData({ ...logData, hours: e.target.value })}
                    required
                    min="0.5"
                    step="0.5"
                  />
                </div>
                <button type="submit" className="nepal-button h-14 shadow-lift tracking-tight">
                  {t('dashboard.log_activity')}
                </button>
              </form>
            </div>
          </section>

          {/* Matches Grid */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-ink leading-tight">{t('dashboard.matches_for_you')}</h3>
              <Link to="/events" className="text-sm font-bold text-brandRed hover:underline tracking-tight">{t('dashboard.view_all')}</Link>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2">
              {events.slice(0, 4).map(event => (
                <EventCard 
                  key={event._id}
                  {...event}
                  id={event._id}
                  date={new Date(event.date).toLocaleDateString([], { dateStyle: 'medium' })}
                  actions={
                    <button 
                      onClick={() => handleJoin(event._id)}
                      className="nepal-button h-10 px-6 text-xs font-bold"
                    >
                      {t('events.join_mission')}
                    </button>
                  }
                />
              ))}
              {events.length === 0 && (
                <div className="col-span-full nepal-card p-16 text-center animate-fadeUp">
                  <p className="text-lg text-muted font-medium">No active missions currently matching your profile.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right: Feeds & Discovery */}
        <aside className="space-y-10">
          {/* Immersive Activity Feed */}
          <section className="nepal-card p-10">
            <h3 className="text-xl font-bold text-ink mb-10 leading-tight">{t('dashboard.activity_feed')}</h3>
            <div className="space-y-8">
              {notifications.length > 0 ? (
                notifications.map((n, idx) => (
                  <div key={n._id || idx} className="flex gap-5 group items-start">
                    <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl transition-all group-hover:scale-110 shadow-sm">
                      {n.type === 'event_reminder' ? '🔔' : '✨'}
                    </div>
                    <div className="min-w-0 pt-1">
                      <p className="text-[14px] font-bold text-ink leading-relaxed line-clamp-3 group-hover:text-brandRed transition-colors">{n.message}</p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.15em] font-bold text-muted/60">
                        {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4 opacity-20">📭</div>
                  <p className="text-sm font-bold text-muted/50 uppercase tracking-widest">{t('dashboard.no_recent_activity')}</p>
                </div>
              )}
            </div>
          </section>

          {/* Dynamic Presence Card */}
          <section className="nepal-card p-10 bg-gradient-to-br from-brandRed to-brandBlue text-white border-0 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-hero-glow opacity-20 transition-opacity group-hover:opacity-40" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold leading-tight">{t('dashboard.public_presence')}</h3>
              <p className="mt-4 text-[15px] text-white/90 leading-relaxed font-medium">
                {t('dashboard.public_presence_desc')}
              </p>
              <div className="mt-10 flex flex-col gap-4">
                <Link to="/profile" className="w-full h-14 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-sm font-bold hover:bg-white hover:text-brandRed transition-all duration-300">
                  {t('dashboard.profile_hub')}
                </Link>
                <Link to={`/impact-profile/${user?.id || user?._id}`} className="w-full h-14 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-sm font-bold hover:bg-white hover:text-brandBlue transition-all duration-300">
                  {t('dashboard.impact_analytics')}
                </Link>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
