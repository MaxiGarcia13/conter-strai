# Architecture — Type split tasks

Introduce a three-domain type architecture (scenario/arena, soldier entity, skin/hitbox) adapted to module-colocated registries. Migrate existing `ScenarioConfig` and `SoldierDefinition` without changing runtime behavior.

Design reference: [types.md](./types.md).

**Folder convention:** one `types.ts` per module (matches `textures/`, `teams/`, `props/`).

MVP scope: no AI stubs, no objectives manager, no soldier classes, no deprecated aliases — rename cleanly in one pass.

---

## Status

| Section | Topic | State |
|---------|-------|-------|
| §1–§2 | Scenario types + verify | done |
| §3 | Map & registry migration | done |
| §4–§5 | Soldier types + registry | done |
| §6 | Combat / weapons / game types | done |
| §7–§8 | Docs + verification | done |
| §9 | Consolidate `types/` folders → `types.ts` | done |
| **§10** | **Move hitbox types + registry → `combat/`** | **open** |

---

## 1. Scenarios — type split

Target: single [`src/modules/scenarios/types.ts`](../../src/modules/scenarios/types.ts) with comment sections (Layout / Spawns / Environment / Config).

- [x] Types defined: `ArenaLayout`, floor/wall/prop types, `CollisionSegment`, `SpawnerConfig`, `ArenaEnvironment`, `ScenarioConfig` flat composition
- [x] Consolidate from `scenarios/types/` multi-file split → one `types.ts` (§9)

**Cut for MVP:** no objectives, hazards, fog/skybox stubs.

---

## 2. Scenarios — verify consumers

- [x] All scenario consumers compile unchanged (`scenario.bounds`, `teamSpawns`, etc.)
- [x] Imports resolve to module `types.ts`

---

## 3. Scenarios — map & registry migration

- [x] Update `maps/arena-01/layout.ts` + `pieces/*` imports → `scenarios/types.ts`
- [x] `scenario-registry.ts` + `maps/index.ts` unchanged (`ScenarioId` / `ScenarioConfig`)
- [x] `arena-01/index.ts` composes from named sub-objects (`arena01Meta`, `arena01Layout`, …)
- [x] `collisionSegments` via `buildCollisionSegments` + `arena01Collisions`
- [x] `scenario-registry.test.ts`

---

## 4. Soldiers — type split

Target: single [`src/modules/soldiers/types.ts`](../../src/modules/soldiers/types.ts) with comment sections.

- [x] Types defined: `CharacterMeshData`, `SoldierSkin`, `HitboxPreset`, `SoldierController`, `EntityId`, `Soldier`
- [x] Consolidate from `soldiers/types/` multi-file split → one `types.ts` (§9)

**Remaining:** hitbox section moves to `combat/types.ts` in §10.

---

## 5. Soldiers — registry & consumer migration

- [x] `soldierSkins` + `hitboxPresets` with `meshData` + `hitboxPresetId`
- [x] `getSoldierSkinById`; `SoldierSkinId` replaces `SoldierId`
- [x] `SoldierModel`, `FpsViewModel`, locomotion utils use `skin.meshData`
- [x] `soldier-skin-registry.ts` + `hitbox-preset-registry.ts` at module root
- [x] Removed dead `get-soldier-by-id.ts` / `SoldierDefinition`

**Remaining:** `hitbox-preset-registry.ts` moves to `combat/` in §10.

---

## 6. Combat, weapons, game — types only

- [x] `combat/types.ts` + `apply-damage.ts` — `DamageData`, `HealthState`, `HealthSystem`, `Difficulty`
- [x] `combat/constants/` — damage zones, difficulty multipliers
- [x] `weapons/types.ts` + `weapon-registry.ts` — `PistolWeaponConfig`, `BulletHitResult`, `Loadout`
- [x] `game/types.ts` — `GameMode`, `RoundPhase`

No `types/` subfolders.

---

## 7. Documentation

- [x] Link [types.md](./types.md) from [specs/current/design.md](../current/design.md)
- [x] Link from [specs/current/tasks.md](../current/tasks.md)

---

## 8. Verification

- [x] `npm run build` passes
- [x] `npm run dev` — arena-01 renders; NPC soldiers + FPS view model unchanged
- [x] `soldier-skin-registry.test.ts` — `meshData`, clip names, `hitboxPresetId`

---

## 9. Folder structure refactor

Consolidate multi-file `types/` folders to single `types.ts` per module.

### Scenarios

- [x] Merge `scenarios/types/*` → `scenarios/types.ts`; delete `types/` folder
- [x] Update imports; `scenarios/index.ts` exports `./types`

### Soldiers

- [x] Merge `soldiers/types/*` → `soldiers/types.ts`; delete `types/` folder
- [x] Update imports across `soldiers/` and `game/`
- [x] `soldier-skin-registry.ts` + `hitbox-preset-registry.ts` at module root

### Acceptance

- [x] Each module has at most one `types.ts` (no `types/` folder)
- [x] Same exported type names; `npm run build` passes

**When to re-split:** only if a `types.ts` grows past ~200 lines.

---

## 10. Module ownership alignment

Hitbox colliders belong in **`combat/`**, not **`soldiers/`**. Visual skins reference a preset id; combat owns preset data and raycast zones.

### Move types

- [ ] Move from `soldiers/types.ts` → `combat/types.ts`:
  - `HitZone`
  - `HitboxPresetId`
  - `HitboxPart`
  - `HitboxPreset`
- [ ] Keep `SoldierSkin.hitboxPresetId` in `soldiers/types.ts`; import `HitboxPresetId` from `@/modules/combat`
- [ ] Update `combat/apply-damage.ts` — import `HitZone` from `./types` (not `@/modules/soldiers`)

### Move registry

- [ ] Move `soldiers/hitbox-preset-registry.ts` → `combat/hitbox-preset-registry.ts`
- [ ] Add `combat/index.ts` barrel (export types, registry, `applyDamage`) if other modules need clean imports
- [ ] Update `soldier-skin-registry.ts` / tests — import `hitboxPresets` from combat if needed for validation

### Update dependents

- [ ] `weapons/types.ts` — import `HitZone`, `EntityId` from combat (or keep `EntityId` in soldiers if still entity-owned)
- [ ] `soldiers/index.ts` — stop re-exporting hitbox types if combat owns them; export only skin/entity/controller types
- [ ] Grep `HitZone` / `HitboxPreset` imports across `src/` and point at `@/modules/combat`

### Documentation

- [ ] Update [types.md](./types.md) “Current” tree — remove “pending move” notes once done
- [ ] Mark §10 complete in Status table above

### Acceptance

- [ ] `soldiers/types.ts` has no hitbox geometry types (only `hitboxPresetId` reference)
- [ ] `combat/hitbox-preset-registry.ts` is the single source for `humanoid-standard` preset data
- [ ] `npm run build` + unit tests pass

---

## Out of scope

- Runtime `Arena` class, AI controller, hazards, weapon firing, health store (Zustand)
- Renaming `scenarios/` → `arena/` or `soldiers/` → `soldier/` (design.md uses singular; code uses plural — align separately)
- Nested `scenario.layout.bounds` refactor
- Colyseus Schema types (US-5)
- Soldier classes, objectives manager, voice packs, skin customization

---

## Dependency order

```mermaid
flowchart LR
  A[1-3 Scenarios] --> B[4-5 Soldiers]
  B --> C[9 types.ts consolidate]
  C --> D[6 Combat weapons game]
  D --> E[8 Verify]
  E --> F[10 Hitbox to combat]
```

§10 is the remaining folder-alignment work. §3 `collisionSegments` aligns with [specs/us-2/tasks.md](../us-2/tasks.md).
