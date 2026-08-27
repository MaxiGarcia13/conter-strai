import type { MatchHandle } from './types';

let activeMatch: MatchHandle | null = null;

export function getActiveMatch(): MatchHandle | null {
  return activeMatch;
}

export function setActiveMatch(match: MatchHandle | null): void {
  activeMatch = match;
}

export function requireActiveMatch(): MatchHandle {
  const match = activeMatch;
  if (!match) {
    throw new Error('No active Colyseus match — call initMatch first');
  }
  return match;
}
