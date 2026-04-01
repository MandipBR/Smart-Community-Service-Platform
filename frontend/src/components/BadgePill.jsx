const tones = {
  default: "bg-slate-100 text-slate-700",
  red: "bg-brandRed/10 text-brandRed",
  blue: "bg-brandBlue/10 text-brandBlue",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
};

export default function BadgePill({ children, tone = "default" }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${tones[tone] || tones.default}`}>
      {children}
    </span>
  );
}
