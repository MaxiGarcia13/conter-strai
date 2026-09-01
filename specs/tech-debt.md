# Tech debt

Tracked cleanup from codebase audits. Not tied to a user story — pick items when touching nearby code or during a dedicated hygiene pass.

## Dead exports

Remove or stop exporting symbols with no callers (grep `src/` before deleting).

- [x] `measureFeetGroundOffset` — `src/modules/soldiers/utils/strip-root-motion.ts`
- [x] `updateSoldierSkeleton` — `src/modules/soldiers/utils/clone-soldier-root.ts`
- [x] `getTeamSpawn` (+ `TeamSpawn` if unused) — `src/modules/scenarios/utils/spawn-helpers.ts`
- [x] `applyUvRepeat` — un-export (only used inside `use-scenario-material.ts`)

Aug 2026 audit (knip + grep — grep `src/` before deleting):

- [x] `isMovePressed` — `src/modules/game/constants/game-bindings.ts` (movement uses `axesFromPressedCodes` instead)
- [x] `VIEWMODEL_OFFSET`, `VIEWMODEL_ROTATION_Y` — `src/modules/game/constants/player.ts` (viewmodel tuning lives on skin registry `viewModelScale`)
- [x] `GameMode` — `src/modules/game/types.ts` (type defined, never referenced)
- [x] `cloneSoldierRoot` — `src/modules/soldiers/utils/clone-soldier-root.ts` (superseded by `useSoldierMesh` + drei `<Clone>`; keep `getSoldierArmature`, `soldierScaleVector`, `disableSkinnedMeshCulling`)
- [x] `DEV_CONTROLS` — un-export from `src/modules/game/dev/use-free-camera-look.ts` if only used in-folder
- [x] `NPC_BODY_RADIUS` — un-export from `src/modules/game/utils/npc-blockers-from-scenario.ts` if module-private
- [x] Scenario utils — un-export if only used in-file: `holeWidth` (`wall-segment-helpers.ts`), `faceCenterYaw` (`spawn-helpers.ts`), `configureTexture` (`texture-library-utils.ts`), `segmentWall` (`wall-mesh-builders.ts`); keep `preloadScenarioTextures()` side effect, drop the export if unused
- [ ] Soldier / weapons tuning — un-export if grep confirms no callers: `CROSSFADE_SECONDS` (`apply-clip-transition.ts`), `WEAPON_ATTACH_SCALE` (`weapon-attach.tsx`), `RIGHT_HAND_BONE_NAMES` (`find-right-hand-bone.ts`), `PISTOL_GRIP_DOWN_AXIS` (`pistol-grip-alignment.ts`)
- [ ] Multiplayer tuning constants — un-export if only used in-file: `REMOTE_*` in `resolve-remote-locomotion.ts`, `REMOTE_FOLLOW_RATE` in `step-remote-render-transform.ts`, `MOVE_MAX_DELTA_METERS` / `MOVE_SPEED_TOLERANCE` in `validate-move.ts`, `TRANSFORM_SYNC_INTERVAL_MS` in colyseus adapter barrel
- [ ] Multiplayer adapter barrel — trim unused re-exports (`onLeave`, `PlayerStateSchema`, listener/payload types in `colyseus-adapter/index.ts` and `schema/index.ts`) or document as intentional public API
- [ ] E2E helpers — un-export `waitForCanvas`, `navigateToPlayWithHandoff`, `waitForCountdownToFinish` from `tests/e2e/test-helpers.ts` if only used in-file

## Package & dependency hygiene

Aug 2026 audit (knip):

- [x] **Remove `@colyseus/react`** — no imports; matchmaking uses `@colyseus/sdk` directly. Drop from `package.json` and re-run build + e2e.

## Scenario piece catalog (unused scaffolding)

Built for future maps; only `floorZone`, `wallAlongX` / `wallAlongZ`, and `buildHouses` are used by `arena-01` (`houses.ts` / `ground.ts`). Either wire into a second map or trim until needed.

- [x] `WALL_PIECES`, `wallBetween`, `placeWallPiece` — `src/modules/scenarios/pieces/wall-helpers.ts`
- [x] `FLOOR_PIECES`, `placeFloorPiece` — `src/modules/scenarios/pieces/floor-helpers.ts`
- [x] `WALL_LENGTH`, `STREET_WIDTH` — `src/modules/scenarios/pieces/constants.ts`
- [x] Unused material aliases: `WALL_MATERIAL.cliff`, `FLOOR_MATERIAL.forest`, `FLOOR_MATERIAL.street` (arena-01 uses texture ids directly)
- [x] Layout-only exports: make `arena01Streets`, `arena01Houses`, `houseFootprint` module-private if still only used in map modules / `house-helpers.ts`
- [ ] **Unused house presets** — `fortifiedBlock`, `streetShack` in `src/modules/scenarios/pieces/house-presets.ts` (never imported; `ruinedCottage`, `cornerRuin`, `bombedHouse` are used in unit tests). Wire into a second map or remove until needed.

## Inactive but wired infrastructure

Keep if the next US needs it; document or implement so it is not misleading dead weight.

- [x] **Props module** — `prop-registry.ts` is `{}`; `arena-01` has `props: []` but `PropInstance` is wired in `ScenarioScene`. Add at least one prop or add a one-line comment in registry that props are deferred.
- [x] **`game/index.ts` barrel** — nothing imports `@/modules/game`; either use the barrel from `play.astro` / islands or delete the re-export file.
- [x] **`scenarios/index.ts` re-exports `./pieces`** — broad public API unused outside map authoring; narrow exports or document as map-authoring surface only.
- [x] **`game/components/index.ts` barrel** — deleted; `play.astro` imports `GameCanvasWrapper` from `@/modules/game/components/game-canvas` directly.

## Complexity hotspots (index)

Largest today: `use-player-movement-frame.ts` / house helpers. Prefer the **Complexity refactors** tasks below when editing these; do not split for vanity line-count.

| File                                                     | Why                                       |
| -------------------------------------------------------- | ----------------------------------------- |
| `house-helpers.ts`                                       | Wall segments with doorway holes          |
| `hooks/use-player-controls/use-player-movement-frame.ts` | Move + collide + bounds + camera          |
| `hooks/use-player-controls/use-player-pointer-lock.ts`   | Click-lock + mouse look (small; leave)    |
| `dev/dev-free-camera.tsx`                                | Ghost fly + look + controls claim         |
| `scenario-walls.tsx`                                     | Outer perimeter + segments + UV tiling    |
| `use-scenario-texture-library.ts`                        | PBR map load + material assembly          |
| `hooks/use-soldier-locomotion/`                          | Slim orchestrator + private mixer/helpers |
| `play-test-hook.tsx`                                     | DEV poll + bone debug surface             |

Watch-only (already modular enough — no refactor task):

- `resolve-player-collision.ts` — `resolveSegment` / circle blockers already extracted
- `pick-bullet-hit.ts` — tag walk helpers already extracted
- `use-player-pointer-lock.ts` — small after hygiene pass

## Complexity refactors

Unchecked how-tos for the hotspots above. `LocalPlayer` / `SoldierModel` size is covered by **Soldier mesh setup duplication** (`useSoldierMesh`).

- [x] **Split `useSoldierLocomotion`** — `src/modules/soldiers/hooks/use-soldier-locomotion/`
  1. Extract pure helpers (`createSoldierActions`, `playDyingHard`, one-shot `finished` wiring, clip transition) as private modules in the hook folder.
  2. `useSoldierMixer` owns mount lifecycle + `activeMixers`; `useSoldierLocomotion` is a thin orchestrator (`useFrame` only).
  3. Preserve `countActiveSoldierMixers` and existing option callbacks for e2e / pose owners.
  4. Do not change the public hook signature; barrel exports only the public API.

- [x] **Split `DevFreeCamera`** — `src/modules/game/dev/dev-free-camera.tsx`
  1. `use-free-camera-toggle.ts` — KeyV toggle listener.
  2. `use-free-camera-look.ts` — claim/release R3F `controls`, pointer lock, mouse look.
  3. `use-free-camera-fly.ts` — `useFrame` fly (WASD via shared axes + Q/E/boost).
  4. `DevFreeCamera` becomes a short composer returning `null`.

- [x] **Extract wall mesh builders from `ScenarioWalls`** — `src/modules/scenarios/components/scenario-walls.tsx`
  1. Move `segmentWall` / `outerWalls` into `scenarios/utils/` (or `pieces/`).
  2. Leave `ScenarioWalls` as the R3F component that maps scenario config → those builders + materials.

- [x] **Extract house wall-segment helpers** — `src/modules/scenarios/pieces/house-helpers.ts`
  1. Move `wallSegmentsAlongX` / `wallSegmentsAlongZ` / hole math into `wall-segment-helpers.ts` (or similar).
  2. Keep `buildHouses` / `HouseFootprint` as the public map-authoring API.

- [x] **Extract texture-library pure utils** — `src/modules/scenarios/hooks/use-scenario-texture-library.ts`
  1. Move `collectMapEntries` + material assembly from loaded maps into pure utils (Vitest without R3F).
  2. Hook stays: `useLoader` + `useMemo` wiring only.

- [x] **Extract pure advance from `usePlayerMovementFrame`** — `src/modules/game/hooks/use-player-controls/use-player-movement-frame.ts`
  1. Pure `advancePlayerTransform({…})` (intended move → wall collision → NPC discs → bounds clamp → locomotion).
  2. Hook keeps elimination / external-controls early-outs and `applyCameraMode`.
  3. Add a small unit test for the pure advance path.

- [x] **Extract DEV play-test helpers** — `src/modules/game/dev/play-test-hook.tsx`
  1. Move `findLocalNode` / quaternion helpers into `dev/play-test-helpers.ts`.
  2. Keep polling + `__playTest` surface in the component.

## Player controls hygiene

Post-split leftovers from `use-player-controls` → folder + `game/utils`. Pick up when touching controls or free-cam.

- [x] **Remove unused `isPointerLocked` plumbing**
  1. Grep `src/` for `isPointerLocked` (expect only the pointer-lock hook + orchestrator).
  2. In `use-player-pointer-lock.ts`: drop `useState`, the `pointerlockchange` listener that only feeds that state, and the return value; make the hook `void`.
  3. Keep eliminated → `exitPointerLock`, click-to-lock, and mouse look.
  4. In `use-player-controls.ts`: stop destructuring / returning `{ isPointerLocked }`.
  5. `player-controls.tsx` already ignores the return — no change there.

- [x] **Stop exporting unused `UsePlayerControlsOptions`**
  1. Grep confirms only `hooks/use-player-controls/index.ts` re-exports it.
  2. Keep the interface in `use-player-controls.ts` for local typing.
  3. Remove `export type { UsePlayerControlsOptions }` from `index.ts`.

- [x] **Share WASD axes in free-cam**
  1. In `dev-free-camera.tsx`, keep a local map only for free-cam extras (`up` / `down` / `boost` / `toggle`).
  2. For horizontal axes, use `axesFromPressedCodes(pressed, MOVE_CODES)` from `game/utils/axes-from-pressed-codes.ts` + `game/constants/game-bindings.ts`.
  3. Leave vertical + boost math as-is.

- [x] **Document or replace the look pitch floor**
  1. `use-player-pointer-lock.ts` gates look with `pitch >= -0.6` (free-cam does not).
  2. Default: add a named constant next to `PITCH_LIMIT` in `constants/player.ts` with a one-line comment (why look-down is limited for FPS).
  3. Only remove the gate (rely on `PITCH_LIMIT` alone) if playtest confirms full look-down is desired.

## Soldier mesh setup duplication

`LocalPlayer` and `SoldierModel` repeat the same GLTF load / armature / scale / culling pipeline; locomotion is already shared via `useSoldierLocomotion`. Do **not** merge the two components — player transform, aim rig, FPS camera, and pose callbacks stay in `game/`.

- [x] **Extract `useSoldierMesh`** — new hook in `src/modules/soldiers/hooks/use-soldier-mesh.ts` consolidating: `getSoldierSkinById`, `useGLTF`, `useSoldierAnimationClips`, `getSoldierArmature`, `soldierScaleVector`, and the `disableSkinnedMeshCulling` mount effect. Returns `{ modelRef, source, scale, skin, animations }`.
- [x] **Extract `SoldierMeshBody`** — presentational Clone + conditional `WeaponAttach` / `HitboxMesh` in `src/modules/soldiers/components/soldier-mesh-body.tsx`. Outer `<group>` (static props vs `rigRef` / root name / `useFrame` transform) stays with each caller.
- [x] **Refactor `SoldierModel`** — consume `useSoldierMesh` + `SoldierMeshBody`; keep NPC-only concerns (static `position` / `rotationY`, health-store pose via `resolveNpcPose`, optional `entityId`).
- [x] **Refactor `LocalPlayer`** — consume `useSoldierMesh` + `SoldierMeshBody`; keep game-only concerns (`useFrame` + `getPlayerTransform`, aim rig, `placeCameraAtHead`, `setBodyAnchorY`, pose clear callbacks).

## Multiplayer lobby REST handler tests

`lobby-security-handlers.test.ts` already covers origin guard, host token DELETE, expiry `410`, and create metadata — reuse its `matchMaker` mock / `stubFoundRoom` helper when extending coverage. Remaining gaps:

- [x] **503 when matchMaker is not ready** — all four handlers
- [x] **`getRoom`** — `400` missing `roomId`; `500` lookup without `state` (404/410 partially covered)
- [x] **`createRoom`** — `400` invalid body
- [x] **`claimSeat`** — `409` wrong phase / team full / reserve throws (origin `403` covered)
- [x] **`disposeRoom`** — `500` if `disconnect` throws (`404`/`401`/`403`/`410`/`204` covered)

## Lobby rejoin after browser back

Join → waiting → browser **back** to `/room/{id}/join` → second **Join Room** can fail (stuck `join.isPending` from bfcache, or ghost WS before `leaveMatch` completes). `useLobbyPresence` + `abandonLobbySync` clears `sessionStorage` on `pagehide` by design. Pick one: softer abandon (reconnect grace only), `pageshow` mutation reset on join page, or redirect stale waiting URLs to join.

- [x] **Reproduce in e2e** — `tests/e2e/join-room.spec.ts`: invite join → waiting → `page.goBack()` → change soldier → **Join Room** again; assert `PUT` 200 and waiting URL
- [x] **Fix join-page bfcache / abandon race** — reset TanStack `join` mutation on `pageshow` when `event.persisted`; await or harden `leaveMatch` in `abandonLobbySync` so ghost `roomCache.clients` does not block the next `PUT`
- [x] **Stale waiting URL** — when `readRoomSession` is null on `/room/{id}`, redirect to `/room/{id}/join` instead of dead-end “No session found”

## Lobby security & multiplayer e2e (US-8 gaps)

`tests/e2e/lobby-security.spec.ts` covers API-only: cross-origin `POST` `403`, `DELETE` `401`/`403`/`204`, `GET` `expiresAt`. `create-room.spec.ts` covers host Close Room UI. Unit tests own shot/move validation and mocked `410`. Remaining Playwright gaps:

- [x] **Cross-origin `PUT` claim seat → `403`** — extend `lobby-security.spec.ts` or new API test file
- [x] **Expired room → `410`** — e2e with short `ROOM_CODE_TTL_MS` in test env (or clock stub); `GET` and `PUT` on expired code; optional `DELETE` with valid token
- [x] **Guest round-end Home** — two-browser or single guest: after round end, guest **Home** leaves without `DELETE` (no `401`); host **Home** still disposes room
- [ ] **Two-browser match smoke** — US-8 acceptance: create + join, start round, friendly-fire does not apply damage (or host-only wipe); optional full round to banner
- [ ] **TTL renew on Restart** — after `startRound`, `GET` snapshot shows `expiresAt` slid forward (~40 min); API or UI assertion

## Game UI & session duplication

Small DRY wins from a codebase audit (Aug 2026). Pick up when touching round-end, pause, or lobby close flows.

- [ ] **Unify offline vs multiplayer phase resolution** — `src/modules/game/hooks/use-effective-round-phase.ts` (or similar)
  1. Grep `connected ? mpPhase : roundPhase` and `roomId ? mpPhase : roundPhase` (expect `countdown-banner`, `game-pause-panel`, `use-player-controls`, `round-end-banner`).
  2. Add `useEffectiveRoundPhase()` returning `{ phase, countdown?, winner? }` with one authoritative rule (prefer `connected` for live play; document why if `roomId` differs for round-end).
  3. Replace duplicated store subscriptions in callers; add a small unit test for the resolution rule if any logic is non-trivial.

- [ ] **Extract host / restart capabilities** — `src/modules/game/hooks/use-room-host-capabilities.ts` (or `lobby/` if reused outside play)
  1. Grep `readRoomSession` + `isHost` + `canRestart` (expect `round-end-banner`, `game-pause-panel`).
  2. Hook returns `{ isHost, canRestart }` from `roomId?: string` (`canRestart = roomId ? isHost : true`).
  3. Callers keep UI-only state (`closing`, pause toggles); no behavior change.

- [ ] **Shared dispose-room helper (404-tolerant)** — `src/modules/multiplayer/services/dispose-room-tolerant.ts` (or extend `delete-room.ts`)
  1. Grep `deleteRoom` + `LobbyRestError` + `status !== 404` (expect `round-end-banner`, `waiting-room-content`).
  2. Export `disposeRoomTolerant(roomId, hostToken?)` — calls `deleteRoom`, swallows `404`, rethrows other `LobbyRestError` / network failures.
  3. Unit test: mock fetch → `204`, `404`, `401` paths.

- [ ] **Consolidate round-end Home navigation** — `src/modules/game/utils/leave-match-to-home.ts` (+ optional sibling)
  1. `round-end-banner` inlines host `deleteRoom` + guest `leaveMatch` + hard nav; pause panel already uses `leaveMatchToHome`.
  2. Add `leaveMatchToHomeAsHost(roomId, hostToken)` (or options on `leaveMatchToHome`) using `disposeRoomTolerant`; keep `closing` / `aria-busy` in the banner.
  3. Preserve comments: hard-nav tears page down; peers may navigate via `roomClosed`; do not await Colyseus reconnect grace on guest path.

- [ ] **Extract game overlay shell** — `src/modules/game/components/game-overlay-panel.tsx` (optional / cosmetic)
  1. Grep `fixed inset-0 z-20 flex items-center justify-center bg-background-deep/50` and inner `border border-surface-border bg-background-deep/90` (expect `round-end-banner`, `game-pause-panel`; `countdown-banner` is similar but `z-50` / larger type).
  2. Presentational wrapper: `role`, `aria-*`, children; callers pass title + actions.
  3. Skip if the three overlays diverge further (countdown vs dialog vs alert semantics).

- [ ] **Split `MatchRoom` message handlers** — `src/modules/multiplayer/rooms/match-room.ts`
  1. Only when adding message types or editing teardown — file is ~300 lines but cohesive today.
  2. Move `onMessage('move'|'shot'|…)`, countdown tick, and expiry scheduling into private modules in the same folder (mirror `use-soldier-locomotion/` layout).
  3. Keep `MatchRoom` as the Colyseus `Room` class wiring handlers + state transitions; no public API change.
