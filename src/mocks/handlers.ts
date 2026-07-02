/**
 * Handlers MSW: interceptan las rutas reales del backend (`/api/*`) y responden
 * con la API simulada. Como MSW intercepta a nivel HTTP, el `core` (axios) las
 * consume igual que al backend real.
 */
import { http, HttpResponse } from 'msw';
import { createMockApi } from './mockApi';

const api = createMockApi();

const error422 = (msg: string) =>
  HttpResponse.json({ detail: [{ msg }] }, { status: 422 });

export const handlers = [
  http.post('/api/buscados', async ({ request }) => {
    const form = await request.formData();
    if (!form.getAll('files').length) return error422('Adjunta al menos una fotografía.');
    return HttpResponse.json(
      api.search({
        nombre: String(form.get('nombre') ?? ''),
        docNumero: String(form.get('doc_numero') ?? ''),
      }),
    );
  }),

  http.post('/api/encontrados', async ({ request }) => {
    const form = await request.formData();
    if (!form.getAll('files').length) return error422('Adjunta al menos una fotografía.');
    if (!String(form.get('refugio') ?? '').trim()) return error422('Indica el refugio.');
    if (!String(form.get('telefono_responsable') ?? '').trim()) return error422('Indica el teléfono.');
    return HttpResponse.json(api.registerFoundPerson());
  }),

  http.post('/api/reportes/falla', () => HttpResponse.json(api.createReport('falla'))),
  http.post('/api/reportes/publicacion', () => HttpResponse.json(api.createReport('publicacion'))),
];
