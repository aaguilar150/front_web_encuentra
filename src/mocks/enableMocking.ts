/**
 * Activa los mocks MSW SOLO cuando se pide explícitamente con la variable de
 * entorno `VITE_USE_MOCKS=true`. Así el dev normal sigue pegándole al backend
 * real (vía proxy) y los mocks son opt-in para trabajar sin backend.
 */
export async function enableMocking(): Promise<void> {
  const wantMocks = import.meta.env.VITE_USE_MOCKS === 'true';
  const isTest = import.meta.env.MODE === 'test';
  if (!wantMocks || isTest || typeof window === 'undefined') return;

  const { worker } = await import('./browser');
  await worker.start({
    onUnhandledRequest: 'bypass', // deja pasar lo que no esté mockeado
    serviceWorker: { url: '/mockServiceWorker.js' },
  });
}
