import type { CreateRoomOptions, RoomSnapshot } from '../types';

const CREATE_ROOM_PATH = '/api/v1/room';
const ROOM_ID_LENGTH = 6;

export class LobbyRestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'LobbyRestError';
    this.status = status;
  }
}

/** `POST /api/v1/room` — server generates the public room code. */
export async function postCreateRoom(options: CreateRoomOptions): Promise<string> {
  const response = await fetch(CREATE_ROOM_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });

  const body: unknown = await readJson(response);
  if (response.status !== 201) {
    throw new LobbyRestError(
      response.status,
      readErrorMessage(body, 'Could not create room'),
    );
  }

  const roomId = readCreatedRoomId(body);
  if (!roomId) {
    throw new LobbyRestError(500, 'Invalid create-room response');
  }
  return roomId;
}

export function readCreatedRoomId(value: unknown): string | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  const id = (value as Partial<RoomSnapshot>).id;
  if (typeof id !== 'string' || id.length !== ROOM_ID_LENGTH) {
    return null;
  }
  return id;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function readErrorMessage(body: unknown, fallback: string): string {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return fallback;
  }
  const error = (body as { error?: unknown }).error;
  return typeof error === 'string' && error.length > 0 ? error : fallback;
}
