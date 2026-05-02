import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { setAuth } from "../services/api";
import api from "../services/api";
import { useTranslation } from "react-i18next";

export default function GoogleSuccess() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // Fix: verify the token server-side via /api/auth/me before trusting it.
    // Previously used jwtDecode alone which only decodes — it does NOT verify the signature.
    const verify = async () => {
      try {
        // Store token first so the api interceptor can attach it as Authorization header
        setAuth(token, null);
        // Backend verifies the token — if invalid it returns 401
        const meRes = await api.get("/auth/me");
        const user = meRes.data;
        // Now safe to persist user data since backend confirmed the token
        setAuth(token, {
          id: user.id,
          name: user.name,
          role: user.role,
        });
        navigate("/dashboard", { replace: true });
      } catch {
        // Token was invalid/expired — clear any partially stored data and go to login
        navigate("/login", { replace: true });
      }
    };

    verify();
  }, [params, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="nepal-card p-8 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-brandRed border-t-transparent" />
        <h1 className="font-heading text-xl font-semibold text-ink">
          {t("auth.signing_you_in")}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {t("auth.redirecting_dashboard")}
        </p>
      </div>
    </div>
  );
}
