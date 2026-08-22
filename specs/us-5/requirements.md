# US-5 — Playroom Kit multiplayer

## Requirements

| ID | Requirement |
|----|-------------|
| US-5.1 | Playroom init after Start Game (skipLobby) |
| US-5.2 | Sync player transforms (position, rotation) |
| US-5.3 | Sync health, eliminated state, and **team** (`argentina` \| `england`) |
| US-5.4 | RPC for shot events (shooter-authoritative) |
| US-5.5 | Remote soldiers rendered for other players |
| US-5.6 | Adapter pattern isolates Playroom from game modules |
| US-5.7 | Round state synced across clients (round start/end, team wipe) |
| US-5.8 | 2–8 players split across Argentina and England per match |

## Acceptance

Two+ browsers join same room, assigned to teams, fight with pistols until one team is eliminated; round resets and repeats.
