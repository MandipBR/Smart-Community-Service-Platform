import PageShell from "../components/PageShell.jsx";
import Hero from "../components/Hero.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

const faqs = [
  {
    q: "How do I start volunteering?",
    a: "Create a volunteer account, complete onboarding, and browse events by cause, date, skills, or location.",
  },
  {
    q: "How are organizations approved?",
    a: "Organization accounts enter a pending state until an administrator reviews and approves the account.",
  },
  {
    q: "How do points and badges work?",
    a: "Hours and verified attendance contribute points. Milestones unlock badges that appear in volunteer profiles and certificates.",
  },
  {
    q: "Can organizations verify attendance?",
    a: "Yes. Approved organizations can mark attendance, which can automatically create verified volunteer logs and trigger certificate-ready notifications.",
  },
  {
    q: "Are recommendations personalized?",
    a: "Yes. Recommended opportunities use cause, skills, prior activity, and optionally location proximity to rank events.",
  },
];

export default function FAQ() {
  return (
    <PageShell
      links={[
        { to: "/about", label: "About" },
        { to: "/events", label: "Events" },
        { to: "/contact", label: "Contact" },
      ]}
    >
      <Hero
        badge="Help Center"
        title="Answers for volunteers, organizations, and admins"
        subtitle="A clear explanation of how the platform works so every role knows what to expect."
        height="min-h-[320px]"
      />

      <section className="nepal-card p-8">
        <SectionHeader
          eyebrow="Frequently Asked Questions"
          title="Everything important, without the noise"
          subtitle="These answers mirror the current platform behavior and workflows already built into the app."
        />
        <div className="mt-8 space-y-4">
          {faqs.map((item) => (
            <div key={item.q} className="rounded-[14px] bg-white/75 p-6">
              <h3 className="text-lg font-semibold text-ink">{item.q}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
