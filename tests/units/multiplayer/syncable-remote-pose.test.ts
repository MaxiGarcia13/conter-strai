import { describe, expect, it } from 'vitest';
import {
  isRemotePoseMessage,
  SYNCABLE_REMOTE_POSES,
  toRemotePoseMessage,
} from '@/modules/multiplayer/utils/syncable-remote-pose';

describe('syncable-remote-pose', () => {
  it('passes through every syncable pose', () => {
    for (const pose of SYNCABLE_REMOTE_POSES) {
      expect(toRemotePoseMessage(pose)).toBe(pose);
    }
  });

  it('maps authority and inferred poses to clear', () => {
    expect(toRemotePoseMessage(null)).toBe('clear');
    expect(toRemotePoseMessage('dying')).toBe('clear');
    expect(toRemotePoseMessage('hitReaction')).toBe('clear');
    expect(toRemotePoseMessage('crouchWalking')).toBe('clear');
  });

  it('validates relay payloads on the server', () => {
    expect(isRemotePoseMessage('jump')).toBe(true);
    expect(isRemotePoseMessage('reloadingKneel')).toBe(true);
    expect(isRemotePoseMessage('clear')).toBe(true);
    expect(isRemotePoseMessage('dying')).toBe(false);
    expect(isRemotePoseMessage(undefined)).toBe(false);
  });
});
