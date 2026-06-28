import { Phone } from 'lucide-react';

import { inputClasses } from './Field';

const PHONE_PREFIXES = ['0424', '0412', '0416', '0426', '0422'];

interface PhoneFieldProps {
  prefix: string;
  number: string;
  onPrefixChange: (value: string) => void;
  onNumberChange: (value: string) => void;
  accent: 'blue' | 'rose';
  error?: string;
  id?: string;
}

export default function PhoneField({
  prefix,
  number,
  onPrefixChange,
  onNumberChange,
  accent,
  error,
  id = 'contact-phone-input',
}: PhoneFieldProps) {
  const selectClass = `px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none transition-all font-bold shadow-sm shrink-0 focus:ring-2 ${
    accent === 'rose' ? 'focus:border-rose-500 focus:ring-rose-500/20' : 'focus:border-blue-500 focus:ring-blue-500/20'
  }`;

  return (
    <div className="flex gap-2">
      <select
        value={prefix}
        onChange={(event) => onPrefixChange(event.target.value)}
        className={selectClass}
        aria-label="Prefijo telefónico"
      >
        {PHONE_PREFIXES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Phone size={16} className="text-slate-400" />
        </div>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          placeholder="8135166"
          maxLength={7}
          value={number}
          onChange={(event) => onNumberChange(event.target.value.replace(/\D/g, ''))}
          className={inputClasses(accent, !!error, true)}
        />
      </div>
    </div>
  );
}
