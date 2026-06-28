import { Baby, Check } from 'lucide-react';

interface ChildToggleProps {
  isChild: boolean;
  onToggle: () => void;
}

export default function ChildToggle({ isChild, onToggle }: ChildToggleProps) {
  return (
    <div
      className="bg-amber-50/40 border-2 border-amber-200/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
      id="child-toggle-container"
    >
      <div>
        <span className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Baby size={20} className="text-amber-500" />
          ¿Es menor de edad?
        </span>
        <p className="text-xs text-slate-500 mt-1">
          Actívalo para aplicar protección de identidad (oculta nombre y apellido).
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={isChild}
        className={`px-6 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 shrink-0 flex items-center justify-center gap-2 shadow-sm border-2 ${
          isChild
            ? 'bg-amber-500 border-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_20px_rgba(245,158,11,0.4)] scale-105'
            : 'bg-white border-amber-400 text-amber-700 hover:bg-amber-100 hover:border-amber-500 hover:shadow-md'
        }`}
        id="btn-toggle-child"
      >
        {isChild ? <Check size={18} /> : <Baby size={18} />}
        {isChild ? 'MENOR PROTEGIDO' : 'SÍ, ES MENOR'}
      </button>
    </div>
  );
}
