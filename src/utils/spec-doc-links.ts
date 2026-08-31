import { repository } from '@root/package.json';

function githubRepoBase(): string {
  const url = repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
  return `${url}/blob/main`;
}

export function specDocUrl(relativePath: string): string {
  return `${githubRepoBase()}/specs/${relativePath}`;
}
