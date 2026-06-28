import { describe, it, expect } from 'vitest';
import { validateSearch } from './search.schema';

describe('validateSearch', () => {
  const photo = { file: new File([], 'x.png'), url: 'blob:x' };

  it('exige al menos una foto', () => {
    const r = validateSearch({ photos: [], nombre: 'Ana', docNumero: '' });
    expect(r.ok).toBe(false);
    expect(r.errors.photos).toBeTruthy();
  });

  it('exige nombre O cédula', () => {
    const r = validateSearch({ photos: [photo], nombre: '', docNumero: '' });
    expect(r.ok).toBe(false);
    expect(r.errors.identidad).toBeTruthy();
  });

  it('pasa con foto + solo nombre', () => {
    expect(validateSearch({ photos: [photo], nombre: 'Ana', docNumero: '' }).ok).toBe(true);
  });

  it('pasa con foto + solo cédula', () => {
    expect(validateSearch({ photos: [photo], nombre: '', docNumero: '12345678' }).ok).toBe(true);
  });
});
