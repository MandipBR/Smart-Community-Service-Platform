import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { clearAuth, getUser, getUserFromToken, hasToken } from "../services/api";
import { useTheme } from "../context/ThemeContext";

/* ── role-specific default nav links ────────────────────────── */
const ROLE_LINKS = {
  volunteer: [
    { to: "/dashboard", labelKey: "nav.dashboard" },
    { to: "/events", labelKey: "nav.events" },
    { to: "/my-events", labelKey: "nav.my_events" },
    { to: "/profile", labelKey: "nav.profile" },
    { to: "/leaderboard", labelKey: "nav.leaderboard" },
  ],
  organization: [
    { to: "/dashboard", labelKey: "nav.dashboard" },
    { to: "/events", labelKey: "nav.events" },
    { to: "/org/profile", labelKey: "nav.profile" },
    { to: "/org/analytics", labelKey: "nav.analytics" },
  ],
  admin: [
    { to: "/dashboard", labelKey: "nav.dashboard" },
    { to: "/admin", labelKey: "nav.approvals" },
    { to: "/admin/users", labelKey: "nav.users" },
    { to: "/admin/events", labelKey: "nav.events" },
    { to: "/admin/analytics", labelKey: "nav.analytics" },
    { to: "/admin/logs", labelKey: "nav.logs" },
  ],
};

const GUEST_LINKS = [
  { to: "/events", labelKey: "nav.events" },
  { to: "/about", labelKey: "nav.about" },
  { to: "/map", labelKey: "nav.map" },
  { to: "/leaderboard", labelKey: "nav.leaderboard" },
  { to: "/contact", labelKey: "nav.contact" },
];

/* ── style tokens ───────────────────────────────────────────── */
const linkBase =
  "rounded-lg px-3 py-2 text-sm font-medium text-ink/70 transition-all duration-200 hover:bg-slate-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandRed/40 focus-visible:ring-offset-2 dark:hover:bg-slate-800 dark:hover:text-white";
const linkActive =
  "rounded-lg bg-brandRed/10 px-3 py-2 text-sm font-semibold text-brandRed dark:bg-brandRed/20";

/* ── icons (inline SVG for zero deps) ───────────────────────── */
const BellIcon = ({ count }) => (
  <span className="relative">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
    {count > 0 && (
      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brandRed px-1 text-[10px] font-bold text-white">
        {count > 9 ? "9+" : count}
      </span>
    )}
  </span>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const ChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
);

const SidebarToggleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="9" y1="3" y2="21"/></svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);

const UserCircle = ({ name }) => (
  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brandRed to-brandBlue text-xs font-bold text-white shadow-sm" aria-hidden="true">
    {name?.charAt(0)?.toUpperCase() || "U"}
  </span>
);

/* ── main component ─────────────────────────────────────────── */
export default function Navbar({ links: overrideLinks, unreadCount = 0, onMenuClick }) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const tokenUser = getUserFromToken();
  const cachedUser = getUser();
  const isLoggedIn = hasToken();
  const role = tokenUser?.role;
  const userName = cachedUser?.name || tokenUser?.name || "User";
  const authUserId = tokenUser?.id || tokenUser?._id;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* resolve final links */
  const navLinks = overrideLinks || (role ? ROLE_LINKS[role] : GUEST_LINKS) || GUEST_LINKS;

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* close dropdown on Escape */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const logout = () => {
    clearAuth();
    document.cookie = "g_csrf_token=; Max-Age=0; Path=/;";
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* skip-to-content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brandRed focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
      >
        {t('nav.skip_to_content')}
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80" role="banner">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-6">
          {/* logo & sidebar toggle */}
          <div className="flex items-center gap-2">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="mr-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-slate-100 hover:text-ink lg:flex dark:hover:bg-slate-800"
                aria-label="Open sidebar"
              >
                <SidebarToggleIcon />
              </button>
            )}
            <Link to="/" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandRed/40 focus-visible:ring-offset-2 rounded-lg" aria-label="Smart Community — Home">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brandRed to-brandBlue shadow-sm">
                <span className="text-xs font-bold text-white">SC</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-heading text-base font-semibold tracking-tight text-ink uppercase">Smart Community</p>
                <p className="text-[10px] font-medium text-muted">{t('home.hero_badge')}</p>
              </div>
            </Link>
          </div>

          {/* desktop nav */}
          {!onMenuClick && (
            <nav className="hidden items-center gap-1 lg:flex" role="navigation" aria-label="Main navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => (isActive ? linkActive : linkBase)}
                >
                  {link.labelKey ? t(link.labelKey) : link.label}
                </NavLink>
              ))}
            </nav>
          )}

           {/* right actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ne' : 'en')}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200/60 px-3 text-[11px] font-bold uppercase tracking-wider text-ink transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Switch language"
            >
              {i18n.language === 'en' ? 'न' : 'EN'}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink/60 transition-colors hover:bg-slate-100 hover:text-ink dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandRed/40 shadow-sm border border-slate-200/40"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            {isLoggedIn ? (
              <>
                {/* notifications */}
                <Link
                  to="/notifications"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink/60 transition-colors hover:bg-slate-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandRed/40"
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
                >
                  <BellIcon count={unreadCount} />
                </Link>

                {/* user dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandRed/40"
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    <UserCircle name={userName} />
                    <span className="hidden text-sm font-medium text-ink md:block">{userName}</span>
                    <ChevronDown />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right animate-fadeUp rounded-xl border border-slate-200/70 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900" role="menu">
                      <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                        <p className="text-sm font-semibold text-ink">{userName}</p>
                        <p className="text-xs text-muted capitalize">{t(`nav.${role || 'member'}`)}</p>
                      </div>
                      {role === "volunteer" && (
                        <div className="flex flex-col">
                          <Link to="/profile" className="dropdown-item" role="menuitem" onClick={() => setDropdownOpen(false)}>
                            {t('nav.profile_hub')}
                          </Link>
                          <Link to={`/impact-profile/${authUserId || cachedUser?.id}`} className="dropdown-item" role="menuitem" onClick={() => setDropdownOpen(false)}>
                            {t('nav.impact_profile')}
                          </Link>
                        </div>
                      )}
                      {role === "organization" && (
                        <Link to="/org/profile" className="dropdown-item" role="menuitem" onClick={() => setDropdownOpen(false)}>
                          {t('nav.org_profile')}
                        </Link>
                      )}
                      <Link to="/settings" className="dropdown-item" role="menuitem" onClick={() => setDropdownOpen(false)}>
                        {t('nav.settings')}
                      </Link>
                      <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
                      <button onClick={logout} className="dropdown-item w-full text-left text-brandRed hover:bg-red-50 dark:hover:bg-red-950/20" role="menuitem">
                        {t('nav.signout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-slate-100">
                  {t('nav.signin')}
                </Link>
                <Link to="/signup-choice" className="rounded-lg bg-brandRed px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  {t('nav.get_started')}
                </Link>
              </div>
            )}

            {/* mobile toggle */}
            {!onMenuClick && (
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink/70 transition-colors hover:bg-slate-100 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandRed/40"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            )}
          </div>
        </div>

        {/* mobile drawer */}
        {mobileOpen && (
          <div className="border-t border-slate-200/60 bg-white px-6 pb-6 pt-4 lg:hidden animate-fadeUp dark:border-slate-800 dark:bg-slate-950" role="navigation" aria-label="Mobile navigation">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => (isActive ? linkActive : linkBase)}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.labelKey ? t(link.labelKey) : link.label}
                </NavLink>
              ))}
            </nav>
            {!isLoggedIn && (
              <div className="mt-4 flex flex-col gap-2">
                <Link to="/login" className="nepal-button-secondary w-full text-center" onClick={() => setMobileOpen(false)}>{t('nav.signin')}</Link>
                <Link to="/signup-choice" className="nepal-button w-full text-center" onClick={() => setMobileOpen(false)}>{t('nav.get_started')}</Link>
              </div>
            )}
            {isLoggedIn && (
              <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button onClick={logout} className="nepal-button-secondary w-full text-center text-brandRed">{t('nav.signout')}</button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
