import type { GameCommandIconId } from '@/modules/game/constants/game-bindings';
import {
  ArrowDownIcon,
  FireIcon,
  MenuIcon,
  ReloadIcon,
  RunIcon,
} from '@/components/icons';

const COMMAND_ICONS = {
  'menu': MenuIcon,
  'fire': FireIcon,
  'run': RunIcon,
  'arrow-down': ArrowDownIcon,
  'reload': ReloadIcon,
} as const satisfies Record<GameCommandIconId, typeof MenuIcon>;

interface CommandIconProps {
  iconId: GameCommandIconId;
}

export function CommandIcon({ iconId }: CommandIconProps) {
  const Icon = COMMAND_ICONS[iconId];
  return <Icon className="size-6 shrink-0" />;
}
