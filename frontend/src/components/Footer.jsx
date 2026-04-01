import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const footerLinks = [
  { to: "/about", labelKey: "nav.about" },
  { to: "/faq", labelKey: "nav.faq" },
  { to: "/contact", labelKey: "nav.contact" },
  { to: "/events", labelKey: "nav.events" },
];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-slate-200/60 bg-white/60 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/60" role="contentinfo">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brandRed to-brandBlue shadow-sm">
            <span className="text-[10px] font-bold text-white">SC</span>
          </div>
          <p className="text-sm text-muted">
            {t('nav.footer_msg')}
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-4" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandRed/40 focus-visible:ring-offset-2 rounded dark:hover:text-white"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
