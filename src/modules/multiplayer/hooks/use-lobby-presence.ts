import { useEffect } from 'react';
import { abandonLobbySync } from '@/modules/multiplayer/services/abandon-lobby';

/** Abandon the lobby seat on tab close, browser back, or other page unload. */
export function useLobbyPresence(roomId: string, enabled = true): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function onPageHide() {
      abandonLobbySync(roomId);
    }

    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [roomId, enabled]);
}
