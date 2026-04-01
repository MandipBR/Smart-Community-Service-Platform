export default function LeaderboardTable({ rows = [] }) {
  if (!rows.length) {
    return (
      <div className="nepal-card p-6">
        <p className="text-sm text-muted">No leaderboard data yet.</p>
      </div>
    );
  }

  return (
    <div className="nepal-card p-6">
      <div className="grid grid-cols-5 text-xs uppercase tracking-[0.2em] text-muted">
        <span>Rank</span>
        <span className="col-span-2">Name</span>
        <span>Hours</span>
        <span>Badge</span>
      </div>
      <div className="mt-4 space-y-2">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="grid h-14 grid-cols-5 items-center rounded-xl bg-white/70 px-4 text-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-soft"
          >
            <span className="text-muted">#{index + 1}</span>
            <span className="col-span-2 font-medium text-ink">{row.name}</span>
            <span>{row.totalHours}</span>
            <span className="text-xs text-brandRed">{row.badge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
