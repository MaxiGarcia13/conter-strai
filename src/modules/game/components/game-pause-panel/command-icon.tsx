import type { GameCommandIconId } from '@/modules/game/constants/game-bindings';
import { IconButtonA, IconButtonB, IconFire, IconMenu } from '@/components/icons';

const COMMAND_ICONS = {
  'menu': IconMenu,
  'fire': IconFire,
  'button-a': IconButtonA,
  'button-b': IconButtonB,
} as const satisfies Record<GameCommandIconId, typeof IconMenu>;

interface CommandIconProps {
  iconId: GameCommandIconId;
}

export function CommandIcon({ iconId }: CommandIconProps) {
  const Icon = COMMAND_ICONS[iconId];
  return <Icon className="size-6 shrink-0" />;
}
