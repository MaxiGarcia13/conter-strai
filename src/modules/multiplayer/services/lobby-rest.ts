export const LOBBY_ROOM_COLLECTION_PATH = '/api/v1/room';

export const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

export class LobbyRestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'LobbyRestError';
    this.status = status;
  }
}

export function lobbyRoomPath(roomId: string): string {
  return `${LOBBY_ROOM_COLLECTION_PATH}/${encodeURIComponent(roomId)}`;
}

export async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function readErrorMessage(body: unknown, fallback: string): string {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return fallback;
  }
  const error = (body as { error?: unknown }).error;
  return typeof error === 'string' && error.length > 0 ? error : fallback;
}
