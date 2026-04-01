import { Navigate } from "react-router-dom";
import { clearAuth, getToken, hasToken, isTokenExpired } from "../services/api";

export default function PublicRoute({ children }) {
  const token = getToken();
  if (token && isTokenExpired(token)) {
    clearAuth();
  }

  if (hasToken()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
