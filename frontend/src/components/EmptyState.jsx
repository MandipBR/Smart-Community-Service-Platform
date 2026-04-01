export default function EmptyState({ title, message, action, compact = false }) {
  return (
    <div className={`nepal-card border-dashed p-6 text-center ${compact ? "" : "py-10"}`}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brandBlue/10 text-brandBlue">
        <span className="text-lg font-semibold">SC</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-[420px] text-sm leading-6 text-muted">{message}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
