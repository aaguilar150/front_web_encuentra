interface EnableMockingOptions {
  isDev?: boolean;
  isTest?: boolean;
  hasWindow?: boolean;
  loadWorker?: () => Promise<{
    worker: {
      start: (options: {
        onUnhandledRequest: 'bypass';
        serviceWorker: { url: string };
      }) => Promise<unknown>;
    };
  }>;
}

export async function enableMocking({
  isDev = import.meta.env.DEV,
  isTest = import.meta.env.MODE === 'test',
  hasWindow = typeof window !== 'undefined',
  loadWorker = () => import('./browser'),
}: EnableMockingOptions = {}) {
  if (!isDev || isTest || !hasWindow) {
    return;
  }

  const { worker } = await loadWorker();
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });
}
