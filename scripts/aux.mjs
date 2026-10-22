#!/usr/bin/env node
import { assertAuxLaunchIdentity } from './lib/aux-launch-identity.mjs';
// Development launcher. Production startup belongs to the native browser.
import { launchOwnedProcess } from './lib/owned-process.mjs';
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
// Supplied production UI discovers 21520; native CDP remains fixed at 45203.
// A daemon-only override does not relocate or isolate any browser/CDP endpoint.
if (!options.noBrowser && options.port !== 21520) {
  throw new Error('The supplied browser requires daemon port 21520 and CDP port 45203. Custom --port is supported only with --no-browser.');
}
if (options.app && options.chromium) throw new Error('Select either --app or --chromium.');
const executable = resolve(options.chromium ?? (options.app ? join(options.app, 'Contents/MacOS/Aux') : process.env.AUX_BROWSER_PATH ?? join(homedir(), 'Applications/Aux.app/Contents/MacOS/Aux')));
const app = dirname(dirname(dirname(executable))), resources = join(app, 'Contents/Resources/aux');
let supplied;
try { supplied = JSON.parse(await readFile(join(resources, 'bundle.json'), 'utf8')); }
catch { throw new Error('Assemble the supplied app first with package:provided, then select it with --app.'); }
const launchIdentity = assertAuxLaunchIdentity(supplied);
if (options.temporary && (options.profile || args.includes('--home'))) throw new Error('Temporary profile cannot be combined with explicit home/profile.');
// macOS tmpdir may begin with /var, a symlink. Cache guards require the
// actual canonical disposable root before the supplied daemon seeds resources.
const temporaryRoot = options.temporary ? await realpath(await mkdtemp(join(tmpdir(), 'aux-provided-'))) : undefined;
const home = temporaryRoot ? join(temporaryRoot, 'home') : options.home;
const profile = temporaryRoot ? join(temporaryRoot, 'profile') : options.profile ?? join(home, 'profile');
await mkdir(home, { recursive: true, mode: 0o700 });
const children = new Set();
let stopping = false;
const pendingLaunches = new Set();
async function start(command, arguments_, env) {
  if (stopping) return null;
  const pending = launchOwnedProcess(command, arguments_, { cwd: root, env });
  pendingLaunches.add(pending);
  let child;
  try {
    child = await pending;
  } finally {
    pendingLaunches.delete(pending);
  }
  children.add(child);
  child.done.then(outcome => {
    children.delete(child);
    if (!stopping) void stop(outcome.error || outcome.forced || !outcome.groupStopped || outcome.childSignal ? 1 : outcome.childExitCode ?? 1);
  });
  if (stopping) {
    await child.stop();
    return null;
  }
  if (!child.pid) {
    await stop(1);
    throw new Error('The packaged executable could not be started.');
  }
  return child;
}
let shutdown;
const startupAbort = new AbortController();
function stop(code) {
  if (shutdown) return shutdown;
  stopping = true;
  startupAbort.abort();
  shutdown = (async () => {
    // Pending controllers are retained even if their completion callback removes
    // them from children before the shutdown snapshot is taken.
    const launched = await Promise.allSettled([...pendingLaunches]);
    const owned = new Set([...children, ...launched.filter(result => result.status === 'fulfilled').map(result => result.value)]);
    const outcomes = await Promise.all([...owned].map(child => child.stop()));
    const failed = launched.some(result => result.status === 'rejected') || outcomes.some(outcome => outcome.error || outcome.forced || !outcome.groupStopped);
    // Native shutdown has no launcher-visible success receipt, and the supplied
    // runtime may start detached shell groups. Group absence is not proof that
    // every descendant stopped; never delete potentially live application state.
    if (temporaryRoot) console.error(`Temporary Aux state retained at ${temporaryRoot}; complete descendant shutdown is unverified.`);
    process.exitCode = code || (failed ? 1 : 0);
  })();
  return shutdown;
}
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => void stop(signal === 'SIGINT' ? 130 : 143));
async function main() {
  if (stopping) return;
// Foundation's home/Application Support lookup on macOS does not follow HOME
// alone. Keep those native lookups in the same disposable development home.
const env = { ...process.env, ...(temporaryRoot ? { HOME: home, CFFIXED_USER_HOME: home } : {}), AUX_HOME: home, AUX_PORT: String(options.port),
  AUX_HOST: '127.0.0.1', DAEMON_BASE_URL: `http://127.0.0.1:${options.port}`,
  AUX_BROWSER_CDP_HOST: '127.0.0.1:45203',
  AUX_AGENT_RUNTIME_DIR: join(home, 'runtime'),
  AUX_COMPUTER_USE_SOURCE_APP: join(resources, 'apps/computer-use/Aux Computer Use.app'),
  AUX_HELPER_PATH: join(resources, 'apps/computer-use/Aux Computer Use.app/Contents/MacOS/aux-computer-use') };
if (options.noBrowser) {
  const boundary = join(resources, 'native/libaux-native-boundary.dylib');
  const stat = await lstat(boundary);
  if (stopping) return;
  const canonicalBoundary = await realpath(boundary);
  if (stopping) return;
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o022) || canonicalBoundary !== boundary) throw new Error('Fixed packaged native boundary required.');
  for (const key of Object.keys(env)) if (key.startsWith('DYLD_')) delete env[key];
  env.DYLD_INSERT_LIBRARIES = boundary;
  const developmentNode = supplied.daemonRuntime === 'provided-node-development';
  const daemon = await start(
    join(resources, developmentNode ? 'agent-runtime/node/bin/node' : 'apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon'),
    developmentNode ? ['--disable-sigusr1', '--use-system-ca', join(resources, 'apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs')] : [], env);
  if (stopping) return;
  let ready = false;
  for (let attempt = 0; attempt < 120 && !stopping; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${options.port}/health`, { signal: AbortSignal.any([AbortSignal.timeout(500), startupAbort.signal]) });
      if (stopping) return;
      if (response.ok) {
        const health = await response.json();
        if (stopping) return;
        if (health.service !== launchIdentity.service || health.pid !== daemon.pid) throw new Error('Port is occupied by another daemon.');
        if (health.ready) { ready = true; break; }
      }
    } catch (error) {
      if (stopping) return;
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
  await start(executable, [
    `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--use-mock-keychain',
    ...browserArgs,
  ], env);
}

}
await main();
