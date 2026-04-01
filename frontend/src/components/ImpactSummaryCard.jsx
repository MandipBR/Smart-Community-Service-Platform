export default function ImpactSummaryCard({ label, value, helper }) {
  return (
    <div className="nepal-card p-6 transition-all duration-[250ms] ease-out hover:-translate-y-1 hover:shadow-lift">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {helper ? <p className="mt-2 text-sm text-muted">{helper}</p> : null}
    </div>
  );
}
