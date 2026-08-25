# US-6 — Design

Builds on US-2 locomotion (`useSoldierLocomotion`, hips strip, kneel/jump poses). Keeps skins under `soldiers/` for now (no module rename).

## Prerequisites

- **US-2** — locomotion mixer, kneel/jump controls (shipped)
- **No dependency on US-4** — ship US-6 before US-4 weapon pose tasks (US-4.9–4.11). `reloading` / `shooting` clips are added to the shared pack in US-4, not here.

## Asset contract

| Asset                                           | Role                                              |
| ----------------------------------------------- | ------------------------------------------------- |
| `/assets/characters/shared/base-animations.glb` | Source of truth for loco/action clips             |
| `/assets/characters/civilians/remy.glb`         | Civilian mesh (Mixamo `Armature` / `mixamorig:*`) |
| `/assets/characters/civilians/james.glb`        | Civilian mesh (same skeleton contract)            |
| `/assets/characters/civilians/liza.glb`         | Civilian mesh (same skeleton contract)            |
| `/assets/characters/soldiers/swat-1.glb`        | Soldier mesh (same skeleton contract)             |
| `/assets/characters/soldiers/swat-2.glb`        | Soldier mesh (same skeleton contract)             |
| `/assets/characters/soldiers/swat-3.glb`        | Soldier mesh (same skeleton contract)             |

**Skeleton contract:** all character meshes use Mixamo `Armature` with bone names `mixamorig:*` (colon form). Vendor exports that ship numbered prefixes (`mixamorig9:`, `mixamorig6:`, …) are rewritten in-asset to `mixamorig:` so shared-pack tracks and aim/FPS bone lookups bind without runtime retarget.

**Required shared clip names:** `idle`, `walk`, `run`, `jump`, `kneel`, `crouch-walking`, `dying` (wired on elimination in US-3). Ignore junk `mixamo.com*` names via explicit registry mapping.

**Removed:** `/assets/soldiers/swat-soldier.glb` and skin id `swat-guy`.

**Deferred to US-4:** add `reloading` / `shooting` into `base-animations.glb` (legacy GLB no longer holds them).

## Skin / mesh data

```
CharacterMeshData {
  modelUrl: string;
  sharedAnimationsUrl?: string; // → base-animations.glb
  scale: number;
  viewModelScale?: number;
  animations: {
    idle, walk, run, jump, kneel, crouchWalking: string;
    reloading?: string;
    shooting?: string;
  };
}
```

- `SoldierSkinId`: `'remy' | 'james' | 'liza' | 'swat-1' | 'swat-2' | 'swat-3'`
- All skins: `sharedAnimationsUrl` + `hitboxPresetId: 'humanoid-standard'`
- Civilians may set `fpsView.eyeOffsetY` when the head bone sits low vs eyes (same tweak as remy until per-skin tuning)
- Team affinity for select (US-7): `remy` / `james` / `liza` → civilian; `swat-1` / `swat-2` / `swat-3` → soldier
- Until US-7 select ships: `/play?skin=<id>` via `resolvePlaySkinId` (default `swat-1`)

## Clip resolve

1. `useGLTF(modelUrl)` + `useGLTF(sharedAnimationsUrl)` when set.
2. Merge animation lists; **shared wins** on name collision.
3. Resolve by registry names; return null if a required clip is missing.
4. Strip hips translation on: `idle`, `walk`, `run`, `crouch-walking`.
5. `reloading` / `shooting`: resolve only if mapped and present; mixer skips until US-4.

## Mixer priority

```
blocking one-shots (jump; later reload/shoot)
  → kneel + moving → crouch-walking (loop)
  → kneel + idle → kneel (LoopOnce + clamp)
  → idle | walk | run
```

## Controls

- Remove “WASD clears kneel” from `use-player-controls`.
- Pose `kneel` persists while moving; locomotion state still `walk` / `run` / `idle`, but mixer maps kneel+walk/run → crouch-walking and kneel+run uses walk speed only.
- **E**: toggle kneel when not busy with jump (same as today for enter; exit anytime).
- **F**: if kneeling, clear pose then set `jump`.

## Compress / tests

- Compress script: keep all civilian / soldier character GLBs + base-animations; drop `swat-soldier.glb` target.
- After re-export / compress, run `npm run assets:normalize-characters` (`scripts/normalize-character-glbs.mjs`): numbered Mixamo bone prefixes → `mixamorig:`; strip glossiness-as-MR; body materials `OPAQUE` with roughness `0.75`.
- Vitest: shared-pack clip contract; each mesh Armature + `mixamorig:Hips` (or equivalent); resolve merge; kneel+moving → crouch-walk selection; grep/assert no `swat-soldier` references.
- Playwright: canvas boots with `swat-1` and one civilian (`remy`) without PropertyBinding errors; other skins covered by registry + asset contract tests + manual `?skin=` probe.
