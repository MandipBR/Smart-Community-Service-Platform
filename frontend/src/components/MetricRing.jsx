export default function MetricRing({ value = 0, label }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-20 w-20">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#D32F2F"
            strokeWidth="3"
            strokeDasharray={`${pct}, 100`}
          />
        </svg>
        <span className="absolute text-sm font-semibold text-ink">{pct}%</span>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
        <p className="text-lg font-semibold text-ink">Impact score</p>
      </div>
    </div>
  );
}
