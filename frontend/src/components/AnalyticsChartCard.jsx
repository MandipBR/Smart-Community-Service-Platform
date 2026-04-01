export default function AnalyticsChartCard({ title, subtitle, children }) {
  return (
    <section className="nepal-card p-6">
      <div className="mb-5 space-y-2">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
      </div>
      <div className="h-[320px]">{children}</div>
    </section>
  );
}
