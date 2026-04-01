import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { setAuth } from "../services/api";
import { jwtDecode } from "jwt-decode";

export default function GoogleSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setAuth(token, {
        id: decoded.id,
        name: decoded.name || "User",
        role: decoded.role || "volunteer",
      });
      navigate("/dashboard", { replace: true });
    } catch {
      navigate("/login", { replace: true });
    }
  }, [params, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
      <div className="nepal-card p-8 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-brandRed border-t-transparent" />
        <h1 className="font-heading text-xl font-semibold text-ink">
          Signing you in...
        </h1>
        <p className="mt-1 text-sm text-muted">
          Redirecting to your dashboard.
        </p>
      </div>
    </div>
  );
}
