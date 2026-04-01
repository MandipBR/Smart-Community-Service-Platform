import { Link } from "react-router-dom";

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
  return (
    <div className="nepal-card h-[220px] w-full max-w-[360px] p-6 transition-all duration-[250ms] ease-out hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-ink">{title}</h3>
          <p className="mt-1 flex items-center text-xs text-muted">
            <span className="mr-2 text-brandBlue">?</span>
            <span className="truncate">{location}</span>
          </p>
        </div>
        {badge ? (
          <span className="rounded-full bg-brandBlue/10 px-3 py-1 text-xs font-semibold text-brandBlue">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="mt-3 text-xs text-muted">{date}</div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.slice(0, 4).map((tag) => (
          <span
            key={`${id || title}-${tag}`}
            className="rounded-full bg-brandRed/10 px-3 py-1 text-xs text-brandRed"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {avatars.slice(0, 3).map((avatar, idx) => (
              <img
                key={`${id || title}-${idx}`}
                src={avatar}
                alt=""
                className="h-7 w-7 rounded-full border border-white object-cover"
              />
            ))}
            {avatars.length === 0 ? (
              <div className="h-7 w-7 rounded-full border border-white bg-white/70" />
            ) : null}
          </div>
          <span className="text-xs text-muted">
            {volunteerCount != null ? `${volunteerCount} volunteers` : `${hours || 1} hrs`}
          </span>
        </div>

        {actions ? (
          <div className="flex gap-2">{actions}</div>
        ) : joinLink ? (
          <Link className="nepal-button-secondary" to={joinLink}>
            Join
          </Link>
        ) : null}
      </div>
    </div>
  );
}
