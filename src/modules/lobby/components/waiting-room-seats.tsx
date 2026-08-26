import type { RoomSnapshot } from '@/modules/multiplayer/types';
import { TEAM_DISPLAY_NAME, TEAMS } from '@/modules/teams';

interface WaitingRoomSeatsProps {
  snapshot: RoomSnapshot | undefined;
  isPending: boolean;
  errorMessage: string | null;
}

export function WaitingRoomSeats({
  snapshot,
  isPending,
  errorMessage,
}: WaitingRoomSeatsProps) {
  if (errorMessage) {
    return (
      <p role="alert" className="font-mono mt-3 text-xs tracking-widest text-danger">
        {errorMessage}
      </p>
    );
  }

  if (isPending && !snapshot) {
    return (
      <p className="font-mono mt-3 text-xs tracking-widest uppercase text-foreground-muted">
        Loading seats…
      </p>
    );
  }

  if (!snapshot) {
    return (
      <p className="font-mono mt-3 text-xs tracking-widest uppercase text-foreground">
        Waiting for players…
      </p>
    );
  }

  return (
    <dl className="mt-3 space-y-2">
      {TEAMS.map((team) => {
        const seats = snapshot.teams[team];
        return (
          <div key={team} className="flex justify-between">
            <dt className="font-mono text-xs tracking-widest uppercase text-foreground-muted">
              {TEAM_DISPLAY_NAME[team]}
            </dt>
            <dd className="font-mono text-xs tracking-widest uppercase text-foreground">
              {seats.count}
              {' / '}
              {seats.max}
              {seats.open ? '' : ' — full'}
            </dd>
          </div>
        );
      })}
      <div className="flex justify-between">
        <dt className="font-mono text-xs tracking-widest uppercase text-foreground-muted">
          Join
        </dt>
        <dd className="font-mono text-xs tracking-widest uppercase text-foreground">
          {snapshot.canJoin ? 'Open' : 'Closed'}
        </dd>
      </div>
    </dl>
  );
}
