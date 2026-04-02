const tones = {
  default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  red: "bg-brandRed/10 text-brandRed dark:bg-brandRed/20 dark:text-red-400",
  blue: "bg-brandBlue/10 text-brandBlue dark:bg-brandBlue/20 dark:text-blue-400",
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function BadgePill({ children, tone = "default" }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${tones[tone] || tones.default}`}>
      {children}
    </span>
  );
}
