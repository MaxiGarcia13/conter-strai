# US-3 — Design

## Types

```typescript
type HitZone = 'head' | 'limb' | 'body';
type Difficulty = 'easy' | 'normal' | 'hard';
```

## Service

`applyDamage({ currentHp, maxHp, zone, difficulty }) → nextHp`

Zone percentages in `combat/constants/damage-zones.ts`.
Difficulty multipliers in `combat/constants/difficulty.ts`.

## Hitboxes

Invisible meshes on soldier tagged with `userData.hitZone`.
Head sphere, body box, limb boxes.

## Store

`health-store.ts` — per-entity HP map, Zustand. HP resets on round end only (US-4 round service).

## Round integration

Elimination sets `eliminated: true` until `endRound()` resets all entities to full HP.
