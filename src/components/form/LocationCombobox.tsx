/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Input de ubicación con desplegable de ubicaciones guardadas localmente.
 * Renderiza solo la UI; la persistencia vive en el hook useSavedLocations.
 */
import React, { useState } from 'react';
import { MapPin, ChevronDown, X } from 'lucide-react';
import { inputClasses } from './Field';

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  onForget: (v: string) => void;
  accent?: 'blue' | 'rose';
  id?: string;
}

export default function LocationCombobox({ value, onChange, options, onForget, accent = 'blue', id }: Props) {
  const [open, setOpen] = useState(false);
  const cls = options.length ? inputClasses(accent).replace('pr-3.5', 'pr-10') : inputClasses(accent);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Ej: Plaza Bolívar, Caracas"
        maxLength={120}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => options.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={cls}
        id={id}
        autoComplete="off"
      />
      {options.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600"
          aria-label="Ver ubicaciones guardadas"
          tabIndex={-1}
        >
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}

      {open && options.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ubicaciones guardadas</p>
          {options.map((loc) => (
            <div key={loc} className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-blue-50 transition-all">
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onChange(loc); setOpen(false); }}
                className="flex-1 text-left text-sm text-slate-700 truncate flex items-center gap-2"
              >
                <MapPin size={14} className="text-slate-400 shrink-0" />
                {loc}
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onForget(loc); }}
                className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shrink-0"
                aria-label={`Borrar ${loc}`}
                title="Borrar ubicación guardada"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
