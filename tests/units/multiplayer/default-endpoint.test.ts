import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultEndpoint } from '@/modules/multiplayer/adapters/colyseus-adapter/default-endpoint';

describe('defaultEndpoint', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('uses PUBLIC_COLYSEUS_URL in development', () => {
    vi.stubEnv('PROD', false);
    vi.stubEnv('DEV', true);
    vi.stubEnv('PUBLIC_COLYSEUS_URL', 'ws://localhost:2567');

    expect(defaultEndpoint()).toBe('ws://localhost:2567');
  });

  it('throws in development when PUBLIC_COLYSEUS_URL is missing', () => {
    vi.stubEnv('PROD', false);
    vi.stubEnv('DEV', true);
    vi.stubEnv('PUBLIC_COLYSEUS_URL', '');

    expect(() => defaultEndpoint()).toThrow('Missing PUBLIC_COLYSEUS_URL');
  });

  it('uses same-origin wss in production (Render / npm run preview)', () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('DEV', false);
    vi.stubEnv('PUBLIC_COLYSEUS_URL', 'ws://localhost:2567');
    vi.stubGlobal('location', {
      protocol: 'https:',
      host: 'conter-strai.onrender.com',
    });

    expect(defaultEndpoint()).toBe('wss://conter-strai.onrender.com');
  });

  it('uses same-origin ws in production on http', () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('DEV', false);
    vi.stubGlobal('location', {
      protocol: 'http:',
      host: 'localhost:4321',
    });

    expect(defaultEndpoint()).toBe('ws://localhost:4321');
  });
});
