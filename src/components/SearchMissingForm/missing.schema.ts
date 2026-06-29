import { z } from 'zod';

export const DOC_TYPES = ['V', 'E', 'J', 'P', 'G', 'C', 'R'] as const;

export const MSG_REQUIRE_NAME_OR_DOC = 'Indica al menos el nombre o la cédula de quien buscas.';

export const MSG_REQUIRE_PHOTO = 'Por favor, selecciona o sube al menos una foto de la persona que buscas.';

export function getCrossFieldErrors(data: {
  qNombre: string;
  qDocNumero: string;
}): Partial<Record<'qNombre' | 'qDocNumero', string>> {
  if (data.qNombre.trim() === '' && data.qDocNumero.trim() === '') {
    return { qNombre: MSG_REQUIRE_NAME_OR_DOC, qDocNumero: MSG_REQUIRE_NAME_OR_DOC };
  }
  return {};
}

export function getSubmitErrors(
  data: { photos: unknown; qNombre: string; qDocNumero: string },
  toPhotos: (v: unknown) => { length: number },
): Record<string, string | undefined> {
  const res: Record<string, string | undefined> = {};
  const cross = getCrossFieldErrors({ qNombre: data.qNombre, qDocNumero: data.qDocNumero });
  if (cross.qNombre) res.qNombre = cross.qNombre;
  if (cross.qDocNumero) res.qDocNumero = cross.qDocNumero;
  if (toPhotos(data.photos).length < 1) res.photos = MSG_REQUIRE_PHOTO;
  return res;
}

export const searchByImageSchema = z
  .object({
    photos: z.array(z.any()).min(1, MSG_REQUIRE_PHOTO),
    qNombre: z.string().trim(),
    qDocTipo: z.enum(DOC_TYPES),
    qDocNumero: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    const cross = getCrossFieldErrors({ qNombre: data.qNombre, qDocNumero: data.qDocNumero });
    console.log(cross, data);

    if (cross.qNombre) ctx.addIssue({ code: 'custom', message: cross.qNombre, path: ['qNombre'] });
    if (cross.qDocNumero) ctx.addIssue({ code: 'custom', message: cross.qDocNumero, path: ['qDocNumero'] });
  });

export type SearchMissingFormValues = z.infer<typeof searchByImageSchema>;
export type SearchDocTipo = SearchMissingFormValues['qDocTipo'];

export const searchByImageDefaults: SearchMissingFormValues = {
  photos: [],
  qNombre: '',
  qDocTipo: 'V',
  qDocNumero: '',
};
