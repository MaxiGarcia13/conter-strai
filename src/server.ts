import http from 'node:http';
/**
 * Custom server entry — boots Colyseus + Astro in the same Node process.
 *
 * After `astro build`, run:
 *   ASTRO_NODE_AUTOSTART=disabled node dist/server/custom-entry.mjs
 *
 * This file imports the built Astro handler, creates an HTTP server,
 * attaches Colyseus WebSocket transport, then starts listening.
 */
import process from 'node:process';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Server as ColyseusServer } from 'colyseus';

import { MatchRoom } from './modules/multiplayer/rooms/match-room';

const HOST = process.env.HOST ?? '0.0.0.0';
const PORT = Number(process.env.PORT ?? 4321);

let _colyseusReady = false;

async function main() {
  // Prevent the built entry from auto-starting its own server.
  process.env.ASTRO_NODE_AUTOSTART = 'disabled';
  // @ts-expect-error — entry.mjs only exists after `astro build`
  const { handler } = await import('./entry.mjs');

  // Create HTTP server serving Astro pages + API routes.
  const httpServer = http.createServer(handler);

  // Attach Colyseus WebSocket transport to the same HTTP server.
  const transport = new WebSocketTransport();
  transport.attachToServer(httpServer);

  // Create Colyseus server with the attached transport.
  const gameServer = new ColyseusServer({ transport });
  gameServer.define('match', MatchRoom);

  // listen() boots the matchmaker and starts listening on the HTTP server.
  await gameServer.listen(PORT, HOST);
  _colyseusReady = true;
  console.warn(`[server] Astro + Colyseus listening on http://${HOST}:${PORT}`);
}

main()
  .catch((err) => {
    console.error('[server] boot failed:', err);
    process.exit(1);
  });

export function isColyseusReady(): boolean {
  return _colyseusReady;
}
