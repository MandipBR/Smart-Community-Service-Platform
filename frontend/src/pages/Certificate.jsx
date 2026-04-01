import { Link, useParams } from "react-router-dom";
import { getApiBase } from "../services/api";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";

export default function Certificate() {
  const { logId } = useParams();

  const download = () => {
    const token = localStorage.getItem("token");
    const url = `${getApiBase()}/certificates/${logId}`;

    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `certificate-${logId}.pdf`;
        link.click();
      });
  };

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <Navbar
          links={[
            { to: "/dashboard", label: "Dashboard" },
            { to: "/leaderboard", label: "Leaderboard" },
            { to: "/impact", label: "Impact" },
          ]}
        />

        <Hero
          badge="Certificate"
          title="Volunteer Certificate"
          subtitle="Download a verified PDF certificate for your volunteer hours."
        />

        <section className="nepal-card p-6">
          <button className="nepal-button" onClick={download} type="button">
            Download certificate
          </button>
          <p className="mt-3 text-xs text-muted">
            You can share this certificate with organizations and universities.
          </p>
        </section>
      </div>
    </div>
  );
}
