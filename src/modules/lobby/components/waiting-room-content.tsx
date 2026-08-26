import { useState } from 'react';
import { CsButton } from '@/components/cs-button';
import { getScenarioById } from '@/modules/scenarios/get-scenario-by-id';
import { TEAM_DISPLAY_NAME } from '@/modules/teams';
import { useRoomSnapshot } from '../hooks/use-room-snapshot';
import { readRoomSession } from '../utils/room-session';
import { InviteShare } from './invite-share';
import { WaitingRoomSeats } from './waiting-room-seats';

interface WaitingRoomContentProps {
  roomId: string;
}

export function WaitingRoomContent({ roomId }: WaitingRoomContentProps) {
  const [session] = useState(() => readRoomSession(roomId));
  const snapshotQuery = useRoomSnapshot(session ? roomId : '', { poll: true });

  if (!session) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="font-mono text-sm tracking-widest uppercase text-foreground-muted">
          No session found for this room.
        </p>
        <CsButton href="/room" variant="secondary">
          Create a Room
        </CsButton>
      </div>
    );
  }

  const scenario = getScenarioById(snapshotQuery.data?.scenario ?? session.scenario);

  return (
    <div className="flex flex-1 flex-col gap-6">

      <div className="hud-corners border-surface-border p-4">
        <p className="font-mono text-xs tracking-[0.32em] uppercase text-foreground-muted">
          // Room
        </p>
        <p className="font-mono mt-2 text-2xl tracking-widest uppercase text-foreground">
          {roomId}
        </p>
      </div>

      <div className="border-surface-border border p-4">
        <p className="font-mono text-xs tracking-[0.32em] uppercase text-foreground-muted">
          // Your Details
        </p>
        <dl className="mt-3 space-y-2">
          <div className="flex justify-between">
            <dt className="font-mono text-xs tracking-widest uppercase text-foreground-muted">
              Role
            </dt>
            <dd className="font-mono text-xs tracking-widest uppercase text-foreground">
              {session.role}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-mono text-xs tracking-widest uppercase text-foreground-muted">
              Team
            </dt>
            <dd className="font-mono text-xs tracking-widest uppercase text-foreground">
              {TEAM_DISPLAY_NAME[session.team]}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-mono text-xs tracking-widest uppercase text-foreground-muted">
              Character
            </dt>
            <dd className="font-mono text-xs tracking-widest uppercase text-foreground">
              {session.skin}
            </dd>
          </div>
          {session.role === 'host' && (
            <div className="flex justify-between">
              <dt className="font-mono text-xs tracking-widest uppercase text-foreground-muted">
                Arena
              </dt>
              <dd className="font-mono text-xs tracking-widest uppercase text-foreground">
                {scenario.name}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="border-surface-border border p-4">
        <p className="font-mono text-xs tracking-[0.32em] uppercase text-foreground-muted">
          // Players
        </p>
        <WaitingRoomSeats
          snapshot={snapshotQuery.data}
          isPending={snapshotQuery.isPending}
          errorMessage={snapshotQuery.error?.message ?? null}
        />
      </div>

      <InviteShare roomId={roomId} />

      <div className="flex justify-end gap-4">
        {session.role === 'host' && (
          <CsButton href="/room" variant="secondary">
            Back
          </CsButton>
        )}
        <CsButton href={`/room/${roomId}/play`} variant="primary" className="min-w-50 justify-center">
          Play
        </CsButton>
      </div>
    </div>
  );
}
