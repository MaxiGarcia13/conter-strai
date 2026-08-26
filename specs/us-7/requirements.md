# US-7 — Match lobby (create / join / wait)

Local-first pre-play lobby. No Colyseus yet — create/join/waiting work solo; remote players arrive in US-5.

Product routes are room-centric. Legacy `/play?skin=` remains for e2e/dev probes until Playwright migrates.

## Requirements

| ID      | Requirement                                                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| US-7.1  | Landing replaces **Start Game** with **Create Room** → `/room` and **Join Room** → `/room/join` — not straight to play; room id is entered on the join page                    |
| US-7.2  | `/room` lets the player choose **arena**, **team** (Civilian \| Soldier), and **avatar**                                                                                       |
| US-7.3  | `/room` lists characters for the chosen team (`remy` / `james` / `liza` civilian; `swat-1` / `swat-2` / `swat-3` soldier) and shows a **3D idle preview** of the selected skin |
| US-7.4  | `/room` lists arenas from the scenario registry as **cards** (name + optional preview image; placeholder if none)                                                              |
| US-7.5  | **Create Room** stores session in `sessionStorage` for the new id and navigates to `/room/{roomId}` (waiting)                                                                  |
| US-7.6  | `/room/join` and `/room/{roomId}/join` let the player set **room id**, **team**, and **avatar** (no arena pick — host arena synced later in US-5)                              |
| US-7.7  | Landing **Join Room** → `/room/join` (enter room id). Invite → `/room/{roomId}/join` (id in the path, shown on the page). No `?room=` query                                    |
| US-7.8  | After join picks, store session and navigate to `/room/{roomId}` (waiting; local-only; scenario defaults until host sync)                                                      |
| US-7.9  | `/room/{roomId}` shows room id, local player summary, waiting copy / empty slots (no remote players until US-5)                                                                |
| US-7.10 | `/room/{roomId}` shows a **shareable invite URL** (readonly input + **Copy**) pointing at `/room/{roomId}/join`                                                                |
| US-7.11 | `/room/{roomId}` shows a **QR code** encoding the same invite URL (client-side)                                                                                                |
| US-7.12 | Waiting **Play** navigates to `/room/{roomId}/play` and boots from `sessionStorage` for that room                                                                              |
| US-7.13 | `/room/{roomId}/play` boots scenario, skin, and team spawn from session (defaults + team↔skin consistency if missing)                                                          |
| US-7.14 | `arena-01` has at least one **civilian** spawn so civilian pick is playable                                                                                                    |
| US-7.15 | Scenario config supports optional `previewImageUrl` for arena cards (nullable until art exists)                                                                                |
| US-7.16 | Legacy `/play` (and `/play?skin=`) remains available for e2e/dev until Playwright uses room routes; product CTAs use only `/room/.../play`                                     |

## Acceptance

- Create path: landing → `/room` → `/room/{id}` → `/room/{id}/play` loads chosen team / skin / arena; character preview animates idle; civilian and soldier picks both spawn in `arena-01`.
- Waiting shows copyable invite link + QR for `/room/{id}/join`.
- Join path: landing → `/room/join` (enter id) or invite → `/room/{id}/join` → `/room/{id}` alone → **Play** starts solo; no Colyseus required.
