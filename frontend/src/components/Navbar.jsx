import { Link, NavLink } from "react-router-dom";
import { getUser, getUserFromToken } from "../services/api";

const navLinkBase =
  "rounded-full px-3 py-2 text-sm font-medium text-ink/75 transition-all duration-[250ms] ease-out hover:bg-slate-900/[0.03] hover:text-ink";
const navLinkActive =
  "rounded-full bg-white px-3 py-2 text-sm font-semibold text-ink shadow-soft";

export default function Navbar({ links = [] }) {
  const tokenUser = getUserFromToken();
  const cachedUser = getUser();
  const role = tokenUser?.role || cachedUser?.role;

  const roleLinks =
    role === "admin"
      ? [{ to: "/admin", label: "Admin" }]
      : role === "organization"
      ? [{ to: "/org/profile", label: "Org Profile" }]
      : role === "volunteer"
      ? [{ to: "/dashboard", label: "Dashboard" }]
      : [];

  const mergedLinks = [...roleLinks, ...links].filter(
    (link, index, array) => array.findIndex((item) => item.to === link.to) === index
  );

  return (
    <header className="sticky top-4 z-30 panel px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/70 bg-white shadow-sm">
            <span className="text-sm font-semibold text-brandRed">SC</span>
          </div>
          <div>
            <p className="font-heading text-lg font-semibold tracking-tight">Smart Community</p>
            <p className="text-xs text-muted">Civic Tech Nepal</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {role ? (
            <span className="rounded-full border border-brandBlue/10 bg-brandBlue/[0.08] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brandBlue">
              {role}
            </span>
          ) : null}

          <nav className="flex flex-wrap items-center gap-1 rounded-full border border-slate-200/80 bg-white/75 p-1">
            {mergedLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? navLinkActive : navLinkBase)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
