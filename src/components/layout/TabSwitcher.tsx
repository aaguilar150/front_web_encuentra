import { cn } from '@/lib/utils';
import { UserRoundSearch, UserRoundPlus } from 'lucide-react';

interface TabSwitcherProps {
  activeTab: 'buscar' | 'reportar';
  onChange: (tab: 'buscar' | 'reportar') => void;
}

export default function TabSwitcher({ activeTab, onChange }: TabSwitcherProps) {
  return (
    <div
      className="flex mb-5 max-w-4xl mx-auto rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm"
      role="tablist"
    >
      <button
        onClick={() => onChange('buscar')}
        role="tab"
        aria-selected={activeTab === 'buscar'}
        className={cn(
          'flex-1 basis-1/2 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-2 py-3 text-xs sm:text-base font-bold transition-all duration-300',
          activeTab === 'buscar' ? 'bg-rose-600 text-white shadow-inner' : 'bg-white text-rose-600 hover:bg-rose-50',
        )}
      >
        <UserRoundSearch size={20} className="shrink-0" />
        <span className="text-center leading-tight">Buscar Familiar</span>
      </button>

      <button
        onClick={() => onChange('reportar')}
        role="tab"
        aria-selected={activeTab === 'reportar'}
        className={cn(
          'flex-1 basis-1/2 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-2 py-3 text-xs sm:text-base font-bold border-l-2 border-slate-200 transition-all duration-300',
          activeTab === 'reportar' ? 'bg-blue-600 text-white shadow-inner' : 'bg-white text-blue-600 hover:bg-blue-50',
        )}
      >
        <UserRoundPlus size={20} className="shrink-0" />
        <span className="text-center leading-tight">Reportar Persona Encontrada</span>
      </button>
    </div>
  );
}
