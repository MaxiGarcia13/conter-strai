# US-7 — Match select (team / character / arena)

## Requirements

| ID     | Requirement                                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| US-7.1 | Landing **Start Game** navigates to `/select` (not straight to `/play`)                                                                    |
| US-7.2 | `/select` lets the player choose **team** (Civilian \| Soldier)                                                                            |
| US-7.3 | `/select` lists characters for the chosen team (`remy` / `james` / `liza` civilian; `swat-1` / `swat-2` / `swat-3` soldier) and shows a **3D preview** of the selected skin |
| US-7.4 | `/select` lists arenas from the scenario registry with name + optional preview image (placeholder if none)                                 |
| US-7.5 | **Play** navigates to `/play?team=&skin=&scenario=` with the chosen session                                                                |
| US-7.6 | `/play` boots that scenario, skin, and team spawn (no hardcoded soldier-only spawn)                                                        |
| US-7.7 | `arena-01` has at least one **civilian** spawn so civilian pick is playable                                                                |
| US-7.8 | Scenario config supports optional `previewImageUrl` for arena cards (nullable until art exists)                                            |

## Acceptance

From landing → select → play: chosen team/skin/arena load correctly; character preview animates idle; civilian and soldier picks both spawn in `arena-01`.
