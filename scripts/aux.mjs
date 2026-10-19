#!/usr/bin/env node
// Development launcher. Production startup belongs to the native browser.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, readFile, realpath, lstat } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const root = resolve(import.meta.dirname, '..');
const options = { home: process.env.AUX_HOME ?? join(homedir(), '.aux'), port: 21520 };
const args = process.argv.slice(2);
let browserArgs = [];
for (let i = 0; i < args.length; i++) {
  const flag = args[i];
  if (flag === '--') { browserArgs = args.slice(i + 1); break; }
  if (flag === '--temp-profile') { options.temporary = true; continue; }
  if (flag === '--no-browser') { options.noBrowser = true; continue; }
  if (flag === '--help') {
    console.log('aux [--temp-profile] [--no-browser] [--home DIR] [--profile DIR] [--app PATH] [--chromium PATH] [--port NUMBER] [-- browser flags]');
    process.exit(0);
  }
  if (!['--home', '--profile', '--app', '--chromium', '--port'].includes(flag)) throw new Error(`Unknown option: ${flag}`);
  const value = args[++i];
  if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
  const key = flag.slice(2);
  options[key] = key === 'port' ? Number(value) : resolve(value);
}
if (!Number.isInteger(options.port) || options.port < 1 || options.port > 65535) throw new Error('Invalid daemon port.');
if (options.app && options.chromium) throw new Error('Select either --app or --chromium.');
const executable = resolve(options.chromium ?? (options.app ? join(options.app, 'Contents/MacOS/Aux') : process.env.AUX_BROWSER_PATH ?? join(homedir(), 'Applications/Aux.app/Contents/MacOS/Aux')));
const app = dirname(dirname(dirname(executable))), resources = join(app, 'Contents/Resources/aux');
let supplied;
try { supplied = JSON.parse(await readFile(join(resources, 'bundle.json'), 'utf8')); }
catch { throw new Error('Assemble the supplied app first with package:provided, then select it with --app.'); }
if (supplied.version !== 1 || supplied.implementation !== 'supplied') throw new Error('A packaged supplied Aux implementation is required.');
if (options.temporary && (options.profile || args.includes('--home'))) throw new Error('Temporary profile cannot be combined with explicit home/profile.');
const temporaryRoot = options.temporary ? await mkdtemp(join(tmpdir(), 'aux-provided-')) : undefined;
const home = temporaryRoot ? join(temporaryRoot, 'home') : options.home;
const profile = temporaryRoot ? join(temporaryRoot, 'profile') : options.profile ?? join(home, 'profile');
await mkdir(home, { recursive: true, mode: 0o700 });
const children = new Set();
let stopping = false;
function start(command, arguments_, env) {
  const child = spawn(command, arguments_, { cwd: root, env, stdio: 'inherit' });
  children.add(child);
  child.once('error', (error) => { children.delete(child); console.error(error.message); void stop(1); });
  child.once('exit', (code, signal) => {
    children.delete(child);
    if (!stopping) void stop(signal ? 1 : code ?? 1);
  });
  return child;
}
async function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  const timeout = setTimeout(() => {
    for (const child of children) child.kill('SIGKILL');
  }, 5000);
  await Promise.all([...children].map((child) => new Promise((done) => child.once('exit', done))));
  clearTimeout(timeout);
  if (temporaryRoot) await rm(temporaryRoot, { recursive: true, force: true });
  process.exitCode = code;
}
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => void stop(0));
const env = { ...process.env, ...(temporaryRoot ? { HOME: home } : {}), AUX_HOME: home, AUX_PORT: String(options.port) };
if (options.noBrowser) {
  const boundary = join(resources, 'native/libaux-native-boundary.dylib');
  const stat = await lstat(boundary);
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o022) || await realpath(boundary) !== boundary) throw new Error('Fixed packaged native boundary required.');
  for (const key of Object.keys(env)) if (key.startsWith('DYLD_')) delete env[key];
  env.DYLD_INSERT_LIBRARIES = boundary;
  const daemon = start(join(resources, 'apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon'), [], env);
  let ready = false;
  for (let attempt = 0; attempt < 120 && !stopping; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${options.port}/health`, { signal: AbortSignal.timeout(500) });
      if (response.ok) {
        const health = await response.json();
        if (health.service !== 'aside-daemon' || health.pid !== daemon.pid) throw new Error('Port is occupied by another daemon.');
        if (health.ready) { ready = true; break; }
      }
    } catch (error) {
      if (error.message === 'Port is occupied by another daemon.' || (!(error instanceof TypeError) && error.name !== 'TimeoutError')) { await stop(1); throw error; }
    }
    await delay(250);
  }
  if (!ready && !stopping) { await stop(1); throw new Error('Daemon did not become ready within 30 seconds.'); }
} else {
  if (!existsSync(executable)) {
    if (temporaryRoot) await rm(temporaryRoot, { recursive: true, force: true });
    throw new Error('The packaged Aux browser executable is missing.');
  }
  start(executable, [
    `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--use-mock-keychain',
    ...browserArgs,
  ], env);
}
