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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/impact/stats");
        setStats(res?.data && typeof res.data === "object" ? res.data : null);
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

  const eventsPerMonth = stats?.eventsPerMonth || {};
  const volunteerGrowth = stats?.volunteerGrowth || {};
  const hoursByCause = Array.isArray(stats?.hoursByCause) ? stats.hoursByCause : [];
  const totals = stats?.totals || {};

  const eventsChart = {
    labels: Array.isArray(eventsPerMonth.labels) ? eventsPerMonth.labels : [],
    datasets: [
      {
        label: t("admin.events"),
        data: Array.isArray(eventsPerMonth.series) ? eventsPerMonth.series : [],
        borderColor: "#D32F2F",
        backgroundColor: "rgba(211,47,47,0.2)",
      },
    ],
  };

  const volunteerChart = {
    labels: Array.isArray(volunteerGrowth.labels) ? volunteerGrowth.labels : [],
    datasets: [
      {
        label: t("admin.volunteer_growth"),
        data: Array.isArray(volunteerGrowth.series) ? volunteerGrowth.series : [],
        backgroundColor: "rgba(30,58,138,0.35)",
      },
    ],
  };

  const hoursChart = {
    labels: hoursByCause.map((item) => item?.cause || "Unknown"),
    datasets: [
      {
        label: "Hours by cause",
        data: hoursByCause.map((item) => Number(item?.hours) || 0),
        backgroundColor: "rgba(242, 174, 61, 0.5)",
      },
    ],
  };

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <Navbar
          links={[
            { to: "/events", label: t("nav.events") },
            { to: "/leaderboard", label: t("nav.leaderboard") },
            { to: "/map", label: t("nav.map") },
          ]}
        />

        <Hero
          badge={t("map.title")}
          title={t("org.impact_summary")}
          subtitle={t("admin.track_growth_desc")}
        />

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t("admin.total_volunteers")} value={Number(totals.volunteers) || 0} />
          <StatCard label={t("admin.total_events")} value={Number(totals.events) || 0} />
          <StatCard label={t("admin.total_hours")} value={Number(totals.totalHours) || 0} />
          <StatCard label={t("admin.top_causes")} value={Number(totals.communitiesHelped) || 0} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="nepal-card p-6">
            <h3 className="text-lg font-semibold text-ink">{t("admin.volunteer_growth")}</h3>
            <div className="mt-4">
              <Bar data={volunteerChart} />
            </div>
          </div>
          <div className="nepal-card p-6">
            <h3 className="text-lg font-semibold text-ink">{t("admin.events_per_month")}</h3>
            <div className="mt-4">
              <Line data={eventsChart} />
            </div>
          </div>
        </section>

        <section className="nepal-card p-6">
          <h3 className="text-lg font-semibold text-ink">{t("admin.top_causes")}</h3>
          <div className="mt-4">
            <Bar data={hoursChart} />
          </div>
        </section>
      </div>
    </div>
  );
}
