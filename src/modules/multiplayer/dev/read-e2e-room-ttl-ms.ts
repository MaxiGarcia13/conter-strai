import process from 'node:process';
import { isE2e } from './is-e2e';

const E2E_TTL_MIN_MS = 50;
const E2E_TTL_MAX_MS = 10_000;

/** Short `ttlMs` create-body override for e2e / local — ignored in production. */
export function readE2eRoomTtlMs(body: unknown): number | undefined {
  if (!isE2e() && process.env.NODE_ENV === 'production') {
    return undefined;
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return undefined;
  }
  const ttlMs = (body as Record<string, unknown>).ttlMs;
  if (typeof ttlMs !== 'number' || !Number.isFinite(ttlMs)) {
    return undefined;
  }
  if (ttlMs < E2E_TTL_MIN_MS || ttlMs > E2E_TTL_MAX_MS) {
    return undefined;
  }
  return ttlMs;
}
