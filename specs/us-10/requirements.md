# US-10 — Shuffle teams when there are no opponents

Depends on **US-5** (shipped), **US-7** (shipped).

## Requirements

| ID      | Requirement                                                                                                                                                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-10.1 | On host `startRound` while `waiting` or `ended`, if ≥ 2 connected players and **one team has zero players**, server randomly shuffles players across Civilians / Soldiers (as even as possible, max 4 per team) before spawn and countdown. |
| US-10.2 | If at least one player is already on the opposing team, teams are **unchanged** (no rebalancing of uneven lobbies, e.g. 5v2).                                                                                                               |
| US-10.3 | Solo (`playerCount < 2`): skip shuffle — no opponent to create.                                                                                                                                                                             |
| US-10.4 | Shuffled players keep their skin when valid for the new team; otherwise assign the first skin for that team (`TEAM_SKINS[team][0]`).                                                                                                        |
| US-10.5 | After shuffle, recalculate per-team spawn slot indices so moved players respawn on the correct team spawns.                                                                                                                                 |
| US-10.6 | Client syncs authoritative `team` / `skin` from server player state into `sessionStorage` when they differ (so `/play` local player matches server after shuffle).                                                                          |
| US-10.7 | Subsequent `startRound` (rematch) skips shuffle when both teams already have players.                                                                                                                                                       |

## Acceptance

Two browsers: both join the same team in the waiting room → host **Start Match** → players land on `/play` with roughly even teams (e.g. 2v2 for four players) → can shoot each other → round wipe works.

Mixed lobby (e.g. 3 Civilians + 1 Soldier): **Start Match** leaves teams as chosen.

## Out of scope (this US)

- Rebalancing uneven but mixed lobbies (e.g. 5v2)
- Team-change UI in the waiting room
- Blocking solo **Start Match**
- Toast / banner notifying players they were moved
