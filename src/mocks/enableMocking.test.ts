import { describe, expect, it, vi } from 'vitest';

import { enableMocking } from './enableMocking';

describe('enableMocking', () => {
  it('starts the worker only in dev browser mode', async () => {
    const start = vi.fn().mockResolvedValue(undefined);
    const loadWorker = vi.fn().mockResolvedValue({
      worker: { start },
    });

    await enableMocking({
      isDev: true,
      isTest: false,
      hasWindow: true,
      loadWorker,
    });

    expect(loadWorker).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledWith({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
  });

  it('does not load mocks outside local development', async () => {
    const loadWorker = vi.fn();

    await enableMocking({
      isDev: false,
      isTest: false,
      hasWindow: true,
      loadWorker,
    });

    await enableMocking({
      isDev: true,
      isTest: true,
      hasWindow: true,
      loadWorker,
    });

    await enableMocking({
      isDev: true,
      isTest: false,
      hasWindow: false,
      loadWorker,
    });

    expect(loadWorker).not.toHaveBeenCalled();
  });
});
