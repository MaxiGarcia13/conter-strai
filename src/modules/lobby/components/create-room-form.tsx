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
import { SCENARIO_LIST } from '@/modules/scenarios/constants/scenarios';
import { TEAM_DISPLAY_NAME } from '@/modules/teams';
import { TEAM_SKINS } from '@/modules/teams/constants/team-skins';
import { generateRoomId } from '../utils/generate-room-id';
import { writeRoomSession } from '../utils/room-session';
import { ArenaPicker } from './arena-picker';
import { CharacterPicker } from './character-picker';
import { LazyCharacterPreview } from './lazy-character-preview';
import { TeamToggle } from './team-toggle';

export function CreateRoomForm() {
  const [team, setTeam] = useState<Team>(DEFAULT_TEAM);
  const [skinId, setSkinId] = useState<SoldierSkinId>(DEFAULT_PLAY_SKIN_ID);
  const [scenarioId, setScenarioId] = useState<ScenarioConfig['id']>(DEFAULT_SCENARIO_ID);

  function handleTeamChange(newTeam: Team) {
    setTeam(newTeam);
    setSkinId(TEAM_SKINS[newTeam][0]);
  }

  function handleCreate() {
    const roomId = generateRoomId();
    writeRoomSession(roomId, {
      team,
      skin: skinId,
      scenario: scenarioId,
      role: 'host',
    });
    window.location.href = `/room/${roomId}`;
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

        <CsButton type="button" onClick={handleCreate} className="mt-2 self-start">
          Create Room
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
