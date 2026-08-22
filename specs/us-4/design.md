# US-4 — Design

## useShooting hook

- Raycast from camera on mousedown (with cooldown)
- Filter hits by `userData.hitZone`, `userData.entityId`, and **team** (no friendly fire in MVP, or spec as optional)
- Call `applyDamage` via combat service
- Update health store

## Weapons (MVP)

- **Pistol only** — single hitscan weapon at round start
- Future: knife (melee), rifle (primary), loadout registry

## Round service

```typescript
type Team = 'argentina' | 'england';

type RoundState = 'waiting' | 'in_progress' | 'ended';

// round-store or game-session
startRound() → assign teams, spawn, full HP, equip pistol
checkRoundEnd() → if all argentina dead OR all england dead → endRound()
endRound(winner) → show banner, delay, startRound()
```

## Local PvP stub

Dummy soldier on **opposing team** at fixed position for shooting tests until US-5.

## Elimination

When `isEliminated`, disable FpsPlayer controls until `roundState === 'in_progress'` and player is respawned on next round.

**No 3-second respawn timer** — contradicts game rules.

## Vitest

Test `resolveHitDamage` helper and `checkRoundEnd` (pure logic).
