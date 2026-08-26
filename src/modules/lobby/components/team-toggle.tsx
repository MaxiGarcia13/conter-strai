import type { Team } from '@/modules/teams';

import { TEAM_DISPLAY_NAME } from '@/modules/teams';

interface TeamToggleProps {
  team: Team;
  onChange: (team: Team) => void;
}

export function TeamToggle({ team, onChange }: TeamToggleProps) {
  return (
    <div>
      <p className="font-mono text-xs tracking-widest uppercase text-foreground-muted mb-3">
        Team
      </p>
      <div className="flex gap-2">
        {(Object.keys(TEAM_DISPLAY_NAME) as Team[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`flex-1 border px-4 py-2.5 font-mono text-xs tracking-widest uppercase transition-[border-color,background-color] ${
              team === t
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-surface-border bg-surface text-foreground-muted hover:border-accent/50'
            }`}
          >
            {TEAM_DISPLAY_NAME[t]}
          </button>
        ))}
      </div>
    </div>
  );
}
