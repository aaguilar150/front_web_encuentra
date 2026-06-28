import { INITIAL_FOUND_PERSONS } from '../data';
import type {
  AlertaFamiliar,
  Candidato,
  ReporteCreado,
  ResultadoBusqueda,
  ResultadoRegistro,
} from '../api';
import type { FoundPerson } from '../types';

interface SearchInput {
  nombre?: string;
  docNumero?: string;
}

interface RegisterInput {
  esMenor: boolean;
  nombre?: string;
  apellido?: string;
  docTipo?: string;
  docNumero?: string;
  refugio?: string;
  ubicacion?: string;
  telefonoResponsable?: string;
  descripcion?: string;
}

function normalize(value?: string | null) {
  return (value ?? '').trim().toLowerCase();
}

function slugId() {
  return `mock_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

function createAvatarDataUrl(label: string, tone: string) {
  const safeLabel = encodeURIComponent(label.slice(0, 18));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
      <rect width="320" height="320" fill="${tone}" />
      <circle cx="160" cy="118" r="58" fill="#f8fafc" opacity="0.95" />
      <path d="M84 272c18-54 56-82 76-82s58 28 76 82" fill="#f8fafc" opacity="0.95" />
      <text x="160" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#0f172a">${safeLabel}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const tones = ['#f97316', '#0ea5e9', '#10b981', '#8b5cf6', '#ef4444'];

function toMockFoundPeople(): FoundPerson[] {
  return INITIAL_FOUND_PERSONS.map((person) => ({ ...person }));
}

function toCandidate(person: FoundPerson, index: number): Candidato {
  const score = Math.max(97 - index * 7, 71);
  const distance = Number((0.18 + index * 0.11).toFixed(2));
  return {
    person_id: person.id,
    estado: person.status === 'hospitalizado' ? 'encontrada' : 'encontrada',
    es_menor: /niño|niña|menor/i.test(person.physicalDescription),
    nombre: person.name,
    apellido: '',
    edad: null,
    refugio: person.hospitalName,
    ubicacion: person.locationAddress,
    telefono: person.contactPhone,
    descripcion: person.physicalDescription,
    image_url: person.imageUrl || createAvatarDataUrl(person.name, tones[index % tones.length]),
    distancia: distance,
    coincidencia: score,
    confianza: score >= 90 ? 'alta' : score >= 80 ? 'media' : 'baja',
  };
}

export function createMockApi() {
  const foundPeople = toMockFoundPeople();
  const reports: ReporteCreado[] = [];

  const search = ({ nombre, docNumero }: SearchInput): ResultadoBusqueda => {
    const nameQuery = normalize(nombre);
    const docQuery = normalize(docNumero);

    const matches = foundPeople.filter((person) => {
      if (!nameQuery && !docQuery) return true;
      const nameMatch = nameQuery ? normalize(person.name).includes(nameQuery) : false;
      const docMatch = docQuery ? normalize(person.ci).replace(/\D/g, '').includes(docQuery.replace(/\D/g, '')) : false;
      return nameMatch || docMatch;
    });

    const fallback = matches.length ? matches : foundPeople.slice(0, 3);

    return {
      codigo: `BUS-${Date.now()}`,
      total: fallback.length,
      coincidencias: fallback.slice(0, 6).map(toCandidate),
    };
  };

  const registerFoundPerson = (input: RegisterInput): ResultadoRegistro => {
    const id = slugId();
    const fullName = input.esMenor
      ? 'Menor protegido'
      : [input.nombre, input.apellido].filter(Boolean).join(' ').trim() || 'Persona no identificada';
    const ci = input.docNumero?.trim() ? `${input.docTipo ?? 'V'}-${input.docNumero.trim()}` : 'Desconocido';

    foundPeople.unshift({
      id,
      name: fullName,
      ci,
      hospitalName: input.refugio?.trim() || 'Centro de atención temporal',
      locationAddress: input.ubicacion?.trim() || 'Ubicación resguardada',
      contactPhone: input.telefonoResponsable?.trim() || '+58 424-0000000',
      physicalDescription: input.descripcion?.trim() || 'Sin descripción adicional.',
      imageUrl: createAvatarDataUrl(fullName, '#2563eb'),
      dateFound: new Date().toISOString(),
      status: 'refugiado',
    });

    const alertName = normalize(input.nombre);
    const alert: AlertaFamiliar | null =
      alertName && (alertName.includes('santiago') || alertName.includes('maria'))
        ? {
            person_id: id,
            familiar_nombre: alertName.includes('santiago') ? 'Rosa Elena Ruiz' : 'Andrés Colmenares',
            familiar_telefono: alertName.includes('santiago') ? '+58 414-2223344' : '+58 412-9087766',
            image_url: foundPeople[0].imageUrl,
            coincidencia: alertName.includes('santiago') ? 96 : 91,
            confianza: 'alta',
          }
        : null;

    return {
      codigo: `ENC-${Date.now()}`,
      person_id: id,
      alerta: alert,
    };
  };

  const createReport = (tipo: string): ReporteCreado => {
    const report: ReporteCreado = {
      id: slugId(),
      tipo,
      estado: 'recibido',
      created_at: new Date().toISOString(),
    };
    reports.unshift(report);
    return report;
  };

  return {
    search,
    registerFoundPerson,
    createFailureReport: () => createReport('falla'),
    createPublicationReport: () => createReport('publicacion'),
    getFoundPeople: () => foundPeople.slice(),
    getReports: () => reports.slice(),
  };
}
