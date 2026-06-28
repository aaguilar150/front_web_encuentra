/**
 * API simulada (dev/local). Devuelve respuestas con la MISMA forma snake_case que
 * el backend real, para que el `core` las mapee igual. Fixture autocontenido (no
 * depende de datos de la app).
 */
import type { CandidatoDto, ResultadoBusquedaDto } from '../core/application/search/dto/candidato.dto';
import type { ResultadoRegistro } from '../core/domain/found-person/found-person.model';
import type { ReporteCreado } from '../core/domain/report/report.model';

interface SearchInput {
  nombre?: string;
  docNumero?: string;
}

/** Avatar SVG en data:URL (válido para resolveImageUrl, que solo permite data:image/). */
function avatar(label: string, tone: string): string {
  const safe = label.slice(0, 18).replace(/[<>&]/g, '');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">` +
    `<rect width="320" height="320" fill="${tone}"/>` +
    `<circle cx="160" cy="118" r="58" fill="#f8fafc" opacity="0.95"/>` +
    `<path d="M84 272c18-54 56-82 76-82s58 28 76 82" fill="#f8fafc" opacity="0.95"/>` +
    `<text x="160" y="305" text-anchor="middle" font-family="Arial" font-size="22" fill="#0f172a">${safe}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const SEED: Array<Omit<CandidatoDto, 'distancia' | 'coincidencia' | 'confianza'>> = [
  {
    person_id: 'mock_juan', estado: 'encontrada', es_menor: false,
    nombre: 'Juan Carlos', apellido: 'Pérez', edad: '35',
    refugio: 'Hospital Dr. Domingo Luciani', ubicacion: 'Piso 2, Caracas',
    telefono: '04125551234', descripcion: 'Hombre ~35 años, cicatriz en la ceja izquierda.',
    image_url: avatar('Juan', '#0ea5e9'),
  },
  {
    person_id: 'mock_maria', estado: 'encontrada', es_menor: false,
    nombre: 'María Alejandra', apellido: 'Colmenares', edad: '28',
    refugio: 'Hospital Periférico de Catia', ubicacion: 'Sala A, Caracas',
    telefono: '04161234567', descripcion: 'Mujer ~28 años, tatuaje de mariposa en la muñeca.',
    image_url: avatar('Maria', '#f97316'),
  },
  {
    person_id: 'mock_santi', estado: 'encontrada', es_menor: true,
    nombre: 'Santiago', apellido: '', edad: '7',
    refugio: 'Centro de Cuidado Infantil San José', ubicacion: 'Maracay, Aragua',
    telefono: '04127778899', descripcion: 'Niño ~7 años, franela roja de superhéroe.',
    image_url: avatar('Santiago', '#10b981'),
  },
];

const norm = (v?: string | null) => (v ?? '').trim().toLowerCase();
const id = () => `mock_${Math.random().toString(36).slice(2, 10)}`;

export function createMockApi() {
  const search = ({ nombre, docNumero }: SearchInput): ResultadoBusquedaDto => {
    const nq = norm(nombre);
    const hits = SEED.filter((p) => (!nq && !docNumero) || (nq && norm(p.nombre).includes(nq)));
    const list = hits.length ? hits : SEED; // si no hay match, muestra todos (demo)
    const coincidencias: CandidatoDto[] = list.map((p, i) => {
      const score = Math.max(97 - i * 8, 71);
      return {
        ...p,
        distancia: Number((0.18 + i * 0.12).toFixed(2)),
        coincidencia: score,
        confianza: score >= 90 ? 'alta' : score >= 80 ? 'media' : 'baja',
      };
    });
    return { codigo: id(), total: coincidencias.length, coincidencias };
  };

  const registerFoundPerson = (): ResultadoRegistro => ({
    codigo: id(),
    person_id: id(),
    // 1 de cada 2 registros simula que un familiar ya buscaba (para ver la alerta)
    alerta: Math.random() < 0.5
      ? { person_id: id(), familiar_nombre: 'Ana Pérez', familiar_telefono: '04141112233', image_url: avatar('Ana', '#8b5cf6'), coincidencia: 93, confianza: 'alta' }
      : null,
  });

  const createReport = (tipo: string): ReporteCreado => ({
    id: id(), tipo, estado: 'recibido', created_at: new Date().toISOString(),
  });

  return { search, registerFoundPerson, createReport };
}
