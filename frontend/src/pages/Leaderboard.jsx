import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import LeaderboardTable from "../components/LeaderboardTable.jsx";

const badgeFrom = (hours = 0) => {
  if (hours >= 100) return "Gold";
  if (hours >= 50) return "Silver";
  if (hours >= 10) return "Bronze";
  return "Starter";
};

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/volunteer/leaderboard");
        setRows(res.data);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load leaderboard.");
      }
    };
    load();
  }, []);

  const podium = useMemo(() => rows.slice(0, 3), [rows]);

  const podiumCards = podium.map((volunteer, index) => {
    const scale = index === 0 ? "scale-110" : "scale-95";
    return (
      <div
        key={volunteer.id}
        className={`nepal-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lift ${scale}`}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Rank {index + 1}</p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">{volunteer.name}</h3>
        <p className="mt-2 text-sm text-muted">{volunteer.totalHours} hours</p>
        <span className="mt-3 inline-flex rounded-full bg-brandRed/10 px-3 py-1 text-xs text-brandRed">
          {badgeFrom(volunteer.totalHours)}
        </span>
      </div>
    );
  });

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <Navbar
          links={[
            { to: "/events", label: "Events" },
            { to: "/map", label: "Map" },
            { to: "/impact", label: "Impact" },
          ]}
        />

        <Hero
          badge="Top Volunteers"
          title="Volunteer Leaderboard"
          subtitle="Celebrating the people driving the biggest community outcomes."
        />

        {message ? <div className="nepal-card p-4 text-sm text-brandRed">{message}</div> : null}

        <section className="grid gap-6 md:grid-cols-3">{podiumCards}</section>

        <LeaderboardTable
          rows={rows.map((volunteer) => ({
            ...volunteer,
            badge: badgeFrom(volunteer.totalHours),
          }))}
        />
      </div>
    </div>
  );
}
