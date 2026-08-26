# US-5 — Tasks

Post type-split: client game modules stay free of Colyseus imports — use `src/modules/multiplayer/` adapter only. Reuse `combat` HP types, `game` `RoundPhase`, `teams`, and `weapons` contracts. See [`specs/current/design.md#module-types`](../current/design.md#module-types).

Lobby REST wraps Colyseus `matchMaker`; presence and play stay on WebSocket. See [`design.md`](./design.md).

## Done (prerequisites)

- [x] `@astrojs/node` + `output: 'server'` in `astro.config.mjs` (already configured for multiplayer)

## Astro Node + Colyseus server

- [x] Add `colyseus`, `@colyseus/schema`, `@colyseus/sdk`
- [x] Define `MatchState` / `PlayerState` Schema (`hp`, `eliminated`, `team`, `skin`, transform) aligned with `HealthState` + `Team`
- [ ] Implement single `MatchRoom` (`waiting` → `in_progress` → `ended`; join, leave, move, shot, round end / reset) under `src/modules/multiplayer/rooms/`
- [ ] Enforce `maxClients: 8` and `maxPerTeam: 4` in `onJoin` / team assignment
- [ ] Wire Colyseus into Astro Node process (boot rooms with server; matchMaker ready before API traffic)
- [ ] Env: `PUBLIC_COLYSEUS_URL` (+ optional `COLYSEUS_PORT`)

## Lobby REST (`/api/v1/room`)

- [ ] `POST /api/v1/room` — generate 6-char `roomCode`, `matchMaker.createRoom('match', …)`, return `RoomSnapshot` (`201`)
- [ ] `GET /api/v1/room/[roomId]` — lookup by metadata `roomCode`, snapshot or `404`
- [ ] `PUT /api/v1/room/[roomId]` — seat claim/update while `waiting`; `409` if full/wrong phase/team full; prefer `reserveSeatFor` token in response
- [ ] `DELETE /api/v1/room/[roomId]` — dispose room (`204` / `404`)
- [ ] `GET /api/v1/room/[roomId]/status` — `phase`, `canJoin`, per-team seats (`max: 4`), optional `scenario` / `playerCount`
- [ ] Return `503` from REST when matchMaker is not initialized
- [ ] Files: `src/pages/api/v1/room/index.ts`, `[roomId].ts`, `[roomId]/status.ts`

## Lobby UI consumers

- [ ] Create-room flow → `POST /api/v1/room` (stop client-only id generation as source of truth; keep writing `sessionStorage`)
- [ ] Join / invite flows → `GET` status + `PUT` seat before navigating to waiting/play
- [ ] Waiting room → poll or fetch `GET …/status`; show open team slots / `canJoin`
- [ ] Host dispose (if exposed) → `DELETE /api/v1/room/{id}`

## Client adapter + game wiring

- [ ] `colyseus-adapter` (`initMatch` with room id / reservation, sync transform, send shot, listeners) in `multiplayer/adapters/`
- [ ] `multiplayer-store` for remote players + round phase (map to `RoundPhase` where useful)
- [ ] `RemotePlayer` component (skin from `getSoldierSkinById`; hitboxes from combat preset when needed)
- [ ] Wire local FPS transform sync through adapter (not direct Colyseus in `game/`)
- [ ] Wire `useShooting` → `sendShot`; apply **server** HP / eliminated updates (client combat math becomes prediction-only or removed for HP)
- [ ] Init Colyseus join on waiting room and/or `/room/{id}/play` mount (`joinById` / reserved seat)
- [ ] Lock joins when `roundPhase` leaves `waiting`

## Verification

- [ ] Two browsers: create via REST, join via PUT + WebSocket, teams ≤4 each, shoot until one team eliminated; round resets
- [ ] Status reflects `canJoin` false when full or `in_progress`; PUT returns `409` when team full

## Do not

- Import `colyseus` from `combat/`, `scenarios/`, `soldiers/`, or `weapons/` — adapter boundary only
- Re-author hitbox / skin types on the server Schema beyond what client modules already define
- Implement pure-HTTP gameplay or a REST-only session store instead of Colyseus
- Split LobbyRoom → MatchRoom migration in this US (single `MatchRoom` with phases)
