# US-8 — Tasks

Ship **after US-5** (shipped). Tick only when the matching requirement passes.

See [`design.md`](./design.md) and [`requirements.md`](./requirements.md).

## Origin guard (US-8.1)

- [x] Add `requireSameSiteOrigin(request)` (or equivalent) under `src/modules/multiplayer/utils/`
- [x] Wire into `POST` / `PUT` / `DELETE` lobby handlers; leave `GET` unrestricted for invite snapshot
- [x] Return `403` when Origin/Referer host does not match `SITE` / request host

## Host token (US-8.2 / US-8.3)

- [x] Generate opaque `hostToken` on `POST /api/v1/room`; persist in Colyseus room metadata
- [x] Include `hostToken` in create response (not in public Schema state)
- [x] Persist `hostToken` on client `RoomSession` after create
- [x] `DELETE /api/v1/room/{id}` requires `Authorization: Bearer <hostToken>` (`401` missing, `403` mismatch)
- [x] Update `delete-room` client service + host Close Room UI to send the bearer token

## Shot validation (US-8.5)

- [x] In `MatchRoom` `shot` handler: enforce phase, shooter/target alive, opposing team
- [x] Enforce pistol max range from shooter↔target Schema positions
- [x] Enforce per-shooter fire-rate cooldown
- [x] Accept `zone` only from `{ head, body, limb }`; apply damage via `applyDamage`
- [x] Do **not** port Three.js / `pick-bullet-hit` raycast to the server in this US

## Move validation (US-8.6)

- [x] Track last accepted position per player in `MatchRoom`
- [x] Reject or clamp `move` messages that exceed max delta / speed threshold
- [x] Ignore `move` when phase or player invalid (already partially present — harden)

## Room code TTL (US-8.9 / US-8.11)

- [x] Set `metadata.expiresAt` on create from `ROOM_CODE_TTL_MS` (default 40 min); renew on host `startRound`
- [x] Expose `expiresAt` on `RoomSnapshot` / create + get adapters
- [x] Schedule auto-dispose in `MatchRoom.onCreate`; clear timer in `onDispose`
- [x] Shared expiry check: REST returns `410 Gone` for expired rooms; reject late WS join
- [x] Document `ROOM_CODE_TTL_MS` in `.env.example` (if present) / design env table

## Verification (US-8.8)

- [x] Unit: origin guard rejects mismatched Origin
- [x] Unit: `deleteRoom` / dispose handler rejects missing or wrong `hostToken`
- [x] Unit: shot helper / room logic ignores friendly-fire (and preferably out-of-range or cooldown)
- [x] Unit: expiry helper + snapshot includes `expiresAt`
- [x] E2e or API test: create → DELETE without token fails; with host token succeeds
- [x] E2e or API test: expired room (short TTL in test env) returns `410`

## Do not

- Implement API-key proxies or `PUBLIC_*` audits
- Add HttpOnly cookie sessions or user accounts
- Add in-app IP rate limiting (deferred)
- Require reservation-only join as a separate hardening pass (US-5 wiring only)
- Port client hitscan geometry to Colyseus
