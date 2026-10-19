import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const roots = process.argv.slice(2).map((root) => resolve(root));
if (!roots.length) throw new Error('Pass the reference artifact directories to index.');
const hashes = new Map();
let files = 0;
async function visit(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const file = join(path, entry.name);
    if (entry.isDirectory()) {
      await visit(file);
      continue;
    }
    if (!entry.isFile()) continue;
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(file)) hash.update(chunk);
    const digest = hash.digest('hex');
    hashes.set(digest, (hashes.get(digest) ?? 0) + 1);
    files++;
  }
}
for (const root of roots) await visit(root);
await mkdir('out/reference', { recursive: true });
await writeFile('out/reference/hashes.json', JSON.stringify({
  version: 1, generatedAt: new Date().toISOString(), roots, files,
  sha256: [...hashes.keys()].sort(),
}, null, 2) + '\n');
console.log(`Indexed ${files} reference files (${hashes.size} distinct hashes).`);
