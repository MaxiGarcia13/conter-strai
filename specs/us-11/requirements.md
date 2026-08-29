# US-11 — Arena modularization (Ruined Village polish)

Depends on **US-2** (shipped), **US-7** (shipped).

## Requirements

| ID      | Requirement                                                                                                                                                                                                                                          |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-11.1 | Greenery asset `jacaranda.glb` is registered in the prop registry, texture-compressed, stripped to a single LOD, and geometry-simplified for web delivery (target: loadable in browser without a multi-minute fetch).                                |
| US-11.2 | `arena-01` places **jacaranda** as collidable tree props inside the playable area (initial cap ~6–10 until FPS is acceptable). No ground-cover GLB in v1.                                                                                            |
| US-11.3 | Collidable props block **local player movement** via circle blockers (`prop.collidable` or registry default); bullets already occlude on prop meshes.                                                                                                |
| US-11.4 | Procedural **destroyed-house variants**: per-side or house-level wall height (`full` / `mid` / `low`), optional **open** sides (no render/collision), optional floor material override; named presets for easy map authoring.                        |
| US-11.5 | `arena-01` map authoring is split into composable modules (`ground`, `houses`, `greenery`, `spawns`, `environment`, `compose`) — thin `index.ts` exports `ScenarioConfig`.                                                                           |
| US-11.6 | **Floor zones must not overlap each other** (base `forrest_ground` under zones is allowed). Overlap detection runs in unit tests on composed `arena-01` floors; street/house zones are refactored to eliminate z-fighting.                           |
| US-11.7 | **Visible sky** (drei procedural `<Sky>` or color fallback) and **scene fog** are scenario-authorable via `ArenaEnvironment`; sun direction stays consistent with existing directional light.                                                        |
| US-11.8 | Arena **perimeter** uses `mode: 'open'`: no cliff `outerWalls`; extended forest ground **vista skirt** beyond playable bounds; decorative non-collidable jacaranda in skirt; fog blends vista into sky horizon. Playable bounds remain **100×50 m**. |
| US-11.9 | Layout pass: houses aligned to street grid, doorways face streets, unique team spawn coords, greenery clear of spawn lanes and main street centerlines.                                                                                              |

## Acceptance

1. `/room/{id}/play` on `arena-01`: sky visible when looking up; foggy forest vista at map edges (no cliff walls); no floor shimmer at street junctions or house doorways.
2. Player cannot walk through collidable jacaranda trunks inside bounds.
3. House ruins show visual variety (mixed heights, open sides, plaster vs fort) via presets.
4. `npm run test:unit` passes including floor-overlap and prop-blocker tests.
5. Jacaranda asset size is reasonable after compress/simplify (no 300 MB+ fetch in network tab).

## Out of scope (this US)

- Custom ruin **GLB** buildings (procedural footprints only)
- Second scenario / map registry entry
- Mesh-derived prop colliders (fixed `collisionRadius` discs for v1)
- Infinite procedural terrain
- Ground-cover / flower GLBs (e.g. celandine) — jacaranda only in v1
- `InstancedMesh` for repeated trees (follow-up if FPS needs it)
- HDR sky / distant hill meshes / arena preview screenshot update
- Multiplayer prop sync (props are static scenario data — identical on all clients)
