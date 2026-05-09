import { useTranslation } from "react-i18next";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";
import Hero from "../components/Hero.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

export default function FAQ() {
  const { t } = useTranslation();
  const faqs = [
    {
      q: t("faq.q1", "How do I start volunteering?"),
      a: t("faq.a1", "Create a volunteer account, complete onboarding, and browse events by cause, date, skills, or location."),
    },
    {
      q: t("faq.q2", "How are organizations approved?"),
      a: t("faq.a2", "Organization accounts enter a pending state until an administrator reviews and approves the account."),
    },
    {
      q: t("faq.q3", "How do points and badges work?"),
      a: t("faq.a3", "Hours and verified attendance contribute points. Milestones unlock badges that appear in volunteer profiles and certificates."),
    },
    {
      q: t("faq.q4", "Can organizations verify attendance?"),
      a: t("faq.a4", "Yes. Approved organizations can mark attendance, which can automatically create verified volunteer logs and trigger certificate-ready notifications."),
    },
    {
      q: t("faq.q5", "Are recommendations personalized?"),
      a: t("faq.a5", "Yes. Recommended opportunities use cause, skills, prior activity, and optionally location proximity to rank events."),
    },
  ];

  return (
    <PageShell maxWidth="max-w-[1600px]">
      <PageMeta
        title={t("faq.meta_title", "Help Center")}
        description={t("faq.meta_description", "A clear explanation of how the platform works for volunteers, organizations, and admins.")}
      />
      <Hero
        badge={t("faq.badge", "Help Center")}
        title={t("faq.title", "Everything important, without the noise")}
        subtitle={t("faq.subtitle", "A clear explanation of how the platform works so every role knows what to expect.")}
        height="min-h-[420px]"
      />

      <div className="mx-auto max-w-[1200px] py-20 animate-fadeUp">
        <section className="nepal-card p-10 sm:p-20 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brandRed/5 blur-3xl transition-transform group-hover:scale-125" />

          <div className="relative z-10">
            <SectionHeader
              eyebrow={t("faq.eyebrow", "Frequently Asked Questions")}
              title={t("faq.section_title", "Answers for volunteers, organizations, and admins")}
              subtitle={t("faq.section_subtitle", "These answers mirror the current platform behavior and workflows already built into the app.")}
            />

            <div className="mt-16 space-y-6">
              {faqs.map((item) => (
                <div key={item.q} className="rounded-[28px] bg-white border border-slate-50 p-8 shadow-soft hover:shadow-lg transition-all group/faq">
                  <h3 className="text-xl font-bold text-ink group-hover/faq:text-brandRed transition-colors leading-tight">{item.q}</h3>
                  <p className="mt-4 text-md leading-relaxed text-muted font-medium">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
