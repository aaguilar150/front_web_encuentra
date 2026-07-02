import { describe, it, expect } from 'vitest';
import { mapBusqueda } from './match-result.mapper';
import type { ResultadoBusquedaDto } from '../dto/candidato.dto';

describe('mapBusqueda', () => {
  const dto: ResultadoBusquedaDto = {
    codigo: 'c1',
    total: 1,
    coincidencias: [
      {
        person_id: 'p1', estado: 'encontrada', es_menor: false,
        nombre: 'Ana', apellido: 'Pérez', edad: null,
        refugio: 'Hosp', ubicacion: 'Caracas', telefono: '0412', descripcion: 'desc',
        image_url: '/fotos/a.jpg', distancia: 0.4, coincidencia: 88, confianza: 'media',
      },
    ],
  };

  it('mapea DTO snake_case a MatchResult de dominio', () => {
    const [m] = mapBusqueda(dto, (u) => `https://cdn${u}`);
    expect(m.foundPerson.id).toBe('p1');
    expect(m.foundPerson.name).toBe('Ana Pérez');
    expect(m.foundPerson.imageUrl).toBe('https://cdn/fotos/a.jpg'); // resolver inyectado
    expect(m.similarity).toBeCloseTo(0.88);
    expect(m.distance).toBe(0.4);
    expect(m.isCertain).toBe(false); // confianza media
  });

  it('marca menor como "Menor protegido"', () => {
    const menor = { ...dto, coincidencias: [{ ...dto.coincidencias[0], es_menor: true }] };
    expect(mapBusqueda(menor, (u) => u)[0].foundPerson.name).toBe('Menor protegido');
  });
});
