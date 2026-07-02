import { describe, it, expect } from 'vitest';
import { validateReport } from './report.schema';

describe('validateReport', () => {
  const photo = { file: new File([], 'x.png'), url: 'blob:x' };
  const base = { photos: [photo], refugio: 'Hospital X', telNumero: '1234567', isChild: false, docResponsable: '' };

  it('pasa con datos mínimos válidos (adulto)', () => {
    expect(validateReport(base).ok).toBe(true);
  });

  it('exige foto, refugio y teléfono de 7 dígitos', () => {
    const r = validateReport({ ...base, photos: [], refugio: '', telNumero: '123' });
    expect(r.ok).toBe(false);
    expect(r.errors.photos).toBeTruthy();
    expect(r.errors.refugio).toBeTruthy();
    expect(r.errors.telefono).toBeTruthy(); // telNumero -> telefono
  });

  it('exige doc del responsable cuando es menor', () => {
    const r = validateReport({ ...base, isChild: true, docResponsable: '' });
    expect(r.ok).toBe(false);
    expect(r.errors.docResponsable).toBeTruthy();
  });

  it('menor con doc del responsable pasa', () => {
    expect(validateReport({ ...base, isChild: true, docResponsable: '12345678' }).ok).toBe(true);
  });
});
