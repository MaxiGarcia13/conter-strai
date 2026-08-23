# US-3 — Tasks

Post type-split: health/hitbox types and pure damage math live in `src/modules/combat/`. Skins only carry `hitboxPresetId` — see [`specs/current/design.md#module-types`](../current/design.md#module-types).

## Done (architecture foundation)

- [x] `HitZone`, `Difficulty`, `HealthState`, `DamageData`, `HealthSystem` in `combat/types.ts`
- [x] `HitboxPreset` / `HitboxPresetId` / `HitboxPart` in `combat/types.ts` (`humanoid-standard`)
- [x] `hitbox-preset-registry.ts`
- [x] `combat/constants/damage-zones.ts` (`DAMAGE_ZONE_PCT`) + `difficulty.ts` (`DIFFICULTY_MULT`)
- [x] Pure `applyDamage` in `combat/apply-damage.ts` (`DAMAGE_ZONE_PCT` × `DIFFICULTY_MULT` → next HP)
- [x] `SoldierSkin.hitboxPresetId` on skin registry (no hitbox geometry on skin)

## Remaining

- [ ] Export `isEliminated(hp)` helper (or equivalent) for callers if not covered by `HealthState.isEliminated`
- [ ] `health-store.ts` (Zustand) — per-`EntityId` HP map; implement `HealthSystem` (`getHealth`, `applyDamage`, `resetAll`)
- [ ] Soldier **hitbox meshes** — invisible colliders from `HitboxPreset.parts`, tagged `userData.hitZone` + `userData.entityId`
- [ ] Attach hitboxes to world/NPC soldiers (and local player when third-person / raycast targets exist)
- [ ] `HealthBar` HUD component (local player HP)
- [ ] Elimination persists until round end (no mid-round respawn) — store flag; disable controls when eliminated (full round reset in US-4)
- [ ] Optional: wire `dying` clip on elimination (clip in GLB)
- [ ] Vitest: `apply-damage.test.ts` — zone math, difficulty multipliers, HP floor at 0 / elimination

## Out of scope here

- Round start/end / team wipe (US-4)
- Hitscan shooting (US-4)
- Server-authoritative HP (US-5)
