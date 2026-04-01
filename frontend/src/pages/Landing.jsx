import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Hero from "../components/Hero.jsx";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";

const stats = [
  { value: "1,200+", label: "Volunteer hours logged this month" },
  { value: "85", label: "Community orgs building together" },
  { value: "4.9/5", label: "Average volunteer experience rating" },
];

const capabilities = [
  {
    icon: "✓",
    title: "Verified opportunities",
    body: "Every event is reviewed and documented for transparency.",
  },
  {
    icon: "📊",
    title: "Impact tracking",
    body: "Track hours, points, and community outcomes in one place.",
  },
  {
    icon: "🎯",
    title: "Smart matching",
    body: "Personalized recommendations for each volunteer.",
  },
];

export default function Landing() {
  const { t } = useTranslation();
  const preview = (
    <div className="nepal-card h-[300px] w-full max-w-[520px] p-6 text-ink">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Live preview</p>
          <h3 className="mt-2 text-lg font-semibold text-ink">
            Impact command center
          </h3>
        </div>
        <span className="pill">Impact</span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200/70 bg-white/90 p-4">
          <p className="text-xs text-muted">Hours</p>
          <p className="mt-2 text-xl font-semibold tracking-tight">126</p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-white/90 p-4">
          <p className="text-xs text-muted">Events</p>
          <p className="mt-2 text-xl font-semibold tracking-tight">14</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {[
          "River Cleanup - 92% match",
          "Child Literacy - 88% match",
          "Food Drive - 84% match",
        ].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-slate-200/70 bg-white/90 p-3 text-sm"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <PageShell>
      <PageMeta 
        title="Home" 
        description="Connect with local community events, track your impact, and volunteer for a better Nepal." 
      />
      <Hero
        badge={t('home.hero_badge')}
        title={t('home.hero_title')}
        subtitle={t('home.hero_subtitle')}
        right={preview}
        height="h-[420px]"
      >
        <div className="cta-row pt-2">
          <Link className="nepal-button" to="/signup-choice">
            {t('home.cta_join')}
          </Link>
          <Link className="nepal-button-secondary" to="/events">
            {t('home.cta_browse')}
          </Link>
        </div>
      </Hero>

      {/* stats */}
      <section className="grid gap-6 md:grid-cols-3" aria-label="Platform statistics">
        {stats.map((stat) => (
          <div key={stat.value} className="nepal-card p-6">
            <p className="eyebrow">Snapshot</p>
            <h3 className="mt-4 text-[32px] font-semibold tracking-tight text-ink">
              {stat.value}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* capabilities */}
      <section className="grid gap-6 md:grid-cols-3" aria-label="Platform capabilities">
        {capabilities.map((item) => (
          <div key={item.title} className="nepal-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandRed/10 text-lg">
              {item.icon}
            </div>
            <h4 className="mt-4 text-xl font-semibold text-ink">
              {item.title}
            </h4>
            <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
          </div>
        ))}
      </section>

      {/* CTA blocks */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="nepal-card p-8">
          <p className="eyebrow">For organizations</p>
          <h2 className="mt-3 text-[32px] font-semibold tracking-tight text-ink">
            Run volunteer operations with clarity
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted">
            Post events, manage volunteers, and share verified impact reports.
          </p>
          <Link className="nepal-button mt-5 inline-flex" to="/org-signup">
            Become a partner
          </Link>
        </div>
        <div className="nepal-card p-8">
          <p className="eyebrow">For volunteers</p>
          <h2 className="mt-3 text-[32px] font-semibold tracking-tight text-ink">
            Build a service profile that compounds
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted">
            Find events near you, earn badges, and track your service story.
          </p>
          <Link className="nepal-button-secondary mt-5 inline-flex" to="/signup">
            Start volunteering
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
