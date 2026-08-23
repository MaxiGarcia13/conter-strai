# Architecture — Type domains

Three type domains, **one `types.ts` per module** (same convention as `textures/`, `teams/`, `props/`). Data-first registries at module root; no OOP lifecycle classes.

## Folder layout (target)

```
src/modules/
├── scenarios/
│   ├── types.ts                 # all scenario/arena types (comment sections inside)
│   ├── scenario-registry.ts
│   ├── maps/arena-01/
│   │   ├── index.ts             # flat ScenarioConfig (or named sub-object spread)
│   │   └── layout.ts            # floor/wall data builders
│   └── pieces/                  # map authoring helpers
├── soldiers/
│   ├── types.ts                 # skin, hitbox, controller, entity types
│   ├── soldier-skin-registry.ts # soldierSkins (rename from soldier-registry.ts)
│   ├── hitbox-preset-registry.ts
│   └── get-soldier-skin-by-id.ts
├── combat/
│   └── types.ts                 # add with first US-3 service (apply-damage.ts)
├── weapons/
│   └── types.ts                 # add with first US-4 config (pistol.ts)
└── game/
    └── types.ts                 # GameMode, RoundPhase (next to constants/)
```

**Rules**

- No `types/` subfolders until a single `types.ts` exceeds ~200 lines.
- Do not create `combat/` or `weapons/` module shells with types only — add `types.ts` alongside the first runtime file in that module.
- Map data stays under `scenarios/maps/`; no separate `arena/` module rename in MVP.

## Scenario / arena (`scenarios/types.ts`)

Organize with comment sections inside one file:

| Section | Types |
|---------|-------|
| Layout | `Vec3`, `ScenarioFloorZone`, `ScenarioWallSegment`, `CollisionSegment`, `ArenaLayout` |
| Spawns | `SpawnPoint`, `SpawnerConfig` |
| Environment | `ArenaEnvironment` (lighting only for MVP) |
| Config | `ScenarioId`, `ScenarioMeta`, `ScenarioConfig` |

`ScenarioConfig` = flat composition (`ScenarioMeta & ArenaLayout & SpawnerConfig & ArenaEnvironment`). Existing code keeps flat access (`scenario.bounds`, not `scenario.layout.bounds`).

Map migration (`maps/arena-01/`, `scenario-registry.ts`, `pieces/*`, optional `collisionSegments`) — [tasks.md §3](./tasks.md#3-scenarios--map--registry-migration).

## Soldier entity (`soldiers/types.ts`)

| Section | Types |
|---------|-------|
| Skin | `CharacterMeshData`, `SoldierAnimationClips`, `SoldierSkinId`, `SoldierSkin` |
| Hitbox | `HitZone`, `HitboxPresetId`, `HitboxPreset`, `HitboxPart` |
| Controller | `LocomotionState`, `LocomotionIntent`, `SoldierController`, `PlayerController` |
| Entity | `EntityId`, `Soldier` |

**Registries** (module root, not in `types.ts`):

- `soldier-skin-registry.ts` — visual presets (`meshData`, `hitboxPresetId`)
- `hitbox-preset-registry.ts` — collider layouts decoupled from skin mesh (US-3)

`HitboxPreset` types may move to `combat/types.ts` when US-3 lands if damage/raycast owns colliders; either location is fine for MVP with one preset.

## Combat, weapons, game

| Module | File | Types | When to add |
|--------|------|-------|-------------|
| `combat/` | `types.ts` | `DamageData`, `HealthState`, `HealthSystem`, optionally `HitboxPreset` | With `apply-damage.ts` (US-3) |
| `weapons/` | `types.ts` | `BulletHitResult`, `PistolWeaponConfig`, `Loadout` | With pistol config (US-4) |
| `game/` | `types.ts` | `GameMode`, `RoundPhase` | Before round service (US-4) |

## MVP cuts

No AI controller, objectives manager, soldier classes, hazards, fog/skybox, or voice/customization types until a consumer exists.

## Refactor from `types/` folders

The repo briefly used `scenarios/types/` and `soldiers/types/` multi-file splits. Consolidate back to single `types.ts` per module — see [tasks.md §9](./tasks.md#9-folder-structure-refactor).

See [tasks.md](./tasks.md) for the full checklist.
