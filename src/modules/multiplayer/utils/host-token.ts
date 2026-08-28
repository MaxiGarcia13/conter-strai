import { Buffer } from 'node:buffer';
import { randomBytes, timingSafeEqual } from 'node:crypto';

/** Opaque bearer secret that authorizes `DELETE /api/v1/room/{id}`. */
export function generateHostToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Constant-time token comparison; different-length secrets never match. */
export function isHostToken(provided: string, expected: string): boolean {
  if (typeof provided !== 'string' || typeof expected !== 'string') {
    return false;
  }
  if (provided.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}
