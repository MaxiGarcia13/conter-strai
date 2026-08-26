# US-5 — Colyseus multiplayer

## Requirements

| ID      | Requirement                                                                                                                                        |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-5.1  | Astro runs as a **Node.js server** via `@astrojs/node` adapter (`output: 'server'`)                                                                |
| US-5.2  | **Colyseus** game server handles rooms, matchmaking, and real-time state sync                                                                      |
| US-5.3  | Lobby **Create Room** / **Join Room** / **Play** (US-7) wire to Colyseus rooms (`joinOrCreate` / `joinById`) — supersedes former “Start Game” join |
| US-5.4  | Sync player transforms (position, rotation) via Colyseus Schema state                                                                              |
| US-5.5  | Sync health, eliminated state, and **team** (`civilian` \| `soldier`)                                                                              |
| US-5.6  | Shot events via Colyseus room messages (server-authoritative or validated)                                                                         |
| US-5.7  | Remote soldiers rendered for other players                                                                                                         |
| US-5.8  | Adapter pattern isolates Colyseus from game modules (`colyseus-adapter`)                                                                           |
| US-5.9  | Round state synced across clients (round start/end, team wipe) — server-authoritative                                                              |
| US-5.10 | 2–8 players split across Civilians and Soldiers per match (`maxClients`)                                                                           |

## Acceptance

Two+ browsers join the same Colyseus room (served by Astro Node + Colyseus), assigned to teams, fight with pistols until one team is eliminated; round resets and repeats.
