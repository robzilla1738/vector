import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

export const nativeSlotPath = join(homedir(), 'aux-chromium-stable', '.aux-native-slot');

function alive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; }
  catch (error) { return error.code === 'EPERM'; }
}

/** A child build/journey may reuse its live parent's slot; unrelated work waits. */
export async function acquireNativeSlot({ path = nativeSlotPath, timeoutMs = 30 * 60_000, signal } = {}) {
  const started = Date.now();
  const ownerFile = join(path, 'owner.json');
  for (;;) {
    signal?.throwIfAborted();
    if (Date.now() - started > timeoutMs) throw new Error(`Timed out waiting for native slot: ${path}`);
    try {
      mkdirSync(path, { mode: 0o700 });
      const token = randomUUID();
      try {
        writeFileSync(ownerFile, JSON.stringify({ pid: process.pid, token, startedAt: Date.now() }), { mode: 0o600, flag: 'wx' });
      } catch (error) { rmSync(path, { recursive: true, force: true }); throw error; }
      return { token, release() {
        const owner = JSON.parse(readFileSync(ownerFile, 'utf8'));
        if (owner.token !== token || owner.pid !== process.pid) throw new Error('Native slot ownership changed');
        rmSync(path, { recursive: true });
      } };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
    try {
      const owner = JSON.parse(readFileSync(ownerFile, 'utf8'));
      if (!Number.isInteger(owner.pid) || typeof owner.token !== 'string') throw new Error('Invalid native slot owner');
      if (alive(owner.pid)) {
        if (process.env.AUX_NATIVE_SLOT_TOKEN === owner.token) return { token: owner.token, release() {} };
      } else {
        const reclaim = `${path}.reclaim`;
        try { mkdirSync(reclaim); }
        catch (error) { if (error.code === 'EEXIST') { await new Promise(resolve => setTimeout(resolve, 100)); continue; } throw error; }
        try {
          const current = JSON.parse(readFileSync(ownerFile, 'utf8'));
          if (current.token === owner.token && !alive(current.pid)) {
            const stale = `${path}.stale-${randomUUID()}`;
            renameSync(path, stale);
            rmSync(stale, { recursive: true });
          }
        } catch (error) { if (error.code !== 'ENOENT') throw error; }
        finally { rmSync(reclaim, { recursive: true, force: true }); }
        continue;
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      // A process can be between mkdir and owner write. Never steal that lock.
      try {
        if (Date.now() - statSync(path).mtimeMs > 30_000) throw new Error(`Native slot has no owner: ${path}`);
      } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    if (Date.now() - started >= timeoutMs) throw new Error(`Timed out waiting for native slot: ${path}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export async function withNativeSlot(run, options) {
  const slot = await acquireNativeSlot(options);
  try { return await run(slot.token); }
  finally { slot.release(); }
}

if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])) {
  const [command, ...args] = process.argv.slice(2).filter((arg, index) => index !== 0 || arg !== '--');
  if (!command) throw new Error('Usage: node scripts/native-slot.mjs -- <command> [args]');
  process.exitCode = await withNativeSlot(token => new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', env: { ...process.env, AUX_NATIVE_SLOT_TOKEN: token } });
    const interrupt = signal => child.kill(signal);
    const onInt = () => interrupt('SIGINT');
    const onTerm = () => interrupt('SIGTERM');
    process.on('SIGINT', onInt);
    process.on('SIGTERM', onTerm);
    const cleanup = () => { process.off('SIGINT', onInt); process.off('SIGTERM', onTerm); };
    child.on('error', error => { cleanup(); reject(error); });
    child.on('exit', (code, signal) => { cleanup(); resolve(code ?? (signal ? 1 : 0)); });
  }));
}
