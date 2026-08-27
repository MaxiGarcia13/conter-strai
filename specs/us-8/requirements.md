# US-8 — Server security hardening

Depends on **US-5** (Colyseus multiplayer + lobby REST) shipping first.

## Requirements

| ID     | Requirement                                                                                                                                                                                                 |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-8.1 | Mutating REST routes (`POST`, `PUT`, `DELETE` on `/api/v1/room`) reject cross-origin requests without a matching `Origin` / `Referer` (same-site policy).                                                   |
| US-8.2 | `DELETE /api/v1/room/{id}` requires a valid `hostToken`; returns `401` / `403` without it.                                                                                                                  |
| US-8.3 | `POST /api/v1/room` returns `hostToken`; create handler persists it in Colyseus room metadata.                                                                                                              |
| US-8.5 | Server validates shot messages — never trust client HP/score; checks opposing team, alive, in-range, fire-rate; `zone` constrained to a known enum (no full server geometry raycast in this US).            |
| US-8.6 | Server validates movement (max speed / teleport threshold per message).                                                                                                                                     |
| US-8.8 | Unit + e2e tests cover unauthorized DELETE, cross-origin POST rejection, and at least one spoofing case (e.g. friendly-fire shot ignored).                                                                  |
| US-8.9 | Every room code has a server-side **`expiresAt`** (ISO timestamp) set at create; default TTL via `ROOM_CODE_TTL_MS` (**4 h**).                                                                               |
| US-8.11 | `MatchRoom` schedules auto-dispose at `expiresAt` (clear timer in `onDispose`); `RoomSnapshot` exposes `expiresAt`. Expired REST lookups return **`410 Gone`**.                                              |

## Acceptance

Two browsers complete a match after US-5 wiring. Curl without `hostToken` cannot `DELETE` a room. Curl with a forged `Origin` cannot mutate lobby routes. Friendly-fire / out-of-range shot spam does not apply damage. Expired room codes return `410` and the room is disposed server-side.

## Out of scope (this US)

- API-key / third-party proxy conventions
- HttpOnly session cookies / user accounts
- Reservation-only WebSocket join hardening (beyond what US-5 already wires)
- In-app IP rate limiting / Cloudflare config
- Authoritative Three.js hitbox raycast on the server
