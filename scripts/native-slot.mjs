import { randomUUID } from 'node:crypto';
import { constants, readSync, openSync, closeSync, fstatSync, lstatSync, fsyncSync, unlinkSync, existsSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

export const nativeSlotPath = join(homedir(), 'aux-chromium-stable', '.aux-native-slot');
const activeReservations = new Map();

function hasQuarantine(path) {
  try { lstatSync(join(path, 'quarantine.json')); return true; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

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
        if (hasQuarantine(path)) throw new Error('Native slot quarantined; original LS retirement is unverified');
        const owner = JSON.parse(readFileSync(ownerFile, 'utf8'));
        if (owner.token !== token || owner.pid !== process.pid) throw new Error('Native slot ownership changed');
        rmSync(path, { recursive: true });
      } };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
    try {
      if (hasQuarantine(path)) {
        const reservation = activeReservations.get(path);
        if (!reservation) throw new Error('Native slot quarantined; original LS retirement is unverified');
        return { token: reservation(), release() {} };
      }
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
          if (hasQuarantine(path)) throw new Error('Native slot quarantined during reclaim');
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

/** Fixed-path persistent refusal marker. Only the branded original App/pair
 * can supply the genuine original LS generation retirement reader. */
export async function quarantineLaunchServicesAppearanceSlot(app, pair) {
  const { readLaunchServicesQuarantineOwner } = await import('../tests/host/lib/app.mjs');
  const original = readLaunchServicesQuarantineOwner(app, pair);
  if (!original) return null; // No original LS dispatch, hence no LS process debt.
  const path = nativeSlotPath, filename = join(path, 'quarantine.json'), ownerFile = join(path, 'owner.json');
  const directory = openSync(path, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
  let file, ownerHandle, marker, cleared = false, retired = false;
  const identity = fstatSync(directory);
  const checkDirectory = () => {
    const named = lstatSync(path), held = fstatSync(directory);
    if (!named.isDirectory() || named.isSymbolicLink() || named.dev !== identity.dev || named.ino !== identity.ino ||
        held.dev !== identity.dev || held.ino !== identity.ino || named.uid !== process.getuid() || (named.mode & 0o777) !== 0o700)
      throw new Error('Original native slot directory changed');
  };
  try {
    checkDirectory();
    ownerHandle = openSync(ownerFile, constants.O_RDONLY | constants.O_NOFOLLOW);
    const ownerInfo = fstatSync(ownerHandle);
    const readHeld = (fd, size) => {
      if (!Number.isInteger(size) || size <= 0 || size > 4096) throw new Error('Original native slot receipt size invalid');
      const buffer = Buffer.alloc(size);
      if (readSync(fd, buffer, 0, size, 0) !== size) throw new Error('Original native slot receipt truncated');
      return buffer.toString('utf8');
    };
    const ownerBytes = readHeld(ownerHandle, ownerInfo.size), owner = JSON.parse(ownerBytes);
    const ownerNamed = lstatSync(ownerFile);
    if (ownerNamed.dev !== ownerInfo.dev || ownerNamed.ino !== ownerInfo.ino || ownerNamed.isSymbolicLink()) throw new Error('Original native slot owner replaced');
    if (!ownerInfo.isFile() || ownerInfo.isSymbolicLink() || ownerInfo.uid !== process.getuid() || (ownerInfo.mode & 0o777) !== 0o600 || ownerInfo.nlink !== 1 ||
        Object.keys(owner).sort().join(',') !== 'pid,startedAt,token' ||
        !Number.isSafeInteger(owner.pid) || owner.pid <= 0 || typeof owner.token !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(owner.token) ||
        !Number.isSafeInteger(owner.startedAt) || owner.startedAt <= 0 ||
        !alive(owner.pid) || owner.token !== process.env.AUX_NATIVE_SLOT_TOKEN) throw new Error('Foreign native slot cannot be quarantined');
    const receipt = { producer: 'aux-native-slot-ls-quarantine', version: 1, ownerPid: owner.pid, token: owner.token,
      reporterPid: process.pid, nonce: randomUUID(), phase: 'reserved', reason: 'launch-services-appearance-cleanup', pid: original.pid, launchServicesGeneration: original.generation };
    const bytes = JSON.stringify(receipt) + '\n';
    file = openSync(filename, constants.O_RDWR | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
    writeFileSync(file, bytes); fsyncSync(file); marker = fstatSync(file); checkDirectory();
    const check = () => {
      checkDirectory();
      const namedOwner = lstatSync(ownerFile), heldOwner = fstatSync(ownerHandle), named = lstatSync(filename), heldMarker = fstatSync(file);
      if (!namedOwner.isFile() || namedOwner.isSymbolicLink() || namedOwner.dev !== ownerInfo.dev || namedOwner.ino !== ownerInfo.ino ||
          namedOwner.uid !== process.getuid() || namedOwner.nlink !== 1 || (namedOwner.mode & 0o777) !== 0o600 ||
          heldOwner.size !== ownerInfo.size || readHeld(ownerHandle, heldOwner.size) !== ownerBytes ||
          named.dev !== marker.dev || named.ino !== marker.ino || heldMarker.size !== Buffer.byteLength(bytes) ||
          !named.isFile() || named.isSymbolicLink() || named.uid !== process.getuid() || named.nlink !== 1 || (named.mode & 0o777) !== 0o600 || readHeld(file, heldMarker.size) !== bytes)
        throw new Error('Original native slot quarantine replaced');
    };
    check();
    const assertReserved = () => {
      check();
      if (activeReservations.get(path) !== assertReserved || retired || cleared || !alive(owner.pid) || owner.token !== process.env.AUX_NATIVE_SLOT_TOKEN) throw new Error('Original LS reservation retired');
      return owner.token;
    };
    activeReservations.set(path, assertReserved);
    return Object.freeze({
      assertReserved,
      async clearAfterOriginalRetirement() {
        if (cleared || retired) throw new Error('Original quarantine already retired');
        check(); const absent = await original.observeAbsent(); check();
        if (absent !== true) throw new Error('Original LS generation retirement remains unverified');
        unlinkSync(filename); fsyncSync(directory); cleared = true; activeReservations.delete(path);
        closeSync(file); file = undefined; closeSync(ownerHandle); ownerHandle = undefined; closeSync(directory);
      },
      retire() {
        if (cleared || retired) return;
        retired = true; activeReservations.delete(path); if (file !== undefined) closeSync(file); file = undefined; closeSync(ownerHandle); ownerHandle = undefined; closeSync(directory);
        // Persistent refusal marker remains; closing observation is not cleanup.
      },
      receipt: Object.freeze({ ...receipt }),
    });
  } catch (error) { if (file !== undefined) closeSync(file); if (ownerHandle !== undefined) closeSync(ownerHandle); closeSync(directory); throw error; }
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
