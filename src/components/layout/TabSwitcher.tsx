import React from 'react';
import { Heart } from 'lucide-react';

interface TabSwitcherProps {
  onChange: (tab: 'inicio') => void;
}

export default function TabSwitcher({ onChange }: TabSwitcherProps) {
  return (
    <div className="flex mb-5 w-full">
      <button
        onClick={() => onChange('inicio')}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 transition-all shadow-sm active:scale-[0.99] group font-black tracking-wide"
      >
        <div className="relative w-8 h-8 rounded-lg shadow-sm overflow-hidden shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
          <div className="absolute inset-0 flex flex-col pointer-events-none">
            <div className="flex-1 bg-amber-400"></div>
            <div className="flex-1 bg-blue-600"></div>
            <div className="flex-1 bg-rose-600"></div>
          </div>
          <Heart size={16} className="relative z-10 text-white fill-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
        </div>
        <span className="leading-tight text-sm sm:text-base">
          IR AL MENÚ PRINCIPAL
        </span>
      </button>
    </div>
  );
}
