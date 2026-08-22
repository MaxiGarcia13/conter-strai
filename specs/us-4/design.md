# US-4 — Design

## useShooting hook

- Raycast from camera on mousedown (with cooldown)
- Filter hits by `userData.hitZone`, `userData.entityId`, and **team** (no friendly fire in MVP)
- Call `applyDamage` via combat service
- Update health store

## Weapons (MVP)

- **Pistol only** — single hitscan weapon at round start
- Future: knife (melee), rifle (primary), loadout registry

## Round service

```
type Team = 'argentina' | 'england';

startRound() → assign teams, spawn, full HP, equip pistol
checkRoundEnd() → if all argentina eliminated OR all england eliminated → endRound()
endRound(winner) → show banner, delay, startRound()
```

## Local PvP stub

Dummy soldier on **opposing team** at fixed position for shooting tests until US-5.

## Elimination

When `isEliminated`, disable FpsPlayer controls until next `startRound()`.

## Vitest

Test `resolveHitDamage` and `checkRoundEnd` (pure logic).
