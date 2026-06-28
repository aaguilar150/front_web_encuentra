/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Modal de bienvenida que aparece solo la primera vez que se abre la app.
 */
import React from 'react';
import { UserRoundSearch , UserRoundPlus, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
}

export default function OnboardingModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative p-6 sm:p-7 max-h-[90vh] overflow-y-auto animate-[fadeIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={18} />
        </Button>

        <div className="text-center mb-5">
          <div className="relative w-12 h-12 rounded-xl shadow-sm overflow-hidden flex items-center justify-center mx-auto mb-3">
            <div className="absolute inset-0 flex flex-col">
              <div className="flex-1 bg-amber-400"></div>
              <div className="flex-1 bg-blue-600"></div>
              <div className="flex-1 bg-rose-600"></div>
            </div>
            <Heart size={22} className="relative text-white fill-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
          </div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Bienvenido a VzlaEncuentra</h2>
          <p className="text-sm text-slate-500 mt-1">Así puedes ayudar a reunir familias.</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-4 flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <UserRoundSearch  size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-900">Buscar familiar</h3>
              <p className="text-xs text-slate-600 leading-snug mt-0.5">
                Sube la foto de tu ser querido. Analizamos su rostro y lo comparamos con las personas ya reportadas.
              </p>
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <UserRoundPlus size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-900">Reportar persona encontrada</h3>
              <p className="text-xs text-slate-600 leading-snug mt-0.5">
                ¿Ayudaste a alguien? Registra su foto y sus datos para que su familia pueda dar con ella. Reporta solo casos reales.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="dark"
          className="w-full mt-5"
          onClick={onClose}
        >
          Entendido, empezar
        </Button>
      </div>
    </div>
  );
}
