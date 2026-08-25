# US-6 — Shared character animations + crouch-walk

## Requirements

| ID     | Requirement                                                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| US-6.1 | Character locomotion / action clips load from shared pack [`base-animations.glb`](../../public/assets/characters/shared/base-animations.glb)                       |
| US-6.2 | Mesh skins [`remy.glb`](../../public/assets/characters/civilians/remy.glb) and [`swat-1.glb`](../../public/assets/characters/soldiers/swat-1.glb) play those clips |
| US-6.3 | Registry skins: `remy` (civilian) and `swat-1` (soldier); default play skin is `swat-1`                                                                            |
| US-6.4 | Remove legacy [`swat-soldier.glb`](../../public/assets/soldiers/swat-soldier.glb) and `swat-guy` skin (no dual animation pipeline)                                 |
| US-6.5 | Clip map includes `crouch-walking`; `reloading` / `shooting` optional until present on the shared pack (US-4)                                                      |
| US-6.6 | **E** toggles kneel; while kneeling, WASD keeps kneel stance and plays **crouch-walking** (do not stand up)                                                        |
| US-6.7 | While kneeling, movement is walk-speed only (ignore Space run); stationary kneel uses clamped `kneel` clip                                                         |
| US-6.8 | **F** jump clears kneel then plays jump                                                                                                                            |
| US-6.9 | Mixer / hips strip applies to `idle` / `walk` / `run` / `crouch-walking` so locomotion stays in place                                                              |

## Acceptance

Local player on `swat-1` and `remy` plays idle / walk / run / jump / kneel from the shared pack with no `PropertyBinding` errors. Kneeling + WASD plays crouch-walk and stays crouched. Legacy `swat-soldier.glb` / `swat-guy` are gone.
