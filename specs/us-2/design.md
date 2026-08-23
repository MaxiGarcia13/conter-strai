# US-2 — Design

## Units

1 world unit = **1 meter**. Movement, collision, and map sizes use meters everywhere.

## Registries

Maps stay data-driven so future arenas (and props like trees) are config-only, not new React scenes.

| Registry     | Role                                               | Example ids                         |
| ------------ | -------------------------------------------------- | ----------------------------------- |
| **Texture**  | Floor/wall GLB materials under `/assets/textures/` | `forrest_ground`, `coral_fort_wall` |
| **Prop**     | Placeable objects (trees, barrels, cover)          | `tree` (later)                      |
| **Scenario** | Map layout: bounds, materials, props, team spawns  | `arena-01`                          |
| **Soldier**  | Player model definitions                           | `swat-guy`                          |

## Registry types

```typescript
type Team = 'puma' | 'lion';
type Vec3 = [number, number, number];

interface TextureDefinition {
  id: string;
  url: string; // e.g. /assets/textures/floor/forrest_ground.glb
}

interface PropDefinition {
  id: string;
  modelUrl: string;
  scale?: number;
  collidable?: boolean; // default false for decor
}

interface ScenarioProp {
  id: string; // looks up prop registry
  position: Vec3;
  rotationY?: number;
  scale?: number;
  collidable?: boolean; // overrides definition default
}

interface ScenarioConfig {
  id: string;
  name: string;
  theme?: string;
  bounds: { width: number; depth: number; wallHeight: number };
  floor: { assetId: string; repeat?: [number, number] };
  walls: { assetId: string; thickness?: number };
  /** Optional interior ruin stubs (cover); outer box comes from bounds */
  wallSegments?: { start: Vec3; end: Vec3; height?: number }[];
  props?: ScenarioProp[];
  teamSpawns: Record<Team, Vec3[]>;
  /** Optional spawn yaw (radians); omit = face map center */
  spawnYaw?: Record<Team, number>;
  lighting?: { ambient: number; sunIntensity: number };
}

interface SoldierDefinition {
  id: string;
  modelUrl: string;
  scale: number;
}
```

New arena = new `ScenarioConfig` entry. New tree/object = prop registry entry + placements in `props[]`. `ScenarioScene` only reads config.

## Components

- `GameCanvas.tsx` — R3F Canvas, lights (from scenario or defaults), camera
- `ScenarioScene.tsx` — floor + outer walls + optional `wallSegments` + generic `props` render
- `SoldierModel.tsx` — loads `swat-soldier.glb` (soldier id `swat-guy`)
- `FpsPlayer.tsx` — camera + movement hook
- `useFpsControls.ts` — WASD, mouse, collision against bounds (+ collidable props later)

## arena-01 — Ruined Village

Abandoned village: only walls remain (no roofs / interiors). Long street layout for pistol TDM.

| Field            | Value                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **id**           | `arena-01`                                                                                                                 |
| **name**         | Ruined Village                                                                                                             |
| **theme**        | `ruined-village`                                                                                                           |
| **bounds**       | **100 m** width (X) × **50 m** depth (Z); wall height **3.5 m**                                                            |
| **floor**        | `forrest_ground` (`/assets/textures/floor/forrest_ground.glb`) — outdoor ground; set `repeat` so tiling holds at this size |
| **walls**        | `coral_fort_wall` (`/assets/textures/wall/coral_fort_wall.glb`) — stone ruin perimeter                                     |
| **props (US-2)** | Empty array or omit — slots ready for trees / cover later                                                                  |
| **lighting**     | Soft daylight (ambient + sun); mood can differ per arena later                                                             |

| Team | Spawn side | Points           | Facing                 |
| ---- | ---------- | ---------------- | ---------------------- |
| Puma | West (−X)  | ≥2 near west end | Toward +X (map center) |
| Lion | East (+X)  | ≥2 near east end | Toward −X (map center) |

Spawns stay clear of walls (~2 m inset). Round start (US-4) picks one spawn per player on their team.

### Out of scope for US-2

Navmesh, destructible walls, multi-level, roofs, LODs, prop models (trees etc. land via config when assets exist).

## Module layout

```
src/modules/
├── game/       GameCanvas, FpsPlayer, useFpsControls, HUD crosshair
├── scenarios/  registry + types, ScenarioScene, arena-01
├── soldiers/   registry + types, SoldierModel, swat-guy
├── textures/   registry + types
├── props/      registry + types
└── teams/      team definitions
```
