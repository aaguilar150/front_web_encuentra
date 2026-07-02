import React from 'react';
import { Menu, Heart, X, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

interface HeaderProps {
  activeTab?: string;
  onChangeTab?: (tab: 'inicio' | 'buscar' | 'reportar' | 'testimonios') => void;
  isMenuOpen?: boolean;
  onToggleMenu?: () => void;
  onReportError: () => void;
}

export default function Header({ activeTab, onChangeTab, isMenuOpen, onToggleMenu, onReportError }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-sm overflow-hidden shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 bg-amber-400" />
                <div className="flex-1 bg-blue-600" />
                <div className="flex-1 bg-rose-600" />
              </div>
              <Heart size={18} className="relative text-white fill-white sm:w-5 sm:h-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-slate-800 tracking-tight leading-none truncate">VzlaEncuentra</h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">S.O.S. - Búsqueda de personas</p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {onToggleMenu && (
              <button
                onClick={onToggleMenu}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm shrink-0 relative z-50 ${isMenuOpen ? 'bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200' : 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50'}`}
                aria-label="Menú"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
