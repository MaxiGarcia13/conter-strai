# US-6 — Tasks

Shared animation pack + new skins + crouch-walk stance. Select UI is **US-7**.

**Order:** Ship before [**US-4**](../us-4/tasks.md) weapon poses and pistol attach. No dependency on US-4 — see [suggested order](../current/tasks.md#suggested-order).

## Spec / queue

- [x] `specs/us-6/` requirements + design + tasks
- [x] Point from [`specs/current/tasks.md`](../current/tasks.md)

## Types + clip resolve

- [x] Extend `SoldierAnimationClips` with `crouchWalking`; make `reloading` / `shooting` optional
- [x] Add optional `sharedAnimationsUrl` on `CharacterMeshData`
- [x] `SoldierSkinId`: `'remy' | 'swat-1'` (drop `swat-guy`)
- [x] Merge mesh + shared `AnimationClip[]` (shared wins on name); resolve by registry names
- [x] Strip hips on `idle` / `walk` / `run` / `crouch-walking`
- [x] Vitest: resolve merge + missing required clip → null; optional reload/shoot absent OK

## Registry + assets

- [x] Register `remy` → `/assets/characters/civilians/remy.glb` + shared pack + `humanoid-standard`
- [x] Register `swat-1` → `/assets/characters/soldiers/swat-1.glb` + shared pack + `humanoid-standard` (default skin)
- [x] Delete `public/assets/soldiers/swat-soldier.glb` and remove `swat-guy` everywhere
- [x] Update `scripts/compress-assets.mjs` (drop legacy TODO target; keep character paths)
- [x] Replace `swat-soldier-glb.test.ts` with shared-pack + remy/swat-1 contract tests
- [x] Preload shared + both mesh URLs via `useGLTF.preload`

## Mixer + controls

- [x] Load shared GLB in `SoldierModel` / `LocalPlayer` path; feed merged clips into resolve
- [x] `useSoldierLocomotion`: add `crouchWalking` action (loop); priority kneel+moving → crouch-walk, kneel+idle → kneel
- [x] `use-player-controls`: do **not** clear kneel on WASD; walk-speed only while kneeling; **F** clears kneel then jumps
- [x] Pure helper (Vitest): given pose + locomotion → clip id (`kneel` | `crouch-walking` | loco)
- [x] Camera / body anchor still tracks lowered hips during crouch-walk

## Verification

- [x] Vitest: no remaining `swat-soldier` / `swat-guy` references in src + tests
- [x] Playwright: `/play` with default `swat-1` — no `PropertyBinding` errors; kneel + WASD stays crouched (probe or manual)
- [x] Manual: swap skin to `remy` in code — idle/walk/kneel/crouch-walk OK
    (covered by Playwright `/play?skin=remy` probe; `resolvePlaySkinId` for e2e until US-7 select)

## Out of scope here

- Match select UI / query params (US-7)
- `reloading` / `shooting` clips on shared pack (US-4 — add to `base-animations.glb`)
- `dying` on elimination *(shipped US-3)*
- Colyseus (US-5)
