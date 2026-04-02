export default function StatCard({ label, value, helper, trend, icon }) {
  return (
    <div className="nepal-card group p-6 transition-all duration-300 hover:shadow-lg dark:hover:border-slate-700">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
            {label}
          </p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {value}
          </p>
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brandRed/5 text-xl font-bold text-brandRed transition-colors group-hover:bg-brandRed/10 dark:bg-brandRed/10">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        {helper ? (
          <p className="truncate text-xs font-medium text-muted">{helper}</p>
        ) : (
          <div className="h-4" />
        )}
        {trend && (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10 dark:bg-emerald-900/20 dark:text-emerald-400">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
