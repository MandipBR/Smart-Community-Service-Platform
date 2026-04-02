import { useTranslation } from "react-i18next";
import Hero from "../components/Hero.jsx";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";

export default function About() {
  const { t } = useTranslation();

  const values = [
    {
      icon: "🎯",
      title: t('about.mission'),
      subtitle: t('about.mission'),
      body: t('about.mission_body'),
    },
    {
      icon: "🌱",
      title: t('about.vision'),
      subtitle: t('about.vision'),
      body: t('about.vision_body'),
    },
    {
      icon: "📊",
      title: t('about.approach'),
      subtitle: t('about.approach'),
      body: t('about.approach_body'),
    },
  ];

  const forSections = [
    {
      title: t('auth.join_community_desc'),
      items: [
        "Discover relevant events matched to your skills and interests",
        "Build a public record of verified service hours",
        "Earn badges, certificates, and climb the leaderboard",
        "Get personalized AI-powered event recommendations",
      ],
    },
    {
      title: t('auth.org_scale_impact'),
      items: [
        "Publish events and manage volunteer applications",
        "Approve participation and verify attendance",
        "Track team performance and impact metrics",
        "Build public credibility through reviews and ratings",
      ],
    },
  ];

  const timeline = [
    { year: "2024", event: "Platform concept developed as Final Year Project" },
    { year: "2025", event: "Core features built — events, matching, gamification" },
    { year: "2026", event: "Public beta launch with Nepal-focused communities" },
  ];

  return (
    <PageShell maxWidth="max-w-[1600px]">
      <PageMeta 
        title={t('about.hero_badge')} 
        description={t('about.hero_subtitle')} 
      />
      <Hero
        badge={t('about.hero_badge')}
        title={t('about.hero_title')}
        subtitle={t('about.hero_subtitle')}
        height="min-h-[480px]"
      />

      <div className="mx-auto max-w-[1200px] space-y-24 py-20 animate-fadeUp">
        
        {/* Core Values Grid */}
        <section className="grid gap-10 md:grid-cols-3" aria-label="Our values">
          {values.map((v) => (
            <div key={v.title} className="nepal-card p-10 relative group overflow-hidden">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brandRed/5 blur-2xl transition-transform group-hover:scale-150" />
              <div className="relative z-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brandRed shadow-soft text-3xl" aria-hidden="true">
                  {v.icon}
                </div>
                <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.25em] text-muted/60">{v.title}</p>
                <h3 className="mt-2 text-2xl font-bold text-ink leading-tight">{v.subtitle}</h3>
                <p className="mt-6 text-[15px] leading-relaxed text-muted font-medium">{v.body}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Stakeholder Narratives */}
        <section className="nepal-card p-12 sm:p-20 bg-slate-50/50 border-slate-100 relative overflow-hidden">
          <div className="absolute -left-40 -bottom-40 h-96 w-96 rounded-full bg-brandBlue/5 blur-3xl" />
          
          <div className="relative z-10 text-center mb-16">
            <p className="eyebrow Onboarding mb-4">{t('about.for_who')}</p>
            <h2 className="text-3xl font-bold text-ink sm:text-5xl leading-[1.1] max-w-[900px] mx-auto">
              {t('about.for_title')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted font-medium leading-relaxed">
              {t('about.for_desc')}
            </p>
          </div>

          <div className="relative z-10 mt-16 grid gap-10 md:grid-cols-2">
            {forSections.map((section) => (
              <div key={section.title} className="rounded-[32px] bg-white p-10 shadow-soft border border-slate-100 group transition-all hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-xl font-bold text-ink group-hover:text-brandRed transition-colors leading-tight">{section.title}</h3>
                <ul className="mt-8 space-y-5">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-[15px] text-muted font-medium leading-relaxed">
                      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brandRed/10 text-[10px] text-brandRed font-bold" aria-hidden="true">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Journey Timeline */}
        <section className="nepal-card p-12 sm:p-20 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
             <div className="text-[200px] font-bold text-slate-200 select-none">2026</div>
          </div>
          
          <div className="relative z-10">
            <p className="eyebrow Onboarding mb-4">{t('about.journey')}</p>
            <h2 className="text-3xl font-bold text-ink sm:text-4xl">Project Roadmap</h2>
            
            <div className="mt-16 space-y-12">
              {timeline.map((item, i) => (
                <div key={item.year} className="flex gap-10 group">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brandRed shadow-soft text-sm font-bold text-white transition-transform group-hover:scale-110">
                      {i + 1}
                    </div>
                    {i < timeline.length - 1 && <div className="w-1 flex-1 bg-slate-100 rounded-full my-4" />}
                  </div>
                  <div className="pb-12 pt-1 border-b border-slate-50 flex-1">
                    <p className="text-xl font-bold text-ink tracking-tight">{item.year}</p>
                    <p className="mt-3 text-lg text-muted font-medium leading-relaxed max-w-[600px]">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="text-center">
          <p className="eyebrow Onboarding mb-6">Engineered for Nepal</p>
          <h2 className="text-3xl font-bold text-ink mb-12">{t('about.tech_stack')}</h2>
          <div className="flex flex-wrap items-center justify-center gap-4 max-w-[800px] mx-auto">
            {["React", "Vite", "Tailwind CSS", "Node.js", "Express", "MongoDB", "Google OAuth", "Chart.js", "Leaflet", "i18next"].map((tech) => (
              <span key={tech} className="rounded-2xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-ink shadow-soft hover:border-brandRed hover:text-brandRed transition-all duration-300">
                {tech}
              </span>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
