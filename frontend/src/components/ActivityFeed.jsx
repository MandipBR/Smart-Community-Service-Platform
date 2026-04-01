export default function ActivityFeed({ items = [] }) {
  if (!items.length) {
    return (
      <div className="nepal-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Activity</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">Recent updates</h3>
          </div>
        </div>
        <p className="mt-6 text-sm text-muted">No recent activity yet.</p>
      </div>
    );
  }

  return (
    <div className="nepal-card p-6">
      <div>
        <p className="eyebrow">Activity</p>
        <h3 className="mt-2 text-xl font-semibold text-ink">Recent updates</h3>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-4 rounded-[14px] border border-slate-200/70 bg-white/80 p-4 transition-all duration-[250ms] ease-out hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{item.title}</p>
              <p className="mt-1 text-xs text-muted">{item.subtitle}</p>
            </div>
            <span className="shrink-0 text-xs text-muted">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
