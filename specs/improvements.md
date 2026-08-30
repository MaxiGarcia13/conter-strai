# Improvements backlog

**Open:** §6 (staged arena deploy). **Shipped:** §1–§5 (closed 2026-08-28 with US-5 polish). New feel items go here as unchecked entries; for hygiene / dead code see [tech-debt.md](./tech-debt.md).

---

## 6. Staged arena deploy + deferred gameplay chrome

**Symptom:** The play scene mounts the full arena (floor, houses, props) in one Suspense commit once all scenario textures finish loading. Sky renders immediately and the character layer is already deferred via `DeferredAfterLoad`, but everything between those two extremes appears at once. `PlayerControls` mounts before the arena is visible, so input is live during deploy.

**Scope:** Play boot (`game-canvas-island`, `game-canvas`), scenario rendering (`scenario-scene`, texture library), deploy loader (`play-loader`, `loading-reporter`), gameplay chrome (`player-controls`, `game-pause-panel`, optional HUD bundle).

**Current mount order** (`src/modules/game/components/game-canvas.tsx`):

1. Immediate — `ScenarioLighting`, `ScenarioSky`, `PlayerControls`
2. Suspense — `ScenarioScene` (floor + walls + all props; blocked by `useScenarioTextureLibrary` loading every texture id at once)
3. `DeferredAfterLoad` — `LocalPlayer`, NPCs / remotes (after drei `useProgress` clears)

Props and soldier GLBs are preloaded at module init (`prop-registry.ts`, `soldier-skin-registry.ts`) so they do not block Suspense but pop in when `ScenarioScene` mounts.

**Target mount priority:**

| Phase | Layer                | Notes                                                     |
| ----- | -------------------- | --------------------------------------------------------- |
| 0     | Sky + lighting       | Already immediate                                         |
| 1     | Ground               | Base floor + street `floorZones` (`arena01GroundFloors`)  |
| 2     | Houses               | Wall segments + house `floorZones` (`arena01HouseFloors`) |
| 3     | Decorations          | `scenario.props` (greenery, infrastructure)               |
| 4     | Character + gameplay | `LocalPlayer`, controls, shooting, pause UI, HUD          |

**Tasks:**

- [x] **Split scenario textures by phase** — Replace single `getScenarioTextureIds(scenario)` / `useScenarioTextureLibrary` call with phase-scoped helpers (`getScenarioPhaseTextureIds`, `useScenarioPhaseTextureLibrary`, phases `ground` / `houses`). Each phase gets its own `useLoader` subset so Suspense can resolve independently. Arena-01 data is already authored in separate files (`ground.ts`, `houses.ts`, `greenery.ts`, `infrastructure.ts`); `floorZones` is now split at compose time (`groundFloorZones` / `houseFloorZones`) instead of merging early.
- [x] **Staged `ScenarioScene`** — Split `scenario-scene.tsx` into phased sub-scenes (`ScenarioGround` / `ScenarioHouses` / `ScenarioProps`) each in its own Suspense boundary inside `game-canvas.tsx`. Props keep preload for cache warmth but mount only in the decorations phase.
- [ ] **Defer `PlayerControls` with character layer** — Move `PlayerControls` into `DeferredAfterLoad` alongside `LocalPlayer`. Spawn reset and pointer-lock should activate when the soldier appears, not while the arena is still building.
- [ ] **Bundle gameplay chrome with character phase** — Group `ShootingController` and gameplay HUD (`CrosshairHud`, `CameraHud`, `HealthBar`) into the same deferred bucket; they are unused until the player can act.
- [ ] **Lazy-load deploy loader UI** — Code-split React `PlayLoader` in `game-canvas-island.tsx`. Keep Astro boot loader (`play-loader.astro` / `#play-boot`) or a tiny inline fallback until the chunk is ready — boot loader is removed on island mount today, so naive lazy import would flash empty.
- [ ] **Lazy-load `GamePausePanel`** — `React.lazy` + Suspense; mount after character layer is ready (not only on first Esc), so `togglePause` in `usePlayerKeyboard` always has a dialog to render. Pause input stays in deferred `PlayerControls`.
- [ ] **Loader labels (optional)** — Phase-aware deploy copy on `LoadingReporter` / `PlayLoader` (e.g. “Laying ground…”, “Building houses…”, “Placing props…”) via a small `useArenaLoadPhase` state machine if the single “Deploying” bar feels too coarse.
- [ ] **E2E + boot tests** — Confirm `boot.spec.ts`, deploy-hold helpers (`holdDeployComplete`), and `pause-menu.spec.ts` still pass; update selectors only if loader handoff timing changes.

**Acceptance:**

1. Entering `/play`, sky and lighting appear first; ground textures render before house walls; props appear after houses; local soldier and controls appear last.
2. No WASD / pointer-lock / crosshair during arena deploy; input becomes active when the character layer mounts.
3. Deploy overlay stays visible through arena phases with no blank flash between Astro boot and React loader.
4. Esc opens the pause panel during live play after deploy completes.
5. No regression in `npm run test:e2e` play boot / pause specs.

**Out of scope:** Changing collision data timing (movement already uses scenario segments, not meshes); schema or multiplayer protocol changes; splitting prop preload across network priorities.

**Spec touch:** Note staged deploy order in `specs/current/design.md` (play canvas lifecycle) when implemented.

---

[x] ## 1. Dark clothing / lighting

**Symptom:** Skins with black or very dark clothing look crushed and unreadably black in the arena and in the lobby character preview.

**Scope:** Arena play (`game-canvas`), lobby preview (`character-preview`), scenario environment config.

**Likely cause:** Minimal lighting setup — `ambient 0.6` plus a single `directionalLight` (`sunIntensity 1.2`), with no fill light, hemisphere light, image-based lighting (IBL), or tone mapping. Dark PBR albedo on soldier meshes reads as flat black under these conditions. Same values are duplicated in:

- `src/modules/scenarios/maps/arena-01/index.ts`
- `src/modules/game/components/game-canvas.tsx`
- `src/modules/lobby/components/character-preview.tsx`

**Suggested direction:**

- Raise ambient or add a hemisphere / fill light so dark fabrics retain detail.
- Consider `@react-three/drei` `Environment` (IBL) for lobby preview and in-match character rendering.
- Optional: enable `renderer.toneMapping` on Canvas for better PBR response.
- Centralize lighting presets via `ArenaEnvironment` (`src/modules/scenarios/types.ts`) so preview and arena stay consistent.

**Acceptance:** Dark-cloth soldier skins show visible fabric detail and shading in the lobby character preview and in-match at first-person, over-the-shoulder, and third-person camera modes.

**Spec touch:** None required unless lighting becomes scenario-authorable beyond ambient/sun intensity.

---

[x] ## 2. Kneel (and jump) while walking — local controls

**Symptom:** Player cannot kneel while already walking. Jump while walking may feel broken (verify in-game).

**Scope:** Local FPS controls, animation mixer, player pose state.

**Likely cause:**

- **Kneel:** `toggleKneel` in `src/modules/game/utils/player-pose-actions.ts` requires `!movePressed` — kneel only works from idle. Animation support for kneel + walk already exists (`crouchWalking` clip via `src/modules/soldiers/utils/resolve-animation-clip-key.ts`).
- **Jump:** `requestJump` only requires `pose === null`, so jump while walking should work locally; confirm with a repro before changing code.

**Suggested direction:**

- Remove the `!movePressed` guard in `toggleKneel`; allow `setPlayerPose('kneel')` while locomotion is `walk` or `run` (mixer already resolves `crouchWalking` / run-over-kneel per FR-15).
- Verify jump-from-walk in solo play; fix only if a repro exists.

**Acceptance:** Pressing **E** while walking transitions into crouch-walk (or stand-run if sprinting). **F** jump works from walk when no blocking pose is active.

**Spec touch:** Shipped [FR-15](./current/requirements.md) describes kneel-from-idle then walk-while-kneeling. Entering kneel mid-walk is a **behavior change** — update FR-15 if intentional.

---

[x] ## 3. Remote kneel / jump not visible in multiplayer

**Symptom:** When a remote player kneels or jumps, other clients only see idle / walk / run inferred from position deltas — not the pose animation.

**Scope:** Colyseus sync, remote player rendering, adapter + schema.

**Likely cause:** Network sync sends position only (`x`, `z`, `rotY` via `src/modules/multiplayer/hooks/use-local-transform-sync.ts`). `PlayerStateSchema` (`src/modules/multiplayer/schema/player-state.ts`) has no `pose` field. `RemotePlayer` (`src/modules/multiplayer/components/remote-player.tsx`) uses `resolveNpcPose` (`src/modules/soldiers/utils/resolve-soldier-pose.ts`), which returns only `dying` or `hitReaction` — never `kneel` or `jump`.

**Suggested direction:**

Add pose to the sync path (pick one at implementation time):

- **A (minimal):** Ephemeral client message `pose` (`jump` | `kneel` | `clear`) relayed/broadcast by the server; cosmetic one-shots need no authority.
- **B (schema):** Add `pose` / `locomotion` fields to `PlayerStateSchema` (heavier, schema migration).

Then:

- Extend `RemotePlayerEntry`, adapter payloads, and pose resolution to drive `useSoldierLocomotion` `getPose`.
- Wire the local player to emit pose changes alongside transform sync.

**Acceptance:** Two clients in a live match see each other's kneel and jump animations within one round-trip of the action.

**Spec touch:** Shipped in [current/design.md](./current/design.md#cosmetic-clip-relay) (ephemeral pose relay).

---

[x] ## 4. Spatial combat SFX for remote players

**Symptom:** Gunshots and injury sounds from remote players are not heard (or not distance-attenuated) by peers.

**Scope:** Multiplayer audio, shot handling, health sync.

**Likely cause:**

- **Gunshots:** Only the shooter hears their shot (`src/modules/game/hooks/use-shooting.ts` plays at camera). The server applies damage via the `shot` message but does not broadcast a fire event to other clients.
- **Ouch:** `useSpatialCombatSounds` (`src/modules/game/hooks/use-spatial-combat-sounds.ts`) subscribes to `useHealthStore`, but in multiplayer only the local player's HP is mirrored there (`src/modules/multiplayer/services/bind-match.ts`). Remote HP lives in `multiplayerStore` only, so peer injury SFX never fires. Spatial infra already exists (`src/modules/game/utils/play-game-sound.ts`, 40 m falloff via `COMBAT_SOUND_MAX_DISTANCE`).

**Suggested direction:**

- **Gunshot:** Broadcast a lightweight `fire` event (shooter `sessionId` + optional position) when the server validates a shot or when the client sends one; peers call `playEntityGameSound('pistol', shooterId, ...)`.
- **Ouch:** On `applyPlayersUpdate`, detect remote HP drops (same logic as `src/modules/multiplayer/services/resolve-server-health-effects.ts`) and play spatial ouch at the victim's world position — extend `useSpatialCombatSounds` or hook in `bind-match`.
- Reuse existing `COMBAT_SOUND_MAX_DISTANCE` and `GAME_SOUND_GAIN` constants.

**Acceptance:** Standing near a remote player, gunshots and injury grunts are audible and quieter when far away (~40 m falloff). Local player's own gunshot remains full volume at the camera.

**Spec touch:** Shipped in [current/design.md](./current/design.md#client-adapter) (`sendFire` relay) and FR-41.

---

[x] ## 5. New shared animations (reload, jump-idle, backward locomotion) + multiplayer sync

**Symptom:** New clips in [`base-animations.glb`](../public/assets/characters/shared/base-animations.glb) are not wired locally; remote peers still miss reload variants, `jump-idle`, and backward walk/run gaits (§3 pose relay only covers `jump` / `kneel` / `clear`).

**Scope:** Soldier registry + mixer, local locomotion, pose actions, ephemeral `pose` relay (extends §3), remote locomotion inference.

**GLB contract:**

| Registry key     | GLB clip          | Notes                                |
| ---------------- | ----------------- | ------------------------------------ |
| `reloading`      | `reloading`       | local only today                     |
| `reloadingKneel` | `reloading-kneel` | synced as `kneel` today (wrong clip) |
| `jumpIdle`       | `jump-idle`       | new                                  |
| `jump`           | `jump`            | keep for walk/run jumps              |
| `walkBackward`   | `walk-backward`   | new                                  |
| `runBackward`    | `run-backward`    | new                                  |

**Tasks:**

- [x] **Registry + clips** — Add `jumpIdle`, `walkBackward`, `runBackward` to `SoldierAnimationClips`, `SHARED_CLIP_MAP`, `resolve-soldier-clips`, mixer actions (`soldier-actions.ts`), and asset tests (`soldier-assets.test.ts`, clip resolver tests). Strip hips root motion on backward locomotion clips.
- [x] **Local backward locomotion** — Extend `LocomotionState` with `walkBackward` / `runBackward`; detect dominant backpedal (`forward < 0` and `|forward| >= |strafe|`) in `advancePlayerTransform`; slower speeds via named constants in `player.ts` (~70% walk, ~60% run). Kneel + S keeps `crouchWalking` / run-over-kneel (no crouch-backward clip).
- [x] **Jump-idle selection** — `jump-idle` when **F** from idle or kneel; `jump` when walking/running. Fix `requestJump()` so kneel → jump sets `jumpIdle` same keypress. `onJumpFinished` clears both `jump` and `jumpIdle`.
- [x] **Pose relay (multiplayer)** — Extend `RemotePoseMessage` with `jumpIdle`, `reloading`, `reloadingKneel`; update `toSyncPose()`, `RemotePlayerEntry.pose`, `remote-player.tsx` finish callbacks (`onReloadingFinished`, jump clear). No schema migration — keep ephemeral `pose` relay.
- [x] **Remote backward inference** — Pass `rotY` into `updateRemoteMotion`; when velocity is mostly opposite facing (`|angleDiff| > 135°`), emit `walkBackward` / `runBackward`. Unit tests in `resolve-remote-locomotion.test.ts`.
- [x] **Spec** — Note pose relay values + backward inference in `specs/current/design.md`; optional FR line for backward locomotion.

**Acceptance (two clients):**

1. Stand reload (**R**) → peer sees `reloading` clip.
2. Kneel reload → peer sees `reloading-kneel`, returns to kneel on finish.
3. **F** from idle/kneel → peer sees `jump-idle`; **F** while walking → peer sees `jump`.
4. **S** / **S+Shift** → local backward clips + slower speed; peer sees `walk-backward` / `run-backward` when backpedaling.
5. WASD during reload → peer pose clears / returns to kneel.

**Out of scope:** `shooting` pose sync (deferred on LMB); crouch-walk-backward clip; schema-authoritative `pose` field.

**Spec touch:** Shipped FR-39–FR-40 and [current/design.md](./current/design.md#cosmetic-clip-relay).
