import { ArrowDownIcon, FireIcon, RunIcon } from '@/components/icons';
import { setTouchRunning } from '@/modules/game/input/player-input-intent';
import { fireWeapon } from '@/modules/game/utils/fire-weapon';
import { toggleKneel } from '@/modules/game/utils/player-pose-actions';
import { ActionButton } from './action-button';
import { LookZone } from './look-zone';
import { PauseButton } from './pause-button';
import { VirtualJoystick } from './virtual-joystick';

export function MobileControls() {
  return (
    <>
      <PauseButton />
      <LookZone />
      <VirtualJoystick />

      <div className="pointer-events-auto fixed right-6 bottom-22 z-10 flex flex-col items-end gap-2">
        <ActionButton
          size="large"
          label="Fire"
          icon={<FireIcon className="size-12" />}
          mode="fire"
          onAction={fireWeapon}
        />

        <div className="flex gap-2">
          <ActionButton
            label="Kneel"
            icon={<ArrowDownIcon className="size-8" />}
            mode="kneel"
            onAction={toggleKneel}
          />
          <ActionButton
            label="Run"
            icon={<RunIcon className="size-8" />}
            mode="sprint"
            onAction={() => {}}
            onHoldStart={() => setTouchRunning(true)}
            onHoldEnd={() => setTouchRunning(false)}
          />
        </div>

      </div>
    </>
  );
}
