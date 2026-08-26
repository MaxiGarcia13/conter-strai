import type { ScenarioConfig } from '@/modules/scenarios';

import { ArenaCard } from './arena-card';

interface ArenaPickerProps {
  scenarios: ScenarioConfig[];
  selectedId: ScenarioConfig['id'];
  onSelect: (id: ScenarioConfig['id']) => void;
}

export function ArenaPicker({ scenarios, selectedId, onSelect }: ArenaPickerProps) {
  return (
    <div>
      <p className="font-mono text-xs tracking-widest uppercase text-foreground-muted mb-3">
        Arena
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {scenarios.map((scenario) => (
          <ArenaCard
            key={scenario.id}
            scenario={scenario}
            selected={selectedId === scenario.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
