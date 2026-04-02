import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Hero from "../components/Hero.jsx";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";
import landingHero from "../assets/i18n/landing-hero.png";
import dashboardPreview from "../assets/i18n/dashboard-preview.png";

const stats = [
  { value: "1,200+", label: "Volunteer hours logged this month" },
  { value: "85", label: "Community orgs building together" },
  { value: "4.9/5", label: "Average volunteer experience rating" },
];

export default function Landing() {
  const { t } = useTranslation();

  const preview = (
    <div className="relative group overflow-hidden rounded-[32px] border border-white/40 bg-white/10 shadow-2xl backdrop-blur-2xl transition-transform hover:scale-[1.02] duration-500">
      <img 
        src={dashboardPreview} 
        alt="Platform Dashboard Preview" 
        className="w-full h-full object-cover brightness-[0.95]" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );

  return (
    <PageShell maxWidth="max-w-[1600px]">
      <PageMeta 
        title={t('nav.home')} 
        description={t('home.hero_subtitle')} 
      />
      <Hero
        badge={t('home.hero_badge')}
        title={t('home.hero_title')}
        subtitle={t('home.hero_subtitle')}
        right={preview}
        image={landingHero}
        height="h-[640px]"
      >
        <div className="flex flex-wrap gap-4 pt-6">
          <Link className="nepal-button" to="/signup-choice">
            {t('home.cta_join')}
          </Link>
          <Link className="nepal-button-secondary bg-white/10 text-white border-white/20 hover:bg-white hover:text-ink" to="/events">
            {t('home.cta_browse')}
          </Link>
        </div>
      </Hero>

      {/* stats */}
      <section className="grid gap-10 md:grid-cols-3 pt-12" aria-label="Platform statistics">
        {stats.map((stat) => (
          <div key={stat.value} className="nepal-card p-10 flex flex-col justify-between min-h-[220px]">
            <p className="eyebrow Onboarding">Impact</p>
            <div>
              <h3 className="text-[48px] font-bold tracking-tighter text-ink leading-none">
                {stat.value}
              </h3>
              <p className="mt-4 text-md font-bold text-muted/60 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* capabilities */}
      <section className="grid gap-8 md:grid-cols-3" aria-label="Platform capabilities">
        {[
          { icon: "✨", key: "verified", title: "Verified opportunities", body: "Every event is reviewed and documented for transparency." },
          { icon: "📈", key: "tracking", title: "Impact tracking", body: "Track hours, points, and community outcomes in one place." },
          { icon: "⚡", key: "matching", title: "Smart matching", body: "Personalized recommendations for each volunteer." }
        ].map((item) => (
          <div key={item.key} className="nepal-card p-10 group">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brandRed/10 text-3xl transition-transform group-hover:scale-110 duration-500">
              {item.icon}
            </div>
            <h4 className="mt-8 text-2xl font-bold text-ink group-hover:text-brandRed transition-colors">
              {item.title}
            </h4>
            <p className="mt-4 text-md leading-relaxed text-muted/80 font-medium">{item.body}</p>
          </div>
        ))}
      </section>

      {/* CTA segments */}
      <section className="grid gap-10 md:grid-cols-2">
        <div className="nepal-card p-12 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brandRed/5 blur-3xl transition-transform group-hover:scale-125" />
          <p className="eyebrow Onboarding">For organizations</p>
          <h2 className="mt-6 text-[40px] font-bold tracking-tight text-ink leading-[1.1]">
            {t('auth.org_scale_impact')}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted font-medium">
            Post events, manage volunteers, and share verified impact reports with a few clicks.
          </p>
          <Link className="nepal-button mt-10 inline-flex" to="/org-signup">
            {t('auth.become_partner')}
          </Link>
        </div>

        <div className="nepal-card p-12 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brandBlue/5 blur-3xl transition-transform group-hover:scale-125" />
          <p className="eyebrow Onboarding">For volunteers</p>
          <h2 className="mt-6 text-[40px] font-bold tracking-tight text-ink leading-[1.1]">
            {t('auth.start_journey')}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted font-medium">
            Find events near you, earn badges, and track your service story on a global stage.
          </p>
          <Link className="nepal-button-secondary mt-10 inline-flex border-slate-200" to="/signup">
            {t('auth.create_account')}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
