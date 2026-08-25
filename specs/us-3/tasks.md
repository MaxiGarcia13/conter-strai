# US-3 — Tasks

Post type-split: health/hitbox types and pure damage math live in `src/modules/combat/`. Skins only carry `hitboxPresetId` — see [`specs/current/design.md#module-types`](../current/design.md#module-types).

## Done (architecture foundation)

- [x] `HitZone`, `Difficulty`, `HealthState`, `DamageData`, `HealthSystem` in `combat/types.ts`
- [x] `HitboxPreset` / `HitboxPresetId` / `HitboxPart` in `combat/types.ts` (`humanoid-standard`)
- [x] `hitbox-preset-registry.ts`
- [x] `combat/constants/damage-zones.ts` (`DAMAGE_ZONE_PCT`) + `difficulty.ts` (`DIFFICULTY_MULT`)
- [x] Pure `applyDamage` in `combat/apply-damage.ts` (zone × difficulty → next HP; **extend for weapon profiles below**)
- [x] `SoldierSkin.hitboxPresetId` on skin registry (no hitbox geometry on skin)

## Weapon + body-zone damage

Injury amount depends on **where** you are hit (head > body > limbs) **and** **which weapon** hit you (pistol now; knife later). Health bar still shows HP % — it drops more for a headshot than a limb hit, and differently per weapon.

- [x] Add `damageByZone: Record<HitZone, number>` to weapon config (`WeaponConfig` or extend `PistolWeaponConfig`)
- [x] Pistol registry entry: head `0.4`, body `0.2`, limb `0.15` (same numbers as today’s `DAMAGE_ZONE_PCT`)
- [x] Extend `applyDamage` to take `damageByZone` (from weapon); formula: `maxHp × damageByZone[zone] × DIFFICULTY_MULT`
- [x] Make `DamageData.weaponId` required; health store resolves profile via weapon registry; `zone` comes from hitbox `userData.hitZone`
- [x] Retire or narrow global `DAMAGE_ZONE_PCT` once pistol owns the profile (avoid two sources of truth)
- [x] Vitest: same weapon + difficulty, **different zones** → different HP deltas (head > body > limb)
- [x] Vitest: same zone + difficulty, **different weapons** → different HP deltas (pistol fixture now; knife fixture optional stub)

## Remaining

- [x] Export `isEliminated(hp)` helper (or equivalent) for callers if not covered by `HealthState.isEliminated`
- [x] `health-store.ts` (Zustand) — per-`EntityId` HP map; implement `HealthSystem` (`getHealth`, `applyDamage`, `resetAll`)
- [x] Soldier **hitbox meshes** — invisible colliders from `HitboxPreset.parts`, tagged `userData.hitZone` + `userData.entityId`
- [x] Attach hitboxes to world/NPC soldiers (and local player when third-person / raycast targets exist)
- [x] `HealthBar` HUD component (local player HP %)
- [ ] Elimination persists until round end (no mid-round respawn) — store flag; disable controls when eliminated (full round reset in US-4)
- [ ] Wire `dying` clip on elimination (clip already in `swat-soldier.glb`; deferred from US-2)
- [ ] Vitest: `apply-damage.test.ts` — zone × weapon × difficulty, HP floor at 0 / elimination

## Out of scope here

- Round start/end / team wipe (US-4)
- Hitscan shooting / equipping knife mesh (US-4+)
- Knife / rifle as playable loadout (future)
- Server-authoritative HP (US-5)
