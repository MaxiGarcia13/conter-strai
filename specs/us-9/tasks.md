# US-9 — Tasks

Ship after **US-5** / **US-7** / **US-8** (shipped). Tick only when the matching requirement passes.

See [`design.md`](./design.md) and [`requirements.md`](./requirements.md).

## Deploy-ready countdown (US-9.10–US-9.15)

- [x] Add `deploying` to `MatchRoundPhase` in `src/modules/multiplayer/schema/match-state.ts`
- [x] Add per-player `ready: boolean` on `PlayerState` (default false); reset on `startRound`
- [x] `MatchRoom.startRound()`: `resetRound()` → `roundPhase = 'deploying'`, clear ready flags, lock room; **do not** start countdown
- [x] Add `onMessage('playerReady')` → `playerReady()` → `tryBeginRoundWhenAllReady()` → `startCountdown()`
- [x] On disconnect during **`deploying`**: re-check ready gate in `removePlayer`
- [x] Map server `deploying` in `map-match-round-phase.ts` → client phase **`loading`**
- [x] Add **`loading`** to `RoundPhase` in `src/modules/game/types.ts`
- [x] Adapter: `playerReady()` on `MatchHandle` + export from `match-session.ts`
- [x] `MatchPlayCanvas`: call `playerReady()` when deploy loader clears (`visible === false`, join succeeded)
- [x] Gate movement during **`loading`** in `use-player-movement-frame.ts`
- [x] Waiting room redirects to `/play` on **`loading`** phase (`waiting-room-content.tsx`)
- [x] Deploy UX via existing **`PlayLoader`** / `LoadingReporter`; numeric countdown only in **`countdown`** (`countdown-banner.tsx`)
- [x] Update `to-room-snapshot.ts`: REST phase **`in_progress`** while server is **`deploying`**
- [x] Add `onMessage('restartRound')` + adapter `restartRound()`; wire `round-end-banner` restart through deploy gate
- [x] `bind-match.ts`: local respawn + health sync on entering deploying / countdown / in_progress
- [x] Unit: `mapMatchRoundPhase('deploying')` + `to-room-snapshot` deploying snapshot
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
