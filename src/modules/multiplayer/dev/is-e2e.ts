/** True when Playwright (or another harness) sets `PUBLIC_E2E=true`. */
export function isE2e(): boolean {
  if (import.meta.env.PUBLIC_E2E === 'true') {
    return true;
  }

  return typeof process !== 'undefined' && process.env.PUBLIC_E2E === 'true';
}
