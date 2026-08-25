# US-7 — Design

Depends on **US-6** skins (`remy`, `swat-1`) and shared idle for the character preview. Does not own animation retarget or crouch-walk.

## Routing

```
/  →  /select  →  /play?team=civilian|soldier&skin=remy|swat-1&scenario=arena-01
```

- Astro page: `src/pages/select.astro`
- React island (client-only): match-select UI + small R3F canvas for character turntable
- Landing CTA (`index.astro`) points to `/select`
- Invalid / missing query params on `/play`: sensible defaults (`soldier`, `swat-1`, `arena-01`) with team↔skin consistency (civilian → `remy`, soldier → `swat-1`)

## Session → play boot

`GameCanvas` (or a thin boot helper) reads URL search params:

| Param      | Type            | Effect                                     |
| ---------- | --------------- | ------------------------------------------ |
| `team`     | `Team`          | `resolveLocalSpawn` uses that team’s slots |
| `skin`     | `SoldierSkinId` | `LocalPlayer` / model skin                 |
| `scenario` | `ScenarioId`    | `getScenarioById` (today only `arena-01`)  |

Local play **respects** the selected team. When US-4 round service / US-5 Colyseus assign teams, document override: select becomes preference or is skipped for networked matches — update US-4.8 note when implementing rounds.

## Select UI layout

One job per section (no dashboard clutter):

1. **Team** — Civilian | Soldier
2. **Character** — skins filtered by team; R3F preview (idle from shared pack, slow yaw or orbit)
3. **Arena** — cards from scenario registry: display name + `previewImageUrl` or placeholder
4. **Play** — primary CTA → `/play?...`

Keep landing brand styles; select can stay utilitarian.

## Scenario registry

```
ScenarioConfig {
  // existing fields…
  previewImageUrl?: string | null;
}
```

- `arena-01`: `previewImageUrl: null` until art is uploaded
- `teamSpawns.civilian`: add ≥1 east spawn (design already says Civilians east / Soldiers west)

## Skin ↔ team

| Team       | Skin id  |
| ---------- | -------- |
| `civilian` | `remy`   |
| `soldier`  | `swat-1` |

Changing team resets character to that team’s default skin if the current skin is invalid for the new team.

## Out of scope

- Image upload pipeline (field only)
- Multiplayer lobby / matchmaking (US-5)
- Extra maps (registry already supports more when added)
