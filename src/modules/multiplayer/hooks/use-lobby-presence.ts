import { useEffect } from 'react';
import { abandonLobbySync } from '@/modules/multiplayer/services/abandon-lobby';

/** Abandon the lobby seat on tab close / leave; keep it when bfcache restores the page. */
export function useLobbyPresence(roomId: string, enabled = true): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function onPageHide(event: PageTransitionEvent) {
      // Caught for back/forward cache — the seat, session, and socket survive,
      // so the waiting/join page restores as-is instead of racing a fresh join.
      if (event.persisted) {
        return;
      }
      abandonLobbySync(roomId);
    }

    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [roomId, enabled]);
}
