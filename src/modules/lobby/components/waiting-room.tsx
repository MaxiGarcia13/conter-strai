import { LobbyQueryProvider } from './lobby-query-provider';
import { WaitingRoomContent } from './waiting-room-content';

interface WaitingRoomProps {
  roomId: string;
}

export function WaitingRoom({ roomId }: WaitingRoomProps) {
  return (
    <LobbyQueryProvider>
      <WaitingRoomContent roomId={roomId} />
    </LobbyQueryProvider>
  );
}
