import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function VerifyEmail() {
  const { t } = useTranslation();
  const { token } = useParams();

  useEffect(() => {
    const baseUrl =
      import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000/api";
    window.location.href = `${baseUrl}/auth/verify/${token}`;
  }, [token]);

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="nepal-card p-8">
          <h1 className="font-heading text-2xl font-semibold text-ink">{t("auth.verifying_email")}</h1>
          <p className="mt-2 text-sm text-muted">
            {t("auth.verifying_email_subtitle")}
          </p>
        </div>
      </div>
    </div>
  );
}
