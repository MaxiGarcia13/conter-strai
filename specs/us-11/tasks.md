# US-11 — Tasks

**US-10** is shipped. Tick only when the matching requirement passes.

See [`design.md`](./design.md) and [`requirements.md`](./requirements.md).

## Assets (US-11.1)

- [x] Run `npm run assets:compress` for `jacaranda.glb` (strip extra LODs + simplify + WebP)
- [x] Extend `scripts/compress-assets.mjs` with a jacaranda LOD-strip + simplify pipeline
- [x] Delete `public/assets/greenery/celandine.glb` (not used in v1)
- [ ] Verify jacaranda file size and in-game scale (`~0.35–0.45`) + `collisionRadius` via DEV free-cam

## Props registry and placement (US-11.2)

- [x] Add `collisionRadius` to `PropDefinition` in `src/modules/props/types.ts`
- [x] Register `jacaranda` in `src/modules/props/prop-registry.ts`
- [x] Add `src/modules/scenarios/maps/arena-01/greenery.ts` — collidable jacaranda only (6–10 inside bounds)
- [ ] Optional: `src/modules/scenarios/pieces/greenery-helpers.ts` (`scatter-in-rect`, `perimeterVistaProps`)

## Prop movement collision (US-11.3)

- [x] Add `src/modules/game/utils/prop-blockers-from-scenario.ts`
- [x] Merge prop blockers in `src/modules/game/hooks/use-player-controls/use-player-controls.ts`
- [x] Unit: `tests/units/game/prop-blockers-from-scenario.test.ts`

## House variants (US-11.4)

- [x] Extend `HouseFootprint` — per-side/house height, `'open'` sides, optional `floorAssetId`, inset interior floor
- [x] Update `wall-segment-helpers.ts` for variable height and open sides
- [x] Add `src/modules/scenarios/pieces/house-presets.ts` (`ruinedCottage`, `cornerRuin`, `fortifiedBlock`, `streetShack`, …)
- [x] Unit: extend `tests/units/scenarios/collision-hole-math.test.ts`

## Modular map layout (US-11.5)

- [ ] Split `maps/arena-01/` into `compose.ts`, `ground.ts`, `houses.ts`, `greenery.ts`, `spawns.ts`, `environment.ts`
- [ ] Thin `index.ts` — exports `ScenarioConfig` only
- [ ] Remove or replace monolithic `layout.ts`

## Floor overlap fix (US-11.6)

- [ ] Add `src/modules/scenarios/pieces/floor-zone-helpers.ts` (`findFloorOverlaps`, `assertNoFloorOverlaps`)
- [ ] Refactor `ground.ts` — non-overlapping street segments at junctions
- [ ] Inset house floor zones in `house-helpers.ts` / presets
- [ ] Call `assertNoFloorOverlaps` from `compose.ts` (dev) or test only
- [ ] Unit: `tests/units/scenarios/floor-zone-overlap.test.ts` — zero overlaps for arena-01

## Sky and fog (US-11.7)

- [ ] Extend `ArenaEnvironment` in `src/modules/scenarios/types.ts` (`sky`, `fog`)
- [ ] Add `src/modules/scenarios/components/scenario-sky.tsx` (drei `<Sky>` + scene fog)
- [ ] Mount in `src/modules/game/components/game-canvas.tsx`
- [ ] Configure sky + fog in `maps/arena-01/environment.ts`

## Open foggy perimeter (US-11.8)

- [ ] Extend `ArenaLayout` with `perimeter` in `src/modules/scenarios/types.ts`
- [ ] `ScenarioWalls` — skip `outerWalls()` when `perimeter.mode === 'open'`
- [ ] `ScenarioFloor` — extended vista skirt (`vistaExtension`, default ~30 m)
- [ ] Skirt greenery in `greenery.ts` (non-collidable outside bounds)
- [ ] Set `perimeter: { mode: 'open', vistaExtension: 30 }` on arena-01

## Layout pass (US-11.9)

- [ ] Reposition houses via presets — align to street grid, doorways face streets
- [ ] Fix duplicate spawn coordinates in `spawns.ts`; clear jacaranda from spawn lanes
- [ ] Tune fog `near` / `far` at playable edge
- [ ] Manual free-cam verification (junctions, doorways, perimeter, trees, FPS)

## Verification

- [ ] `npm run test:unit`
- [ ] `npm run dev` — acceptance checklist in [`requirements.md`](./requirements.md)

## Spec (on ship)

- [ ] Extend FR / arena section in `specs/current/requirements.md`
- [ ] Update `specs/current/design.md` § arena-01
- [ ] CHANGELOG row; delete `specs/us-11/`

## Do not

- Add custom ruin GLB buildings (procedural only)
- Add a second scenario id
- Derive prop colliders from mesh bounds (fixed radius discs only)
- Block shipping on `InstancedMesh` / HDR sky / preview screenshot
