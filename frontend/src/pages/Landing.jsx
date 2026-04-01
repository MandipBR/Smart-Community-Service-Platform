import { Link } from "react-router-dom";
import Hero from "../components/Hero.jsx";
import Navbar from "../components/Navbar.jsx";
import { getUserFromToken } from "../services/api";

const getStoredRole = () => getUserFromToken()?.role || null;

export default function Landing() {
  const preview = (
    <div className="panel h-[300px] w-full max-w-[520px] p-6 text-ink">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Live preview</p>
          <h3 className="mt-2 text-lg font-semibold text-ink">Impact command center</h3>
        </div>
        <span className="rounded-full bg-brandRed/10 px-3 py-1 text-xs text-brandRed">Impact</span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-[14px] border border-slate-200/70 bg-white/90 p-4">
          <p className="text-xs text-muted">Hours</p>
          <p className="mt-2 text-xl font-semibold tracking-tight">126</p>
        </div>
        <div className="rounded-[14px] border border-slate-200/70 bg-white/90 p-4">
          <p className="text-xs text-muted">Events</p>
          <p className="mt-2 text-xl font-semibold tracking-tight">14</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {["River Cleanup - 92% match", "Child Literacy - 88% match", "Food Drive - 84% match"].map((item) => (
          <div key={item} className="rounded-[14px] border border-slate-200/70 bg-white/90 p-3 text-sm">
            {item}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-12 px-6 py-10">
        <Navbar
          links={[
            { to: "/events", label: "Events" },
            { to: "/map", label: "Map" },
            { to: "/recommended-events", label: "AI Matches" },
            { to: "/impact", label: "Impact" },
            { to: "/leaderboard", label: "Leaderboard" },
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
            { to: "/login", label: "Sign in" },
            { to: "/org-login", label: "Org sign in" },
            ...(getStoredRole() === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
          ]}
        />

        <Hero
          badge="Local Impact - Nepal"
          title="Turn local needs into measurable community impact."
          subtitle="Connect volunteers with verified community organizations. Track service hours, match skills, and build a stronger Nepal together."
          right={preview}
          height="h-[420px]"
        >
          <div className="cta-row pt-2">
            <Link className="nepal-button" to="/signup-choice">
              Create a profile
            </Link>
            <Link className="nepal-button-secondary" to="/events">
              Browse events
            </Link>
            <Link className="nepal-button-secondary" to="/signup">
              Volunteer now
            </Link>
          </div>
        </Hero>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            { title: "1,200+", body: "Volunteer hours logged this month" },
            { title: "85", body: "Community orgs building together" },
            { title: "4.9/5", body: "Average volunteer experience rating" },
          ].map((stat) => (
            <div key={stat.title} className="nepal-card p-6">
              <p className="eyebrow">Snapshot</p>
              <h3 className="mt-4 text-[32px] font-semibold tracking-tight text-ink">{stat.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{stat.body}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Verified opportunities",
              body: "Every event is reviewed and documented for transparency.",
            },
            {
              title: "Impact tracking",
              body: "Track hours, points, and community outcomes in one place.",
            },
            {
              title: "Smart matching",
              body: "Personalized recommendations for each volunteer.",
            },
          ].map((item) => (
            <div key={item.title} className="nepal-card p-6">
              <p className="eyebrow">Capabilities</p>
              <h4 className="mt-4 text-xl font-semibold text-ink">{item.title}</h4>
              <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="nepal-card p-8">
            <p className="eyebrow">For organizations</p>
            <h2 className="mt-3 text-[32px] font-semibold tracking-tight text-ink">Run volunteer operations with clarity</h2>
            <p className="mt-4 text-sm leading-6 text-muted">Post events, manage volunteers, and share verified impact reports.</p>
            <Link className="nepal-button mt-5 inline-flex" to="/org-signup">
              Become a partner
            </Link>
          </div>
          <div className="nepal-card p-8">
            <p className="eyebrow">For volunteers</p>
            <h2 className="mt-3 text-[32px] font-semibold tracking-tight text-ink">Build a service profile that compounds</h2>
            <p className="mt-4 text-sm leading-6 text-muted">Find events near you, earn badges, and track your service story.</p>
            <Link className="nepal-button-secondary mt-5 inline-flex" to="/signup">
              Start volunteering
            </Link>
          </div>
        </section>

        <footer className="pb-6 text-center text-xs text-muted">Smart Community Platform - Designed for civic impact.</footer>
      </div>
    </div>
  );
}
