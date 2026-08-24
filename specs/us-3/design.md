# US-3 — Design

Types and pure damage math already land in `src/modules/combat/` (architecture type split). This US wires stores, hitbox meshes, HUD, and **weapon-scoped damage**.

## Types (`combat/types.ts`)

```typescript
type HitZone = 'head' | 'body' | 'limb';
type Difficulty = 'easy' | 'normal' | 'hard';

interface DamageData {
  attackerId: EntityId;
  targetId: EntityId;
  zone: HitZone;
  /** Required for damage resolution — looks up weapon `damageByZone`. */
  weaponId: string;
  team?: Team;
}

interface HealthState {
  currentHp: number;
  maxHp: number;
  isEliminated: boolean;
}
```

Hitbox geometry: `HitboxPreset` / `HitboxPart` + `hitbox-preset-registry` (`humanoid-standard`). Skins only store `hitboxPresetId`.

## Damage formula

```
damage = maxHp × weapon.damageByZone[zone] × DIFFICULTY_MULT[difficulty]
nextHp = max(0, currentHp − damage)
```

- **Weapons own** per-zone fractions (`damageByZone: Record<HitZone, number>`) on the weapon registry / config.
- **Combat owns** pure `applyDamage` + difficulty multipliers — no Three.js.
- Global `DAMAGE_ZONE_PCT` becomes the **pistol** profile (or is removed once profiles live on weapons).

### MVP + future profiles

| Weapon   | head | body | limb | Status                          |
| -------- | ---- | ---- | ---- | ------------------------------- |
| `pistol` | 0.50 | 0.20 | 0.15 | MVP — only equipped weapon now  |
| `knife`  | TBD  | TBD  | TBD  | Future loadout (not US-3/US-4)  |

Same health bar UI; injury severity = **body place** (hit zone) × **weapon** × difficulty — e.g. pistol headshot hurts more than pistol limb hit; a future knife can use different per-zone numbers.

## Service

`applyDamage({ currentHp, maxHp, zone, difficulty, damageByZone }) → nextHp` in `combat/apply-damage.ts`.

Caller (health store / US-4 shooting) resolves `weaponId` → registry profile, then passes `damageByZone`.

Difficulty multipliers: `combat/constants/difficulty.ts` (`DIFFICULTY_MULT`).

## Hitboxes

Invisible meshes on soldier tagged with `userData.hitZone` + `userData.entityId`, built from `HitboxPreset.parts` (head sphere, body/limb boxes).

## Store

`health-store.ts` — per-`EntityId` HP map, Zustand. Implements `HealthSystem`. On `applyDamage(DamageData)`, look up weapon profile, run pure math, update HP / `isEliminated`. HP resets on round end only (US-4 round service `resetAll`).

## Round integration

Elimination sets `isEliminated: true` until `endRound()` / `resetAll` restores full HP.

Optional visual: play `dying` from `swat-soldier.glb` when HP hits 0 (clip present; not wired in US-2).
