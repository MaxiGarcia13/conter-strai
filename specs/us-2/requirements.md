# US-2 — 3D scenario + FPS movement

## Requirements

| ID | Requirement |
|----|-------------|
| US-2.1 | `/play` loads R3F canvas via dynamic import |
| US-2.2 | Scenario `arena-01`: rectangular arena with floor + walls |
| US-2.3 | Floor/wall materials from texture GLBs |
| US-2.4 | Soldier `swat-guy` loaded at spawn point |
| US-2.5 | WASD movement + mouse look; pointer lock on click |
| US-2.6 | Wall collision prevents walking through bounds |
| US-2.7 | Minimal HUD crosshair |
| US-2.8 | Scenario and soldier registries are data-driven |

## Acceptance

Start Game → 3D arena loads, player moves and looks around, cannot walk through walls.
