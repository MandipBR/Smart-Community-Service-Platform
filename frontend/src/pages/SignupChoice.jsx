import { Link } from "react-router-dom";

export default function SignupChoice() {
  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-12">
        <section className="nepal-card p-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Join the community</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-ink">
            Choose how you want to contribute
          </h1>
          <p className="mt-3 text-sm text-muted">
            Volunteer to serve communities or register your organization.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="nepal-card p-8">
            <h2 className="section-title">Volunteer</h2>
            <p className="mt-3 text-sm text-muted">
              Build your impact profile, earn badges, and join local events.
            </p>
            <Link className="nepal-button mt-5 inline-flex" to="/signup">
              Sign up as volunteer
            </Link>
          </div>
          <div className="nepal-card p-8">
            <h2 className="section-title">Organization</h2>
            <p className="mt-3 text-sm text-muted">
              Post opportunities, verify volunteers, and measure community impact.
            </p>
            <Link className="nepal-button-secondary mt-5 inline-flex" to="/org-signup">
              Register organization
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
