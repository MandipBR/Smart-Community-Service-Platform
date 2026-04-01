import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { clearAuth, getUser, hasToken, setAuth } from "../services/api";
import VolunteerDashboard from "./VolunteerDashboard.jsx";
import OrgDashboard from "./OrgDashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));
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
        const res = await api.get("/auth/me");
        setUser(res.data);
        setAuth(authToken, res.data);
        if (!res.data.onboardingCompleted) {
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

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-12 px-6 py-10">
        <section className="panel relative overflow-hidden p-8 md:p-10">
          <div className="absolute -right-10 -top-8 h-40 w-40 rounded-full bg-brandRed/10 blur-2xl" />
          <div className="absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-brandBlue/10 blur-2xl" />
          <div className="relative z-10 flex flex-col gap-8">
            <DashboardHeader
              title={user?.name ? `Hi ${user.name}` : "Welcome back"}
              subtitle={`You’re inside the ${user?.role || "member"} workspace. Keep momentum high and the next action obvious.`}
              actions={
                <>
                  {user?.role === "admin" ? (
                    <>
                      <Link className="nepal-button-secondary" to="/admin">
                        Admin panel
                      </Link>
                      <Link className="nepal-button-secondary" to="/admin/analytics">
                        Analytics
                      </Link>
                    </>
                  ) : null}
                  <Link className="nepal-button-secondary" to="/notifications">
                    Notifications
                  </Link>
                  <Link className="nepal-button-secondary" to="/leaderboard">
                    Leaderboard
                  </Link>
                  <Link className="nepal-button-secondary" to="/map">
                    Map
                  </Link>
                  <Link className="nepal-button-secondary" to="/recommended-events">
                    AI matches
                  </Link>
                  <Link className="nepal-button-secondary" to="/nearby-events">
                    Nearby
                  </Link>
                  <Link className="nepal-button-secondary" to="/impact">
                    Impact
                  </Link>
                  {user?.role === "volunteer" ? (
                    <>
                      <Link className="nepal-button" to={`/volunteer/${user.id}`}>
                        Public profile
                      </Link>
                      <Link
                        className="nepal-button-secondary"
                        to={`/impact-profile/${user.id}`}
                      >
                        Impact profile
                      </Link>
                    </>
                  ) : null}
                  <button className="nepal-button-secondary" onClick={logout}>
                    Log out
                  </button>
                </>
              }
            />

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-brandBlue/10 bg-brandBlue/[0.08] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brandBlue">
                Role: {user?.role || "member"}
              </span>
              {user?.onboardingCompleted ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Profile complete
                </span>
              ) : null}
            </div>
          </div>
        </section>

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
      </div>
    </div>
  );
}
