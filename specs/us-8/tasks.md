# US-8 — Tasks

Ship **after US-5** (shipped). Tick only when the matching requirement passes.

See [`design.md`](./design.md) and [`requirements.md`](./requirements.md).

## Origin guard (US-8.1)

- [ ] Add `requireSameSiteOrigin(request)` (or equivalent) under `src/modules/multiplayer/utils/`
- [ ] Wire into `POST` / `PUT` / `DELETE` lobby handlers; leave `GET` unrestricted for invite snapshot
- [ ] Return `403` when Origin/Referer host does not match `SITE` / request host

## Host token (US-8.2 / US-8.3)

- [ ] Generate opaque `hostToken` on `POST /api/v1/room`; persist in Colyseus room metadata
- [ ] Include `hostToken` in create response (not in public Schema state)
- [ ] Persist `hostToken` on client `RoomSession` after create
- [ ] `DELETE /api/v1/room/{id}` requires `Authorization: Bearer <hostToken>` (`401` missing, `403` mismatch)
- [ ] Update `delete-room` client service + host Close Room UI to send the bearer token

## Shot validation (US-8.5)

- [ ] In `MatchRoom` `shot` handler: enforce phase, shooter/target alive, opposing team
- [ ] Enforce pistol max range from shooter↔target Schema positions
- [ ] Enforce per-shooter fire-rate cooldown
- [ ] Accept `zone` only from `{ head, body, limb }`; apply damage via `applyDamage`
- [ ] Do **not** port Three.js / `pick-bullet-hit` raycast to the server in this US

## Move validation (US-8.6)

- [ ] Track last accepted position per player in `MatchRoom`
- [ ] Reject or clamp `move` messages that exceed max delta / speed threshold
- [ ] Ignore `move` when phase or player invalid (already partially present — harden)

## Room code TTL (US-8.9 / US-8.11)

- [ ] Set `metadata.expiresAt` on create from `ROOM_CODE_TTL_MS` (default 4 h)
- [ ] Expose `expiresAt` on `RoomSnapshot` / create + get adapters
- [ ] Schedule auto-dispose in `MatchRoom.onCreate`; clear timer in `onDispose`
- [ ] Shared expiry check: REST returns `410 Gone` for expired rooms; reject late WS join
- [ ] Document `ROOM_CODE_TTL_MS` in `.env.example` (if present) / design env table

## Verification (US-8.8)

- [ ] Unit: origin guard rejects mismatched Origin
- [ ] Unit: `deleteRoom` / dispose handler rejects missing or wrong `hostToken`
- [ ] Unit: shot helper / room logic ignores friendly-fire (and preferably out-of-range or cooldown)
- [ ] Unit: expiry helper + snapshot includes `expiresAt`
- [ ] E2e or API test: create → DELETE without token fails; with host token succeeds
- [ ] E2e or API test: expired room (short TTL in test env) returns `410`

## Do not

- Implement API-key proxies or `PUBLIC_*` audits
- Add HttpOnly cookie sessions or user accounts
- Add in-app IP rate limiting (deferred)
- Require reservation-only join as a separate hardening pass (US-5 wiring only)
- Port client hitscan geometry to Colyseus
