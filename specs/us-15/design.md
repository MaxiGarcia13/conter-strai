# US-15 — Multiple wall openings + horizontal offset — Design

Delta over [US-14 design](../us-14/design.md) and [`specs/current/design.md`](../current/design.md) § Interior collision / arena-01 houses.

## Current behavior (US-14)

`HouseSide` has a **single** optional `hole`. Segment helpers always **center** it: leftover length is split evenly into left and right spans. There is no horizontal offset and no second gap on the same side.

```
walls: { west: { hole: 2.2 } }
walls: { north: { hole: { width: 1.5, height: 1.0 } } }
```

## Proposed API

Extend types in [`house-helpers.ts`](../../src/modules/scenarios/pieces/house-helpers.ts):

```typescript
export interface WallDoorSpec {
  kind: "door";
  width: number;
  /** Meters from wall center along the wall axis. Default: 0 */
  along?: number;
}

export interface WallWindowSpec {
  kind: "window";
  width: number;
  height: number;
  /** Sill height above ground (m). Default: 1.0 */
  bottom?: number;
  along?: number;
}

export type WallHoleSpec = WallDoorSpec | WallWindowSpec;

export type HouseSide =
  | "full"
  | "open"
  | {
      hole?: WallOpening; // US-14 shorthand — one centered opening
      holes?: WallHoleSpec[]; // one or more, optional along
      height?: HouseWallHeight;
    };
```

**Example** (authoring target):

```
west: {
  holes: [
    { kind: 'door', width: 2.2, along: -4 },
    { kind: 'window', width: 1.2, height: 1.0, along: 3, bottom: 1.1 },
  ],
}
```

`along` is in **meters from the wall center**, not a 0–1 t-value.

| Wall          | Wall axis | Positive `along` |
| ------------- | --------- | ---------------- |
| north / south | X         | +X               |
| east / west   | Z         | +Z               |

Opening world center:

- along-X wall: `(centerX + along, z)`
- along-Z wall: `(x, centerZ + along)`

### `hole` vs `holes`

| Authoring                              | Normalized specs                           |
| -------------------------------------- | ------------------------------------------ |
| `{ hole: 2.2 }`                        | `[{ kind: 'door', width: 2.2, along: 0 }]` |
| `{ hole: { width, height, bottom? } }` | `[{ kind: 'window', …, along: 0 }]`        |
| `{ holes: [...] }`                     | as written (`along` defaults to `0`)       |
| both `hole` and `holes`                | **`holes` wins**                           |

Keep `WallOpening` / `parseOpening()` for the shorthand path, or fold both into a shared `normalizeOpenings(side) → WallHoleSpec[]`.

## Segment layout

Walk the wall from **−halfLength** to **+halfLength**, sorted by `along`:

```
[ solid ][ door gap or window sill+lintel ][ solid ][ … ][ solid ]
```

| Opening    | At that `along`                                                         | Between openings |
| ---------- | ----------------------------------------------------------------------- | ---------------- |
| **Door**   | No full-height segment (passable)                                       | Solid span       |
| **Window** | Sill (`baseY: 0`, `height: bottom`) + lintel (`baseY: bottom + height`) | Solid span       |

Same window mesh/collision rules as US-14, just not forced to the wall midpoint.

### Validation (whole side → solid wall)

Reuse the US-14 0.6 m / 0.3 m remnant spirit:

1. Sort by `along`.
2. Each opening must sit inside the wall with **≥ 0.3 m** remnant at **each wall end**: `|along| + width/2 ≤ totalLength/2 − 0.3`.
3. Adjacent openings: edge-to-edge gap **≥ 0.6 m** (no overlap, room for a pillar).
4. Each window must still pass US-14 height checks (`bottom + height < sideWallHeight − 0.1`).

If any check fails → one solid segment for the side (same fallback as oversized single holes).

### `collisionHole()`

One `CollisionHole` per **door**, `center` at that door’s world position, `width` = door width. Windows: none.

## arena-01 placement

Use the new API on **`house-right-tall` west** (currently a single centered `hole: HOLE`): door offset toward one end, window toward the other. Keep north as a door (shorthand `hole` is fine). Door hole count in [`scenario-registry.test.ts`](../../tests/units/scenarios/scenario-registry.test.ts) stays the same unless a door is added or removed.

## Files touched

| Area   | Files                                                                                   |
| ------ | --------------------------------------------------------------------------------------- |
| Spec   | `specs/us-15/*`, `specs/current/tasks.md`, `specs/CHANGELOG.md` Open row                |
| Domain | `house-helpers.ts`, `wall-segment-helpers.ts`                                           |
| Map    | `maps/arena-01/houses.ts` (and presets only if a preset should demo two openings)       |
| Tests  | `collision-hole-math.test.ts`, `scenario-registry.test.ts` if door count/centers change |

No render-path change expected: `baseY` and mesh builders already handle per-segment height from US-14.

## Ship checklist

- Fold FR-76–FR-82 into `specs/current/requirements.md`
- Update `specs/current/design.md` § Interior collision / arena-01 houses (`hole` shorthand + `holes` / `along`)
- Add **US-15** row to `specs/CHANGELOG.md`
- Delete `specs/us-15/`
