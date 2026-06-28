interface StatItem {
  label: string;
  value: number | string;
  color: string;
}

interface StatsBarProps {
  items: StatItem[];
}

export default function StatsBar({ items }: StatsBarProps) {
  return (
    <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 bg-white border border-slate-200/60 rounded-xl py-2 px-3 shadow-sm min-w-0"
        >
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.color} animate-pulse`}></span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-tight truncate">{item.label}</p>
            <p className="text-sm font-bold text-slate-800 font-mono leading-tight truncate">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
