# US-2 — 3D scenario + FPS movement

## Requirements

| ID      | Requirement                                                                                                                  |
| ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| US-2.1  | `/play` loads R3F canvas via dynamic import                                                                                  |
| US-2.2  | Scenario `arena-01` (**Ruined Village**): **100×50 m** rectangular arena, outer walls only (abandoned village theme)         |
| US-2.3  | Floor/wall materials from texture GLBs via texture registry (`forrest_ground`, `coral_fort_wall`)                            |
| US-2.4  | Soldier `swat-guy` loaded at spawn point                                                                                     |
| US-2.5  | WASD movement + mouse look; pointer lock on click                                                                            |
| US-2.6  | Wall collision prevents walking through outer bounds                                                                         |
| US-2.7  | Minimal HUD crosshair                                                                                                        |
| US-2.8  | Scenario, texture, prop, and soldier registries are data-driven; new maps/props = config, not new scene components           |
| US-2.9  | Scenario defines **team spawn points** — Puma (west) vs Lion (east); spawns face map center                                  |
| US-2.10 | Scenario config supports optional `props[]` placements (trees/objects later) without changing `ScenarioScene` rendering path |
| US-2.11 | World units: **1 unit = 1 meter**; floor textures use repeat/tiling appropriate for map size                                 |
| US-2.12 | Three camera modes cycle with **F**: first-person, over-the-shoulder, standard third-person; HUD shows active mode             |
| US-2.13 | Local soldier plays **idle** / **walk** / **run** from GLB clips matching stand / WASD / WASD+Space                           |
| US-2.14 | Interior ruin walls block movement; player passes only through configured wall **holes** (holes wide enough to walk through) |
| US-2.15 | Unit tests validate `swat-soldier.glb` animation contract and clip resolution (`idle` / `walk` / `run`; hips strip)          |
| US-2.16 | E2E smoke test on `/play` confirms canvas loads and soldier scene initializes without animation binding errors               |

## Acceptance

Start Game → Ruined Village loads (100×50 m, forest ground + ruin walls), player moves and looks around, cannot walk through outer **or interior** solid walls (only through holes). **F** cycles FPS → over-the-shoulder → third-person; locomotion clips match movement. Spawns are team-aware for round start (US-4). Adding a future arena or tree is a registry/config change.

`npm run test:unit` and `npm run test:e2e` cover soldier GLB contract, clip utilities, and `/play` load smoke (see tasks).
