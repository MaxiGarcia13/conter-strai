# US-7 — Match lobby (create / join / wait)

Local-first pre-play lobby. No Colyseus yet — create/join/waiting work solo; remote players arrive in US-5.

## Requirements

| ID      | Requirement                                                                                                                                                                      |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-7.1  | Landing replaces **Start Game** with **Create Room** → `/create` and **Join Room** → `/join` (not straight to `/play`)                                                           |
| US-7.2  | `/create` lets the player choose **arena**, **team** (Civilian \| Soldier), and **avatar**                                                                                       |
| US-7.3  | `/create` lists characters for the chosen team (`remy` / `james` / `liza` civilian; `swat-1` / `swat-2` / `swat-3` soldier) and shows a **3D idle preview** of the selected skin |
| US-7.4  | `/create` lists arenas from the scenario registry as **cards** (name + optional preview image; placeholder if none)                                                              |
| US-7.5  | **Create Room** navigates to `/lobby?mode=create&room=&team=&skin=&scenario=` with a generated local room id                                                                     |
| US-7.6  | `/join` accepts a **room code**, **team**, and **avatar** (no arena pick — host arena synced later in US-5)                                                                      |
| US-7.7  | `/join?room=` prefills the room code from an invite link                                                                                                                         |
| US-7.8  | **Join Room** navigates to `/lobby?mode=join&room=&team=&skin=` (local-only; `scenario` defaults until host sync)                                                                |
| US-7.9  | `/lobby` shows room id, local player summary, waiting copy / empty slots (no remote players until US-5)                                                                          |
| US-7.10 | `/lobby` shows a **shareable invite URL** (readonly input + **Copy**) pointing at `/join?room=<id>`                                                                              |
| US-7.11 | `/lobby` shows a **QR code** encoding the same invite URL (client-side)                                                                                                          |
| US-7.12 | Lobby **Play** navigates to `/play?team=&skin=&scenario=` with the chosen session                                                                                                |
| US-7.13 | `/play` boots that scenario, skin, and team spawn (no hardcoded soldier-only spawn)                                                                                              |
| US-7.14 | `arena-01` has at least one **civilian** spawn so civilian pick is playable                                                                                                      |
| US-7.15 | Scenario config supports optional `previewImageUrl` for arena cards (nullable until art exists)                                                                                  |

## Acceptance

- Create path: landing → `/create` → `/lobby` → `/play` loads chosen team / skin / arena; character preview animates idle; civilian and soldier picks both spawn in `arena-01`.
- Lobby shows copyable invite link + QR for `/join?room=<id>`.
- Join path: landing → `/join` (or invite URL) → `/lobby` alone → **Play** starts solo; no Colyseus required.
