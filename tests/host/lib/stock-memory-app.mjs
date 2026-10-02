import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { constants, createReadStream, lstatSync, realpathSync, readFileSync } from 'node:fs';
import { open } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { createPerformanceMailbox, preparePerformanceMailbox } from './performance-mailbox.mjs';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const keys = (value, expected) => assert.deepEqual(Object.keys(value).sort(), [...expected].sort());
const hex = (value, length) => assert.match(value, new RegExp(`^[a-f0-9]{${length}}$`));
const within = (root, path) => { const rel = relative(root, path); assert.ok(rel && !rel.startsWith('../') && !isAbsolute(rel)); return rel; };
const pin = value => [value.dev, value.ino, value.size, value.mode, value.uid, value.mtimeMs, value.ctimeMs];
function filePath(root, path) {
  assert.ok(typeof path === 'string' && path && !isAbsolute(path) && path.split('/').every(part => part && part !== '.' && part !== '..'));
  const actual = join(root, path); within(root, actual); assert.equal(realpathSync(actual), actual, 'Build file cannot redirect through a symlink');
  assert.ok(lstatSync(actual).isFile()); return actual;
}
export function validateStockBuildManifest(row) {
  keys(row, ['producer', 'version', 'sourceRoot', 'sourceCommit', 'sourceTree', 'upstreamCommit', 'upstreamTag', 'chromiumVersion', 'chromiumLastChange', 'buildId', 'executable', 'files', 'effectiveGnArgs', 'gnArgsFile', 'measurementPackets']);
  assert.equal(row.producer, 'aux-stock-memory-build'); assert.equal(row.version, 1);
  assert.ok(isAbsolute(row.sourceRoot)); hex(row.sourceCommit, 40); hex(row.sourceTree, 40); hex(row.upstreamCommit, 40);
  assert.match(row.upstreamTag, /^\d+\.\d+\.\d+\.\d+$/); assert.equal(row.chromiumVersion, row.upstreamTag);
  assert.ok(typeof row.chromiumLastChange === 'string' && row.chromiumLastChange.length <= 256);
  assert.match(row.chromiumLastChange, /^(?!0{40}(?:-|$))[a-f0-9]{40}(?:-[A-Za-z0-9_./@{}#:-]+)?$/);
  assert.equal(row.chromiumLastChange.slice(0, 40), row.upstreamCommit, 'Compiled revision must identify the original upstream tag');
  assert.ok(typeof row.buildId === 'string' && row.buildId.length > 0 && row.buildId.length <= 256);
  keys(row.effectiveGnArgs, ['is_debug', 'is_component_build', 'symbol_level', 'use_lld', 'stock_measurement_for_tests', 'use_dummy_lastchange', 'is_official_build']);
  assert.deepEqual(row.effectiveGnArgs, { is_debug: false, is_component_build: true, symbol_level: 0, use_lld: false, stock_measurement_for_tests: true, use_dummy_lastchange: false, is_official_build: false });
  assert.ok(Array.isArray(row.files) && row.files.length > 1 && row.files.length <= 8192);
  const names = new Set();
  for (const file of row.files) { keys(file, ['path', 'sha256']); hex(file.sha256, 64); assert.ok(typeof file.path === 'string' && !names.has(file.path)); names.add(file.path); }
  assert.ok(names.has(row.executable) && names.has(row.gnArgsFile), 'Executable and original GN args must be pinned');
  assert.ok(Array.isArray(row.measurementPackets) && row.measurementPackets.length > 0 && row.measurementPackets.length <= 16);
  const packets = new Set(); for (const packet of row.measurementPackets) { hex(packet, 64); assert.ok(!packets.has(packet)); packets.add(packet); }
  return row;
}
async function hashOriginalFile(path) {
  const before = lstatSync(path); const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    assert.deepEqual(pin(await handle.stat()), pin(before)); const hash = createHash('sha256');
    for await (const bytes of createReadStream(path, { fd: handle.fd, autoClose: false })) hash.update(bytes);
    assert.deepEqual(pin(await handle.stat()), pin(before)); assert.deepEqual(pin(lstatSync(path)), pin(before));
    return hash.digest('hex');
  } finally { await handle.close(); }
}
/** This checks original source/output bytes. It does not manufacture a build:
 * builder must supply the reviewed complete runtime dependency file list. */
export async function readStockBuildIdentity(manifestPath, expectedManifestSha256) {
  hex(expectedManifestSha256, 64);
  assert.equal(realpathSync(manifestPath), resolve(manifestPath)); const before = lstatSync(manifestPath); assert.ok(before.isFile() && before.size <= 1024 * 1024);
  const bytes = readFileSync(manifestPath); assert.equal(digest(bytes), expectedManifestSha256, 'Original builder manifest differs from the approved digest'); assert.deepEqual(pin(lstatSync(manifestPath)), pin(before));
  const row = validateStockBuildManifest(JSON.parse(bytes)); const root = realpathSync(row.sourceRoot); assert.equal(root, row.sourceRoot);
  const git = args => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', timeout: 10000, maxBuffer: 1024 * 1024 }).trim();
  const source = () => {
    assert.equal(git(['status', '--porcelain', '--untracked-files=all']), '', 'Stock source must be clean');
    assert.equal(git(['rev-parse', 'HEAD']), row.sourceCommit); assert.equal(git(['rev-parse', 'HEAD^{tree}']), row.sourceTree);
    assert.equal(git(['rev-parse', `refs/tags/${row.upstreamTag}^{commit}`]), row.upstreamCommit);
  };
  source();
  for (const file of row.files) assert.equal(await hashOriginalFile(filePath(root, file.path)), file.sha256, `Original build bytes changed: ${file.path}`);
  const args = readFileSync(filePath(root, row.gnArgsFile), 'utf8');
  for (const [name, expected] of Object.entries(row.effectiveGnArgs)) {
    const matches = [...args.matchAll(new RegExp(`^\\s*${name}\\s*=\\s*(true|false|[0-9]+)\\s*(?:#.*)?$`, 'gm'))];
    assert.equal([...args.matchAll(new RegExp(`^\\s*${name}\\s*=.*$`, 'gm'))].length, 1, `Duplicate or indirect GN argument: ${name}`);
    assert.equal(matches.length, 1, `Original explicit GN argument required: ${name}`); assert.equal(matches[0][1], String(expected));
  }
  source(); assert.deepEqual(readFileSync(manifestPath), bytes); assert.deepEqual(pin(lstatSync(manifestPath)), pin(before));
  return { manifest: row, executable: filePath(root, row.executable), identity: { dirty: false, sourceCommit: row.sourceCommit, sourceTree: row.sourceTree,
    upstreamCommit: row.upstreamCommit, upstreamTag: row.upstreamTag, manifestHash: digest(bytes), buildId: row.buildId,
    chromiumVersion: row.chromiumVersion, chromiumLastChange: row.chromiumLastChange } };
}
export function stockLaunchArguments(userDataDir, urls) {
  assert.equal(urls.length, 10); assert.equal(new Set(urls).size, 10);
  assert.match(realpathSync(userDataDir), /^\/private\/tmp\/aux-native-journey-[A-Za-z0-9_-]+\/profile$/);
  const info = lstatSync(userDataDir); assert.ok(info.isDirectory() && info.uid === process.getuid() && (info.mode & 0o777) === 0o700);
  for (const raw of urls) { const url = new URL(raw); assert.equal(url.protocol, 'http:'); assert.equal(url.hostname, '127.0.0.1'); assert.ok(url.port && !url.username && !url.password && !url.hash); assert.equal(url.href, raw); }
  return [`--user-data-dir=${userDataDir}`, '--profile-directory=Default', '--aux-native-stock-measurement-observer', '--no-first-run', '--no-default-browser-check', '--no-proxy-server', '--password-store=basic', '--use-mock-keychain', ...urls];
}
function bounded(promise, ms, message) {
  let timer; return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), ms); })]).finally(() => clearTimeout(timer));
}
/** Testable lifecycle only; supplied child must be the actual spawn return in
 * production. A close event is Node's owned subprocess reap, never PID polling. */
export function createStockChildLifetime(child, { termMs = 750, killMs = 2250 } = {}) {
  assert.ok(Number.isInteger(child.pid) && child.pid > 0);
  let exited = false, closed = false, exit, spawnError, stopping;
  const reaped = new Promise(resolveClose => {
    child.once('error', error => { spawnError = error; });
    child.once('exit', (code, signal) => { exited = true; exit = { code, signal }; });
    child.once('close', (code, signal) => { closed = true; exit ??= { code, signal }; resolveClose(exit); });
  });
  return { get running() { return !exited && !closed && !spawnError; }, get exit() { return exit; }, get spawnError() { return spawnError; }, reaped,
    stop() {
      stopping ??= (async () => {
        const failures = [];
        if (!exited && !closed) { try { assert.ok(child.kill('SIGTERM'), 'Owned TERM failed'); } catch (error) { failures.push(error); } }
        try { await bounded(reaped, termMs, 'Owned child did not reap after TERM'); }
        catch {
          if (!exited && !closed) { try { assert.ok(child.kill('SIGKILL'), 'Owned KILL failed'); } catch (error) { failures.push(error); } }
          try { await bounded(reaped, killMs, 'Owned child did not reap after KILL'); } catch (error) { failures.push(error); }
        }
        if (failures.length) { const failure = new AggregateError(failures, 'Original stock child cleanup failed'); failure.ownedChild = child; failure.reaped = reaped; throw failure; }
        return exit;
      })(); return stopping;
    } };
}
export async function launchStockMemoryApp({ manifestPath, manifestSha256, userDataDir, urls, signal }) {
  assert.equal(process.platform, 'darwin'); assert.ok(signal instanceof AbortSignal); signal.throwIfAborted();
  const original = await readStockBuildIdentity(manifestPath, manifestSha256); signal.throwIfAborted();
  preparePerformanceMailbox(userDataDir);
  const argv = stockLaunchArguments(userDataDir, urls);
  const env = { PATH: '/usr/bin:/bin:/usr/sbin:/sbin', HOME: userDataDir, TMPDIR: userDataDir, LANG: 'en_US.UTF-8' };
  const child = spawn(original.executable, argv, { env, stdio: ['ignore', 'ignore', 'pipe'] });
  if (!child.pid) { await new Promise((_, reject) => child.once('error', reject)); throw new Error('Stock child spawn failed'); }
  const lifetime = createStockChildLifetime(child), generation = randomBytes(6).readUIntBE(0, 6) + 1;
  let transport;
  try { transport = createPerformanceMailbox({ userDataDir, pid: child.pid, generation }); }
  catch (primary) { let cleanup; try { await lifetime.stop(); } catch (error) { cleanup = error; } const failure = new AggregateError([primary, cleanup].filter(Boolean), 'Stock mailbox setup failed'); if (cleanup?.ownedChild) { failure.ownedChild = cleanup.ownedChild; failure.reaped = cleanup.reaped; } throw failure; }
  const stderrChunks = []; let stderrBytes = 0, overflow;
  const receive = bytes => {
    if (overflow) return; stderrChunks.push(Buffer.from(bytes)); stderrBytes += bytes.length;
    if (stderrBytes > 1024 * 1024) { overflow ??= new Error('Original stock stderr exceeded 1MiB'); transport.dispose(overflow); void lifetime.stop().catch(() => {}); return; }
    transport.write(bytes, { pid: child.pid, generation });
  };
  child.stderr.on('data', receive); child.once('close', () => transport.dispose(new Error('Original stock child exited')));
  const abort = () => { transport.dispose(signal.reason instanceof Error ? signal.reason : new Error('Original global deadline reached')); void lifetime.stop().catch(() => {}); };
  signal.addEventListener('abort', abort, { once: true }); if (signal.aborted) abort();
  return { browserPid: child.pid, generation, argv, identity: original.identity, transport, lifetime,
    get stderrRawBase64() { return Buffer.concat(stderrChunks).toString('base64'); },
    get stderrSha256() { return digest(Buffer.concat(stderrChunks)); },
    async readIdentity() { signal.throwIfAborted(); assert.ok(lifetime.running, 'Original stock child is no longer running'); if (overflow) throw overflow;
      const current = await readStockBuildIdentity(manifestPath, manifestSha256); signal.throwIfAborted(); assert.ok(lifetime.running, 'Original stock child exited during source revalidation'); if (overflow) throw overflow; assert.deepEqual(current.identity, original.identity); return current.identity; },
    async close() { signal.removeEventListener('abort', abort); transport.dispose(); return lifetime.stop(); } };
}
