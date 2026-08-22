# US-2 — 3D scenario + FPS movement

## Requirements

| ID      | Requirement                                                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| US-2.1  | `/play` loads R3F canvas via dynamic import                                                                                                 |
| US-2.2  | Scenario `arena-01` (**Ruined Village**): **100×50 m** rectangular arena, outer walls only (abandoned village theme)                        |
| US-2.3  | Floor/wall materials from texture GLBs via texture registry (`forrest_ground`, `coral_fort_wall`)                                           |
| US-2.4  | Soldier `swat-guy` loaded at spawn point                                                                                                    |
| US-2.5  | WASD movement + mouse look; pointer lock on click                                                                                           |
| US-2.6  | Wall collision prevents walking through outer bounds                                                                                        |
| US-2.7  | Minimal HUD crosshair                                                                                                                       |
| US-2.8  | Scenario, texture, prop, and soldier registries are data-driven; new maps/props = config, not new scene components                          |
| US-2.9  | Scenario defines **team spawn points** — Puma (west) vs Lion (east); spawns face map center                                                 |
| US-2.10 | Scenario config supports optional `props[]` placements (trees/objects later) without changing `ScenarioScene` rendering path                |
| US-2.11 | World units: **1 unit = 1 meter**; floor textures use repeat/tiling appropriate for map size                                                |

## Acceptance

Start Game → Ruined Village loads (100×50 m, forest ground + coral fort walls), player moves and looks around, cannot walk through walls. Spawns are team-aware for round start (US-4). Adding a future arena or tree is a registry/config change.
