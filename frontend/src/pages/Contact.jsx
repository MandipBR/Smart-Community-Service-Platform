import { useState } from "react";
import { useTranslation } from "react-i18next";
import PageShell from "../components/PageShell.jsx";
import Hero from "../components/Hero.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const submit = (event) => {
    event.preventDefault();
    setStatus(t("contact.success"));
  };

  return (
    <PageShell
      links={[
        { to: "/about", label: t("nav.about") },
        { to: "/faq", label: t("nav.faq") },
        { to: "/events", label: t("nav.events") },
      ]}
    >
      <Hero
        badge={t("contact.badge")}
        title={t("contact.title")}
        subtitle={t("contact.subtitle")}
        height="min-h-[320px]"
      />

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="nepal-card p-8">
          <SectionHeader
            eyebrow={t("contact.eyebrow")}
            title={t("contact.section_title")}
            subtitle={t("contact.section_subtitle")}
          />
          <div className="mt-8 space-y-4 text-sm text-muted">
            <p>{t("contact.support_note")}</p>
            <p className="rounded-[14px] bg-white/75 p-4 text-ink dark:bg-slate-900/50 dark:text-slate-100">
              support@smartcommunity.local
            </p>
            <p className="rounded-[14px] bg-white/75 p-4 text-ink dark:bg-slate-900/50 dark:text-slate-100">
              Kathmandu, Nepal
            </p>
          </div>
        </div>

        <form className="nepal-card p-8" onSubmit={submit}>
          <SectionHeader
            eyebrow={t("contact.form_eyebrow")}
            title={t("contact.form_title")}
            subtitle={t("contact.form_subtitle")}
          />
          <div className="mt-8 grid gap-4">
            <div>
              <label htmlFor="contact-name" className="nepal-label">
                {t("contact.name_label")}
              </label>
              <input
                id="contact-name"
                className="nepal-input"
                placeholder={t("contact.name_placeholder")}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="nepal-label">
                {t("contact.email_label")}
              </label>
              <input
                id="contact-email"
                className="nepal-input"
                type="email"
                placeholder={t("contact.email_placeholder")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="nepal-label">
                {t("contact.message_label")}
              </label>
              <textarea
                id="contact-message"
                className="nepal-input min-h-[180px] py-4"
                placeholder={t("contact.message_placeholder")}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
            {status ? <p className="text-sm text-brandBlue">{status}</p> : null}
            <button className="nepal-button w-fit btn-submit" type="submit" aria-label="Submit contact form">
              {t("contact.send")}
            </button>
          </div>
        </form>
      </section>
    </PageShell>
  );
}
