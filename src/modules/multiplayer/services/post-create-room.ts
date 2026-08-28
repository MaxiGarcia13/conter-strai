import type { CreateRoomOptions, CreateRoomResponse, CreateRoomResult } from '../types';
import { ROOM_ID_LENGTH } from '@/modules/lobby/constants/room-id';
import {
  JSON_HEADERS,
  LOBBY_ROOM_COLLECTION_PATH,
  LobbyRestError,
  readErrorMessage,
  readJson,
} from './lobby-rest';

/** `POST /api/v1/room` — server generates the public room code + host token. */
export async function postCreateRoom(options: CreateRoomOptions): Promise<CreateRoomResult> {
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

  const created = readCreatedRoom(body);
  if (!created) {
    throw new LobbyRestError(500, 'Invalid create-room response');
  }
  return created;
}

export function readCreatedRoom(value: unknown): CreateRoomResult | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  const body = value as Partial<CreateRoomResponse>;
  if (typeof body.id !== 'string' || body.id.length !== ROOM_ID_LENGTH) {
    return null;
  }
  if (typeof body.hostToken !== 'string' || body.hostToken.length === 0) {
    return null;
  }
  return { roomId: body.id, hostToken: body.hostToken };
}
