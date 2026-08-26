import { CreateRoomFields } from './create-room-fields';
import { LobbyQueryProvider } from './lobby-query-provider';

export function CreateRoomForm() {
  return (
    <LobbyQueryProvider>
      <CreateRoomFields />
    </LobbyQueryProvider>
  );
}
