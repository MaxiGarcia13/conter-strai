# US-4 — Design

Builds on combat health + weapon type contracts from the architecture type split.

## useShooting hook

- Raycast from camera on mousedown (cooldown from `PistolWeaponConfig.fireCooldownSeconds`)
- Filter hits by `userData.hitZone`, `userData.entityId`, and **team** (no friendly fire in MVP)
- Build `DamageData` → health store / `applyDamage`
- Update health store

## Weapon pose animations

- **LMB** (pointer-locked) → one-shot `shooting` clip on the local soldier mixer
- **R** → one-shot `reloading` clip (blocks other actions until finished)
- Clip names live on `SoldierSkin.meshData.animations`; priority above kneel/locomotion (see US-2)
- Hitscan / ammo gating may attach later without changing the clip contract

## Weapons (MVP)

- **Pistol only** — `weapons/weapon-registry.ts` with `damageByZone` (see US-3); combat applies profile × difficulty
- **Hand mesh:** load `pistol_a.glb` from registry `modelUrl`; parent under the soldier **RightHand** bone at runtime (local + NPCs). Grip offset is a small constant on the weapon config or attach helper — do not merge into `swat-soldier.glb`.
- Hits pass `weaponId` on `DamageData` so the health bar drops by that weapon’s injury amounts
- Future: knife (melee), rifle (primary), richer `Loadout` — each gets its own `damageByZone`

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
