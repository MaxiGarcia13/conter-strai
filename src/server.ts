import http from 'node:http';
/**
 * Custom server entry — boots Colyseus + Astro in the same Node process.
 *
 * After `astro build` (+ `scripts/build-server-entry.mjs`), run:
 *   node dist/server/custom-entry.mjs
 *
 * Colyseus matchmake HTTP + WebSocket share `$PORT` with Astro. Non-Colyseus
 * requests fall through to the Astro Node handler via the Express bridge.
 */
import process from 'node:process';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Server as ColyseusServer } from 'colyseus';

import { MatchRoom } from './modules/multiplayer/rooms/match-room';

const HOST = process.env.HOST ?? '0.0.0.0';
const PORT = Number(process.env.PORT ?? 4321);

async function main() {
  // Prevent the built Astro entry from auto-starting its own server.
  process.env.ASTRO_NODE_AUTOSTART = 'disabled';
  // @ts-expect-error — entry.mjs only exists after `astro build`
  const { handler } = await import('./entry.mjs');

  const httpServer = http.createServer();
  const transport = new WebSocketTransport({ server: httpServer });

  const gameServer = new ColyseusServer({
    transport,
    // Colyseus prepends matchmake routes; everything else goes to Astro.
    express: (app) => {
      app.use((req: http.IncomingMessage, res: http.ServerResponse) => {
        handler(req, res);
      });
    },
  });
  gameServer.define('match', MatchRoom);

  await gameServer.listen(PORT, HOST);
  console.warn(`[server] Astro + Colyseus listening on http://${HOST}:${PORT}`);
}

main().catch((err) => {
  console.error('[server] boot failed:', err);
  process.exit(1);
});
