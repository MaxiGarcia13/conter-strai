# Architecture — Type domains

Three type domains, **one `types.ts` per module** (same convention as `textures/`, `teams/`, `props/`). Data-first registries at module root; no OOP lifecycle classes.

## Folder layout

### Current (implemented)

```
src/modules/
├── scenarios/
│   ├── types.ts
│   ├── scenario-registry.ts
│   ├── maps/arena-01/
│   │   ├── index.ts             # named sub-object spread → ScenarioConfig
│   │   └── layout.ts
│   └── pieces/
│       └── collision-helpers.ts
├── soldiers/
│   ├── types.ts                 # skin, controller, entity
│   ├── soldier-skin-registry.ts
│   └── get-soldier-skin-by-id.ts
├── combat/
│   ├── index.ts                 # barrel: types, registry, applyDamage
│   ├── types.ts                 # hitbox, health, difficulty
│   ├── apply-damage.ts
│   ├── hitbox-preset-registry.ts
│   └── constants/
│       ├── damage-zones.ts
│       └── difficulty.ts
├── weapons/
│   ├── types.ts
│   └── weapon-registry.ts
└── game/
    ├── types.ts
    └── constants/player.ts
```

Hitbox colliders live in `combat/` — skins reference a preset id; combat owns preset data and raycast zones.

**Rules**

- No `types/` subfolders until a single `types.ts` exceeds ~200 lines.
- Add module runtime files alongside `types.ts` — no types-only shells.
- Map data stays under `scenarios/maps/`; no `arena/` module rename in MVP.

---

## Scenario / arena (`scenarios/types.ts`)

Comment sections inside one file:

| Section | Types |
|---------|-------|
| Layout | `Vec3`, `ScenarioFloorZone`, `ScenarioWallSegment`, `CollisionSegment`, `ArenaLayout` |
| Spawns | `SpawnPoint`, `SpawnerConfig` |
| Environment | `ArenaEnvironment` (lighting only for MVP) |
| Config | `ScenarioId`, `ScenarioMeta`, `ScenarioConfig` |

`ScenarioConfig` = flat composition. Flat runtime access (`scenario.bounds`) — no nested `scenario.layout.bounds`.

Map work: [tasks.md §3](./tasks.md#3-scenarios--map--registry-migration) (done).

---

## Soldier entity (`soldiers/types.ts`)

| Section | Types | Notes |
|---------|-------|-------|
| Skin | `CharacterMeshData`, `SoldierAnimationClips`, `SoldierSkinId`, `SoldierSkin` | `hitboxPresetId` refs combat preset |
| Controller | `LocomotionState`, `LocomotionIntent`, `SoldierController`, `PlayerController` | |
| Entity | `EntityId`, `Soldier` | |

Hitbox types (`HitZone`, `HitboxPreset`, …) moved to `combat/types.ts` — see [tasks.md §10](./tasks.md#10-module-ownership-alignment).

**Registries at module root**

| File | Module |
|------|--------|
| `soldier-skin-registry.ts` | `soldiers/` |
| `hitbox-preset-registry.ts` | `combat/` |

---

## Combat, weapons, game

| Module | File | Types / runtime |
|--------|------|-----------------|
| `combat/` | `index.ts` | Barrel — types, `hitboxPresets`, `applyDamage` |
| `combat/` | `types.ts` | `HitZone`, `HitboxPresetId`, `HitboxPart`, `HitboxPreset`, `DamageData`, `HealthState`, `HealthSystem`, `Difficulty` |
| `combat/` | `apply-damage.ts` | Pure zone/damage math (US-3) |
| `combat/` | `hitbox-preset-registry.ts` | `humanoid-standard` preset data |
| `combat/` | `constants/` | `DAMAGE_ZONE_PCT`, `DIFFICULTY_MULT` |
| `weapons/` | `types.ts` | `PistolWeaponConfig`, `BulletHitResult`, `Loadout` |
| `weapons/` | `weapon-registry.ts` | MVP pistol entry |
| `game/` | `types.ts` | `GameMode`, `RoundPhase` |

`RoundPhase`: `'live' \| 'round-end'` (matches code; expand when lobby/round-start UI lands).

---

## MVP cuts

No AI controller, objectives manager, soldier classes, hazards, fog/skybox, or voice/customization types until a consumer exists.

## Completed refactors

- [x] `scenarios/types/` and `soldiers/types/` multi-file splits → single `types.ts` each ([tasks.md §9](./tasks.md#9-folder-structure-refactor))
- [x] Hitbox ownership → `combat/` ([tasks.md §10](./tasks.md#10-module-ownership-alignment))

See [tasks.md](./tasks.md) for the full checklist.
