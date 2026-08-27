/**
 * Client WebSocket endpoint for `@colyseus/sdk`.
 *
 * - **Dev** (`npm run dev`): Colyseus listens on `COLYSEUS_PORT` — requires
 *   `PUBLIC_COLYSEUS_URL` (e.g. `ws://localhost:2567`).
 * - **Prod** (`npm run preview` / Render): Astro + Colyseus share the site host/port —
 *   use same-origin `ws:` / `wss:` so a baked `localhost:2567` cannot break deploy.
 */
export function defaultEndpoint(): string {
  if (import.meta.env.PROD && typeof globalThis.location !== 'undefined') {
    const { protocol, host } = globalThis.location;
    return `${protocol === 'https:' ? 'wss:' : 'ws:'}//${host}`;
  }

  const url = import.meta.env.PUBLIC_COLYSEUS_URL;
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error('Missing PUBLIC_COLYSEUS_URL');
  }
  return url;
}
