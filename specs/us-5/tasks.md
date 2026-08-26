# US-5 — Tasks

Post type-split: client game modules stay free of Colyseus imports — use `src/modules/multiplayer/` adapter only. Reuse `combat` HP types, `game` `RoundPhase`, `teams`, and `weapons` contracts. See [`specs/current/design.md#module-types`](../current/design.md#module-types).

## Done (prerequisites)

- [x] `@astrojs/node` + `output: 'server'` in `astro.config.mjs` (already configured for multiplayer)

## Astro Node + Colyseus server

- [ ] Add `colyseus`, `@colyseus/schema`, `@colyseus/sdk`
- [ ] Define `MatchState` / `PlayerState` Schema (`hp`, `eliminated`, `team`, transform) aligned with `HealthState` + `Team`
- [ ] Implement `MatchRoom` (join, leave, move, shot, round end / reset) under `src/modules/multiplayer/rooms/`
- [ ] Wire Colyseus into Astro Node process (boot rooms with server)
- [ ] Env: `PUBLIC_COLYSEUS_URL` (+ optional `COLYSEUS_PORT`)

## Client adapter + game wiring

- [ ] `colyseus-adapter` (`initMatch`, sync transform, send shot, listeners) in `multiplayer/adapters/`
- [ ] `multiplayer-store` for remote players + round phase (map to `RoundPhase` where useful)
- [ ] `RemotePlayer` component (skin from `getSoldierSkinById`; hitboxes from combat preset when needed)
- [ ] Wire local FPS transform sync through adapter (not direct Colyseus in `game/`)
- [ ] Wire `useShooting` → `sendShot`; apply **server** HP / eliminated updates (client combat math becomes prediction-only or removed for HP)
- [ ] Init Colyseus join on `/room/{id}/play` mount
- [ ] Cap room at 2–8 players; assign Civilians / Soldiers on server

## Verification

- [ ] Two browsers join same room, teams assigned, shoot until one team eliminated; round resets

## Do not

- Import `colyseus` from `combat/`, `scenarios/`, `soldiers/`, or `weapons/` — adapter boundary only
- Re-author hitbox / skin types on the server Schema beyond what client modules already define
