import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { withNativeSlot } from '../../../scripts/native-slot.mjs';

export function hashFile(path) { return createHash('sha256').update(readFileSync(path)).digest('hex'); }
export function createEvidence(outputDir, ax, appearanceProvider, pipAppearanceProvider) {
  const requested = resolve(outputDir);
  mkdirSync(requested, { recursive: true });
  if (lstatSync(requested).isSymbolicLink()) throw new Error('Evidence output must not be a symlink');
  const directory = realpathSync(requested);
  const captures = [];
  async function capture(name, { windowId, state, expectedOwner, expectedWindowKind } = {}, child = false) {
    if (typeof name !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,120}$/.test(name)) throw new Error('Capture needs a simple unique name');
    return withNativeSlot(async () => {
      const windows = await ax.windows();
      const candidates = windows.filter(item => item.layer === 0 && item.width > 0 && item.height > 0);
      if (windowId !== undefined && (!Number.isInteger(windowId) || windowId <= 0)) throw new Error('Capture window ID must be positive');
      const appearance = child ? pipAppearanceProvider?.() : state === undefined ? undefined : appearanceProvider?.();
      if (child && (!appearance || windowId === undefined || typeof state !== "string" || !state)) throw new Error("Child capture requires its current registry producer, explicit window and state");
      if (expectedWindowKind !== undefined && (child || !['quick-ask', 'little'].includes(expectedWindowKind) || !appearance)) throw new Error('Expected Aux utility kind requires its current native appearance producer');
      if (!child && expectedOwner !== undefined) throw new Error('Normal capture cannot use child ownership');
      const childTicket = child ? await appearance.before(windowId, expectedOwner) : undefined;
      const selected = child ? windows.filter(item => item.id === windowId && item.layer === childTicket.windowLayer && item.width > 0 && item.height > 0) : candidates;
      if (child && selected.length !== 1) throw new Error("Registered child is absent or ambiguous in owned helper inventory");
      const window = windowId === undefined ? candidates.sort((a, b) => b.width * b.height - a.width * a.height)[0] : selected.find(item => item.id === windowId);
      if (!window || !Number.isInteger(window.id) || window.id <= 0) throw new Error('No journey window available for capture');
      if (state !== undefined && (!appearance || windowId === undefined || typeof state !== 'string' || !state)) throw new Error('Appearance capture requires an explicit state, window and current producer');
      const ticket = childTicket ?? (appearance ? await appearance.before(window.id, undefined, expectedWindowKind) : undefined);
      const path = `${name}.png`;
      const absolute = join(directory, path);
      if (existsSync(absolute)) throw new Error('Existing evidence must not be overwritten');
      const capturedAt = new Date().toISOString();
      execFileSync('/usr/sbin/screencapture', ['-x', '-l', String(window.id), absolute], { timeout: 15000, stdio: 'pipe' });
      const captureCompletedAt = new Date().toISOString();
      const info = lstatSync(absolute);
      if (!info.isFile() || info.isSymbolicLink() || info.size <= 1024) throw new Error('Native window capture is empty');
      let record = { name, path, sha256: hashFile(absolute), bytes: info.size, windowId: window.id };
      const captureIndex = captures.push(record) - 1; // Retain the original even if provenance later refuses.
      if (appearance) {
        record = await appearance.finish(ticket, record, { state, capturedAt, captureCompletedAt });
        captures[captureIndex] = record;
      }
      return record;
    });
  }
  return { capture, capturePip: (name, options) => capture(name, options, true), captures };
}
