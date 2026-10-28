import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './repo-root.mjs';

/** Named inputs under the ignored out/ folder; see inputs.json. */
export const inputs = JSON.parse(readFileSync(new URL('./inputs.json', import.meta.url), 'utf8'));

/** Path of a named input: an explicit path, then its env override, then its default. Does not check existence. */
export function inputPath(name, explicit) {
  const spec = inputs[name];
  if (!spec?.path) throw new Error(`Unknown input: ${name}`);
  return explicit ?? spec.env?.map(key => process.env[key]).find(Boolean) ?? join(repoRoot, spec.path);
}

/** Like inputPath, but a missing input is an error, never a skip. */
export function requireInput(name, explicit) {
  const path = inputPath(name, explicit);
  if (!existsSync(path))
    throw new Error(`Required input "${name}" is missing at ${path}. Restore out/ from docs/backup/2026-10-27.md (${inputs[name].backup})` +
      (inputs[name].env ? ` or set ${inputs[name].env.join(' / ')}.` : '.'));
  return path;
}
