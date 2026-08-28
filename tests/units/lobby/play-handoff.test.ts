import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  consumePlayHandoff,
  markPlayHandoff,
} from '@/modules/lobby/utils/play-handoff';
import { mockSessionStorage, unmockSessionStorage } from '../helpers/mock-session-storage';

describe('play handoff', () => {
  beforeEach(() => {
    mockSessionStorage();
  });

  afterEach(() => {
    unmockSessionStorage();
  });

  it('marks and consumes a play handoff flag', () => {
    markPlayHandoff('ABC123');
    expect(consumePlayHandoff('ABC123')).toBe(true);
    expect(consumePlayHandoff('ABC123')).toBe(false);
  });

  it('returns false when no handoff was marked', () => {
    expect(consumePlayHandoff('ABC123')).toBe(false);
  });
});
