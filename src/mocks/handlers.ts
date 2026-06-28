import { http, HttpResponse } from 'msw';

import { createMockApi } from './mockApi';

const mockApi = createMockApi();

function validationError(message: string) {
  return HttpResponse.json(
    { detail: [{ msg: message }] },
    { status: 422 },
  );
}

export const handlers = [
  http.post('/api/buscados', async ({ request }) => {
    const form = await request.formData();
    const files = form.getAll('files');

    if (!files.length) {
      return validationError('Adjunta al menos una fotografía clara del rostro.');
    }

    const nombre = String(form.get('nombre') ?? '');
    const docNumero = String(form.get('doc_numero') ?? '');

    return HttpResponse.json(mockApi.search({ nombre, docNumero }), {
      status: 200,
    });
  }),

  http.post('/api/encontrados', async ({ request }) => {
    const form = await request.formData();
    const files = form.getAll('files');
    const refugio = String(form.get('refugio') ?? '');
    const telefonoResponsable = String(form.get('telefono_responsable') ?? '');

    if (!files.length) {
      return validationError('Adjunta al menos una fotografía clara del rostro.');
    }
    if (!refugio.trim()) {
      return validationError('Indica el refugio, hospital o centro receptor.');
    }
    if (!telefonoResponsable.trim()) {
      return validationError('Indica un teléfono del responsable.');
    }

    return HttpResponse.json(
      mockApi.registerFoundPerson({
        esMenor: String(form.get('es_menor') ?? 'false') === 'true',
        nombre: String(form.get('nombre') ?? ''),
        apellido: String(form.get('apellido') ?? ''),
        docTipo: String(form.get('doc_tipo') ?? ''),
        docNumero: String(form.get('doc_numero') ?? ''),
        refugio,
        ubicacion: String(form.get('ubicacion') ?? ''),
        telefonoResponsable,
        descripcion: String(form.get('descripcion') ?? ''),
      }),
      { status: 200 },
    );
  }),

  http.post('/api/reportes/falla', async () => {
    return HttpResponse.json(mockApi.createFailureReport(), {
      status: 200,
    });
  }),

  http.post('/api/reportes/publicacion', async () => {
    return HttpResponse.json(mockApi.createPublicationReport(), {
      status: 200,
    });
  }),
];
