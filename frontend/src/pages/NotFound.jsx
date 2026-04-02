import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageShell from "../components/PageShell.jsx";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brandRed/10">
          <span className="text-4xl font-bold text-brandRed">404</span>
        </div>
        <div>
          <h1 className="font-heading text-3xl font-semibold text-ink">{t("not_found.title")}</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">{t("not_found.subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/" className="nepal-button">
            {t("not_found.home")}
          </Link>
          <Link to="/events" className="nepal-button-secondary">
            {t("not_found.browse_events")}
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
