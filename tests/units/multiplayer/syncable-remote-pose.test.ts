import { describe, expect, it } from 'vitest';
import {
  isRemotePoseMessage,
  SYNCABLE_REMOTE_POSES,
  toRemoteClipMessage,
  toRemotePoseMessage,
} from '@/modules/multiplayer/utils/syncable-remote-pose';

describe('syncable-remote-pose', () => {
  it('passes through every syncable pose', () => {
    for (const pose of SYNCABLE_REMOTE_POSES) {
      expect(toRemotePoseMessage(pose)).toBe(pose);
    }
  });

  it('maps authority poses to clear', () => {
    expect(toRemotePoseMessage(null)).toBe('clear');
    expect(toRemotePoseMessage('dying')).toBe('clear');
    expect(toRemotePoseMessage('hitReaction')).toBe('clear');
  });

  it('relays the same clip the local mixer would play', () => {
    expect(toRemoteClipMessage('kneel', 'idle')).toBe('kneel');
    expect(toRemoteClipMessage('kneel', 'walk')).toBe('crouchWalking');
    expect(toRemoteClipMessage('kneel', 'walkBackward')).toBe('crouchWalking');
    expect(toRemoteClipMessage('kneel', 'run')).toBe('run');
    expect(toRemoteClipMessage(null, 'walkBackward')).toBe('walkBackward');
    expect(toRemoteClipMessage(null, 'runBackward')).toBe('runBackward');
    expect(toRemoteClipMessage('jumpIdle', 'idle')).toBe('jumpIdle');
    expect(toRemoteClipMessage('jump', 'walk')).toBe('jump');
    expect(toRemoteClipMessage('dying', 'idle')).toBe('clear');
  });

  it('validates relay payloads on the server', () => {
    expect(isRemotePoseMessage('jump')).toBe(true);
    expect(isRemotePoseMessage('crouchWalking')).toBe(true);
    expect(isRemotePoseMessage('walkBackward')).toBe(true);
    expect(isRemotePoseMessage('reloadingKneel')).toBe(true);
    expect(isRemotePoseMessage('clear')).toBe(true);
    expect(isRemotePoseMessage('dying')).toBe(false);
    expect(isRemotePoseMessage(undefined)).toBe(false);
  });
});
