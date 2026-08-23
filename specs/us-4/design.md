# US-4 — Design

Builds on combat health + weapon type contracts from the architecture type split.

## useShooting hook

- Raycast from camera on mousedown (cooldown from `PistolWeaponConfig.fireCooldownSeconds`)
- Filter hits by `userData.hitZone`, `userData.entityId`, and **team** (no friendly fire in MVP)
- Build `DamageData` → health store / `applyDamage`
- Update health store

## Weapons (MVP)

- **Pistol only** — `weapons/weapon-registry.ts`; damage percentages stay in combat
- Future: knife (melee), rifle (primary), richer `Loadout`

## Round service

```
type Team = 'puma' | 'lion';
type RoundPhase = 'live' | 'round-end'; // game/types.ts

startRound() → assign teams, spawn from ScenarioConfig.teamSpawns, resetAll HP, equip pistol
checkRoundEnd() → if all puma eliminated OR all lion eliminated → endRound()
endRound(winner) → RoundPhase 'round-end', banner, delay, startRound()
```

## Local PvP stub

Dummy soldier on **opposing team** at fixed position for shooting tests until US-5.

## Elimination

When `HealthState.isEliminated`, disable FPS controls until next `startRound()`.

## Vitest

Test pure damage/hit resolution and `checkRoundEnd`.
