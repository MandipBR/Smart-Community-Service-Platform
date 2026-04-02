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
    <div className="nepal-card group flex flex-col p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-ink/70 border border-slate-100 flex items-center justify-center">
              {t('common.upcoming')}
            </span>
            {badge && (
              <span className="rounded-xl bg-brandRed/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brandRed border border-brandRed/20 flex items-center justify-center">
                {badge}
              </span>
            )}
          </div>
          <h3 className="mt-5 line-clamp-2 text-xl font-bold tracking-tight text-ink group-hover:text-brandRed transition-colors leading-[1.3]">
            {title}
          </h3>
          <p className="mt-2 flex items-center text-sm font-bold text-muted/80">
            <span className="mr-2 opacity-50">📍</span>
            <span className="truncate">{location}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 text-[13px] font-bold text-muted/70">
        <span className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">📅</span>
        {date}
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5">
        {tags.slice(0, 3).map((tag) => (
          <span
            key={`${id || title}-${tag}`}
            className="rounded-2xl border border-white bg-white/20 px-4 py-2 text-[11px] font-bold text-ink/70 shadow-sm backdrop-blur-md"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <div className="flex items-center justify-between gap-6 border-t border-slate-100 dark:border-slate-800 pt-6">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {avatars.slice(0, 3).map((avatar, idx) => (
                <img
                  key={`${id || title}-${idx}`}
                  src={avatar}
                  alt=""
                  className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-soft bg-slate-100"
                />
              ))}
              {(volunteerCount > 3 || (avatars.length === 0 && volunteerCount > 0)) && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white text-[11px] font-bold text-ink shadow-soft">
                  +{volunteerCount - (avatars.length > 3 ? 3 : avatars.length)}
                </div>
              )}
              {avatars.length === 0 && volunteerCount == null && (
                <div className="h-10 w-10 rounded-full border-2 border-white bg-brandRed/5 text-xs flex items-center justify-center text-brandRed font-bold shadow-soft">
                  ★
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                {t('common.impact')}
              </p>
              <p className="text-sm font-bold text-ink tracking-tight">
                {volunteerCount != null ? `${volunteerCount} ${t('common.joined')}` : `${hours || 1} ${t('common.reward_pts')}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actions ? (
              actions
            ) : joinLink ? (
              <Link className="nepal-button-secondary h-10 px-5 text-xs font-bold" to={joinLink}>
                {t('common.details')}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
