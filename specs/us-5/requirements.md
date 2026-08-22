# US-5 — Playroom Kit multiplayer

## Requirements

| ID | Requirement |
|----|-------------|
| US-5.1 | Playroom init after Start Game (skipLobby) |
| US-5.2 | Sync player transforms (position, rotation) |
| US-5.3 | Sync health and eliminated state |
| US-5.4 | RPC for shot events (shooter-authoritative) |
| US-5.5 | Remote soldiers rendered for other players |
| US-5.6 | Adapter pattern isolates Playroom from game modules |

## Acceptance

Two browsers join same room, see each other move, shoot, take damage, eliminate.
