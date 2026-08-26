import { JoinRoomFields } from './join-room-fields';
import { LobbyQueryProvider } from './lobby-query-provider';

interface JoinRoomFormProps {
  roomId?: string;
}

export function JoinRoomForm({ roomId }: JoinRoomFormProps) {
  return (
    <LobbyQueryProvider>
      <JoinRoomFields roomId={roomId} />
    </LobbyQueryProvider>
  );
}
