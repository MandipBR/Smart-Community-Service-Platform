export default function Hero({ badge, title, subtitle, children, right, height = "h-[280px]" }) {
  return (
    <section className={`relative overflow-hidden rounded-[20px] bg-hero-glow px-8 py-8 text-white shadow-soft md:px-10 md:py-10 ${height}`}>
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 800 400" className="h-full w-full">
          <path
            d="M0 260 C160 180 260 260 380 210 C520 150 620 240 800 180 V400 H0 Z"
            fill="#fff"
          />
        </svg>
      </div>
      <div className="absolute right-10 top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute left-6 top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-10 lg:flex-row lg:items-center">
        <div className="max-w-[560px] space-y-5">
          {badge ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
              {badge}
            </span>
          ) : null}
          <h1 className="max-w-[10ch] font-heading text-[40px] font-semibold leading-[1.02] tracking-tight md:text-[44px]">
            {title}
          </h1>
          {subtitle ? (
            <p className="max-w-[480px] text-[15px] leading-7 text-white/78">{subtitle}</p>
          ) : null}
          {children}
        </div>
        {right ? <div className="w-full max-w-[520px] lg:self-end">{right}</div> : null}
      </div>
    </section>
  );
}
