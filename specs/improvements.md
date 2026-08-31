# Improvements backlog

**Open:** none. **Shipped:** §1–§6 (§1–§5 closed 2026-08-28 with US-5 polish; §6 closed 2026-08-31). New feel items go here as unchecked entries; for hygiene / dead code see [tech-debt.md](./tech-debt.md).

---

## 6. Staged arena deploy + deferred gameplay chrome (shipped)

**Symptom:** The play scene mounts the full arena (floor, houses, props) in one Suspense commit once all scenario textures finish loading. Sky renders immediately and the character layer is already deferred via `DeferredAfterLoad`, but everything between those two extremes appears at once. `PlayerControls` mounts before the arena is visible, so input is live during deploy.

**Scope:** Play boot (`game-canvas-wrapper`, `game-canvas`), scenario rendering (`scenario-scene`, texture library), deploy loader (`play-loader.astro`, `game-canvas-loader`), gameplay chrome (`player-controls`, `game-pause-panel`, optional HUD bundle).

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
- [x] **Defer `PlayerControls` with character layer** — Move `PlayerControls` into `DeferredAfterLoad` alongside `LocalPlayer`. Spawn reset and pointer-lock should activate when the soldier appears, not while the arena is still building.
- [x] **Bundle gameplay chrome with character phase** — Group `ShootingController` and gameplay HUD (`CrosshairHud`, `CameraHud`, `HealthBar`) into the same deferred bucket; they are unused until the player can act.
- [x] **Lazy-load deploy loader UI** — Code-split React `PlayLoader` in `game-canvas-wrapper.tsx` (`GameCanvasLoader`). Keep Astro boot loader (`play-loader.astro` / `#play-boot`) or a tiny inline fallback until the chunk is ready — boot loader is removed on island mount today, so naive lazy import would flash empty.
- [x] **Lazy-load `GamePausePanel`** — `React.lazy` + Suspense; mount after character layer is ready (not only on first Esc), so `togglePause` in `usePlayerKeyboard` always has a dialog to render. Pause input stays in deferred `PlayerControls`.

**Acceptance:**

1. Entering `/play`, sky and lighting appear first; ground textures render before house walls; props appear after houses; local soldier and controls appear last.
2. No WASD / pointer-lock / crosshair during arena deploy; input becomes active when the character layer mounts.
3. Deploy overlay stays visible through arena phases with no blank flash between Astro boot and React loader.
4. Esc opens the pause panel during live play after deploy completes.
5. No regression in `npm run test:e2e` play boot / pause specs.

**Out of scope:** Changing collision data timing (movement already uses scenario segments, not meshes); schema or multiplayer protocol changes; splitting prop preload across network priorities.

**Spec touch:** Staged deploy order documented in [current/design.md](./current/design.md#staged-arena-deploy) (play canvas lifecycle).

---
