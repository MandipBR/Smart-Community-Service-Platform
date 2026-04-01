export default function DashboardHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="space-y-2">
        <p className="eyebrow">Workspace</p>
        <h2 className="section-title">{title}</h2>
        {subtitle ? (
          <p className="max-w-[620px] text-sm leading-6 text-muted">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
