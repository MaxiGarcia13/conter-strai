import type { CreateRoomOptions, RoomSnapshot } from '../types';
import { ROOM_ID_LENGTH } from '@/modules/lobby/constants/room-id';
import {
  JSON_HEADERS,
  LOBBY_ROOM_COLLECTION_PATH,
  LobbyRestError,
  readErrorMessage,
  readJson,
} from './lobby-rest';

/** `POST /api/v1/room` — server generates the public room code. */
export async function postCreateRoom(options: CreateRoomOptions): Promise<string> {
  const response = await fetch(LOBBY_ROOM_COLLECTION_PATH, {
    method: 'POST',
    headers: JSON_HEADERS,
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
