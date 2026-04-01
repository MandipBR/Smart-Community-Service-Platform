import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { clearAuth, getUser, hasToken, setAuth } from "../services/api";
import VolunteerDashboard from "./VolunteerDashboard.jsx";
import OrgDashboard from "./OrgDashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import PageShell from "../components/PageShell.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));
  const [unread, setUnread] = useState(0);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    const load = async () => {
      if (!authToken || !hasToken()) {
        setLoading(false);
        navigate("/login");
        return;
      }
      try {
        const [meRes, notifRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/notifications").catch(() => ({ data: { data: [] } })),
        ]);
        setUser(meRes.data);
        setAuth(authToken, meRes.data);
        setUnread((notifRes.data.data || []).filter((n) => !n.isRead).length);
        if (!meRes.data.onboardingCompleted) {
          navigate("/onboarding");
        }
      } catch (err) {
        if (err?.response?.status === 429) {
          setLoading(false);
          return;
        }
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate, authToken]);

  const logout = () => {
    clearAuth();
    document.cookie = "g_csrf_token=; Max-Age=0; Path=/;";
    setUser(null);
    setAuthToken(null);
    navigate("/login", { replace: true });
  };

  /* build quick-action links based on role */
  const quickLinks = [];
  if (user?.role === "volunteer") {
    quickLinks.push(
      { to: `/volunteer/${user.id}`, label: "Public profile", primary: true },
      { to: `/impact-profile/${user.id}`, label: "Impact profile" },
      { to: "/recommended-events", label: "AI matches" },
    );
  }
  if (user?.role === "organization") {
    quickLinks.push(
      { to: "/org/profile", label: "Org profile" },
      { to: "/org/analytics", label: "Analytics" },
    );
  }
  if (user?.role === "admin") {
    quickLinks.push(
      { to: "/admin", label: "Approvals" },
      { to: "/admin/analytics", label: "Analytics" },
    );
  }
  quickLinks.push(
    { to: "/nearby-events", label: "Nearby" },
    { to: "/impact", label: "Impact" },
    { to: "/map", label: "Map" },
  );

  return (
    <PageShell unreadCount={unread}>
      {/* welcome header */}
      <section className="nepal-card relative overflow-hidden p-8 md:p-10">
        <div className="absolute -right-10 -top-8 h-40 w-40 rounded-full bg-brandRed/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-brandBlue/10 blur-2xl" aria-hidden="true" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {user?.name ? `Hi, ${user.name}` : "Welcome back"} 👋
              </h1>
              <p className="mt-1 text-sm text-muted">
                You&rsquo;re in the {user?.role || "member"} workspace. Here&rsquo;s your overview.
              </p>
            </div>
            <button
              onClick={logout}
              className="nepal-button-ghost text-sm text-muted hover:text-brandRed"
            >
              Sign out
            </button>
          </div>

          {/* role badge + onboarding status */}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-brandBlue/10 bg-brandBlue/[0.08] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brandBlue">
              {user?.role || "member"}
            </span>
            {user?.onboardingCompleted && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Profile complete
              </span>
            )}
          </div>

          {/* quick action links */}
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={link.primary ? "nepal-button" : "nepal-button-secondary"}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* role-specific dashboard */}
      <section>
        {loading ? (
          <div className="nepal-card p-6">
            <div className="skeleton h-4 w-48 rounded" />
            <div className="skeleton mt-4 h-3 w-64 rounded" />
          </div>
        ) : user?.role === "admin" ? (
          <AdminDashboard />
        ) : user?.role === "organization" ? (
          <OrgDashboard />
        ) : (
          <VolunteerDashboard user={user} />
        )}
      </section>
    </PageShell>
  );
}
