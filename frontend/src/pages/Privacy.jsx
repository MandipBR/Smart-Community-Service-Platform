import PageShell from "../components/PageShell.jsx";
import Hero from "../components/Hero.jsx";
import { useTranslation } from "react-i18next";

export default function Privacy() {
  const { t } = useTranslation();
  return (
    <PageShell links={[{ to: "/", label: t("nav.home", "Home") }, { to: "/terms", label: t("legal.terms", "Terms") }]}>
      <Hero
        badge={t("legal.badge", "Legal")}
        title={t("legal.privacy_title", "Privacy Policy")}
        subtitle={t("legal.privacy_subtitle", "How Smart Community handles account and participation data.")}
        height="min-h-[260px]"
      />
      <section className="nepal-card p-8 space-y-4 text-sm text-muted">
        <p>{t("legal.privacy_p1", "We collect account and activity data to run event matching, attendance, and recognition features.")}</p>
        <p>{t("legal.privacy_p2", "We do not sell personal data. Access is limited to authorized platform functionality.")}</p>
        <p>{t("legal.privacy_p3", "You can request profile updates through your account settings and support channels.")}</p>
      </section>
    </PageShell>
  );
}
