# US-2 — Tasks

- [x] Texture registry (`forrest_ground`, `coral_fort_wall` → `/assets/textures/…`)
- [x] Prop registry stub (empty or placeholder ids; ready for trees later)
- [x] Scenario registry + `arena-01` **Ruined Village**: 100×50×3.5 m, floor/walls, **teamSpawns** (Puma west / Lion east), `props: []`
- [x] Soldier registry + `swat-guy` definition → `swat-soldier.glb`
- [x] `ScenarioScene`: floor + outer walls from config; generic `props` loop; texture repeat
- [x] Create `/play` page with dynamic `GameCanvas` import
- [x] `SoldierModel` component
- [x] `useFpsControls` hook (WASD, mouse, bounds collision)
- [x] Soldier GLB animations: `idle`, `walk`, `run` (registry-mapped; hips root motion stripped)
- [x] Locomotion state machine: idle / walk (WASD) / run (Space + WASD)
- [x] Three camera modes (F): first-person, over-the-shoulder, third-person
- [x] Remove obsolete `swat-guy.glb` asset (superseded by `swat-soldier.glb`)
- [ ] `dying` animation hook-up (clip present in GLB; wire on damage US-3)
- [ ] `FpsPlayer` + `GameCanvas` wiring (lights from scenario defaults)
- [ ] Crosshair HUD overlay
- [ ] Vitest: texture / scenario / soldier registry lookup; arena-01 bounds + spawn sides
