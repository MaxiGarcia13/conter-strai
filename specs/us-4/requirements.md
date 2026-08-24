# US-4 — PvP shooting (local loop)

## Requirements

| ID      | Requirement                                                                                                                                       |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-4.1  | LMB fires hitscan ray from camera center (**pistol** — only weapon in MVP)                                                                        |
| US-4.2  | Fire rate ~2 shots/sec, range 100 m (pistol tuning)                                                                                               |
| US-4.3  | Hit resolves zone → applyDamage → health store                                                                                                    |
| US-4.4  | Local test: dummy or second target on **opposing team**                                                                                           |
| US-4.5  | Eliminated player cannot move/shoot for remainder of round                                                                                        |
| US-4.6  | **No mid-round respawn** — eliminated until round ends                                                                                            |
| US-4.7  | **Round service**: when all players on one team are eliminated, end round, declare winner, reset HP, respawn all at team spawns, start next round |
| US-4.8  | Round start: assign Puma / Lion, spawn at team points, equip pistol                                                                               |
| US-4.9  | While pointer-locked, **LMB** plays the soldier **shooting** clip (hitscan damage may land later)                                                 |
| US-4.10 | **R** plays the soldier **reloading** clip (ammo / magazine gating may land later)                                                                |

## Acceptance

Two teams fight with pistols until one team is eliminated; round resets and repeats. Soldier fire/reload clips play on LMB / R.
