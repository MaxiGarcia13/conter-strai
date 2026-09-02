# US-14 — Wall windows (partial-height openings)

Delta over [`specs/current/requirements.md`](../current/requirements.md). Ships as **US-14** when acceptance passes.

## Summary

Extend house wall authoring so map authors can place **windows** — horizontal openings with configurable **width** and **height** — on ruin walls. Windows **block player movement** (unlike full-height door holes). Existing numeric `hole` values remain **passable doorways**.

## Functional

| ID    | Requirement                                                                                                                                                                                                                                                                   |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-70 | `HouseSide` accepts a **window** opening as `{ hole: { width, height, bottom? } }` on any wall edge of a `HouseFootprint`. `width` and `height` are in meters; `bottom` is sill height above ground (default **1.0 m**).                                                      |
| FR-71 | A **door hole** remains a numeric `hole` (e.g. `2.2`) and produces a **full-height, passable** opening — same behavior as today (`WALL_HOLE_WIDTH`).                                                                                                                          |
| FR-72 | A **window** produces visible wall geometry with a rectangular mesh gap at sill height: left/right pillars (full side height), a **sill** below the gap, and a **lintel** above. Players **cannot walk through** the window column (sill collision segment fills the XZ gap). |
| FR-73 | Hitscan passes through the window mesh gap (no solid mesh in the opening); sill and lintel still block shots at their heights.                                                                                                                                                |
| FR-74 | Invalid windows (width ≥ wall length − 0.6 m, or `bottom + height` ≥ side wall height − 0.1 m) fall back to a **solid wall** — same rejection rule spirit as oversized door holes.                                                                                            |
| FR-75 | **arena-01** places windows on at least **2–3** house footprints so the feature is visible in play without manual map edits.                                                                                                                                                  |

## Non-functional

| ID     | Requirement                                                                                                      |
| ------ | ---------------------------------------------------------------------------------------------------------------- |
| NFR-70 | Unit tests cover window segment layout, door regression, and invalid-window fallback. No Playwright requirement. |

## Out of scope (US-14)

- Y-aware collision (player crouch vs window height)
- Window frame / glass props
- Multiple windows per wall side — [US-15](../us-15/requirements.md)
- Horizontal offset — [US-15](../us-15/requirements.md)
- Manual `ScenarioWallSegment` window authoring outside `buildHouses`

## Acceptance

1. `npm run test:unit` — window math tests pass; existing door / corner tests unchanged.
2. In `/room/.../play` on **arena-01**: visible rectangular openings at sill height on chosen houses; player cannot walk through them; can still walk through existing door holes.
3. Hitscan passes through the window mesh gap; sill/lintel block lower/upper shots.
