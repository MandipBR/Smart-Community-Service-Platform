import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function EventCard({
  id,
  title,
  location,
  date,
  tags = [],
  hours,
  badge,
  volunteerCount,
  actions,
  joinLink,
  avatars = [],
}) {
  const { t } = useTranslation();
  return (
    <div className="nepal-card group flex flex-col p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="pill-outline text-[10px] font-bold uppercase tracking-wider">
              {t('common.upcoming')}
            </span>
            {badge && (
              <span className="rounded-full bg-brandBlue/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brandBlue">
                {badge}
              </span>
            )}
          </div>
          <h3 className="mt-3 line-clamp-1 text-lg font-semibold tracking-tight text-ink group-hover:text-brandRed transition-colors">
            {title}
          </h3>
          <p className="mt-1 flex items-center text-xs font-medium text-muted">
            <span className="mr-1.5 opacity-60">📍</span>
            <span className="truncate">{location}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-muted/80">
        <span className="mr-1">📅</span>
        {date}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {tags.slice(0, 3).map((tag) => (
          <span
            key={`${id || title}-${tag}`}
            className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-1.5 text-[11px] font-semibold text-ink/70"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-2.5">
              {avatars.slice(0, 3).map((avatar, idx) => (
                <img
                  key={`${id || title}-${idx}`}
                  src={avatar}
                  alt=""
                  className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm bg-slate-100"
                />
              ))}
              {(volunteerCount > 3 || (avatars.length === 0 && volunteerCount > 0)) && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-muted shadow-sm">
                  +{volunteerCount - (avatars.length > 3 ? 3 : avatars.length)}
                </div>
              )}
              {avatars.length === 0 && volunteerCount == null && (
                <div className="h-8 w-8 rounded-full border-2 border-white bg-brandRed/5 text-xs flex items-center justify-center text-brandRed font-bold shadow-sm">
                  ★
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {t('common.impact')}
              </p>
              <p className="text-xs font-semibold text-ink">
                {volunteerCount != null ? `${volunteerCount} ${t('common.joined')}` : `${hours || 1} ${t('common.reward_pts')}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actions ? (
              actions
            ) : joinLink ? (
              <Link className="nepal-button-secondary h-9 px-4 text-xs" to={joinLink}>
                {t('common.details')}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
