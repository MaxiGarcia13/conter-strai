import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseShippedUserStories } from '@/utils/parse-changelog-shipped';

const changelog = readFileSync(
  path.join(process.cwd(), 'specs/CHANGELOG.md'),
  'utf8',
);

describe('parseShippedUserStories', () => {
  it('returns the newest US rows first', () => {
    const rows = parseShippedUserStories(changelog, 3);

    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual({
      us: 'US-13',
      summary: expect.stringContaining('Pistol magazine'),
    });
    expect(rows[2]?.us).toBe('US-11');
  });

  it('respects the limit', () => {
    const all = parseShippedUserStories(changelog, 99);
    expect(all.length).toBeGreaterThan(5);
    expect(parseShippedUserStories(changelog, 5)).toHaveLength(5);
    expect(parseShippedUserStories(changelog, all.length)).toHaveLength(all.length);
  });
});
