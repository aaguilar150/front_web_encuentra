/**
 * Entidad de dominio (camelCase). Forma que consume la UI del front.
 * Sin dependencias de capas externas.
 */

export type FoundPersonStatus =
  | 'refugiado'
  | 'hospitalizado'
  | 'desconocido'
  | 'reunificado';

export interface FoundPerson {
  id: string;
  name: string;
  ci: string;
  hospitalName: string;
  locationAddress: string;
  contactPhone: string;
  physicalDescription: string;
  imageUrl: string;
  dateFound: string; // ISO
  status: FoundPersonStatus;
}

/** Datos crudos que captura `ReportFoundForm` antes de aplicar reglas. */
export interface RegisterFoundPersonInput {
  name: string;
  ci: string;
  hospitalName: string;
  locationAddress: string;
  contactPhone: string;
  physicalDescription: string;
  image: string; // dataURL o base64
  status: Extract<FoundPersonStatus, 'refugiado' | 'hospitalizado'>;
  isChild: boolean;
}

/**
 * Factory: aplica la protección de menores. Regla de negocio pura.
 * `idFactory` y `now` se inyectan para que la capa de dominio no toque
 * `Date.now()`/`Math.random()` directamente (testeable).
 */
export function buildFoundPerson(
  input: RegisterFoundPersonInput,
  idFactory: () => string,
  now: () => string,
): FoundPerson {
  return {
    id: idFactory(),
    name: input.isChild ? 'Niño/a Desconocido (Protegido)' : (input.name.trim() || 'Desconocido'),
    ci: input.isChild ? 'No Aplica (Menor de edad)' : (input.ci.trim() || 'Desconocido'),
    hospitalName: input.hospitalName.trim(),
    locationAddress: input.isChild ? 'No revelada por protección al menor' : input.locationAddress.trim(),
    contactPhone: input.contactPhone.trim(),
    physicalDescription: input.physicalDescription.trim(),
    imageUrl: input.image,
    dateFound: now(),
    status: input.status,
  };
}
