export default function Hero({ badge, title, subtitle, children, right, height = "h-[480px]", image }) {
  return (
    <section className={`relative overflow-hidden rounded-[40px] bg-brandBlue px-10 py-10 text-white shadow-lift lg:px-16 lg:py-16 ${height} group animate-fadeUp`}>
      {/* Dynamic Background Image */}
      {image ? (
        <>
          <img 
            src={image} 
            alt={title} 
            className="absolute inset-0 h-full w-full object-cover brightness-[0.7] transition-transform duration-[30s] group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/40 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-hero-glow opacity-60" />
      )}

      {/* Decorative Overlays */}
      <div className="absolute inset-0 opacity-10 mix-blend-overlay">
        <svg viewBox="0 0 800 400" className="h-full w-full">
          <path
            d="M0 260 C160 180 260 260 380 210 C520 150 620 240 800 180 V400 H0 Z"
            fill="#fff"
          />
        </svg>
      </div>
      <div className="absolute right-10 top-8 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      
      {/* Content Layer */}
      <div className="relative z-10 flex h-full flex-col justify-center gap-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-[620px] space-y-8">
          {badge ? (
            <span className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md">
              {badge}
            </span>
          ) : null}
          <h1 className="font-heading text-[48px] font-bold leading-[1.05] tracking-tight md:text-[56px] lg:text-[64px]">
            {title}
          </h1>
          {subtitle ? (
            <p className="max-w-[520px] text-lg leading-relaxed text-white/85 font-medium">
              {subtitle}
            </p>
          ) : null}
          <div className="pt-4 flex flex-wrap gap-5 items-center">
            {children}
          </div>
        </div>
        {right ? <div className="w-full max-w-[580px] lg:self-end animate-fadeUp delay-150">{right}</div> : null}
      </div>
    </section>
  );
}
