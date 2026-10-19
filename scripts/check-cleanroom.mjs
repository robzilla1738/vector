import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const index = JSON.parse(await readFile(join(root, 'out/reference/hashes.json'), 'utf8'));
if (index.version !== 1 || !index.sha256?.length) throw new Error('Reference hash index is missing or invalid.');
const referenceHashes = new Set(index.sha256);
const roots = process.argv.slice(2);
const targets = roots.length ? roots : ['apps', 'packages', 'assets/brand', 'chromium/patches/aux'];
const failures = [];
let files = 0;
const forbidden = /aside(?:hq)?|AsideDisplay/i;
const bundleFingerprint = /\b(?:webpackChunk|__webpack_require__|sourceMappingURL=data:application\/json)/;
async function inspect(path) {
  const info = await stat(path);
  if (info.isDirectory()) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      if (['node_modules', '.git', '.cache'].includes(entry.name) || entry.isSymbolicLink()) continue;
      await inspect(join(path, entry.name));
    }
    return;
  }
  if (!info.isFile()) return;
  files++;
  const hash = createHash('sha256');
  let carry = '';
  let foundName = false;
  let foundBundle = false;
  for await (const chunk of createReadStream(path)) {
    hash.update(chunk);
    const text = carry + chunk.toString('latin1');
    foundName ||= forbidden.test(text);
    foundBundle ||= bundleFingerprint.test(text);
    carry = text.slice(-256);
  }
  if (foundName) failures.push(`${path}: reference product name or identifier`);
  if (foundBundle && /\/(?:src|patches)\//.test(path)) failures.push(`${path}: bundled-code fingerprint in source`);
  if (referenceHashes.has(hash.digest('hex'))) failures.push(`${path}: byte-identical reference artifact`);
}
for (const target of targets) await inspect(resolve(root, target));
if (!files) throw new Error('No rebuild files were checked.');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Clean-room artifact checks passed for ${files} files. Manual provenance review is still required.`);
}
