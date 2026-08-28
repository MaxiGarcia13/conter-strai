import process from 'node:process';

/** True when Playwright (or another harness) sets `E2E=true` on the server process. */
export function isE2e(): boolean {
  return process.env.E2E === 'true';
}
