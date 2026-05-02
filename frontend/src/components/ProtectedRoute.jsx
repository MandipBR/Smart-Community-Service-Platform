import { useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  clearAuth,
  getToken,
  getUserFromToken,
  hasToken,
  isTokenExpired,
} from "../services/api";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { t } = useTranslation();
  const location = useLocation();
  const token = getToken();
  const expired = !token || isTokenExpired(token);
  const user = expired ? null : getUserFromToken();
  const role = user?.role;

  useEffect(() => {
    if (!token || expired) {
      clearAuth();
      return undefined;
    }

    const expiryTime = user?.exp ? user.exp * 1000 : 0;
    const remainingTime = expiryTime - Date.now();

    if (remainingTime <= 0) {
      clearAuth();
      return undefined;
    }

    const timer = window.setTimeout(() => {
      clearAuth();
      window.location.href = "/login";
    }, remainingTime);

    return () => window.clearTimeout(timer);
  }, [expired, location.pathname, token, user]);

  if (!hasToken() || expired) {
    clearAuth();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="nepal-page">
        <div className="mx-auto flex min-h-screen w-full max-w-[1280px] items-center justify-center px-6 py-10">
          <div className="panel w-full max-w-md p-8 text-center">
            {/* Fix: was hardcoded English — now uses i18n */}
            <h2 className="mb-2 text-2xl font-semibold text-brandRed">
              {t("access_denied.title", "Access Denied")}
            </h2>
            <p className="mb-5 text-sm leading-6 text-muted">
              {t("access_denied.subtitle", "You do not have permission to access this page.")}
            </p>
            <Link
              to="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-brandRed px-4 text-white transition hover:bg-brandRed/90"
            >
              {t("access_denied.go_dashboard", "Go to Dashboard")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
