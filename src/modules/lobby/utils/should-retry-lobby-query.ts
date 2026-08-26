import { LobbyRestError } from '@/modules/multiplayer/services/lobby-rest';

/** Client 4xx is user-facing (404/409); retry only transport / 5xx. */
export function shouldRetryLobbyQuery(failureCount: number, error: Error): boolean {
  if (error instanceof LobbyRestError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 1;
}
