/**
 * Worker MSW para el navegador (dev). Registra los handlers de la API simulada.
 */
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
