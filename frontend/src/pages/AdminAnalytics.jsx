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

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [eventsSeries, setEventsSeries] = useState({ labels: [], series: [] });
  const [volunteerSeries, setVolunteerSeries] = useState({ labels: [], series: [] });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, eventsRes, growthRes] = await Promise.all([
          api.get("/admin/analytics/stats"),
          api.get("/admin/analytics/events-per-month"),
          api.get("/admin/analytics/volunteer-growth"),
        ]);
        setStats(statsRes.data);
        setEventsSeries(eventsRes.data);
        setVolunteerSeries(growthRes.data);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load analytics.");
      }
    };
    load();
  }, []);

  const eventChart = {
    labels: eventsSeries.labels,
    datasets: [
      {
        label: "Events",
        data: eventsSeries.series,
        borderColor: "#D32F2F",
        backgroundColor: "rgba(211,47,47,0.2)",
      },
    ],
  };

  const volunteerChart = {
    labels: volunteerSeries.labels,
    datasets: [
      {
        label: "New volunteers",
        data: volunteerSeries.series,
        backgroundColor: "rgba(30,58,138,0.4)",
      },
    ],
  };

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <Navbar
          links={[
            { to: "/admin", label: "Approvals" },
            { to: "/dashboard", label: "Dashboard" },
          ]}
        />

        <Hero
          badge="Admin Analytics"
          title="Platform insights"
          subtitle="Track growth, events, and volunteer impact."
        />

        {message ? <div className="nepal-card p-4 text-sm text-brandRed">{message}</div> : null}

        {stats ? (
          <>
            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total volunteers" value={stats.totals.volunteers} />
              <StatCard label="Total organizations" value={stats.totals.organizations} />
              <StatCard label="Total events" value={stats.totals.events} />
              <StatCard label="Total hours" value={stats.totals.totalHours} />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="nepal-card p-6">
                <h3 className="text-lg font-semibold text-ink">Events per month</h3>
                <div className="mt-4">
                  <Line data={eventChart} />
                </div>
              </div>
              <div className="nepal-card p-6">
                <h3 className="text-lg font-semibold text-ink">Volunteer growth</h3>
                <div className="mt-4">
                  <Bar data={volunteerChart} />
                </div>
              </div>
            </section>

            <section className="nepal-card p-6">
              <h3 className="text-lg font-semibold text-ink">Top causes</h3>
              {stats.topCauses?.length ? (
                <div className="mt-4 space-y-3">
                  {stats.topCauses.map((cause) => (
                    <div key={cause.cause} className="flex items-center justify-between rounded-xl bg-white/70 p-3">
                      <span className="text-sm text-ink">{cause.cause}</span>
                      <span className="rounded-full bg-brandRed/10 px-3 py-1 text-xs text-brandRed">
                        {cause.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No causes tracked yet.</p>
              )}
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
