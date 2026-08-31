export interface ShippedUserStory {
  us: string;
  summary: string;
}

/** Parse the US table under `## Shipped` (newest rows first in the file). */
export function parseShippedUserStories(changelog: string, limit = 100): ShippedUserStory[] {
  const shippedBlock = changelog.match(/## Shipped\n\n([\s\S]*?)\n\n## Shipped — other/);
  if (!shippedBlock) {
    return [];
  }

  const rows: ShippedUserStory[] = [];

  for (const line of shippedBlock[1].split('\n')) {
    const match = line.match(/^\| \*\*(US-\d+)\*\* \| (.+) \|$/);
    if (match) {
      rows.push({ us: match[1], summary: match[2] });
    }
  }

  return rows.slice(0, limit);
}
