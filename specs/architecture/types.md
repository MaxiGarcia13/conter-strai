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
│   ├── types.ts                 # skin, hitbox, controller, entity
│   ├── soldier-skin-registry.ts
│   ├── hitbox-preset-registry.ts   ← pending move to combat/ (§10)
│   └── get-soldier-skin-by-id.ts
├── combat/
│   ├── types.ts
│   ├── apply-damage.ts
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

### Target (after §10)

Hitbox **types** and **registry** move to `combat/` — colliders are a combat/raycast concern, not visual skin data.

```
combat/
├── types.ts                 # + HitZone, HitboxPreset, HitboxPresetId, HitboxPart
├── hitbox-preset-registry.ts
├── apply-damage.ts
└── constants/ …

soldiers/
├── types.ts                 # skin + controller + entity only; skin references HitboxPresetId from combat
└── soldier-skin-registry.ts
```

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
| Hitbox | `HitZone`, `HitboxPreset`, … | **Move to `combat/types.ts`** (§10) |
| Controller | `LocomotionState`, `LocomotionIntent`, `SoldierController`, `PlayerController` | |
| Entity | `EntityId`, `Soldier` | |

**Registries at module root**

| File | Module | Status |
|------|--------|--------|
| `soldier-skin-registry.ts` | `soldiers/` | done |
| `hitbox-preset-registry.ts` | `soldiers/` today → `combat/` target | §10 |

---

## Combat, weapons, game

| Module | File | Types / runtime |
|--------|------|-----------------|
| `combat/` | `types.ts` | `DamageData`, `HealthState`, `HealthSystem`, `Difficulty` |
| `combat/` | `apply-damage.ts` | Pure zone/damage math (US-3) |
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

## Open work

- [ ] Hitbox ownership → `combat/` ([tasks.md §10](./tasks.md#10-module-ownership-alignment))

See [tasks.md](./tasks.md) for the full checklist.
