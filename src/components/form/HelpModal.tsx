/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Modal "¿Cómo funciona?" con pasos numerados, compartido por ambos forms.
 */
import React from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface HelpStep {
  n: number;
  t: string;
  d: string;
}

const ACCENTS = {
  rose: { title: 'text-rose-900', icon: 'text-rose-500', card: 'bg-rose-50/50 border-rose-100', num: 'bg-rose-500' },
  emerald: { title: 'text-emerald-950', icon: 'text-emerald-600', card: 'bg-emerald-50/50 border-emerald-100', num: 'bg-emerald-600' },
};

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  steps: HelpStep[];
  accent: keyof typeof ACCENTS;
  id?: string;
}

export default function HelpModal({ open, onClose, title, steps, accent, id }: Props) {
  if (!open) return null;
  const a = ACCENTS[accent];

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} id={id}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative p-5 sm:p-6 max-h-[90vh] overflow-y-auto animate-[fadeIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200"
          onClick={onClose}
        >
          <X size={18} />
        </Button>
        <h3 className={`text-base font-bold ${a.title} flex items-center gap-2 pr-8 mb-5`}>
          <HelpCircle size={18} className={`${a.icon} shrink-0`} />
          {title}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {steps.map((s) => (
            <div key={s.n} className={`${a.card} p-4 rounded-xl border flex gap-3`}>
              <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full ${a.num} text-white text-xs font-black shrink-0`}>{s.n}</span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">{s.t}</h4>
                <p className="text-xs text-slate-500 leading-snug">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
