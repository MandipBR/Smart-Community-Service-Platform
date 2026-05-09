import PageShell from "../components/PageShell.jsx";
import Hero from "../components/Hero.jsx";
import { useTranslation } from "react-i18next";

export default function Terms() {
  const { t } = useTranslation();
  return (
    <PageShell links={[{ to: "/", label: t("nav.home", "Home") }, { to: "/privacy", label: t("legal.privacy", "Privacy") }]}>
      <Hero
        badge={t("legal.badge", "Legal")}
        title={t("legal.terms_title", "Terms of Service")}
        subtitle={t("legal.terms_subtitle", "Basic terms for using the Smart Community platform.")}
        height="min-h-[260px]"
      />
      <section className="nepal-card p-8 space-y-4 text-sm text-muted">
        <p>{t("legal.terms_p1", "By using this platform, you agree to use it responsibly and provide accurate account information.")}</p>
        <p>{t("legal.terms_p2", "Do not misuse services, automate abuse, or violate local laws while participating in events.")}</p>
        <p>{t("legal.terms_p3", "We may update these terms as the platform evolves.")}</p>
      </section>
    </PageShell>
  );
}
