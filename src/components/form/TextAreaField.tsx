import type { LucideIcon } from 'lucide-react';

import Field from './Field';

interface TextAreaFieldProps {
  label?: string;
  required?: boolean;
  optional?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  icon?: LucideIcon;
  error?: string;
  hint?: string;
  accent?: 'blue' | 'rose';
  counter?: boolean;
  id?: string;
  rows?: number;
}

export default function TextAreaField(props: TextAreaFieldProps) {
  return <Field {...props} multiline />;
}
