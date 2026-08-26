import { describe, expect, it } from 'vitest';
import { decodeSeatClaim } from '@/modules/multiplayer/adapters/decode-seat-claim';

describe('decodeSeatClaim', () => {
  it('accepts a team with a matching skin', () => {
    expect(decodeSeatClaim({ team: 'civilian', skin: 'remy' })).toEqual({
      team: 'civilian',
      skin: 'remy',
    });
  });

  it('rejects missing team or skin', () => {
    expect(decodeSeatClaim({})).toBeNull();
    expect(decodeSeatClaim({ team: 'civilian' })).toBeNull();
    expect(decodeSeatClaim({ skin: 'remy' })).toBeNull();
  });

  it('rejects a skin from the other team', () => {
    expect(decodeSeatClaim({ team: 'civilian', skin: 'swat-1' })).toBeNull();
  });

  it('rejects invalid JSON shapes', () => {
    expect(decodeSeatClaim(null)).toBeNull();
    expect(decodeSeatClaim([])).toBeNull();
    expect(decodeSeatClaim('civilian')).toBeNull();
  });
});
