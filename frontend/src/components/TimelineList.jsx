export default function TimelineList({ items = [] }) {
  if (!items.length) {
    return <p className="text-sm text-muted">No activity yet.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id || index} className="flex gap-4">
          <div className="flex w-10 flex-col items-center">
            <div className="mt-1 h-3 w-3 rounded-full bg-brandRed" />
            {index !== items.length - 1 ? <div className="mt-2 h-full w-px bg-slate-200" /> : null}
          </div>
          <div className="flex-1 rounded-[14px] bg-white/75 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-ink">{item.title}</p>
              {item.meta ? <span className="text-xs text-muted">{item.meta}</span> : null}
            </div>
            {item.description ? <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
