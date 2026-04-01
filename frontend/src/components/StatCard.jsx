export default function StatCard({ label, value, helper, trend, icon }) {
  return (
    <div className="nepal-card h-[120px] w-[260px] p-5 transition-all duration-[250ms] ease-out hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
        {icon ? (
          <span className="text-xs font-semibold text-brandRed">{icon}</span>
        ) : null}
      </div>
      <p className="mt-4 text-[30px] font-semibold tracking-tight text-ink">{value}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        {helper ? <p className="truncate text-xs text-muted">{helper}</p> : <span />}
        {trend != null ? (
          <span className="rounded-full bg-brandBlue/[0.08] px-2.5 py-1 text-[11px] font-semibold text-brandBlue">
            {trend}
          </span>
        ) : null}
      </div>
    </div>
  );
}
