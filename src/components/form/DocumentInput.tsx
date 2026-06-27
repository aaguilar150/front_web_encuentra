/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Documento de identidad: selector de tipo + número (solo dígitos).
 * Compartido por buscar/reportar.
 */
import React from 'react';

export const DOC_TYPES = ['V', 'E', 'J', 'P', 'G', 'C', 'R'];

const RING = {
  rose: 'focus:border-rose-500 focus:ring-rose-500/20',
  blue: 'focus:border-blue-500 focus:ring-blue-500/20',
};

interface Props {
  tipo: string;
  numero: string;
  onTipo: (v: string) => void;
  onNumero: (v: string) => void;
  accent: keyof typeof RING;
  error?: boolean;
  numeroId?: string;
}

export default function DocumentInput({ tipo, numero, onTipo, onNumero, accent, error, numeroId }: Props) {
  const base = 'bg-white border rounded-xl text-slate-800 text-sm outline-none transition-all shadow-sm focus:ring-2';
  const numBorder = error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : `border-slate-200 ${RING[accent]}`;

  return (
    <div className="flex gap-2">
      <select
        value={tipo}
        onChange={(e) => onTipo(e.target.value)}
        className={`px-3 py-2.5 font-bold shrink-0 ${base} border-slate-200 ${RING[accent]}`}
        aria-label="Tipo de documento"
      >
        {DOC_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <input
        type="text"
        inputMode="numeric"
        placeholder="Ej: 12345678"
        maxLength={9}
        value={numero}
        onChange={(e) => onNumero(e.target.value.replace(/\D/g, ''))}
        className={`w-full px-3.5 py-2.5 font-medium placeholder-slate-400 ${base} ${numBorder}`}
        id={numeroId}
      />
    </div>
  );
}
