import { z } from 'zod';

export const DOC_TYPES = ['V', 'E', 'J', 'P', 'G', 'C', 'R'] as const;

export const searchByImageSchema = z.object({
  photos: z.array(z.any()).min(1, 'Por favor, selecciona o sube al menos una foto de la persona que buscas.'),
  qNombre: z.string(),
  qDocTipo: z.enum(DOC_TYPES),
  qDocNumero: z.string(),
}).refine(
  (data) => data.qNombre.trim().length > 0 || data.qDocNumero.trim().length > 0,
  { message: 'Indica al menos el nombre o la cédula de quien buscas.', path: ['qDocNumero'] }
);

export type SearchMissingFormValues = z.infer<typeof searchByImageSchema>;
export type SearchDocTipo = SearchMissingFormValues['qDocTipo'];

export const searchByImageDefaults: SearchMissingFormValues = {
  photos: [],
  qNombre: '',
  qDocTipo: 'V',
  qDocNumero: '',
};
