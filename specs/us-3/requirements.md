# US-3 — Health & zone damage

## Requirements

| ID     | Requirement                                                                                                                  |
| ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| US-3.1 | Each soldier starts at 100 HP (configurable max) **at round start**                                                          |
| US-3.2 | Hit damage depends on **weapon** + **hit zone** (fraction of max HP). MVP weapon: **pistol** (head 50%, body 20%, limbs 15%) |
| US-3.3 | Difficulty presets: Easy ×0.75, Normal ×1.0, Hard ×1.25 incoming damage                                                      |
| US-3.4 | HUD health bar shows current HP % (drops by different amounts when hit by different weapons / zones)                         |
| US-3.5 | At 0 HP soldier is **eliminated for the current round** — no mid-round respawn                                               |
| US-3.6 | `applyDamage` is pure service (no Three.js); inputs include zone, difficulty, and weapon zone fractions                      |
| US-3.7 | HP resets to full only on **round end** (see US-4 round service)                                                             |
| US-3.8 | Damage profiles live on the **weapon registry** (`damageByZone`); combat applies them — knife/rifle profiles can land later  |

## Acceptance

Given a weapon + **body hit zone** + difficulty, HP decreases correctly (head hurts more than limbs); the health bar reflects the new %; eliminated player cannot respawn until the round ends. Swapping in a future knife profile changes injury amount without rewriting combat math.
