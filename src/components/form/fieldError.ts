import type { ValidationError } from '@tanstack/react-form';

export function fieldError(err: ValidationError): string | undefined {
  if (typeof err === 'string') return err;
  if (err !== null && err !== undefined && typeof err === 'object') {
    if ('message' in err) {
      const msg = (err as { message: unknown }).message;
      return typeof msg === 'string' ? msg : undefined;
    }
  }
  return undefined;
}
