# US-4 — Tasks

Post type-split: weapon contracts in `weapons/`, round phase types in `game/`, damage via `combat/`. See [`specs/current/design.md#module-types`](../current/design.md#module-types).

**Order:** US-6 is shipped — weapon pose + pistol attach can proceed. Round service and shooting are independent — see [suggested order](../current/tasks.md#suggested-order).

## Done (architecture foundation)

- [x] `PistolWeaponConfig`, `BulletHitResult`, `Loadout` in `weapons/types.ts`
- [x] `weapon-registry.ts` — MVP pistol (`fireCooldownSeconds`; **damageByZone** added in US-3)
- [x] `GameMode`, `RoundPhase` in `game/types.ts` (`'team-elimination'`, `'live' | 'round-end'`)
- [x] Scenario `teamSpawns` on `arena-01` (consume in round start)
- [x] Teams module (`civilian` | `soldier`)

## Round service

- [x] Round store / service: `startRound`, `endRound`, `checkRoundEnd` using `RoundPhase`
- [x] Team assignment (Civilians / Soldiers) + pick spawn from `ScenarioConfig.teamSpawns`
- [x] On `startRound`: full HP via health store `resetAll`, equip pistol from `Loadout` / weapon registry
- [x] `checkRoundEnd` → if all civilians **or** all soldiers eliminated → `endRound(winner)`
- [x] Round-end UI banner (winner team); delay; `startRound()` again

## Shooting

- [x] `useShooting` hook — raycast from camera on mousedown; cooldown from `PistolWeaponConfig.fireCooldownSeconds`
- [x] Filter hits by `userData.hitZone`, `userData.entityId`, and **team** (no friendly fire in MVP)
- [x] Build `DamageData` (incl. **`weaponId`** of equipped weapon) → combat `applyDamage` / health store `applyDamage`
- [x] Pure `resolveHitDamage` (or thin wrapper) Vitest-covered alongside `checkRoundEnd`
- [x] Opposing-team dummy / bot at fixed spawn for local tests until US-5 (`ScenarioSoldiers` + hit pick / roster aligned)
- [x] When `HealthState.isEliminated`, disable FPS controls until next `startRound()`

## Weapon mesh (hand attach)

Runtime attach — keep `pistol_a.glb` separate from character mesh GLBs (do not bake into civilian / soldier skins).

- [x] Extend `PistolWeaponConfig` / weapon registry with `modelUrl` → `/assets/weapons/pistol_a.glb` (or current registry path)
- [x] Attach pistol clone to Mixamo **right hand** bone (`mixamorig:RightHand` / sanitized name) on local player + NPCs / dummy
- [ ] Tune grip offset (`position` / `rotation` / `scale`) so the weapon sits in the hand across idle / walk / shoot / reload
- [ ] FPS: keep world pistol on the visible arms (same clone as body — no separate view-model)

## Weapon pose animations

Clip playback only (no ammo / hitscan required for these checkboxes). Shared pack shipped in US-6.

- [ ] Add `shooting` + `reloading` clips to `base-animations.glb`; map on all registered skins
- [ ] Pointer-locked **LMB** → one-shot `shooting` (not while reloading/jumping)
- [ ] **R** → one-shot `reloading` (busy until mixer finished)
- [ ] Mixer priority: `reloading` > `jump` > `shooting` > kneel / crouch-walk > locomotion

## Verification

- [x] Vitest: hit → HP path + `checkRoundEnd`
- [ ] Manual: shoot dummy → HP drops by **pistol** zone profile; team wipe ends round and resets

## Out of scope here

- Colyseus / server authority (US-5)
- Knife / rifle loadouts
