# Architecture — Type domains

Three type domains, module-colocated under `src/modules/`. Data-first registries; no OOP lifecycle classes.

## Scenario / arena (`src/modules/scenarios/types/`)

| Type | Role |
|------|------|
| `ArenaLayout` | Floor, walls, props, `collisionSegments` |
| `SpawnerConfig` | `teamSpawns`, `spawnYaw` |
| `ArenaEnvironment` | Lighting (MVP) |
| `ScenarioConfig` | Top-level arena container — flat composition of the above + `id`, `name` |

`ScenarioConfig` is the registry key type (`ScenarioId`). Existing code keeps flat access (`scenario.bounds`, not `scenario.layout.bounds`).

## Soldier entity (`src/modules/soldiers/types/`)

| Type | Role |
|------|------|
| `SoldierSkin` | Visual preset — `meshData`, `hitboxPresetId` |
| `CharacterMeshData` | GLB URL, scale, animation clip names |
| `HitboxPreset` | Invisible collider layout (US-3) — decoupled from skin mesh |
| `SoldierController` | Input → `LocomotionIntent` |
| `Soldier` | Runtime entity shell — `EntityId`, team, `skinId` |

## Combat & weapons (types only until US-3/4)

| Module | Types |
|--------|-------|
| `combat/types/` | `DamageData`, `HealthState`, `HealthSystem` |
| `weapons/types/` | `PistolWeaponConfig`, `BulletHitResult`, `Loadout` |
| `game/types/` | `GameMode`, `RoundPhase` |

## MVP cuts

No AI controller, objectives manager, soldier classes, hazards, fog/skybox, or voice/customization types until a consumer exists.

See [tasks.md](./tasks.md) for the implementation checklist.
