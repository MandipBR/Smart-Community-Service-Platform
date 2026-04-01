import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import {
  clearAuth,
  getToken,
  getUserFromToken,
  hasToken,
  isTokenExpired,
} from "../services/api";

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("User accessed:", location.pathname);

    const token = getToken();
    if (!token || isTokenExpired(token)) {
      clearAuth();
      setLoading(false);
      return undefined;
    }

    const decoded = getUserFromToken();
    const expiryTime = decoded?.exp ? decoded.exp * 1000 : 0;
    const remainingTime = expiryTime - Date.now();
    setLoading(false);

    if (remainingTime <= 0) {
      clearAuth();
      return undefined;
    }

    const timer = window.setTimeout(() => {
      clearAuth();
      window.location.href = "/login";
    }, remainingTime);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Checking access...</div>
      </div>
    );
  }

  const token = getToken();
  if (!hasToken() || !token || isTokenExpired(token)) {
    clearAuth();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const user = getUserFromToken();
  const role = user?.role;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="nepal-page">
        <div className="mx-auto flex min-h-screen w-full max-w-[1280px] items-center justify-center px-6 py-10">
          <div className="panel w-full max-w-md p-8 text-center">
            <h2 className="mb-2 text-2xl font-semibold text-brandRed">
              Access Denied
            </h2>
            <p className="mb-5 text-sm leading-6 text-muted">
              You do not have permission to access this page.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-brandRed px-4 text-white transition hover:bg-brandRed/90"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
