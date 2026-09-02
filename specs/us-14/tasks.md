# US-14 — Tasks

Tick when done; ship into `specs/current/` when all acceptance criteria in [requirements.md](./requirements.md) pass.

## Spec

- [x] Review [requirements.md](./requirements.md) and [design.md](./design.md) with implementer

## Types + parsing

- [x] Add `WallDoorHole`, `WallWindowHole`, `WallOpening` to [`house-helpers.ts`](../../src/modules/scenarios/pieces/house-helpers.ts)
- [x] Add optional `baseY?: number` to [`ScenarioWallSegment`](../../src/modules/scenarios/types.ts)
- [x] Add `parseOpening()` helper in [`wall-segment-helpers.ts`](../../src/modules/scenarios/pieces/wall-segment-helpers.ts)

## Segment generation

- [x] Implement window branch in `wallSegmentsAlongX` / `wallSegmentsAlongZ` (pillars + sill + lintel)
- [x] Keep door (`number`) path unchanged — two spans, no center segment
- [x] Update `collisionHole()` — emit metadata for doors only

## Rendering

- [x] Thread `baseY` through [`wall-helpers.ts`](../../src/modules/scenarios/pieces/wall-helpers.ts)
- [x] Honor `baseY` in [`wall-mesh-builders.ts`](../../src/modules/scenarios/utils/wall-mesh-builders.ts) box positioning
- [x] Pass `baseY` through [`collision-helpers.ts`](../../src/modules/scenarios/pieces/collision-helpers.ts) (future-proof)

## Tests

- [x] Window produces 4 segments (L, R, sill, lintel) + no `collisionHole` entry
- [x] Door still 2 segments + hole metadata (regression)
- [x] Invalid oversized window → solid wall
- [x] Segment heights and `baseY` values asserted
- [x] Update [`scenario-registry.test.ts`](../../tests/units/scenarios/scenario-registry.test.ts) hole count after arena edits
- [x] Existing [`wall-corners.test.ts`](../../tests/units/scenarios/wall-corners.test.ts) still passes

## Map authoring

- [x] Add windows to 2–3 houses in [`maps/arena-01/houses.ts`](../../src/modules/scenarios/maps/arena-01/houses.ts) and/or [`house-presets.ts`](../../src/modules/scenarios/pieces/house-presets.ts)

## Acceptance

- [ ] `npm run test:unit` green
- [ ] Manual smoke: arena-01 shows windows; doors passable; windows block movement; hitscan through gap

## Ship

- [ ] Fold FR-70–FR-75 into `specs/current/requirements.md`
- [ ] Update `specs/current/design.md` (interior collision + arena-01)
- [ ] Add **US-14** row to `specs/CHANGELOG.md`; clear Open row
- [ ] Delete `specs/us-14/`
