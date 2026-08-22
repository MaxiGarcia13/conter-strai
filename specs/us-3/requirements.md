# US-3 — Health & zone damage

## Requirements

| ID     | Requirement                                                                    |
| ------ | ------------------------------------------------------------------------------ |
| US-3.1 | Each soldier starts at 100 HP (configurable max) **at round start**            |
| US-3.2 | Hit zones: head 50%, limbs 15%, body 20% of max HP per hit                     |
| US-3.3 | Difficulty presets: Easy ×0.75, Normal ×1.0, Hard ×1.25 incoming damage        |
| US-3.4 | HUD health bar shows current HP %                                              |
| US-3.5 | At 0 HP soldier is **eliminated for the current round** — no mid-round respawn |
| US-3.6 | `applyDamage` is pure service (no Three.js)                                    |
| US-3.7 | HP resets to full only on **round end** (see US-4 round service)               |

## Acceptance

Given a hit zone + difficulty, HP decreases correctly; HUD updates; eliminated player cannot respawn until the round ends.
