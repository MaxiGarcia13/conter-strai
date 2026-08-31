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
      us: 'US-12',
      summary: expect.stringContaining('Mobile touch controls'),
    });
    expect(rows[2]?.us).toBe('US-10');
  });

  it('respects the limit', () => {
    expect(parseShippedUserStories(changelog, 5)).toHaveLength(5);
    expect(parseShippedUserStories(changelog, 99)).toHaveLength(12);
  });
});
