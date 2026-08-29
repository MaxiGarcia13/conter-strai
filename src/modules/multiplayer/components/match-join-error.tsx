import { CsButton } from '@/components/cs-button';
import { clearRoomSession } from '@/modules/lobby/utils/room-session';

interface MatchJoinErrorProps {
  roomId?: string;
  message: string;
}

/** Full-screen join/reconnect failure with an escape hatch back to create-room. */
export function MatchJoinError({ roomId, message }: MatchJoinErrorProps) {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <p
        role="alert"
        className="font-mono max-w-md text-sm tracking-widest text-danger uppercase"
      >
        {message}
      </p>
      <CsButton
        type="button"
        variant="primary"
        onClick={() => {
          if (roomId) {
            clearRoomSession(roomId);
          }
          window.location.href = '/room';
        }}
      >
        Create a Room
      </CsButton>
    </div>
  );
}
