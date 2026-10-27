import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { repoRoot } from './repo-root.mjs';
import { frozenRoots } from './provided-frozen-sources.mjs';
import { findMachOSeaSection, readSeaBlob } from '../../vendor/aside/lib/sea.mjs';

// The supplied daemon's JS, as embedded in the frozen snapshot's SEA binary.
export const FROZEN_DAEMON_CODE_SHA256 = '5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5';

/** Path of the extracted code, written once under out/live-inputs; null if the snapshot is absent. */
export function frozenDaemonCodeFile() {
  const binary = join(frozenRoots.daemon, 'Contents/MacOS/aside-daemon');
  const file = join(repoRoot, 'out/live-inputs/frozen-sources/aside-daemon-1.26.1016.1852.mjs');
  if (existsSync(file)) return file;
  if (!existsSync(binary)) return null;
  const bytes = readFileSync(binary), section = findMachOSeaSection(bytes);
  const code = readSeaBlob(bytes.subarray(section.offset, section.offset + section.size)).code;
  if (createHash('sha256').update(code).digest('hex') !== FROZEN_DAEMON_CODE_SHA256) throw Error('Frozen daemon code changed');
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, code);
  return file;
}
