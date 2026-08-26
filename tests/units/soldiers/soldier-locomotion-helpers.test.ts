import type { AnimationAction } from 'three';
import type { SoldierActions } from '@/modules/soldiers/hooks/use-soldier-locomotion/types';
import { describe, expect, it, vi } from 'vitest';
import { createOneShotFinishedHandler } from '@/modules/soldiers/hooks/use-soldier-locomotion/create-one-shot-finished-handler';
import { resolvePlayableClipKey } from '@/modules/soldiers/hooks/use-soldier-locomotion/resolve-playable-clip-key';

function stubAction(): AnimationAction {
  return {} as AnimationAction;
}

function stubActions(overrides: Partial<SoldierActions> = {}): SoldierActions {
  return {
    idle: stubAction(),
    walk: stubAction(),
    run: stubAction(),
    crouchWalking: stubAction(),
    jump: stubAction(),
    kneel: stubAction(),
    dying: stubAction(),
    ...overrides,
  };
}

describe('resolvePlayableClipKey', () => {
  it('returns locomotion when no pose', () => {
    const actions = stubActions();
    expect(resolvePlayableClipKey(null, 'walk', actions)).toBe('walk');
  });

  it('returns pose when the one-shot action exists', () => {
    const actions = stubActions({ shooting: stubAction() });
    expect(resolvePlayableClipKey('shooting', 'run', actions)).toBe('shooting');
  });

  it('falls back to locomotion when an optional one-shot is missing', () => {
    const actions = stubActions();
    expect(resolvePlayableClipKey('shooting', 'run', actions)).toBe('run');
    expect(resolvePlayableClipKey('hitReaction', 'idle', actions)).toBe('idle');
    expect(resolvePlayableClipKey('reloading', 'walk', actions)).toBe('walk');
  });

  it('keeps required one-shots that are always present', () => {
    const actions = stubActions();
    expect(resolvePlayableClipKey('jump', 'idle', actions)).toBe('jump');
    expect(resolvePlayableClipKey('dying', 'run', actions)).toBe('dying');
  });
});

describe('createOneShotFinishedHandler', () => {
  it('dispatches the matching one-shot callback', () => {
    const actions = stubActions({
      reloading: stubAction(),
      reloadingKneel: stubAction(),
      shooting: stubAction(),
      hitReaction: stubAction(),
    });
    const onJumpFinished = vi.fn();
    const onReloadingFinished = vi.fn();
    const onShootingFinished = vi.fn();
    const onHitReactionFinished = vi.fn();
    const handler = createOneShotFinishedHandler(actions, {
      onJumpFinished,
      onReloadingFinished,
      onShootingFinished,
      onHitReactionFinished,
    });

    handler({ action: actions.jump });
    expect(onJumpFinished).toHaveBeenCalledOnce();

    handler({ action: actions.reloading! });
    handler({ action: actions.reloadingKneel! });
    expect(onReloadingFinished).toHaveBeenCalledTimes(2);

    handler({ action: actions.shooting! });
    expect(onShootingFinished).toHaveBeenCalledOnce();

    handler({ action: actions.hitReaction! });
    expect(onHitReactionFinished).toHaveBeenCalledOnce();
  });

  it('ignores finished events for unknown actions', () => {
    const actions = stubActions();
    const onJumpFinished = vi.fn();
    const handler = createOneShotFinishedHandler(actions, { onJumpFinished });
    handler({ action: stubAction() });
    expect(onJumpFinished).not.toHaveBeenCalled();
  });
});
