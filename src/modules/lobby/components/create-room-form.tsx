import type { ScenarioConfig } from '@/modules/scenarios';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';
import { useState } from 'react';
import { CsButton } from '@/components/cs-button';
import {
  DEFAULT_PLAY_SKIN_ID,
  DEFAULT_SCENARIO_ID,
  DEFAULT_TEAM,
} from '@/modules/game/constants/play-defaults';
import { postCreateRoom } from '@/modules/multiplayer/services/post-create-room';
import { SCENARIO_LIST } from '@/modules/scenarios/constants/scenarios';
import { TEAM_DISPLAY_NAME } from '@/modules/teams';
import { TEAM_SKINS } from '@/modules/teams/constants/team-skins';
import { writeRoomSession } from '../utils/room-session';
import { ArenaPicker } from './arena-picker';
import { CharacterPicker } from './character-picker';
import { LazyCharacterPreview } from './lazy-character-preview';
import { TeamToggle } from './team-toggle';

export function CreateRoomForm() {
  const [team, setTeam] = useState<Team>(DEFAULT_TEAM);
  const [skinId, setSkinId] = useState<SoldierSkinId>(DEFAULT_PLAY_SKIN_ID);
  const [scenarioId, setScenarioId] = useState<ScenarioConfig['id']>(DEFAULT_SCENARIO_ID);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTeamChange(newTeam: Team) {
    setTeam(newTeam);
    setSkinId(TEAM_SKINS[newTeam][0]);
  }

  async function handleCreate() {
    if (pending) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const roomId = await postCreateRoom({
        team,
        skin: skinId,
        scenario: scenarioId,
      });
      writeRoomSession(roomId, {
        team,
        skin: skinId,
        scenario: scenarioId,
        role: 'host',
      });
      window.location.href = `/room/${roomId}`;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create room');
      setPending(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-8 lg:flex-row">
      <div className="flex flex-1 flex-col gap-6">
        <TeamToggle team={team} onChange={handleTeamChange} />
        <CharacterPicker
          skinIds={TEAM_SKINS[team]}
          selectedId={skinId}
          onSelect={setSkinId}
        />
        <ArenaPicker
          scenarios={SCENARIO_LIST}
          selectedId={scenarioId}
          onSelect={setScenarioId}
        />

        {error && (
          <p role="alert" className="font-mono text-xs tracking-widest text-danger">
            {error}
          </p>
        )}

        <CsButton
          type="button"
          onClick={handleCreate}
          disabled={pending}
          aria-busy={pending}
          className="mt-2 self-start"
        >
          {pending ? 'Creating…' : 'Create Room'}
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
