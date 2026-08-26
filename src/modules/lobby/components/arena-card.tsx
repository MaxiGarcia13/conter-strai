import type { ScenarioConfig } from '@/modules/scenarios';

interface ArenaCardProps {
  scenario: ScenarioConfig;
  selected: boolean;
  onSelect: (id: ScenarioConfig['id']) => void;
}

export function ArenaCard({ scenario, selected, onSelect }: ArenaCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(scenario.id)}
      className={`hud-corners flex w-full flex-col items-center gap-2 border p-4 text-left transition-[border-color,background-color] ${
        selected
          ? 'border-accent bg-accent/10'
          : 'border-surface-border bg-surface hover:border-accent/50'
      }`}
    >
      {scenario.previewImageUrl
        ? (
            <img
              src={scenario.previewImageUrl}
              alt={scenario.name}
              className="mb-2 aspect-video w-full object-cover"
            />
          )
        : (
            <div className="mb-2 flex aspect-video w-full items-center justify-center bg-background-deep text-xs tracking-widest uppercase text-foreground-muted">
              No preview
            </div>
          )}
      <span className="font-mono text-xs tracking-widest uppercase text-foreground-muted">
        {scenario.name}
      </span>
    </button>
  );
}
