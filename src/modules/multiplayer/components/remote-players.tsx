import type { SoldierSkinId } from '@/modules/soldiers';
import { useMultiplayerStore } from '../stores/multiplayer-store';
import { RemotePlayer } from './remote-player';

/**
 * Renders one RemotePlayer per peer. Subscribes only to sessionId+skin so the
 * 20 Hz transform stream does not re-render this list (rigs read getState()).
 */
export function RemotePlayers() {
  const roster = useMultiplayerStore((state) =>
    Object.values(state.remotePlayers)
      .map((player) => `${player.sessionId}:${player.skin}`)
      .sort()
      .join(','),
  );

  return (
    <>
      {roster
        .split(',')
        .filter(Boolean)
        .map((entry) => {
          const [sessionId, skinId] = entry.split(':') as [string, SoldierSkinId];
          return (
            <RemotePlayer
              key={sessionId}
              sessionId={sessionId}
              skinId={skinId}
            />
          );
        })}
    </>
  );
}
