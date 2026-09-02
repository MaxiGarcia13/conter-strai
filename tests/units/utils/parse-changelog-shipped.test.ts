import { describe, expect, it } from 'vitest';
import { parseShippedUserStories } from '@/utils/parse-changelog-shipped';

const changelog = `## Shipped

| US | Summary |
|----|---------|
| **US-13** | Pistol magazine reload |
| **US-12** | Mobile touch controls |
| **US-11** | Arena modularization |
| **US-10** | Shuffle teams |

## Shipped — other

| Date | Item | Summary |
|------|------|---------|
| 2026-08-31 | Other | Not a US row |
`;

describe('parseShippedUserStories', () => {
  it('returns the newest US rows first', () => {
    const rows = parseShippedUserStories(changelog, 3);

    expect(rows).toEqual([
      { us: 'US-13', summary: 'Pistol magazine reload' },
      { us: 'US-12', summary: 'Mobile touch controls' },
      { us: 'US-11', summary: 'Arena modularization' },
    ]);
  });

  it('respects the limit', () => {
    expect(parseShippedUserStories(changelog, 2)).toHaveLength(2);
    expect(parseShippedUserStories(changelog, 99)).toHaveLength(4);
  });

  it('returns an empty list when the shipped table is missing', () => {
    expect(parseShippedUserStories('# Changelog\n\n## Open\n\nNone.\n')).toEqual([]);
  });
});
