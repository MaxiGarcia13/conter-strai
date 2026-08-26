import type { SeatClaimOptions } from '@/modules/multiplayer/types';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { CsButton } from '@/components/cs-button';
import {
  DEFAULT_PLAY_SKIN_ID,
  DEFAULT_ROOM_ROLE,
  DEFAULT_SCENARIO_ID,
  DEFAULT_TEAM,
} from '@/modules/game/constants/play-defaults';
import { joinRoom } from '@/modules/multiplayer/services/join-room';
import { getScenarioById } from '@/modules/scenarios/get-scenario-by-id';
import { TEAM_DISPLAY_NAME } from '@/modules/teams';
import { TEAM_SKINS } from '@/modules/teams/constants/team-skins';
import { ROOM_ID_LENGTH } from '../constants/room-id';
import { useRoomSnapshot } from '../hooks/use-room-snapshot';
import { writeRoomSession } from '../utils/room-session';
import { CharacterPicker } from './character-picker';
import { LazyCharacterPreview } from './lazy-character-preview';
import { TeamToggle } from './team-toggle';

interface JoinRoomFieldsProps {
  roomId?: string;
}

function normalizeRoomId(value: string) {
  return value.replaceAll(/[^a-z0-9]/gi, '').slice(0, ROOM_ID_LENGTH).toUpperCase();
}

export function JoinRoomFields({ roomId: initialRoomId }: JoinRoomFieldsProps) {
  const roomIdLocked = Boolean(initialRoomId);
  const [roomId, setRoomId] = useState(initialRoomId ?? '');
  const [team, setTeam] = useState<Team>(DEFAULT_TEAM);
  const [skinId, setSkinId] = useState<SoldierSkinId>(DEFAULT_PLAY_SKIN_ID);
  const lockedRoomId = roomIdLocked ? normalizeRoomId(initialRoomId ?? '') : '';
  const snapshotQuery = useRoomSnapshot(lockedRoomId);
  const join = useMutation({
    mutationFn: ({ id, claim }: { id: string; claim: SeatClaimOptions }) =>
      joinRoom(id, claim),
  });

  function handleTeamChange(newTeam: Team) {
    setTeam(newTeam);
    setSkinId(TEAM_SKINS[newTeam][0]);
  }

  async function handleJoin() {
    const id = normalizeRoomId(roomId);
    if (!id || join.isPending) {
      return;
    }
    try {
      const claimed = await join.mutateAsync({
        id,
        claim: { team, skin: skinId },
      });
      writeRoomSession(id, {
        team,
        skin: skinId,
        scenario: claimed.snapshot.scenario ?? snapshotQuery.data?.scenario ?? DEFAULT_SCENARIO_ID,
        role: DEFAULT_ROOM_ROLE,
        reservation: claimed.reservation,
      });
      window.location.href = `/room/${id}`;
    } catch {
      // Error surface is `join.error`.
    }
  }

  const scenarioId = snapshotQuery.data?.scenario ?? DEFAULT_SCENARIO_ID;
  const arenaName = getScenarioById(scenarioId).name;
  const error = join.error ?? snapshotQuery.error;

  return (
    <div className="flex flex-1 flex-col gap-8 lg:flex-row">
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <label
            htmlFor="room-id"
            className="mb-3 block font-mono text-xs tracking-widest uppercase text-foreground-muted"
          >
            Room id
          </label>
          <input
            id="room-id"
            name="roomId"
            type="text"
            value={roomId}
            onChange={(event) => setRoomId(normalizeRoomId(event.target.value))}
            maxLength={ROOM_ID_LENGTH}
            readOnly={roomIdLocked}
            required
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="characters"
            autoFocus={!roomIdLocked}
            placeholder="ABC123"
            className="w-full border border-surface-border bg-surface px-3 py-2.5 font-mono text-sm tracking-widest uppercase text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none read-only:text-accent"
          />
        </div>

        <TeamToggle team={team} onChange={handleTeamChange} />
        <CharacterPicker
          skinIds={TEAM_SKINS[team]}
          selectedId={skinId}
          onSelect={setSkinId}
        />

        <p className="font-mono text-xs tracking-widest uppercase text-foreground-muted">
          {roomIdLocked ? arenaName : 'Host arena — synced on join'}
        </p>

        {error && (
          <p role="alert" className="font-mono text-xs tracking-widest text-danger">
            {error.message}
          </p>
        )}

        <CsButton
          type="button"
          onClick={handleJoin}
          disabled={!normalizeRoomId(roomId) || join.isPending}
          aria-busy={join.isPending}
          className="mt-2 self-start"
        >
          {join.isPending ? 'Joining…' : 'Join Room'}
        </CsButton>
      </div>

      <div className="flex flex-1 flex-col items-center gap-4">
        <div className="hud-corners aspect-square w-full max-w-md overflow-hidden bg-surface">
          <LazyCharacterPreview skinId={skinId} />
        </div>
        <p className="font-mono text-xs tracking-widest uppercase text-foreground-muted">
          {skinId}
          {' — '}
          {TEAM_DISPLAY_NAME[team]}
        </p>
      </div>
    </div>
  );
}
