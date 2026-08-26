import type { ScenarioConfig } from '@/modules/scenarios';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';

import { useState } from 'react';
import { CsButton } from '@/components/cs-button';
import { scenarios } from '@/modules/scenarios/scenario-registry';
import { TEAM_DISPLAY_NAME } from '@/modules/teams';
import { TEAM_SKINS } from '../types/team-skins';
import { generateRoomId } from '../utils/generate-room-id';
import { ArenaPicker } from './arena-picker';
import { CharacterPicker } from './character-picker';
import { CharacterPreview } from './character-preview';
import { TeamToggle } from './team-toggle';

const SCENARIO_LIST = Object.values(scenarios);

export function CreateRoomForm() {
  const [team, setTeam] = useState<Team>('civilian');
  const [skinId, setSkinId] = useState<SoldierSkinId>('remy');
  const [scenarioId, setScenarioId] = useState<ScenarioConfig['id']>('arena-01');

  function handleTeamChange(newTeam: Team) {
    setTeam(newTeam);
    setSkinId(TEAM_SKINS[newTeam][0]);
  }

  function handleCreate() {
    const roomId = generateRoomId();
    const params = new URLSearchParams({
      mode: 'create',
      room: roomId,
      team,
      skin: skinId,
      scenario: scenarioId,
    });
    window.location.href = `/lobby?${params.toString()}`;
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
          <CharacterPreview skinId={skinId} />
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
