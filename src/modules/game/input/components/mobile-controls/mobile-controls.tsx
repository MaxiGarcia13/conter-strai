import { setTouchRunning } from '@/modules/game/input/player-input-intent';
import { isTouchPrimaryDevice } from '@/modules/game/input/utils/is-touch-primary-device';
import { fireWeapon } from '@/modules/game/utils/fire-weapon';
import { toggleKneel } from '@/modules/game/utils/player-pose-actions';
import { ActionButton } from './action-button';
import { LookZone } from './look-zone';
import { PauseButton } from './pause-button';
import { VirtualJoystick } from './virtual-joystick';

export function MobileControls() {
  if (!isTouchPrimaryDevice()) {
    return null;
  }

  return (
    <>
      <PauseButton />
      <LookZone />
      <VirtualJoystick />

      <div className="pointer-events-auto fixed right-6 bottom-20 z-10 flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <ActionButton label="Kneel" mode="kneel" onAction={toggleKneel} />
          <ActionButton
            label="Run"
            mode="sprint"
            onAction={() => {}}
            onHoldStart={() => setTouchRunning(true)}
            onHoldEnd={() => setTouchRunning(false)}
          />
        </div>
        <ActionButton label="Fire" mode="fire" onAction={fireWeapon} />
      </div>
    </>
  );
}
