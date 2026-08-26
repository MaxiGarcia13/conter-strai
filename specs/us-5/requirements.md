# US-5 — Colyseus multiplayer

## Requirements

| ID      | Requirement                                                                                                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| US-5.1  | Astro runs as a **Node.js server** via `@astrojs/node` adapter (`output: 'server'`)                                                                                                              |
| US-5.2  | **Colyseus** game server handles rooms, matchmaking, and real-time state sync                                                                                                                    |
| US-5.3  | US-7 lobby pages (`/room`, `/room/{id}`, `/room/{id}/join`, `/room/{id}/play`) call REST for create/status/seat; waiting room and play connect via Colyseus adapter (`joinById` / reserved seat) |
| US-5.4  | Sync player transforms (position, rotation) via Colyseus Schema state                                                                                                                            |
| US-5.5  | Sync health, eliminated state, and **team** (`civilian` \| `soldier`)                                                                                                                            |
| US-5.6  | Shot events via Colyseus room messages (server-authoritative or validated)                                                                                                                       |
| US-5.7  | Remote soldiers rendered for other players                                                                                                                                                       |
| US-5.8  | Adapter pattern isolates Colyseus from game modules (`colyseus-adapter`)                                                                                                                         |
| US-5.9  | Round state synced across clients (round start/end, team wipe) — server-authoritative                                                                                                            |
| US-5.10 | Max **8** players per match, **4 vs 4** (`maxClients: 8`, `maxPerTeam: 4`) — enforced on REST seat claim and Colyseus `onJoin`                                                                   |
| US-5.11 | `POST /api/v1/room` creates a match room, generates a public 6-char room code, returns lobby snapshot                                                                                            |
| US-5.12 | `GET /api/v1/room/{roomId}` returns room existence + snapshot; `404` if unknown/disposed                                                                                                         |
| US-5.13 | `PUT /api/v1/room/{roomId}` claims/updates a lobby seat (`team`, `skin`) while `waiting`; rejects full/wrong-phase/team-full with `409`; may return seat reservation for WebSocket join          |
| US-5.14 | `DELETE /api/v1/room/{roomId}` disposes the Colyseus room (host or empty-room cleanup); `204` / `404`                                                                                            |
| US-5.15 | `GET /api/v1/room/{roomId}/status` returns `phase`, `canJoin`, per-team seat counts (`max: 4`), optional `scenario` / `playerCount`                                                              |

## Acceptance

Two+ browsers create/join via REST (same public room code), connect over Colyseus WebSocket, sit in waiting then play on opposing teams (≤4 each), fight with pistols until one team is eliminated; round resets and repeats.
