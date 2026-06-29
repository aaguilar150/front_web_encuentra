import React from 'react';
import { Search, Megaphone, Heart } from 'lucide-react';

interface Props {
  onSelect: (option: 'buscar' | 'reportar') => void;
}

export default function OnboardingView({ onSelect }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-lg mx-auto p-6 sm:p-8 animate-[fadeIn_0.2s_ease-out]">
      <div className="text-center mb-8">
        <div className="relative w-16 h-16 rounded-xl shadow-sm overflow-hidden flex items-center justify-center mx-auto mb-4">
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 bg-amber-400"></div>
            <div className="flex-1 bg-blue-600"></div>
            <div className="flex-1 bg-rose-600"></div>
          </div>
          <Heart size={28} className="relative text-white fill-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Bienvenido a VzlaEncuentra</h2>
        <p className="text-slate-500 mt-2">Selecciona cómo deseas ayudar para comenzar.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => onSelect('buscar')}
          className="bg-rose-100/50 border border-rose-200 rounded-xl p-5 flex gap-4 text-left hover:bg-rose-100 transition-colors shadow-sm hover:shadow-md group"
        >
          <div className="w-12 h-12 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Search size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-rose-900">Quiero buscar a alguien</h3>
            <p className="text-sm text-slate-600 leading-snug mt-1">
              Sube la foto de tu ser querido. Analizamos su rostro y lo comparamos con las personas ya reportadas.
            </p>
          </div>
        </button>

        <button 
          onClick={() => onSelect('reportar')}
          className="bg-blue-100/50 border border-blue-200 rounded-xl p-5 flex gap-4 text-left hover:bg-blue-100 transition-colors shadow-sm hover:shadow-md group"
        >
          <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Megaphone size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-blue-900">Encontré a alguien</h3>
            <p className="text-sm text-slate-600 leading-snug mt-1">
              ¿Ayudaste a alguien? Registra su foto y sus datos para que su familia pueda dar con ella. Reporta solo casos reales.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
