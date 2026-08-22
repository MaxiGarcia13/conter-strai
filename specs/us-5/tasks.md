# US-5 — Tasks

## Astro Node + Colyseus server

- [ ] Add `@astrojs/node`; set `output: 'server'` + Node adapter in `astro.config.mjs`
- [ ] Add `colyseus`, `@colyseus/schema`, `@colyseus/sdk`
- [ ] Define `MatchState` / `PlayerState` Schema
- [ ] Implement `MatchRoom` (join, leave, move, shot, round end / reset)
- [ ] Wire Colyseus into Astro Node process (boot rooms with server)
- [ ] Env: `PUBLIC_COLYSEUS_URL` (+ optional `COLYSEUS_PORT`)

## Client adapter + game wiring

- [ ] `colyseus-adapter` (`initMatch`, sync transform, send shot, listeners)
- [ ] multiplayer-store for remote players + round phase
- [ ] RemotePlayer component
- [ ] Wire FpsPlayer transform sync through adapter
- [ ] Wire useShooting → `sendShot`; apply server HP / eliminated updates
- [ ] Init Colyseus join on `/play` mount
- [ ] Cap room at 2–8 players; assign Puma / Lion on server

## Verification

- [ ] Two browsers join same room, teams assigned, shoot until one team eliminated; round resets
