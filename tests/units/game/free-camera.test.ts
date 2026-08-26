import { beforeEach, describe, expect, it } from 'vitest';
import {
  isFreeCamera,
  setFreeCamera,
  subscribeFreeCamera,
  toggleFreeCamera,
} from '@/modules/game/dev/free-camera-state';

describe('free camera state', () => {
  beforeEach(() => {
    setFreeCamera(false);
  });

  it('starts disabled and toggles', () => {
    expect(isFreeCamera()).toBe(false);
    expect(toggleFreeCamera()).toBe(true);
    expect(isFreeCamera()).toBe(true);
    expect(toggleFreeCamera()).toBe(false);
  });

  it('notifies subscribers only on change', () => {
    const seen: boolean[] = [];
    const unsubscribe = subscribeFreeCamera((enabled) => {
      seen.push(enabled);
    });

    setFreeCamera(true);
    setFreeCamera(true);
    setFreeCamera(false);

    expect(seen).toEqual([true, false]);
    unsubscribe();
  });
});
