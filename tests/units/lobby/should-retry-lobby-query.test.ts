import { describe, expect, it } from 'vitest';
import { shouldRetryLobbyQuery } from '@/modules/lobby/utils/should-retry-lobby-query';
import { LobbyRestError } from '@/modules/multiplayer/services/lobby-rest';

describe('shouldRetryLobbyQuery', () => {
  it('does not retry client 4xx lobby errors', () => {
    expect(shouldRetryLobbyQuery(0, new LobbyRestError(404, 'Room not found'))).toBe(false);
    expect(shouldRetryLobbyQuery(0, new LobbyRestError(409, 'Team is full'))).toBe(false);
  });

  it('retries once on transport or 5xx errors', () => {
    expect(shouldRetryLobbyQuery(0, new LobbyRestError(503, 'Matchmaker not ready'))).toBe(true);
    expect(shouldRetryLobbyQuery(0, new Error('Failed to fetch'))).toBe(true);
    expect(shouldRetryLobbyQuery(1, new Error('Failed to fetch'))).toBe(false);
  });
});
