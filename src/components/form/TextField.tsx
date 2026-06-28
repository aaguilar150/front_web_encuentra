import type { LucideIcon } from 'lucide-react';

import Field from './Field';

interface TextFieldProps {
  label?: string;
  required?: boolean;
  optional?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  icon?: LucideIcon;
  error?: string;
  invalid?: boolean;
  hint?: string;
  accent?: 'blue' | 'rose';
  counter?: boolean;
  numeric?: boolean;
  id?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  type?: string;
}

export default function TextField(props: TextFieldProps) {
  return <Field {...props} />;
}
