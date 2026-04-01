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
        setStats(statsRes.data);
        setEvents(eventsRes.data || []);
        setNotifications((notifRes.data.data || []).slice(0, 5));
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
      <PageShell withSidebar maxWidth="max-w-[1200px]">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brandRed border-t-transparent" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell withSidebar maxWidth="max-w-[1200px]">
      <PageMeta 
        title={t('dashboard.title')} 
        description={t('dashboard.subtitle')} 
      />
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">{t('dashboard.title')}</h1>
          <p className="mt-1 text-sm text-muted">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/events" className="nepal-button text-xs h-10 px-6">{t('dashboard.explore_cta')}</Link>
          <Link to="/notifications" className="nepal-button-secondary text-xs h-10 px-4 relative">
            {t('dashboard.notif_cta')}
            {notifications.some(n => !n.read) && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-brandRed border-2 border-white" />
            )}
          </Link>
        </div>
      </header>

      {/* Primary Stats */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('dashboard.total_hours')} value={stats.totalHours || 0} helper={t('dashboard.verified_time')} icon="⏱️" trend="+12%" />
        <StatCard label={t('dashboard.points')} value={stats.points || 0} helper={t('dashboard.reward_balance')} icon="⚡" trend="+5%" />
        <StatCard label={t('dashboard.impact_level')} value={stats.impactLevel || "Member"} helper={t('dashboard.rank_progression')} icon="✨" />
        <StatCard label={t('dashboard.rank')} value={`#${stats.rank || "—"}`} helper={t('dashboard.global_placement')} icon="🏆" />
      </section>

      {message && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 px-5 py-3 text-sm font-bold text-emerald-700 animate-fadeUp">
          {message}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        
        {/* Left Column: Operations & Events */}
        <div className="space-y-10">
          
          {/* Quick Logs */}
          <section className="nepal-card p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-ink">{t('dashboard.action_center')}</h3>
                <p className="mt-1 text-xs text-muted">{t('dashboard.action_center_subtitle')}</p>
              </div>
            </div>
            
            <form onSubmit={handleLogHours} className="grid gap-4 md:grid-cols-[1fr_120px_140px]">
              <div className="nepal-field">
                <select 
                  className="nepal-input h-11"
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
                  className="nepal-input h-11" 
                  placeholder={t('dashboard.hours_input')}
                  value={logData.hours}
                  onChange={(e) => setLogData({ ...logData, hours: e.target.value })}
                  required
                  min="0.5"
                  step="0.5"
                />
              </div>
              <button type="submit" className="nepal-button h-11">{t('dashboard.log_activity')}</button>
            </form>
          </section>

          {/* Upcoming Events */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-ink">{t('dashboard.matches_for_you')}</h3>
              <Link to="/events" className="text-xs font-bold text-brandRed hover:underline">{t('dashboard.view_all')}</Link>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {events.slice(0, 4).map(event => (
                <EventCard 
                  key={event._id}
                  {...event}
                  id={event._id}
                  date={new Date(event.date).toLocaleDateString()}
                  actions={
                    <button 
                      onClick={() => handleJoin(event._id)}
                      className="nepal-button-secondary h-9 px-4 text-xs"
                    >
                      Join
                    </button>
                  }
                />
              ))}
              {events.length === 0 && (
                <div className="col-span-full nepal-card p-12 text-center">
                  <p className="text-sm text-muted">No active events found in your region.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Feed & Social */}
        <aside className="space-y-8">
          {/* Notifications Feed */}
          <section className="nepal-card p-8">
            <h3 className="text-lg font-bold text-ink">{t('dashboard.activity_feed')}</h3>
            <div className="mt-6 space-y-6">
              {notifications.length > 0 ? (
                notifications.map((n, idx) => (
                  <div key={n._id || idx} className="flex gap-4 group">
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg transition-transform group-hover:scale-110">
                      {n.type === 'event_reminder' ? '🔔' : '✨'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ink line-clamp-2">{n.message}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider font-bold text-muted">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted text-center py-4">No recent activity.</p>
              )}
            </div>
          </section>

          {/* Quick Profile Widget */}
          <section className="nepal-card p-8 bg-gradient-to-br from-brandRed to-brandBlue text-white border-0">
            <h3 className="text-lg font-bold">{t('dashboard.public_presence')}</h3>
            <p className="mt-1 text-xs text-white/80 leading-relaxed">
              {t('dashboard.public_presence_desc')}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link to="/profile" className="w-full h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xs font-bold hover:bg-white/30 transition-colors">
                {t('dashboard.profile_hub')}
              </Link>
              <Link to={`/impact-profile/${user?.id || user?._id}`} className="w-full h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xs font-bold hover:bg-white/30 transition-colors">
                {t('dashboard.impact_analytics')}
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
