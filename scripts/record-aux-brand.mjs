import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readAuxMark } from './lib/aux-mark.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const files = [];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (/\.(png|svg|icns)$/.test(entry.name)) files.push(path);
  }
}
await collect(join(root, 'assets/brand'));
files.push(join(root, 'vendor/provided-ui/branding/icon48.png'));
const outputs = [];
for (const path of files.sort()) {
  const bytes = await readFile(path);
  outputs.push({ path: relative(root, path), sha256: hash(bytes), ...(path.endsWith('.png') ? { size: [bytes.readUInt32BE(16), bytes.readUInt32BE(20)] } : {}) });
}
const mark = await readAuxMark();
const proposal = 'docs/integration/proposed/native-branding-assets/manifest.json';
await writeFile(join(root, 'assets/brand/inventory.json'), JSON.stringify({
  version: 1,
  source: { path: 'assets/brand/arch-mark.svg', suppliedPath: '/Users/rcourson/Downloads/arch-mark.svg', sha256: hash(Buffer.from(mark.svg)), viewBox: '0 0 1024 1024', pathCount: 2, groupTransform: mark.transform, clipSize: [mark.clipWidth, mark.clipHeight] },
  outputs,
  consumers: [
    { path: 'scripts/lib/provided-ui.mjs', method: 'Both source paths, exact group/clip and 1024 viewBox; existing 64px slot retained' },
    { path: 'packages/ui/src/tokens.css', method: 'Canonical SVG mask for shared Mark component' },
    { path: 'apps/extension/src/first-frame.css', method: 'Canonical SVG mask' },
    { path: 'apps/vault/src/styles.css', method: 'Canonical SVG mask' },
    { path: 'scripts/package-aux.mjs', method: 'Canonical Aux.icns copied at packaging' },
    { path: 'Computer Use Resources/MenuBarIcon*.png', method: 'Root packaging must copy canonical 16px/32px template assets into cloned helper, never source helper' },
  ],
  nativeProposal: { path: proposal, sha256: hash(await readFile(join(root, proposal))), applied: false },
  shapePolicy: 'No crop, contour fitting or reshaping; full supplied SVG canvas retained; white/dark/currentColor and dark app canvas variants only',
}, null, 2) + '\n');
console.log(`Recorded ${outputs.length} canonical/derived brand assets plus checked native proposal`);
