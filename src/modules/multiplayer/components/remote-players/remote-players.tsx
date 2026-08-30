import type { SoldierSkinId } from '@/modules/soldiers';
import { LazyRemotePlayer } from '@/modules/multiplayer/components/remote-player';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';

interface RemotePlayersProps {}
/**
 * Renders one RemotePlayer per peer. Subscribes only to sessionId+skin so the
 * 20 Hz transform stream does not re-render this list (rigs read getState()).
 */
export function RemotePlayers(_props: RemotePlayersProps) {
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
            <LazyRemotePlayer
              key={sessionId}
              sessionId={sessionId}
              skinId={skinId}
            />
          );
        })}
    </>
  );
}
