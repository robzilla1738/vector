import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const manifestPath = fileURLToPath(
  new URL('../models/manifest.json', import.meta.url),
);
const manifest = z
  .object({
    id: z.string(),
    revision: z.string(),
    files: z.array(
      z.object({
        path: z.string().regex(/^(?:onnx\/)?[a-zA-Z0-9_.-]+$/),
        url: z.url(),
        sha256: z.string().length(64),
        bytes: z.number().int().positive(),
      }),
    ),
  })
  .parse(JSON.parse(readFileSync(manifestPath, 'utf8')));
const root =
  process.env.AUX_EMBEDDING_MODEL_DIR ?? join(dirname(manifestPath), 'minilm');
for (const file of manifest.files) {
  const expected = `https://huggingface.co/${manifest.id}/resolve/${manifest.revision}/${file.path}`;
  if (file.url !== expected) throw new Error('Model manifest source mismatch');
  const response = await fetch(file.url, {
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok)
    throw new Error(`Model download failed (${response.status})`);
  const data = Buffer.from(await response.arrayBuffer());
  if (
    data.length !== file.bytes ||
    createHash('sha256').update(data).digest('hex') !== file.sha256
  )
    throw new Error(`Model hash mismatch: ${file.path}`);
  const target = join(root, file.path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(`${target}.download`, data);
  renameSync(`${target}.download`, target);
}
console.log(`Installed ${manifest.id} at ${root}`);
