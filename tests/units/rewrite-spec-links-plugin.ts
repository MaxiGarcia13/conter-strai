import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineMdastPlugin } from 'satteri';

const packageJson = JSON.parse(
  readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../package.json'), 'utf8'),
) as { repository: { url: string } };

function githubSpecsBase(): string {
  const url = packageJson.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
  return `${url}/blob/main/specs`;
}

function rewriteSpecHref(href: string): string {
  if (href.startsWith('../improvements.md')) {
    return href.replace('../improvements.md', `${githubSpecsBase()}/improvements.md`);
  }
  if (href.startsWith('../tech-debt.md')) {
    return href.replace('../tech-debt.md', `${githubSpecsBase()}/tech-debt.md`);
  }
  if (href.startsWith('./CHANGELOG.md')) {
    return href.replace('./CHANGELOG.md', `${githubSpecsBase()}/CHANGELOG.md`);
  }
  return href;
}

/** Rewrite repo-relative spec links in markdown to GitHub URLs. */
export const rewriteSpecLinksPlugin = defineMdastPlugin({
  name: 'rewrite-spec-links',
  link(node, ctx) {
    const next = rewriteSpecHref(node.url);
    if (next !== node.url) {
      ctx.setProperty(node, 'url', next);
    }
  },
});
