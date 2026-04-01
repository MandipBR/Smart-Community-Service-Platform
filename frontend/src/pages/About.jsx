import Hero from "../components/Hero.jsx";
import PageShell from "../components/PageShell.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import ImpactSummaryCard from "../components/ImpactSummaryCard.jsx";

export default function About() {
  return (
    <PageShell
      links={[
        { to: "/events", label: "Events" },
        { to: "/impact", label: "Impact" },
        { to: "/faq", label: "FAQ" },
        { to: "/contact", label: "Contact" },
      ]}
    >
      <Hero
        badge="About Smart Community"
        title="Built to turn local service into visible civic impact"
        subtitle="Smart Community helps volunteers, organizations, and administrators coordinate trusted community action across Nepal."
        height="min-h-[420px]"
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <ImpactSummaryCard label="Mission" value="Trusted action" helper="Make local volunteering easy to discover, verify, and celebrate." />
        <ImpactSummaryCard label="Vision" value="Stronger neighborhoods" helper="Connect real community needs to verified organizations and volunteers." />
        <ImpactSummaryCard label="Approach" value="Data-backed civic tech" helper="Combine transparent workflows, analytics, and identity to build trust." />
      </section>

      <section className="nepal-card p-8">
        <SectionHeader
          eyebrow="Why It Exists"
          title="A platform designed for accountability, visibility, and momentum"
          subtitle="The product brings together discovery, approval workflows, volunteer reputation, and impact tracking in one experience so social good work feels coordinated instead of fragmented."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[14px] bg-white/75 p-6">
            <h3 className="text-xl font-semibold text-ink">For volunteers</h3>
            <p className="mt-3 text-sm leading-7 text-muted">Discover relevant events, build a public record of service, track hours, and grow credibility through badges, recommendations, and certificates.</p>
          </div>
          <div className="rounded-[14px] bg-white/75 p-6">
            <h3 className="text-xl font-semibold text-ink">For organizations</h3>
            <p className="mt-3 text-sm leading-7 text-muted">Publish events, approve participation, verify attendance, manage teams, and measure how much impact each initiative creates over time.</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
