import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function GoogleSuccess() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  useEffect(() => {
    localStorage.setItem("token", params.get("token"));
    localStorage.setItem("role", params.get("role"));
    nav("/dashboard");
  }, []);

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="nepal-card p-8">
          <h1 className="font-heading text-2xl font-semibold text-ink">Logging you in...</h1>
          <p className="mt-2 text-sm text-muted">Redirecting to your dashboard.</p>
        </div>
      </div>
    </div>
  );
}
