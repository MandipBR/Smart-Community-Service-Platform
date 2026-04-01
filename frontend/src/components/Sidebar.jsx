import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getUser, getUserFromToken } from "../services/api";

const ROLE_LINKS = {
  volunteer: [
    { to: "/dashboard", labelKey: "nav.overview", icon: "📊" },
    { to: "/my-events", labelKey: "nav.participation", icon: "📅" },
    { to: "/recommended-events", labelKey: "nav.interests", icon: "🎯" },
    { to: "/impact-profile/" + (getUser()?.id || ""), labelKey: "nav.impact", icon: "⚡" },
    { to: "/leaderboard", labelKey: "nav.leaderboard", icon: "🏆" },
  ],
  organization: [
    { to: "/dashboard", labelKey: "nav.event_studio", icon: "🏗️" },
    { to: "/org/profile", labelKey: "nav.org_info", icon: "🏢" },
    { to: "/org/analytics", labelKey: "nav.impact_metrics", icon: "📈" },
  ],
  admin: [
    { to: "/dashboard", labelKey: "nav.approvals", icon: "🛡️" },
    { to: "/admin/users", labelKey: "nav.user_mgmt", icon: "👥" },
    { to: "/admin/events", labelKey: "nav.event_oversight", icon: "📁" },
    { to: "/admin/analytics", labelKey: "nav.global_stats", icon: "🌐" },
    { to: "/admin/logs", labelKey: "nav.system_logs", icon: "📋" },
  ],
};

const linkBase =
  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted transition-all duration-300 hover:bg-slate-100/80 hover:text-ink dark:hover:bg-slate-800/50 dark:hover:text-white";
const linkActive =
  "flex items-center gap-3 rounded-xl bg-brandRed/10 px-4 py-3 text-sm font-bold text-brandRed shadow-sm border border-brandRed/10 dark:bg-brandRed/20";

export default function Sidebar({ isOpen, onClose }) {
  const { t } = useTranslation();
  const user = getUser() || getUserFromToken();
  const role = user?.role;
  const links = ROLE_LINKS[role] || [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200 bg-white/90 p-5 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] lg:static lg:block lg:translate-x-0 dark:border-slate-800 dark:bg-slate-950/90 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        aria-label="Dashboard navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo / Title */}
          <div className="mb-8 pl-2 pt-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted">
              {t(`nav.${role || 'member'}`)} {t('nav.workspace')}
            </h2>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto scrollbar-thin">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) => (isActive ? linkActive : linkBase)}
              >
                <span className="text-lg leading-none" aria-hidden="true">
                  {link.icon}
                </span>
                {link.labelKey ? t(link.labelKey) : link.label}
              </NavLink>
            ))}
          </nav>

          {/* Bottom section (optional) */}
          <div className="mt-auto border-t border-slate-100 pt-5 dark:border-slate-800">
            <NavLink
              to="/settings"
              className={({ isActive }) => (isActive ? linkActive : linkBase)}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
            >
              <span className="text-lg leading-none" aria-hidden="true">
                ⚙️
              </span>
              {t('nav.settings')}
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}
