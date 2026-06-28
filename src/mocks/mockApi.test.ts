import { describe, expect, it } from 'vitest';

import { createMockApi } from './mockApi';

describe('createMockApi', () => {
  it('returns realistic search matches from the local sample data', () => {
    const api = createMockApi();

    const result = api.search({ nombre: 'Santiago' });

    expect(result.total).toBeGreaterThan(0);
    expect(result.coincidencias[0].nombre).toContain('Santiago');
    expect(result.coincidencias[0].image_url).toBeTruthy();
  });

  it('stores a newly registered found person in memory', () => {
    const api = createMockApi();

    const before = api.getFoundPeople().length;
    const result = api.registerFoundPerson({
      esMenor: false,
      nombre: 'Luis',
      apellido: 'Morales',
      docTipo: 'V',
      docNumero: '12345678',
      refugio: 'Refugio Central',
      ubicacion: 'Caracas',
      telefonoResponsable: '+58 424-1234567',
      descripcion: 'Consciente y estable',
    });

    const foundPeople = api.getFoundPeople();

    expect(result.person_id).toBeTruthy();
    expect(foundPeople).toHaveLength(before + 1);
    expect(foundPeople[0].name).toBe('Luis Morales');
  });
});
