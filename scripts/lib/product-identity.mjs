import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const evidenceDirectories = ['docs', 'tests', 'experiments', 'release', '.github'];
export const PRODUCT_PATHSPEC = [
  '.',
  ...evidenceDirectories.map(path => `:(top,exclude)${path}`),
  ':(top,glob,exclude)*.md',
  ...['ts', 'tsx', 'mjs'].map(ext => `:(top,glob,exclude)**/*.test.${ext}`),
];

/** Docs and evidence can advance HEAD without invalidating the tested product. */
export function productIdentity(root = resolve(import.meta.dirname, '../..')) {
  const git = args => execFileSync('git', args, { cwd: root });
  const commit = git(['log', '-1', '--format=%H', '--', ...PRODUCT_PATHSPEC]).toString().trim();
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('Cannot identify the product commit');
  // ls-tree does not support exclusion magic. Select the same paths from its
  // NUL-delimited records while preserving their exact bytes and ordering.
  const hash = createHash('sha1');
  const entries = git(['ls-tree', '-r', '-z', 'HEAD']);
  let start = 0;
  for (let end = entries.indexOf(0); end !== -1; end = entries.indexOf(0, start)) {
    const record = entries.subarray(start, end + 1);
    const path = record.subarray(record.indexOf(9) + 1, record.length - 1).toString();
    if (!evidenceDirectories.includes(path.split('/')[0]) &&
        !/^[^/]+\.md$/.test(path) && !/\.test\.(ts|tsx|mjs)$/.test(path)) hash.update(record);
    start = end + 1;
  }
  const tree = hash.digest('hex');
  const dirty = git(['status', '--porcelain', '--untracked-files=all', '--', ...PRODUCT_PATHSPEC]).length > 0;
  return { commit, tree, dirty, label: commit + (dirty ? '+dirty' : '') };
}
