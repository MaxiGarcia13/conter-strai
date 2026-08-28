import { JSON_HEADERS, LobbyRestError, lobbyRoomPath, readErrorMessage, readJson } from './lobby-rest';

/** `DELETE /api/v1/room/{roomId}` — host disposes the Colyseus match. */
export async function deleteRoom(roomId: string, hostToken?: string): Promise<void> {
  // JSON Content-Type (no body): Astro CSRF only hard-blocks form-like / bare
  // mutating requests when Origin ≠ request URL origin (common behind TLS proxies).
  const headers: Record<string, string> = { ...JSON_HEADERS };
  if (hostToken) {
    headers.Authorization = `Bearer ${hostToken}`;
  }
  const response = await fetch(lobbyRoomPath(roomId), {
    method: 'DELETE',
    headers,
  });
  if (response.status === 204) {
    return;
  }

  const body: unknown = await readJson(response);
  throw new LobbyRestError(
    response.status,
    readErrorMessage(body, 'Could not close room'),
  );
}
