# US-3 — Design

Types and pure damage math already land in `src/modules/combat/` (architecture type split). This US wires stores, hitbox meshes, and HUD.

## Types (`combat/types.ts`)

```typescript
type HitZone = 'head' | 'body' | 'limb';
type Difficulty = 'easy' | 'normal' | 'hard';

interface DamageData {
  attackerId: EntityId;
  targetId: EntityId;
  zone: HitZone;
  weaponId?: string;
  team?: Team;
}

interface HealthState {
  currentHp: number;
  maxHp: number;
  isEliminated: boolean;
}
```

Hitbox geometry: `HitboxPreset` / `HitboxPart` + `hitbox-preset-registry` (`humanoid-standard`). Skins only store `hitboxPresetId`.

## Service

`applyDamage({ currentHp, maxHp, zone, difficulty }) → nextHp` in `combat/apply-damage.ts`.

Zone percentages: `combat/constants/damage-zones.ts` (`DAMAGE_ZONE_PCT`).  
Difficulty multipliers: `combat/constants/difficulty.ts` (`DIFFICULTY_MULT`).

## Hitboxes

Invisible meshes on soldier tagged with `userData.hitZone` + `userData.entityId`, built from `HitboxPreset.parts` (head sphere, body/limb boxes).

## Store

`health-store.ts` — per-`EntityId` HP map, Zustand. Implements `HealthSystem`. HP resets on round end only (US-4 round service `resetAll`).

## Round integration

Elimination sets `isEliminated: true` until `endRound()` / `resetAll` restores full HP.
