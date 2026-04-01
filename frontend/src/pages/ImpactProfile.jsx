import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import MetricRing from "../components/MetricRing.jsx";

export default function ImpactProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/volunteer/${id}/impact`);
        setProfile(res.data);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load impact profile.");
      }
    };
    if (id) load();
  }, [id]);

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <Navbar
          links={[
            { to: "/dashboard", label: "Dashboard" },
            { to: "/recommended-events", label: "AI Matches" },
            { to: "/impact", label: "Impact" },
          ]}
        />

        <Hero
          badge="Impact Score"
          title={profile ? `${profile.name}'s impact` : "Impact profile"}
          subtitle={profile ? `Level: ${profile.impactLevel}` : ""}
        />

        {message ? <div className="nepal-card p-4 text-sm text-brandRed">{message}</div> : null}

        {profile ? (
          <>
            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="nepal-card p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Impact score</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{profile.impactScore}</p>
              </div>
              <div className="nepal-card p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Total hours</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{profile.totalHours}</p>
              </div>
              <div className="nepal-card p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Events completed</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{profile.eventsCompleted}</p>
              </div>
              <div className="nepal-card p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Badges</p>
                <p className="mt-2 text-sm text-muted">
                  {profile.badges?.length ? profile.badges.join(", ") : "No badges yet"}
                </p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="nepal-card p-6">
                <h3 className="text-lg font-semibold text-ink">Contribution timeline</h3>
                <div className="mt-4 space-y-3">
                  {profile.timeline?.length ? (
                    profile.timeline.map((item) => (
                      <div key={item.id} className="rounded-xl bg-white/70 p-4">
                        <p className="font-medium text-ink">{item.eventTitle}</p>
                        <p className="text-xs text-muted">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                        <span className="mt-2 inline-flex rounded-full bg-brandRed/10 px-3 py-1 text-xs text-brandRed">
                          {item.hours} hrs
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted">No volunteer logs yet.</p>
                  )}
                </div>
              </div>

              <div className="nepal-card p-6">
                <MetricRing value={Math.min(100, Math.round(profile.impactScore / 8))} label="Progress" />
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-ink">Skill gap detection</h4>
                  {profile.skillGaps?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.skillGaps.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-brandBlue/10 px-3 py-1 text-xs text-brandBlue"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted">No skill gaps detected.</p>
                  )}
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
