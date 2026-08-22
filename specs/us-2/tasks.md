# US-2 — Tasks

- [x] Texture registry (`forrest_ground`, `coral_fort_wall` → `/assets/textures/…`)
- [x] Prop registry stub (empty or placeholder ids; ready for trees later)
- [x] Scenario registry + `arena-01` **Ruined Village**: 100×50×3.5 m, floor/walls, **teamSpawns** (Puma west / Lion east), `props: []`
- [x] Soldier registry + `swat-guy` definition
- [ ] `ScenarioScene`: floor + outer walls from config; generic `props` loop; texture repeat
- [ ] Create `/play` page with dynamic `GameCanvas` import
- [ ] `SoldierModel` component
- [ ] `useFpsControls` hook (WASD, mouse, bounds collision)
- [ ] `FpsPlayer` + `GameCanvas` wiring (lights from scenario defaults)
- [ ] Crosshair HUD overlay
- [ ] Vitest: texture / scenario / soldier registry lookup; arena-01 bounds + spawn sides
