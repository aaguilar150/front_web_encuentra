import { z } from 'zod';

export const DOC_TYPES = ['V', 'E', 'J', 'P', 'G', 'C', 'R'] as const;
export const PHONE_PREFIXES = ['0424', '0412', '0416', '0426', '0422'] as const;

export const reportFoundSchema = z.object({
  photos: z.array(z.any()).min(1, 'Adjunta al menos una fotografía clara del rostro.'),
  esMenor: z.boolean(),
  nombre: z.string(),
  apellido: z.string(),
  docTipo: z.enum(DOC_TYPES),
  docNumero: z.string(),
  refugio: z.string().min(1, 'Indica el refugio, hospital o centro receptor.'),
  ubicacion: z.string(),
  telPrefijo: z.enum(PHONE_PREFIXES),
  telNumero: z.string().length(7, 'El teléfono debe tener 7 dígitos.'),
  docRespTipo: z.enum(DOC_TYPES),
  docResponsable: z.string(),
  descripcion: z.string(),
}).refine(
  (data) => !data.esMenor || data.docResponsable.trim().length > 0,
  { message: 'La identificación del responsable es obligatoria para un menor.', path: ['docResponsable'] }
);

export type ReportFoundFormValues = z.infer<typeof reportFoundSchema>;
export type DocTipo = ReportFoundFormValues['docTipo'];
export type TelPrefijo = ReportFoundFormValues['telPrefijo'];

export const reportFoundDefaults: ReportFoundFormValues = {
  photos: [],
  esMenor: false,
  nombre: '',
  apellido: '',
  docTipo: 'V',
  docNumero: '',
  refugio: '',
  ubicacion: '',
  telPrefijo: '0424',
  telNumero: '',
  docRespTipo: 'V',
  docResponsable: '',
  descripcion: '',
};
