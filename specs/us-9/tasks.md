# US-9 — Tasks

Ship after **US-5** / **US-7** / **US-8** (shipped). Tick only when the matching requirement passes.

See [`design.md`](./design.md) and [`requirements.md`](./requirements.md).

## Deploy-ready countdown (US-9.10–US-9.15)

- [ ] Add `deploying` to `MatchRoundPhase` in `src/modules/multiplayer/schema/match-state.ts`
- [ ] Add per-player `ready: boolean` on `PlayerState` (default false); reset on `startRound`
- [ ] `MatchRoom.startRound()`: set `roundPhase = 'deploying'`, clear ready flags, **do not** start countdown timer
- [ ] Add `onMessage('playerReady')`: mark sender ready; when all connected players ready → `beginCountdown()`
- [ ] On disconnect during **`deploying`**: re-check ready gate
- [ ] Map `deploying` in `map-match-round-phase.ts` → client phase `'deploying'`
- [ ] Add `'deploying'` to `src/modules/game/types.ts` `RoundPhase`
- [ ] Adapter: `sendPlayerReady()` + export from colyseus adapter
- [ ] Remove mount-time `startRound()` from `game-canvas.tsx`; call after loader clears (offline)
- [ ] On `onLoaderChange(null)` in `game-canvas-island` / canvas: `sendPlayerReady()` (multiplayer) or `startRound()` (offline)
- [ ] Extend `countdown-banner.tsx` (or new banner) for **`deploying`** copy (“Deploying…” / “Waiting for players…”)
- [ ] Update `to-room-snapshot.ts` mapping for REST phase during **`deploying`**
- [ ] Unit: `MatchRoom` ready gate — 1 player, 2 players, disconnect mid-deploy
- [ ] E2e: countdown does not appear until deploy loader clears

## Auto pointer lock (US-9.1 / US-9.2)

- [ ] In `use-player-pointer-lock.ts`: request lock on transition to **`live`** when `!eliminated && !paused`
- [ ] Keep canvas click as fallback via existing `requestPointerLock`
- [ ] Re-request lock on pause resume
- [ ] E2e: update `camera.spec.ts` — remove pre-click when auto-lock succeeds in CI

## Pause menu (US-9.3–US-9.7)

- [ ] Add `src/modules/game/state/game-pause-store.ts`
- [ ] Add `src/modules/game/constants/game-commands.ts`
- [ ] Add `src/modules/game/components/game-pause-panel.tsx`; mount in `game-canvas.tsx`
- [ ] Escape toggles pause in `use-player-keyboard.ts` (**live** only)
- [ ] Gate movement, look, shoot, pose actions when paused (`isPausedRef` in control hooks)
- [ ] Pause open → `exitPointerLock()`; resume → re-request lock
- [ ] Extract `src/modules/game/utils/restart-round.ts`; reuse in `round-end-banner.tsx` + pause panel
- [ ] Add `src/modules/game/utils/leave-match-to-home.ts` (no `deleteRoom`)
- [ ] Wire Restart (host only), Leave → `/`, Commands toggle, Resume
- [ ] Reset pause store on round end / navigate away
- [ ] Unit: pause store + commands list
- [ ] E2e: `tests/e2e/play/pause-menu.spec.ts`

## Do not

- Implement canvas-relative look without pointer lock
- Add pause during countdown or deploying overlays
- DELETE room from pause Leave
- Add ready timeout / force-start unless playtesting demands it
- Block US-9 on US-8 completion (orthogonal unless shared files conflict)
