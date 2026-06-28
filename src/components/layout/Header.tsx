import { AlertTriangle, Heart } from 'lucide-react';

interface HeaderProps {
  onOpenErrorReport: () => void;
}

export default function Header({ onOpenErrorReport }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-sm overflow-hidden shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 bg-amber-400"></div>
                <div className="flex-1 bg-blue-600"></div>
                <div className="flex-1 bg-rose-600"></div>
              </div>
              <Heart size={18} className="relative text-white fill-white sm:w-5 sm:h-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-slate-800 tracking-tight leading-none truncate">VzlaEncuentra</h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">S.O.S. - Búsqueda de personas</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              onClick={onOpenErrorReport}
              className="flex items-center gap-1.5 sm:gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <AlertTriangle size={14} />
              <span>Reportar Error</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
