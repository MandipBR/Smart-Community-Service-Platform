import { Link } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";

export default function SignupChoice() {
  return (
    <PageShell maxWidth="max-w-[1000px]" noPadding>
      <PageMeta 
        title="Choose Your Journey" 
        description="Select whether to join as a community volunteer or a service-driven organization." 
      />
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 py-12 animate-fadeUp">
        <div className="text-center max-w-[640px] mb-12">
          <p className="eyebrow">Onboarding</p>
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Choose your community role
          </h1>
          <p className="mt-4 text-lg text-muted/90">
            Whether you're looking to lend a hand or lead a cause, we have the specialized workspace you need to build measurable impact.
          </p>
        </div>

        <section className="grid w-full gap-8 md:grid-cols-2">
          {/* Volunteer Choice */}
          <div className="nepal-card relative flex flex-col p-10 overflow-hidden group">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brandRed/5 blur-3xl transition-transform group-hover:scale-150" aria-hidden="true" />
            
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brandRed/10 text-2xl shadow-sm mb-8 transition-transform group-hover:scale-110">
              🫂
            </div>
            
            <h2 className="text-2xl font-bold text-ink mb-3 group-hover:text-brandRed transition-colors">
              I am a Volunteer
            </h2>
            <p className="text-sm leading-7 text-muted mb-8 flex-1">
              Join local events, build your verified service record, earn badges, and grow your reputation within the Nepal community.
            </p>
            
            <ul className="space-y-3 mb-10">
              {['Smart matching to regional events', 'Verified service analytics', 'Gamified impact badges'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-xs font-bold text-ink/70">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <Link className="nepal-button w-full text-center" to="/signup">
              Start volunteering
            </Link>
          </div>

          {/* Organization Choice */}
          <div className="nepal-card relative flex flex-col p-10 overflow-hidden group">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brandBlue/5 blur-3xl transition-transform group-hover:scale-150" aria-hidden="true" />
            
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brandBlue/10 text-2xl shadow-sm mb-8 transition-transform group-hover:scale-110">
              🏢
            </div>
            
            <h2 className="text-2xl font-bold text-ink mb-3 group-hover:text-brandBlue transition-colors">
              I am an Organization
            </h2>
            <p className="text-sm leading-7 text-muted mb-8 flex-1">
              Post opportunities, manage volunteer workflows, verify hours, and share beautiful impact reports with your stakeholders.
            </p>

            <ul className="space-y-3 mb-10">
              {['Workflow automation for signups', 'Verified impact certificates', 'Public credibility profile'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-xs font-bold text-ink/70">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <Link className="nepal-button-secondary w-full text-center hover:bg-slate-50" to="/org-signup">
              Register as partner
            </Link>
          </div>
        </section>

        <div className="mt-16 text-center border-t border-slate-100 pt-8 w-full max-w-[640px]">
          <p className="text-sm text-muted">
            Already have an account?{" "}
            <Link className="font-bold text-brandRed hover:underline" to="/login">
              Sign in to your workspace
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
