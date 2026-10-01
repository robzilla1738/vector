import { spawn, execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync } from 'node:fs';
import { basename, isAbsolute, join, relative, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { acquireNativeSlot } from '../../../scripts/native-slot.mjs';
import { createDevelopmentAcceptance, nativeProfileName, validateDisposableProfile } from './dev-acceptance.mjs';
import { createRpc, validateDescriptor } from './rpc.mjs';

export function validateJourneyBundle(appPath) {
  if (process.platform !== 'darwin' || !isAbsolute(appPath)) throw new Error('Native journey needs an absolute macOS Aux.app path');
  const path = realpathSync(appPath);
  if (basename(path) !== 'Aux.app' || existsSync(join(path, 'Contents/_CodeSignature'))) throw new Error('Journey requires unsigned Aux.app');
  for (const file of ['Contents/MacOS/Aux', 'Contents/Helpers/Aux Runtime', 'Contents/Info.plist'])
    if (!existsSync(join(path, file))) throw new Error(`Aux bundle is missing ${file}`);
  const bundleId = execFileSync('/usr/libexec/PlistBuddy', ['-c', 'Print :CFBundleIdentifier', join(path, 'Contents/Info.plist')], { encoding: 'utf8' }).trim();
  if (bundleId !== 'dev.aux.browser') throw new Error('Native journey requires the Aux bundle identity');
  return path;
}

export function createJourneyApp({ appPath, launch = {}, profileRoot: suppliedRoot }) {
  const bundle = validateJourneyBundle(appPath);
  const profileRoot = suppliedRoot ? resolve(suppliedRoot) : mkdtempSync('/tmp/aux-native-journey-');
  if (relative(realpathSync('/tmp'), realpathSync(profileRoot)).includes('/')) throw new Error('Journey root must be directly inside /tmp');
  const rootInfo = lstatSync(profileRoot);
  if (!/^aux-native-journey-[A-Za-z0-9]+$/.test(basename(profileRoot)) || rootInfo.isSymbolicLink() || rootInfo.uid !== process.getuid?.() || rootInfo.mode & 0o077)
    throw new Error('Journey root must be an owned disposable directory');
  const userDataDir = join(profileRoot, 'profile');
  mkdirSync(userDataDir, { mode: 0o700 });
  validateDisposableProfile(userDataDir);
  const profiles = launch.profiles ?? ['Default'];
  if (!Array.isArray(profiles) || !profiles.length) throw new Error('launch.profiles must be native Profile names');
  profiles.forEach(nativeProfileName);
  const acceptance = launch.devAcceptance ? createDevelopmentAcceptance({ userDataDir, profiles, ...launch.devAcceptance }) : null;
  const launchArgs = launch.args ?? [];
  if (!Array.isArray(launchArgs) || launchArgs.some(arg => typeof arg !== 'string' || /^(--user-data-dir|--profile-directory|--remote-debugging|--password-store|--use-mock-keychain)/.test(arg)))
    throw new Error('Launch args must preserve disposable Profile and disabled public debugging');
  const env = { ...process.env, ...launch.env, ...acceptance?.env };
  // Never inherit a developer token unless this launcher made its own marker.
  if (!acceptance) delete env.AUX_DEV_ACCEPTANCE_TOKEN;
  let child;
  let slot;
  let stderr = '';
  let spawnError;
  let generation = 0;
  const knownPeers = new Map();
  function running() { return child && child.exitCode === null && child.signalCode === null && !spawnError; }
  async function descriptor(name = profiles[0], { timeoutMs = 30_000 } = {}) {
    nativeProfileName(name);
    const file = join(userDataDir, name, 'Aux Runtime Data/runtime.json');
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (!running()) throw new Error(`Aux exited before its disposable runtime became ready: ${spawnError?.message ?? child?.exitCode ?? child?.signalCode ?? 'not started'}`);
      if (existsSync(file)) {
        const info = lstatSync(file);
        if (!info.isFile() || info.isSymbolicLink() || info.uid !== process.getuid?.() || info.mode & 0o077 ||
            !realpathSync(file).startsWith(`${realpathSync(userDataDir)}/`)) throw new Error('Disposable runtime descriptor is not owner-only');
        let value;
        try { value = JSON.parse(readFileSync(file, 'utf8')); } catch { await delay(100); continue; }
        validateDescriptor(value);
        if (!Number.isInteger(value.pid) || value.pid <= 0 || typeof value.instanceId !== 'string' ||
            !value.instanceId || !Number.isFinite(value.startedAt) || !Number.isInteger(value.version?.schema))
          throw new Error('Disposable runtime descriptor lacks peer identity');
        const old = knownPeers.get(name);
        if (old?.generation !== generation && old?.instanceId === value.instanceId) { await delay(100); continue; }
        const nonce = randomBytes(24).toString('hex');
        try {
          const response = await fetch(`http://127.0.0.1:${value.port}/internal/peer?nonce=${nonce}`, {
            redirect: 'error', headers: { authorization: `Bearer ${value.token}` }, signal: AbortSignal.timeout(1000),
          });
          const peer = response.ok ? await response.json() : null;
          if (peer?.service === 'aux-runtime' && peer.ready === true && peer.nonce === nonce && peer.pid === value.pid &&
              peer.instanceId === value.instanceId && peer.startedAt === value.startedAt && peer.schema === value.version?.schema) {
            knownPeers.set(name, { generation, instanceId: value.instanceId });
            return value;
          }
        } catch { /* Runtime startup or replacement may briefly close the listener. */ }
      }
      await delay(100);
    }
    throw new Error(`Timed out waiting for disposable Profile runtime (${name}); browser stderr retained in launcher.log`);
  }
  async function start() {
    if (running()) throw new Error('Journey Aux is already running');
    slot = await acquireNativeSlot();
    generation += 1; spawnError = undefined; stderr = '';
    child = spawn(join(bundle, 'Contents/MacOS/Aux'), [
      `--user-data-dir=${userDataDir}`, `--profile-directory=${profiles[0]}`,
      '--no-first-run', '--no-default-browser-check', '--use-mock-keychain', '--password-store=basic',
      '--disable-background-networking', '--disable-component-update', '--disable-sync',
      ...(launch.perf ? [] : ['--force-renderer-accessibility']), ...launchArgs,
    ], { env: { ...env, AUX_NATIVE_SLOT_TOKEN: slot.token }, stdio: ['ignore', 'ignore', 'pipe'] });
    child.once('error', error => { spawnError = error; });
    child.stderr.on('data', bytes => { stderr = (stderr + bytes.toString()).slice(-65536); });
    try {
      const value = await descriptor();
      const rpc = createRpc(value);
      const deadline = Date.now() + (launch.timeoutMs ?? 30_000);
      while (Date.now() < deadline) {
        if (!running()) throw new Error('Aux exited before native session connected');
        const workspace = await rpc('workspace.get', {}, { timeoutMs: 2000 }).catch(() => null);
        if (workspace?.sessions?.some(session => session.sessionId === 'aux' && session.status === 'connected')) {
          if (existsSync(join(userDataDir, 'DevToolsActivePort'))) throw new Error('Journey exposed a public debugging port');
          return api;
        }
        await delay(100);
      }
      throw new Error('Timed out waiting for authenticated native session');
    } catch (error) { await quit(); throw error; }
  }
  async function quit() {
    try {
      if (running()) {
        child.kill('SIGTERM');
        const deadline = Date.now() + 5000;
        while (running() && Date.now() < deadline) await delay(50);
        if (running()) { child.kill('SIGKILL'); while (running()) await delay(50); }
      }
    } finally { slot?.release(); slot = undefined; }
  }
  const api = {
    start, async restart() { await quit(); return start(); }, quit, profileRoot, userDataDir,
    get pid() { return child?.pid; }, get log() { return stderr; }, descriptor,
    async identity() {
      const describe = await createRpc(() => descriptor())('runtime.describe');
      if (!describe.nativeIdentity || !describe.runtimeIdentity) throw new Error('Runtime did not advertise native and runtime identities');
      const manifestHash = describe.nativeIdentity.buildId?.split('+')[1];
      if (!/^[a-f0-9]{64}$/.test(manifestHash)) throw new Error('Native identity has no valid host manifest hash');
      return { native: { ...describe.nativeIdentity, manifestHash }, runtime: describe.runtimeIdentity };
    },
  };
  return api;
}
