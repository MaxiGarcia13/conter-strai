import process from 'node:process';

function resolveRoomCodeTtl(): number {
  const fromEnv = Number(process.env.ROOM_CODE_TTL_MS);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 2_400_000;
}

/** Time-to-live for a room code from create / round restart (ms). Default: 40 minutes. */
export const ROOM_CODE_TTL_MS = resolveRoomCodeTtl();
