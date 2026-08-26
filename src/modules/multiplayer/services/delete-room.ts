import { LobbyRestError, lobbyRoomPath, readErrorMessage, readJson } from './lobby-rest';

/** `DELETE /api/v1/room/{roomId}` — host disposes the Colyseus match. */
export async function deleteRoom(roomId: string): Promise<void> {
  const response = await fetch(lobbyRoomPath(roomId), { method: 'DELETE' });
  if (response.status === 204) {
    return;
  }

  const body: unknown = await readJson(response);
  throw new LobbyRestError(
    response.status,
    readErrorMessage(body, 'Could not close room'),
  );
}
