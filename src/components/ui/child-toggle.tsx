import { Baby, Check } from 'lucide-react';

interface ChildToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function ChildToggle({ value, onChange }: ChildToggleProps) {
  const baseCls = "inline-flex shrink-0 items-center justify-center font-bold whitespace-nowrap transition-all outline-none select-none py-2 px-4 rounded-xl text-xs gap-1.5";
  const variantCls = value
    ? "bg-amber-500 border-2 border-amber-500 text-white hover:bg-amber-600 shadow-md"
    : "bg-white border-2 border-amber-400 text-amber-700 hover:bg-amber-100 shadow-sm";

  return (
    <button
      type="button"
      className={`${baseCls} ${variantCls}`}
      onClick={() => onChange(!value)}
      aria-pressed={value}
      id="btn-toggle-child"
    >
      {value ? <Check size={18} className="shrink-0" /> : <Baby size={18} className="shrink-0" />}
      {value ? 'MENOR PROTEGIDO' : 'SÍ, ES MENOR'}
    </button>
  );
}
