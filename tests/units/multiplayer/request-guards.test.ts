import { afterEach, describe, expect, it, vi } from 'vitest';
import { requireSameSiteOrigin } from '@/modules/multiplayer/utils/request-guards';

function buildRequest(headers: Record<string, string>): Request {
  return new Request('http://localhost:4321/api/v1/room', { headers });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('requireSameSiteOrigin', () => {
  it('allows a matching Origin', () => {
    expect(
      requireSameSiteOrigin(buildRequest({ origin: 'http://localhost:4321' })),
    ).toBeNull();
  });

  it('allows an Origin matching the SITE env', () => {
    vi.stubEnv('SITE', 'https://conter-strai.example');
    expect(
      requireSameSiteOrigin(buildRequest({ origin: 'https://conter-strai.example' })),
    ).toBeNull();
  });

  it('rejects a mismatched Origin with 403', () => {
    const response = requireSameSiteOrigin(buildRequest({ origin: 'https://evil.example' }));
    expect(response?.status).toBe(403);
  });

  it('falls back to Referer origin', () => {
    expect(
      requireSameSiteOrigin(buildRequest({ referer: 'http://localhost:4321/room' })),
    ).toBeNull();
    const response = requireSameSiteOrigin(
      buildRequest({ referer: 'https://evil.example/room' }),
    );
    expect(response?.status).toBe(403);
  });

  it('allows when both Origin and Referer are absent', () => {
    expect(requireSameSiteOrigin(buildRequest({}))).toBeNull();
  });

  it('rejects malformed Origin values', () => {
    const response = requireSameSiteOrigin(buildRequest({ origin: 'not-a-url' }));
    expect(response?.status).toBe(403);
  });
});
