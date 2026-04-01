import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import api from "../services/api";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import StatCard from "../components/StatCard.jsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

export default function ImpactDashboard() {
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/impact/stats");
        setStats(res.data);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load impact stats.");
      }
    };
    load();
  }, []);

  if (!stats) {
    return (
      <div className="nepal-page">
        <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-6 px-6 py-10">
          {message ? <div className="nepal-card p-4 text-sm text-brandRed">{message}</div> : <p className="text-sm text-muted">Loading impact stats...</p>}
        </div>
      </div>
    );
  }

  const eventsChart = {
    labels: stats.eventsPerMonth.labels,
    datasets: [
      {
        label: "Events",
        data: stats.eventsPerMonth.series,
        borderColor: "#D32F2F",
        backgroundColor: "rgba(211,47,47,0.2)",
      },
    ],
  };

  const volunteerChart = {
    labels: stats.volunteerGrowth.labels,
    datasets: [
      {
        label: "Volunteer growth",
        data: stats.volunteerGrowth.series,
        backgroundColor: "rgba(30,58,138,0.35)",
      },
    ],
  };

  const hoursChart = {
    labels: stats.hoursByCause.map((item) => item.cause),
    datasets: [
      {
        label: "Hours by cause",
        data: stats.hoursByCause.map((item) => item.hours),
        backgroundColor: "rgba(242, 174, 61, 0.5)",
      },
    ],
  };

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <Navbar
          links={[
            { to: "/events", label: "Events" },
            { to: "/leaderboard", label: "Leaderboard" },
            { to: "/map", label: "Map" },
          ]}
        />

        <Hero
          badge="Impact Dashboard"
          title="Community impact analytics"
          subtitle="Visualize platform-wide impact and growth."
        />

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total volunteers" value={stats.totals.volunteers} />
          <StatCard label="Total events" value={stats.totals.events} />
          <StatCard label="Total hours served" value={stats.totals.totalHours} />
          <StatCard label="Communities helped" value={stats.totals.communitiesHelped} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="nepal-card p-6">
            <h3 className="text-lg font-semibold text-ink">Volunteer growth</h3>
            <div className="mt-4">
              <Bar data={volunteerChart} />
            </div>
          </div>
          <div className="nepal-card p-6">
            <h3 className="text-lg font-semibold text-ink">Events per month</h3>
            <div className="mt-4">
              <Line data={eventsChart} />
            </div>
          </div>
        </section>

        <section className="nepal-card p-6">
          <h3 className="text-lg font-semibold text-ink">Hours by cause</h3>
          <div className="mt-4">
            <Bar data={hoursChart} />
          </div>
        </section>
      </div>
    </div>
  );
}
