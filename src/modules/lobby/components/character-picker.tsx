import type { SoldierSkinId } from '@/modules/soldiers';

import { getSoldierSkinById } from '@/modules/soldiers';

interface CharacterPickerProps {
  skinIds: readonly SoldierSkinId[];
  selectedId: SoldierSkinId;
  onSelect: (id: SoldierSkinId) => void;
}

export function CharacterPicker({ skinIds, selectedId, onSelect }: CharacterPickerProps) {
  return (
    <div>
      <p className="font-mono text-xs tracking-widest uppercase text-foreground-muted mb-3">
        Character
      </p>
      <div className="grid grid-cols-3 gap-2">
        {skinIds.map((id) => {
          const skin = getSoldierSkinById(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={`flex flex-col items-center gap-1.5 border p-3 transition-[border-color,background-color] ${
                selectedId === id
                  ? 'border-accent bg-accent/10'
                  : 'border-surface-border bg-surface hover:border-accent/50'
              }`}
            >
              <span className="font-mono text-xs tracking-widest uppercase text-foreground">
                {id}
              </span>
              <span className="text-[10px] tracking-wider uppercase text-foreground-muted">
                {skin.hitboxPresetId}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
