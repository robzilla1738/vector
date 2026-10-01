import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { withNativeSlot } from '../../../scripts/native-slot.mjs';

export function hashFile(path) { return createHash('sha256').update(readFileSync(path)).digest('hex'); }
export function createEvidence(outputDir, ax) {
  const requested = resolve(outputDir);
  mkdirSync(requested, { recursive: true });
  if (lstatSync(requested).isSymbolicLink()) throw new Error('Evidence output must not be a symlink');
  const directory = realpathSync(requested);
  const captures = [];
  async function capture(name) {
    if (typeof name !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,120}$/.test(name)) throw new Error('Capture needs a simple unique name');
    return withNativeSlot(async () => {
      const windows = await ax.windows();
      const window = windows.filter(item => item.layer === 0 && item.width > 0 && item.height > 0)
        .sort((a, b) => b.width * b.height - a.width * a.height)[0];
      if (!window || !Number.isInteger(window.id) || window.id <= 0) throw new Error('No journey window available for capture');
      const path = `${name}.png`;
      const absolute = join(directory, path);
      if (existsSync(absolute)) throw new Error('Existing evidence must not be overwritten');
      execFileSync('/usr/sbin/screencapture', ['-x', '-l', String(window.id), absolute], { timeout: 15000, stdio: 'pipe' });
      const info = lstatSync(absolute);
      if (!info.isFile() || info.isSymbolicLink() || info.size <= 1024) throw new Error('Native window capture is empty');
      const record = { name, path, sha256: hashFile(absolute), bytes: info.size, windowId: window.id };
      captures.push(record);
      return record;
    });
  }
  return { capture, captures };
}
