import Hero from "../components/Hero.jsx";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";

const values = [
  {
    icon: "🎯",
    title: "Mission",
    subtitle: "Trusted action",
    body: "Make local volunteering easy to discover, verify, and celebrate.",
  },
  {
    icon: "🌱",
    title: "Vision",
    subtitle: "Stronger neighborhoods",
    body: "Connect real community needs to verified organizations and volunteers.",
  },
  {
    icon: "📊",
    title: "Approach",
    subtitle: "Data-backed civic tech",
    body: "Combine transparent workflows, analytics, and identity to build trust.",
  },
];

const forSections = [
  {
    title: "For volunteers",
    items: [
      "Discover relevant events matched to your skills and interests",
      "Build a public record of verified service hours",
      "Earn badges, certificates, and climb the leaderboard",
      "Get personalized AI-powered event recommendations",
    ],
  },
  {
    title: "For organizations",
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

export default function About() {
  return (
    <PageShell>
      <PageMeta 
        title="About Us" 
        description="Learn about the Smart Community mission to connect volunteers and organizations in Nepal through verified social action." 
      />
      <Hero
        badge="About Smart Community"
        title="Built to turn local service into visible civic impact"
        subtitle="Smart Community helps volunteers, organizations, and administrators coordinate trusted community action across Nepal."
        height="min-h-[380px]"
      />

      {/* values */}
      <section className="grid gap-6 md:grid-cols-3" aria-label="Our values">
        {values.map((v) => (
          <div key={v.title} className="nepal-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brandRed/10 text-2xl" aria-hidden="true">
              {v.icon}
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">{v.title}</p>
            <h3 className="mt-1 text-xl font-semibold text-ink">{v.subtitle}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{v.body}</p>
          </div>
        ))}
      </section>

      {/* for who */}
      <section className="nepal-card p-6 sm:p-8">
        <div className="text-center">
          <p className="eyebrow">Who it&rsquo;s for</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-ink sm:text-3xl">
            A platform designed for accountability, visibility, and momentum
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted">
            The product brings together discovery, approval workflows, volunteer reputation, and impact tracking so social good work feels coordinated instead of fragmented.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {forSections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-slate-200/70 bg-white p-6">
              <h3 className="text-lg font-semibold text-ink">{section.title}</h3>
              <ul className="mt-4 space-y-3">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brandRed/10 text-xs text-brandRed" aria-hidden="true">
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

      {/* timeline */}
      <section className="nepal-card p-6 sm:p-8">
        <p className="eyebrow">Journey</p>
        <h2 className="mt-2 font-heading text-2xl font-semibold text-ink">Project timeline</h2>
        <div className="mt-6 space-y-0">
          {timeline.map((item, i) => (
            <div key={item.year} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brandRed text-xs font-bold text-white">
                  {i + 1}
                </div>
                {i < timeline.length - 1 && <div className="w-px flex-1 bg-slate-200" />}
              </div>
              <div className="pb-8">
                <p className="text-sm font-semibold text-ink">{item.year}</p>
                <p className="mt-1 text-sm text-muted">{item.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* tech stack */}
      <section className="nepal-card p-6 sm:p-8">
        <p className="eyebrow">Built with</p>
        <h2 className="mt-2 font-heading text-2xl font-semibold text-ink">Technology stack</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {["React", "Vite", "Tailwind CSS", "Node.js", "Express", "MongoDB", "Google OAuth", "Chart.js", "Leaflet"].map((tech) => (
            <span key={tech} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm">
              {tech}
            </span>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
