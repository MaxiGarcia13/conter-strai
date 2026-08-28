const HANDOFF_SUFFIX = ':handoff';

function handoffKey(roomId: string): string {
  return `cs:room:${roomId}${HANDOFF_SUFFIX}`;
}

/** Set before a hard nav to `/play` so `pagehide` does not abandon the lobby seat. */
export function markPlayHandoff(roomId: string): void {
  sessionStorage.setItem(handoffKey(roomId), '1');
}

/** Returns true when a play handoff was pending (and clears the flag). */
export function consumePlayHandoff(roomId: string): boolean {
  const key = handoffKey(roomId);
  if (!sessionStorage.getItem(key)) {
    return false;
  }
  sessionStorage.removeItem(key);
  return true;
}

export function navigateToPlay(roomId: string): void {
  markPlayHandoff(roomId);
  window.location.href = `/room/${roomId}/play`;
}
