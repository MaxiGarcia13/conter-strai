import type { ClaimSeatResponse, SeatClaimOptions } from '../types';
import { decodeClaimSeatResponse } from '@/modules/multiplayer/adapters/decode-claim-seat-response';
import { JSON_HEADERS, LobbyRestError, lobbyRoomPath, readErrorMessage, readJson } from './lobby-rest';

/** `PUT /api/v1/room/{roomId}` — claim a lobby seat and reserve a Colyseus join. */
export async function putClaimSeat(
  roomId: string,
  options: SeatClaimOptions,
): Promise<ClaimSeatResponse> {
  const response = await fetch(lobbyRoomPath(roomId), {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(options),
  });

  const body: unknown = await readJson(response);
  if (response.status !== 200) {
    throw new LobbyRestError(
      response.status,
      readErrorMessage(body, 'Could not claim a seat'),
    );
  }

  const claimed = decodeClaimSeatResponse(body);
  if (!claimed) {
    throw new LobbyRestError(500, 'Invalid seat-claim response');
  }
  return claimed;
}
