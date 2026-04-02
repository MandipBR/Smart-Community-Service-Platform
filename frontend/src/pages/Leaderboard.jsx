import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";
import Hero from "../components/Hero.jsx";
import LeaderboardTable from "../components/LeaderboardTable.jsx";

const badgeFrom = (hours = 0, t) => {
  if (hours >= 100) return t('leaderboard.gold');
  if (hours >= 50) return t('leaderboard.silver');
  if (hours >= 10) return t('leaderboard.bronze');
  return t('leaderboard.starter');
};

export default function Leaderboard() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/volunteer/leaderboard");
        setRows(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setMessage(err?.response?.data?.message || t('leaderboard.load_error'));
      }
    };
    load();
  }, [t]);

  const podium = useMemo(() => rows.slice(0, 3), [rows]);

  const podiumCards = podium.map((volunteer, index) => {
    const isGold = index === 0;
    const scale = isGold ? "scale-110 z-10 border-brandRed/20 shadow-xl" : "scale-100 border-slate-100 grayscale-[0.3]";
    const medal = isGold ? '🥇' : index === 1 ? '🥈' : '🥉';
    
    return (
      <div
        key={volunteer.id || volunteer._id}
        className={`nepal-card p-10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden group ${scale}`}
      >
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-slate-50/50 blur-2xl group-hover:scale-150 transition-transform" />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-white shadow-soft text-4xl border border-slate-50">
            {medal}
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted/60">{t('common.rank')} {index + 1}</p>
          <h3 className="mt-4 text-2xl font-bold text-ink group-hover:text-brandRed transition-colors leading-tight">{volunteer.name}</h3>
          <p className="mt-2 text-sm font-bold text-muted/80">{volunteer.totalHours} {t('leaderboard.hours')}</p>
          <div className="mt-8 flex justify-center">
            <span className={`rounded-xl px-5 py-2 text-[10px] font-bold uppercase tracking-widest ${isGold ? 'bg-brandRed text-white' : 'bg-slate-50 text-muted'}`}>
              {badgeFrom(volunteer.totalHours, t)}
            </span>
          </div>
        </div>
      </div>
    );
  });

  return (
    <PageShell maxWidth="max-w-[1600px]">
      <PageMeta 
        title={t('leaderboard.hero_title')} 
        description={t('leaderboard.hero_subtitle')} 
      />
      
      <Hero
        badge={t('leaderboard.hero_badge')}
        title={t('leaderboard.hero_title')}
        subtitle={t('leaderboard.hero_subtitle')}
        height="min-h-[420px]"
      />

      <div className="mx-auto max-w-[1200px] space-y-20 py-20 animate-fadeUp">
        
        {message && (
          <div className="rounded-2xl border border-red-50 bg-red-50 px-8 py-5 text-[15px] font-bold text-brandRed">
            ✕ {message}
          </div>
        )}

        {/* The Podium Grid */}
        <section className="grid gap-12 md:grid-cols-3 pt-12">
          {podiumCards}
        </section>

        {/* Global Standings Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-slate-100 pb-10">
          <div>
            <p className="eyebrow Onboarding mb-4">Engagement</p>
            <h2 className="text-3xl font-bold text-ink">{t('leaderboard.top_volunteers')}</h2>
          </div>
          <div className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
             <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Live Syncing</span>
          </div>
        </div>

        {/* The Table Layer */}
        <div className="nepal-card overflow-hidden border-slate-100 shadow-soft p-2">
          <LeaderboardTable
            rows={rows.map((volunteer) => ({
              ...volunteer,
              badge: badgeFrom(volunteer.totalHours, t),
            }))}
          />
        </div>
      </div>
    </PageShell>
  );
}
