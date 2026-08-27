import { useMultiplayerStore } from '../stores/multiplayer-store';
import { RemotePlayer } from './remote-player';

/** Renders one RemotePlayer per connected peer, mounting/unmounting on join/leave. */
export function RemotePlayers() {
  const ids = useMultiplayerStore((state) => Object.keys(state.remotePlayers).join(','));

  return (
    <>
      {ids
        .split(',')
        .filter(Boolean)
        .map((sessionId) => (
          <RemotePlayer key={sessionId} sessionId={sessionId} />
        ))}
    </>
  );
}
