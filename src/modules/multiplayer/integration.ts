import type { AstroIntegration } from 'astro';
/**
 * Astro integration — boots Colyseus in dev mode alongside Vite.
 *
 * In production, use src/server.ts instead (ASTRO_NODE_AUTOSTART=disabled).
 */
import process from 'node:process';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Server as ColyseusServer } from 'colyseus';

import { MatchRoom } from './rooms/match-room';

const COLYSEUS_PORT = Number(process.env.COLYSEUS_PORT ?? 2567);

export default function colyseusIntegration(): AstroIntegration {
  return {
    name: 'colyseus',
    hooks: {
      'astro:server:start': async () => {
        const transport = new WebSocketTransport();
        const gameServer = new ColyseusServer({ transport });
        gameServer.define('match', MatchRoom);
        await gameServer.listen(COLYSEUS_PORT);
        console.warn(`[colyseus] dev listening on ws://localhost:${COLYSEUS_PORT}`);
      },
    },
  };
}
