import BadgePill from "./BadgePill.jsx";

const initialsFrom = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function ProfileHero({ name, subtitle, bio, badge, meta = [], tags = [] }) {
  return (
    <section className="nepal-card min-h-[220px] p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-brandRed/10 text-2xl font-semibold text-brandRed">
            {initialsFrom(name)}
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-[40px] font-semibold leading-[48px] tracking-tight text-ink">{name}</h1>
              {badge ? <BadgePill tone="blue">{badge}</BadgePill> : null}
            </div>
            {subtitle ? <p className="text-sm font-medium text-brandBlue">{subtitle}</p> : null}
            {bio ? <p className="max-w-[680px] text-sm leading-7 text-muted">{bio}</p> : null}
            {meta.length ? (
              <div className="flex flex-wrap gap-2">
                {meta.map((item) => (
                  <BadgePill key={item}>{item}</BadgePill>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {tags.length ? (
          <div className="flex max-w-[320px] flex-wrap justify-end gap-2">
            {tags.map((tag) => (
              <BadgePill key={tag} tone="red">{tag}</BadgePill>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
