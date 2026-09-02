# US-15 — Multiple wall openings + horizontal offset

Delta over [`specs/current/requirements.md`](../current/requirements.md) and [US-14](../us-14/requirements.md). Ships as **US-15** when acceptance passes. Depends on US-14 window types (`WallWindowHole`, `baseY`, sill/lintel segments).

## Summary

Map authors can place **more than one opening on the same house wall**, and slide each opening along the wall with **`along`** (meters from the wall center). Doors stay full-height and passable; windows stay partial-height and block movement (US-14 rules per opening). Existing single `hole` authoring remains valid and **centered**.

## Functional

| ID    | Requirement                                                                                                                                                                                                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-76 | `HouseSide` accepts `holes?: WallHoleSpec[]`. Each spec is `{ kind: 'door', width, along? }` or `{ kind: 'window', width, height, bottom?, along? }`.                                                                                                                                |
| FR-77 | **`along`** is meters from the **wall center** along the wall axis (default **0** = centered). On north/south walls, positive `along` is **+X**; on east/west walls, positive `along` is **+Z**.                                                                                     |
| FR-78 | Existing **`hole`** shorthand still works: a number is a centered door; `{ width, height, bottom? }` is a centered window. If both `hole` and `holes` are set, **`holes` wins**.                                                                                                     |
| FR-79 | Several openings on one side emit solid spans between them. Each **door** is a full-height passable gap; each **window** is pillars + sill + lintel (US-14 layout) at that opening’s `along`.                                                                                        |
| FR-80 | An invalid set falls back to a **solid wall**: any opening past the wall ends (min **0.3 m** remnant at each end), adjacent openings closer than **0.6 m** edge-to-edge, overlapping openings, or a window that fails US-14 height checks (`bottom + height ≥ side height − 0.1 m`). |
| FR-81 | `collisionHole()` emits one metadata entry **per door** (center at the door’s world position, `width` = door width). Windows still produce **no** `CollisionHole`.                                                                                                                   |
| FR-82 | **arena-01** uses `holes` + `along` on at least **one** wall (suggested: `house-right-tall` west — door and window offset from center) so the feature is visible in play.                                                                                                            |

## Non-functional

| ID     | Requirement                                                                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-76 | Unit tests cover: two openings on one side, `along` world position, overlap / out-of-bounds fallback, `hole` shorthand regression. No Playwright. |

## Out of scope (US-15)

- Y-aware collision (player crouch vs window height)
- Window frame / glass props
- Openings that hang off the wall (rejected → solid, not clipped)
- Manual `ScenarioWallSegment` opening authoring outside `buildHouses`

## Acceptance

1. `npm run test:unit` — multi-hole / offset tests pass; existing single-door and single-window tests unchanged.
2. In `/room/.../play` on **arena-01**: a wall shows two openings at different horizontal positions; the door is walkable; the window blocks movement; hitscan passes through the window gap.
