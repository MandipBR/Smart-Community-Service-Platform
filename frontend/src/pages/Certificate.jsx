import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getApiBase, getToken } from "../services/api";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";

export default function Certificate() {
  const { t } = useTranslation();
  const { logId } = useParams();

  const download = () => {
    const token = getToken();
    const url = `${getApiBase()}/certificates/${logId}`;

    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Download failed");
        return res.blob();
      })
      .then((blob) => {
        const link = document.createElement("a");
        const objectUrl = window.URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = `certificate-${logId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        // keep UX stable without throwing unhandled promise errors
      });
  };

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <Navbar
          links={[
            { to: "/dashboard", label: t("nav.dashboard") },
            { to: "/leaderboard", label: t("nav.leaderboard") },
            { to: "/impact", label: t("nav.impact") },
          ]}
        />

        <Hero
          badge={t("certificate.badge")}
          title={t("certificate.title")}
          subtitle={t("certificate.subtitle")}
        />

        <section className="nepal-card p-6">
          <button className="nepal-button btn-submit" onClick={download} type="button" aria-label="Download certificate">
            {t("certificate.download")}
          </button>
          <p className="mt-3 text-xs text-muted">{t("certificate.share_hint")}</p>
        </section>
      </div>
    </div>
  );
}
