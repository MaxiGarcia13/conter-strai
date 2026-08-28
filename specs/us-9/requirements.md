# US-9 — Pause menu, auto pointer lock, deploy-ready countdown

Depends on **US-5** (shipped), **US-7** (shipped). Can ship after or alongside **US-8**.

## Requirements

### Input and pause

| ID     | Requirement                                                                                                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| US-9.1 | When round phase becomes **`live`**, auto-call `requestPointerLock(canvas)` once (solo via `round-store`, multiplayer via `multiplayer-store` phase).                                            |
| US-9.2 | Keep canvas **click** as silent fallback when the browser rejects auto-lock (existing swallow in `request-pointer-lock.ts`).                                                                     |
| US-9.3 | **Escape** toggles pause panel during **`live`** only. Releases pointer lock while open.                                                                                                         |
| US-9.4 | Pause panel **Restart**: host only in multiplayer (same rule as `round-end-banner.tsx`); always in offline. Calls `startMatch()` / `startRound(scenarioId)`. Closes panel.                       |
| US-9.5 | Pause panel **Leave**: everyone — disconnect from match if connected, `clearRoomSession(roomId)` when present, navigate to **`/`**. Does **not** `DELETE` the room (room stays open for others). |
| US-9.6 | Pause panel **Commands** section lists gameplay bindings (WASD move, Space sprint, C camera, F jump, E kneel, R reload, LMB shoot, Esc pause). Dev-only **V** free-cam noted as dev-only.        |
| US-9.7 | While paused: disable move, look, shoot, and pose actions; resume on Escape or **Resume** button.                                                                                                |

### Deploy-ready countdown

| ID      | Requirement                                                                                                                                                                                               |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-9.10 | Host **Start Match** (or **Restart**) transitions the room to a **`deploying`** phase — respawn / lock joins as today, but the 3‑2‑1 timer does **not** start until every connected player reports ready. |
| US-9.11 | Each client on `/play` sends **`playerReady`** to the server when the **Deploying** loader finishes (`LoadingReporter` → `onLoaderChange(null)`).                                                         |
| US-9.12 | Server starts **`countdown`** only when `readyCount === connectedPlayerCount` (minimum 1). Solo offline: local `startRound` runs only after the same deploy-complete signal (no server message).          |
| US-9.13 | While **`deploying`**, show a full-screen overlay (“Deploying…” / “Waiting for players…”) instead of the numeric countdown.                                                                               |
| US-9.14 | **`playerReady`** is idempotent per session per round; reconnect during **`deploying`** must re-send ready after load completes.                                                                          |
| US-9.15 | If a player disconnects during **`deploying`**, re-evaluate the ready gate (countdown starts when remaining connected players are all ready).                                                             |

### Verification

| ID     | Requirement                                                                                                              |
| ------ | ------------------------------------------------------------------------------------------------------------------------ |
| US-9.8 | E2E: room play can cycle camera **without** pre-click when auto-lock succeeds; Escape opens panel with expected actions. |
| US-9.9 | Unit + e2e: countdown does not begin until deploy loader clears; multiplayer waits for all connected peers.              |

## Acceptance

Two browsers: host starts match → both land on `/play` → each finishes **Deploying** → server shows 3‑2‑1 → round goes **live** → mouse look works without canvas click (click fallback still works if lock rejected). **Escape** opens pause with Restart (host), Leave (both → `/`), Commands. Slow loader never misses countdown because timer waits for ready.

Solo `/play` (no room): countdown starts only after deploy loader clears; same pause and auto-lock behavior.

## Out of scope (this US)

- Canvas-relative mouse look without pointer lock
- Pause during countdown or deploying overlays
- Leave → waiting room (always `/`)
- Host **DELETE** room from pause (round-end **Home** keeps that behavior)
- Ready timeout / force-start (defer unless needed in playtesting)
- Mixer-ready gate beyond asset load (optional follow-up)
- Mobile touch controls
