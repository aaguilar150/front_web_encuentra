import { Baby, Check } from 'lucide-react';

interface ChildToggleProps {
  isChild: boolean;
  onToggle: () => void;
}

export default function ChildToggle({ isChild, onToggle }: ChildToggleProps) {
  return (
    <div className="bg-purple-100 border-2 border-purple-400 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm" id="child-toggle-container">
      <div>
        <span className="text-sm font-black text-purple-900 uppercase tracking-wider flex items-center gap-2">
          <Baby size={20} className="text-purple-700" />
          ¿Es menor de edad?
        </span>
        <p className="text-xs text-purple-800 font-medium mt-1">Actívalo para aplicar protección de identidad (oculta nombre y apellido).</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={isChild}
        className={`px-6 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 shrink-0 flex items-center justify-center gap-2 border-2 ${
          isChild
            ? 'bg-purple-500 border-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/40 scale-105'
            : 'bg-white border-purple-400 text-purple-700 hover:bg-purple-100 hover:border-purple-500 shadow-sm hover:shadow-md'
        }`}
        id="btn-toggle-child"
      >
        {isChild ? <Check size={18} /> : <Baby size={18} />}
        {isChild ? 'MENOR PROTEGIDO' : 'SÍ, ES MENOR'}
      </button>
    </div>
  );
}
