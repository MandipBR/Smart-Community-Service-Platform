import { Link } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";

export default function NotFound() {
  return (
    <PageShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brandRed/10">
          <span className="text-4xl font-bold text-brandRed">404</span>
        </div>
        <div>
          <h1 className="font-heading text-3xl font-semibold text-ink">
            Page not found
          </h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has been
            moved. Let&rsquo;s get you back on track.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/" className="nepal-button">
            Go home
          </Link>
          <Link to="/events" className="nepal-button-secondary">
            Browse events
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
