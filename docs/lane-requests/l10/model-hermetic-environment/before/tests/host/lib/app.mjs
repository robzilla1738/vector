import { createImportSourceOwner, createImportSourceHome, createImportInterruptionSourceHome, readImportSourceHome, disposeImportSourceHome, importSourceEnvironment } from './import-source-home.mjs';
import { homedir } from 'node:os';
import { spawn, execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { basename, isAbsolute, join, relative, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { acquireNativeSlot, quarantineLaunchServicesAppearanceSlot } from '../../../scripts/native-slot.mjs';
import { createDevelopmentAcceptance, extendDevelopmentAcceptance, nativeProfileName, validateDisposableProfile } from './dev-acceptance.mjs';
import { createRpc, validateDescriptor } from './rpc.mjs';
import { createAppearanceStream, createPipAppearanceStream } from './appearance-stream.mjs';
import { createPerformanceMailbox, preparePerformanceMailbox } from './performance-mailbox.mjs';
import { createStartupTrace } from './startup-evidence.mjs';
import { createAxClient } from './ax.mjs';
import { createLaunchServicesAppearanceOwner } from './launch-services-appearance-owner.mjs';
import { readPackagedRuntimePair, readPackagedRuntimePairBytes } from './packaged-runtime-pair-artifact.mjs';
import { createPrivateWindowStream } from './private-window-stream.mjs';
import { createPrivateObservationOwner } from './private-observation-owner.mjs';

const privateApps = new WeakMap();
const fileApps = new WeakMap();
export function readLaunchServicesQuarantineOwner(app, pair) {
  if (fileApps.get(app) !== pair) throw new Error('Foreign LS quarantine App owner');
  return app.launchServicesQuarantineOwner; // Refusal publication survives artifact damage; clearing still validates it.
}
export function readLaunchServicesAppObservation(app, pair) {
  if (fileApps.get(app) !== pair) throw new Error("Foreign LS appearance App owner");
  readPackagedRuntimePairBytes(pair); return app.fileObservation;
}
export function readPrivateAppObservation(app, pair) {
  if (privateApps.get(app) !== pair) throw new Error('Foreign private observation App owner');
  readPackagedRuntimePair(pair);
  return app.privateObservation;
}

function externalFixtureUrl(url) {
  const fixture = new URL(url);
  if (!["http:", "https:"].includes(fixture.protocol) || !["127.0.0.1", "[::1]"].includes(fixture.hostname) || fixture.username || fixture.password)
    throw new Error("External journey URLs must be loopback fixtures");
  return fixture.href;
}
export function validateExternalLaunch(url, args, expectedPid, userDataDir) {
  const fixtureUrl = externalFixtureUrl(url);
  if (!Array.isArray(args) || !Number.isInteger(expectedPid) || expectedPid < 0)
    throw new Error("Invalid external launch identity");
  if (expectedPid > 0) {
    if (args.length) throw new Error("Warm external open cannot alter launch arguments");
  } else {
    validateDisposableProfile(userDataDir);
    const one = prefix => args.filter(arg => typeof arg === "string" && arg.startsWith(prefix)).length === 1;
    const profile = args.find(arg => typeof arg === "string" && arg.startsWith("--profile-directory="));
    if (!profile || !one("--profile-directory")) throw new Error("Cold external open requires one canonical Profile");
    nativeProfileName(profile.slice("--profile-directory=".length));
    if (!one("--user-data-dir") || !one("--password-store") || !one("--use-mock-keychain") || !args.includes(`--user-data-dir=${userDataDir}`) || !args.includes("--use-mock-keychain") || !args.includes("--password-store=basic") ||
        args.some(arg => typeof arg !== "string" || arg.startsWith("--remote-debugging")))
      throw new Error("Cold external open must preserve disposable launch guards");
  }
  return fixtureUrl;
}

export function validateAuxEnvelope(url) {
  const outer = new URL(url);
  const allowed = new Set(['url','profile','space','window','source','background']);
  const seen = new Set();
  if (outer.protocol !== 'aux:' || outer.hostname !== 'open' || outer.username || outer.password || outer.port || outer.hash || (outer.pathname && outer.pathname !== '/')) throw new Error('Invalid owned Aux scheme');
  for (const [key,value] of outer.searchParams) {
    if (!allowed.has(key) || seen.has(key) || Buffer.byteLength(value,'utf8') > (key === 'url' ? 8192 : 200)) throw new Error('Invalid or duplicate Aux query');
    seen.add(key);
  }
  if (outer.searchParams.get('source') !== 'cli' || !outer.searchParams.get('url') ||
      (outer.searchParams.has('window') && !['tab','little','new-window'].includes(outer.searchParams.get('window'))) ||
      (outer.searchParams.has('background') && outer.searchParams.get('background') !== '1')) throw new Error('Invalid owned CLI envelope');
  const profile = outer.searchParams.get('profile'), space = outer.searchParams.get('space');
  if ((profile !== null && !/^(default|Default|Profile [1-9][0-9]*)$/.test(profile)) ||
      (space !== null && !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,199}$/.test(space))) throw new Error('Invalid canonical Profile or Space ID');
  externalFixtureUrl(outer.searchParams.get('url'));
  return outer;
}
export function validateAuxLaunch(url, args, expectedPid, userDataDir) {
  const outer = validateAuxEnvelope(url);
  validateExternalLaunch(outer.searchParams.get('url'),args,expectedPid,userDataDir);
  return outer.href;
}

export function externalGenerationRunning(receipt) {
  if (!receipt || typeof receipt !== "object" || typeof receipt.running !== "boolean")
    throw new Error("Native generation check failed; process cleanup is unverified");
  return receipt.running;
}

export function validateFixtureEnv(extra, fixtureUrl, userDataDir) {
  if (!extra || typeof extra !== 'object' || Array.isArray(extra) ||
      Object.keys(extra).sort().join(',') !== 'HTTPS_PROXY,NODE_EXTRA_CA_CERTS,NODE_USE_ENV_PROXY' ||
      extra.NODE_USE_ENV_PROXY !== '1' || extra.HTTPS_PROXY !== fixtureUrl)
    throw new Error('Prepared fixture transport must use only the owned loopback fixture proxy');
  const proxy = new URL(fixtureUrl);
  if (proxy.protocol !== 'http:' || proxy.hostname !== '127.0.0.1' || !proxy.port || proxy.username || proxy.password || proxy.pathname !== '/' || proxy.search || proxy.hash)
    throw new Error('Prepared fixture proxy must be the owned HTTP loopback listener');
  const ca = realpathSync(extra.NODE_EXTRA_CA_CERTS);
  const owned = realpathSync(userDataDir);
  const info = statSync(ca);
  if (!ca.startsWith(`${owned}/`) || !info.isFile() || info.uid !== process.getuid?.() || (info.mode & 0o077))
    throw new Error('Prepared CA must be an owner-only file inside disposable user data');
}

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

export function observeJourneyProcess({ child, externalPid, generation, spawnError }) {
  return { pid: externalPid ?? child?.pid ?? null, generation,
    launchKind: externalPid ? "launch-services" : "child",
    exitCode: externalPid ? null : child?.exitCode ?? null,
    signal: externalPid ? null : child?.signalCode ?? null,
    spawnError: spawnError?.message ?? null,
    exitStatusAvailable: !externalPid && (child?.exitCode != null || child?.signalCode != null) };
}

export function createJourneyApp({ appPath, launch = {}, profileRoot: suppliedRoot, admittedPair, appearancePair }) {
  const appearanceArtifact = appearancePair === undefined ? null : readPackagedRuntimePairBytes(appearancePair);
  if (appearanceArtifact && (admittedPair !== undefined || launch.perf || realpathSync(appPath) !== appearanceArtifact.bundle || (launch.profiles && (launch.profiles.length !== 1 || launch.profiles[0] !== "Default")))) throw new Error("File appearance requires the original regular Default artifact outside performance/private runs");
  const privatePair = admittedPair === undefined ? null : readPackagedRuntimePair(admittedPair);
  if (privatePair && (suppliedRoot !== undefined || Object.keys(launch).length || realpathSync(appPath) !== privatePair.bundle)) throw new Error('Private observation requires only its original fixed admitted bundle');
  const bundle = validateJourneyBundle(appPath);
  privatePair?.validate();
  const profileRoot = suppliedRoot ? resolve(suppliedRoot) : mkdtempSync('/tmp/aux-native-journey-');
  if (relative(realpathSync('/tmp'), realpathSync(profileRoot)).includes('/')) throw new Error('Journey root must be directly inside /tmp');
  const rootInfo = lstatSync(profileRoot);
  if (!/^aux-native-journey-[A-Za-z0-9]+$/.test(basename(profileRoot)) || rootInfo.isSymbolicLink() || rootInfo.uid !== process.getuid?.() || rootInfo.mode & 0o077)
    throw new Error('Journey root must be an owned disposable directory');
  const userDataDir = join(profileRoot, 'profile');
  mkdirSync(userDataDir, { mode: 0o700 });
  validateDisposableProfile(userDataDir);
  const profiles = launch.profiles ?? ['Default'];
  let activeProfile = profiles[0];
  if (!Array.isArray(profiles) || !profiles.length) throw new Error('launch.profiles must be native Profile names');
  profiles.forEach(nativeProfileName);
  const acceptance = launch.devAcceptance ? createDevelopmentAcceptance({ userDataDir, profiles, ...launch.devAcceptance }) : null;
  const launchArgs = launch.args ?? [];
  if (!Array.isArray(launchArgs) || launchArgs.some(arg => typeof arg !== 'string' || /^(--user-data-dir|--profile-directory|--remote-debugging|--password-store|--use-mock-keychain)/.test(arg)))
    throw new Error('Launch args must preserve disposable Profile and disabled public debugging');
  const fixtureEnvironment = importSourceEnvironment(process.env, launch.env);
  const env = privatePair ? { PATH: '/usr/bin:/bin:/usr/sbin:/sbin', LANG: 'en_US.UTF-8', LC_ALL: 'en_US.UTF-8',
    HOME: profileRoot, TMPDIR: profileRoot } : { ...fixtureEnvironment, ...acceptance?.env };
  // Never inherit a developer token unless this launcher made its own marker.
  if (!acceptance) delete env.AUX_DEV_ACCEPTANCE_TOKEN;
  let appearanceStream, pipAppearanceStream, appearanceDetach, fileAppearance, appearanceOwnerFailure, appearanceChannelRetirement;
  let appearanceConfiguration = 0;
  let performanceMailbox, performanceDetach;
  function disposePerformance() {
    performanceDetach?.(); performanceDetach = undefined;
    performanceMailbox?.dispose(); performanceMailbox = undefined;
  }
  function disposeAppearance(keepOriginalChannel = false) {
    ++appearanceConfiguration;
    if (keepOriginalChannel) fileAppearance?.stopObserving();
    else { fileAppearance?.retire(); fileAppearance = undefined; }
    appearanceDetach?.(); appearanceDetach = undefined;
    appearanceStream?.dispose(); appearanceStream = undefined;
    pipAppearanceStream?.dispose(); pipAppearanceStream = undefined;
  }
  let privateOwner, privateStream, privateStarted = false, privateWindowId, privateCloseReceipt, privateCaptureCandidate;
  const importSourceOwner = createImportSourceOwner(userDataDir);
  let importSourceLease, importSourcePreparationFailure;
  function assertImportSource() {
    if (importSourcePreparationFailure) throw importSourcePreparationFailure;
    if (importSourceLease) {
      const receipt = readImportSourceHome(importSourceLease, importSourceOwner);
      if (env.AUX_IMPORT_SOURCE_HOME !== receipt.home) throw new Error('Original import source environment changed');
    } else if (env.AUX_IMPORT_SOURCE_HOME !== undefined) throw new Error('Unowned import source environment');
  }
  let child;
  let externalPid;
  let externalGeneration;
  let launchUncertain = false;
  let appearanceLaunchAttempted = false, appearanceLaunchReserved = false, launchQuarantine, appearanceReservation;
  const launchSource = resolve(import.meta.dirname, "../launch-url.swift");
  const launchDigest = createHash("sha256").update(readFileSync(launchSource)).digest("hex").slice(0, 12);
  const launchCache = join(homedir(), "Library/Caches/dev.aux.journeys");
  const urlLauncher = join(launchCache, `launch-url-${launchDigest}`);
  const nativeLog = join(profileRoot, "browser.log");
  function ensureUrlLauncher() {
    if (existsSync(urlLauncher)) return;
    mkdirSync(launchCache, { recursive: true });
    const temporary = `${urlLauncher}.${process.pid}.tmp`;
    execFileSync('xcrun', ['swiftc', launchSource, '-o', temporary], { timeout: 120_000, stdio: 'pipe' });
    renameSync(temporary, urlLauncher);
  }
  async function launchUrl(url, args, expectedPid = null, aux = false, background = false) {
    const fixtureUrl = (aux ? validateAuxLaunch : validateExternalLaunch)(url, args, expectedPid ?? 0, userDataDir);
    ensureUrlLauncher();
    const originalGeneration = generation, originalChild = child, originalExternalPid = externalPid;
    let warmReservation;
    if (appearanceArtifact && expectedPid) {
      if (externalPid) {
        if (externalPid !== expectedPid || !launchQuarantine || !appearanceReservation?.active) throw new Error("Foreign or retired LS warm owner");
        warmReservation = launchQuarantine; warmReservation.assertReserved();
      } else if (!child || child.pid !== expectedPid || child.exitCode !== null || child.signalCode !== null) throw new Error("Original child warm owner retired");
    }
    if (appearanceArtifact && !expectedPid) {
      appearanceLaunchReserved = true;
      const reservation = appearanceReservation = { active: true, generation, slot };
      launchQuarantine = await quarantineLaunchServicesAppearanceSlot(api, appearancePair);
      if (!launchQuarantine) throw new Error("Original LS reservation unavailable before dispatch");
      if (appearanceReservation !== reservation || !reservation.active || generation !== reservation.generation || slot !== reservation.slot) {
        launchQuarantine.retire();
        throw new Error("Original LS reservation retired before dispatch");
      }
      appearanceLaunchAttempted = true;
    }
    if (!expectedPid) launchUncertain = true;
    const stdout = await new Promise((resolveLaunch, rejectLaunch) => {
      const helper = spawn(urlLauncher, [bundle, fixtureUrl, JSON.stringify(args), String(expectedPid ?? 0), String(externalGeneration ?? 0), aux ? "aux" : "http", background ? "background" : "foreground"], { stdio: ["pipe", "pipe", "pipe"] });
      let output = "", errors = "";
      const timer = setTimeout(() => { helper.kill(); rejectLaunch(new Error("LaunchServices receipt was lost; inspect the owned disposable Aux instance before retrying")); }, 15_000);
      helper.stdout.on("data", bytes => { output += bytes; });
      helper.stderr.on("data", bytes => { errors = (errors + bytes).slice(-4096); });
      helper.once("error", error => { clearTimeout(timer); rejectLaunch(error); });
      helper.once("close", code => {
        clearTimeout(timer);
        if (code === 0) resolveLaunch(output);
        else rejectLaunch(new Error(errors || "LaunchServices helper failed"));
      });
      helper.stdin.on("error", error => { clearTimeout(timer); helper.kill(); rejectLaunch(error); });
      helper.stdin.end(JSON.stringify({ ...env, AUX_NATIVE_SLOT_TOKEN: slot.token }));
    });
    if (appearanceArtifact && expectedPid) {
      if (generation !== originalGeneration || child !== originalChild || externalPid !== originalExternalPid) throw new Error("Original warm owner changed");
      if (warmReservation) warmReservation.assertReserved();
      else if (child?.exitCode !== null || child?.signalCode !== null) throw new Error("Original child warm owner retired");
    }
    const receipt = JSON.parse(stdout);
    if (!Number.isInteger(receipt.pid) || receipt.pid <= 0 || !Number.isFinite(receipt.generation) || receipt.generation <= 0 || (expectedPid && receipt.pid !== expectedPid) || (externalGeneration && externalGeneration !== receipt.generation))
      throw new Error("LaunchServices did not target the disposable Aux instance");
    externalGeneration = receipt.generation;
    return receipt;
  }
  let slot;
  let stderr = '';
  let spawnError;
  let generation = 0;
  const knownPeers = new Map();
  let startupTrace;
  let startupAttachment, startupOwner, startupRetired = false;
  const profileInfo = lstatSync(userDataDir);
  function assertStartupAttachment() {
    if (!startupAttachment || startupRetired) throw new Error("No live original startup attachment");
    startupAttachment.assertLive();
    for (const [path, original] of [[profileRoot, rootInfo], [userDataDir, profileInfo]]) {
      const current = lstatSync(path);
      if (current.isSymbolicLink() || !current.isDirectory() || current.dev !== original.dev ||
          current.ino !== original.ino || current.uid !== original.uid || current.mode & 0o077)
        throw new Error("Original attached fixture replaced");
    }
    startupAttachment.assertLive();
  }
  const recordStartup = (phase, facts) => startupTrace?.record(phase, facts);
  function running() {
    if (startupAttachment) { assertStartupAttachment(); return true; }
    if (externalPid) {
      const receipt = JSON.parse(execFileSync(urlLauncher, ["check", bundle, String(externalPid), String(externalGeneration)], { timeout: 2000, encoding: "utf8", stdio: "pipe" }));
      return externalGenerationRunning(receipt);
    }
    return child && child.exitCode === null && child.signalCode === null && !spawnError;
  }
  async function descriptor(name = activeProfile, { timeoutMs = 30_000 } = {}) {
    if (privatePair) throw new Error('Private observation has an inactive runtime and no descriptor');
    nativeProfileName(name);
    if (startupAttachment && name !== "Default") throw new Error("Attached startup owns only its original Default Profile");
    const attachedOwner = startupOwner;
    const file = join(userDataDir, name, 'Aux Runtime Data/runtime.json');
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (!running()) throw new Error(`Aux exited before its disposable runtime became ready: ${spawnError?.message ?? child?.exitCode ?? child?.signalCode ?? 'not started'}`);
      const descriptorExists = existsSync(file);
      recordStartup('descriptor-poll', { descriptorExists });
      if (descriptorExists) {
        const info = lstatSync(file);
        if (!info.isFile() || info.isSymbolicLink() || info.uid !== process.getuid?.() || info.mode & 0o077 ||
            !realpathSync(file).startsWith(`${realpathSync(userDataDir)}/`)) throw new Error('Disposable runtime descriptor is not owner-only');
        let value;
        try { value = JSON.parse(readFileSync(file, 'utf8')); } catch { recordStartup('descriptor-json', { valid: false }); await delay(100); continue; }
        recordStartup('descriptor-json', { valid: true });
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
          recordStartup('peer-response', { status: response.status, ready: peer?.ready === true,
            serviceMatches: peer?.service === 'aux-runtime', nonceMatches: peer?.nonce === nonce,
            pidMatches: peer?.pid === value.pid, instanceMatches: peer?.instanceId === value.instanceId,
            startedAtMatches: peer?.startedAt === value.startedAt, schemaMatches: peer?.schema === value.version?.schema });
          if (peer?.service === 'aux-runtime' && peer.ready === true && peer.nonce === nonce && peer.pid === value.pid &&
              peer.instanceId === value.instanceId && peer.startedAt === value.startedAt && peer.schema === value.version?.schema) {
            if (startupAttachment) {
              if (startupOwner !== attachedOwner) throw new Error("Startup owner changed during peer validation");
              assertStartupAttachment();
            }
            knownPeers.set(name, { generation, instanceId: value.instanceId });
            return value;
          }
        } catch (error) { recordStartup('peer-unavailable', { aborted: error?.name === 'AbortError' || error?.name === 'TimeoutError' }); }
      }
      await delay(100);
    }
    throw new Error(`Timed out waiting for disposable Profile runtime (${name}); browser stderr retained in launcher.log`);
  }
  function spawnDirect(args) {
    child = spawn(join(bundle, 'Contents/MacOS/Aux'), args, { env: { ...env, AUX_NATIVE_SLOT_TOKEN: slot.token }, stdio: ['ignore', 'ignore', 'pipe'] });
    child.once('error', error => { spawnError = error; });
    if (privatePair) {
      const originalPid = child.pid ?? null, originalGeneration = generation;
      child.once('close', (code, signal) => { privateCloseReceipt = Object.freeze({ pid: originalPid, generation: originalGeneration, code, signal }); });
    }
    child.stderr.on('data', bytes => { stderr = (stderr + bytes.toString()).slice(-65536); });
  }
  const privateCandidate = () => ({ productIdentity: privatePair.productIdentity, native: privatePair.native, shellDigest: privatePair.shellDigest,
    harnessCommit: execFileSync('git', ['-C', resolve(import.meta.dirname, '../../..'), 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    moduleSha256: createHash('sha256').update(readFileSync(resolve(import.meta.dirname, '../private-home-capture.mjs'))).digest('hex') });
  async function startPrivateObservation() {
    if (arguments.length || !privatePair || privateStarted || startupAttachment || child || externalPid) throw new Error('Private observation is a fixed zero-argument one-use original launch');
    privatePair.validate(); privateStarted = true;
    try {
      slot = await acquireNativeSlot(); privatePair.validate();
      generation += 1; appearanceChannelRetirement = undefined; appearanceOwnerFailure = undefined; spawnError = undefined; stderr = ''; privateCaptureCandidate = privateCandidate();
      spawnDirect([`--user-data-dir=${userDataDir}`, '--profile-directory=Default', '--incognito',
        '--no-first-run', '--no-default-browser-check', '--use-mock-keychain', '--password-store=basic',
        '--enable-logging', `--log-file=${nativeLog}`, '--disable-background-networking', '--disable-component-update', '--disable-sync',
        '--force-renderer-accessibility', '--aux-native-appearance-observer']);
      const observedChild = child, observedPid = child.pid, observedGeneration = generation;
      privateStream = createPrivateWindowStream({ pid: observedPid, generation: observedGeneration, candidate: privateCaptureCandidate });
      privateOwner = createPrivateObservationOwner({ child, generation, pair: privatePair, stream: privateStream });
      const onData = bytes => privateStream.write(bytes, { pid: observedPid, generation: observedGeneration });
      observedChild.stderr.on('data', onData);
      observedChild.once('close', () => observedChild.stderr.off('data', onData));
      const receipt = await privateOwner.discover(); privateWindowId = receipt.window.windowId;
      privateOwner.assertLive();
      if (existsSync(join(userDataDir, 'DevToolsActivePort'))) throw new Error('Private observation exposed a public debugging port');
      return api;
    } catch (error) {
      try { await quit(); } catch (cleanup) { throw new AggregateError([error, cleanup], 'Private observation failed with original cleanup debt', { cause: error }); }
      throw error;
    }
  }
  async function start({ externalUrl, auxUrl, background = false } = {}) {
    if (privatePair) throw new Error('Private observation cannot use ordinary runtime startup');
    if (startupAttachment) throw new Error("Attached startup cannot use another launcher");
    if (running()) throw new Error('Journey Aux is already running');
    assertImportSource();
    if (auxUrl) {
      const selected = new URL(auxUrl).searchParams.get('profile');
      if (selected) { activeProfile = selected === 'default' ? 'Default' : selected; nativeProfileName(activeProfile); }
    }
    externalPid = undefined; externalGeneration = undefined;
    if (launchArgs.includes("--aux-native-performance-observer")) preparePerformanceMailbox(userDataDir);
    slot = await acquireNativeSlot();
    disposeAppearance(); disposePerformance();
    generation += 1; appearanceChannelRetirement = undefined; appearanceOwnerFailure = undefined; spawnError = undefined; stderr = '';
    startupTrace = createStartupTrace();
    const args = [
      `--user-data-dir=${userDataDir}`, `--profile-directory=${activeProfile}`,
      '--no-first-run', '--no-default-browser-check', '--use-mock-keychain', '--password-store=basic',
      '--enable-logging', `--log-file=${nativeLog}`,
      '--disable-background-networking', '--disable-component-update', '--disable-sync',
      ...(launch.perf ? [] : ['--force-renderer-accessibility']), ...launchArgs,
      ...(appearanceArtifact && (externalUrl || auxUrl) ? ['--aux-native-appearance-file-observer'] : []),
    ];
    try {
      assertImportSource();
      if (externalUrl || auxUrl) {
        if (appearanceArtifact) { appearanceArtifact.validate(); if (activeProfile !== "Default" || launchArgs.filter(arg => arg === "--aux-native-appearance-observer").length !== 1) throw new Error("Owned file observation requires actual Default appearance opt-in"); }
        const receipt = await launchUrl(auxUrl ?? externalUrl, args, null, !!auxUrl, background);
        externalPid = receipt.pid;
        launchUncertain = false;
      }
      else {
        externalPid = undefined;
        spawnDirect(args);
      }
      const value = await descriptor();
      recordStartup('authenticated-descriptor-ready');
      const rpc = createRpc(value);
      const deadline = Date.now() + (launch.timeoutMs ?? 30_000);
      while (Date.now() < deadline) {
        if (!running()) throw new Error('Aux exited before native session connected');
        const workspace = await rpc('workspace.get', {}, { timeoutMs: 2000 }).catch(() => null);
        recordStartup('native-session-poll', { workspaceAvailable: !!workspace,
          nativeConnected: workspace?.sessions?.some(session => session.sessionId === 'aux' && session.status === 'connected') === true });
        if (workspace?.sessions?.some(session => session.sessionId === 'aux' && session.status === 'connected')) {
          if (existsSync(join(userDataDir, 'DevToolsActivePort'))) throw new Error('Journey exposed a public debugging port');
          assertImportSource();
          startupTrace = undefined;
          return api;
        }
        await delay(100);
      }
      throw new Error('Timed out waiting for authenticated native session');
    } catch (error) {
      const evidence = startupTrace.snapshot(observeJourneyProcess({ child, externalPid, generation, spawnError }));
      startupTrace = undefined;
      try { writeFileSync(join(profileRoot, 'startup-evidence.json'), JSON.stringify(evidence, null, 2), { mode: 0o600, flag: 'wx' }); }
      catch { evidence.writeFailed = true; }
      const message = `${error.message}; bounded startup evidence: ${JSON.stringify(evidence)}`;
      try { await quit(); }
      catch (cleanup) { throw new AggregateError([error, cleanup], `${message}; owned cleanup also failed: ${cleanup.message}`, { cause: error }); }
      throw new Error(message, { cause: error });
    }
  }
  async function quit() {
    if (appearanceReservation) appearanceReservation.active = false;
    try { return await quitOwned(); }
    catch (error) { launchQuarantine?.retire(); throw error; }
  }
  async function quitOwned() {
    disposeAppearance(Boolean(fileAppearance && externalPid)); disposePerformance();
    if (privatePair) {
      privateOwner?.retire(new Error('Original private observation stopping'));
      if (child && !privateCloseReceipt) {
        if (Number.isInteger(child.pid) && child.pid > 0 && child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
        const deadline = Date.now() + 5000;
        while (!privateCloseReceipt && Date.now() < deadline) await delay(50);
        if (!privateCloseReceipt) {
          if (Number.isInteger(child.pid) && child.pid > 0 && child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
          const killDeadline = Date.now() + 5000;
          while (!privateCloseReceipt && Date.now() < killDeadline) await delay(50);
        }
        if (!privateCloseReceipt) throw new Error('Original private child has no close receipt; native slot and artifact retained');
      }
      slot?.release(); slot = undefined; return privateCloseReceipt;
    }
    if (startupAttachment) {
      startupRetired = true;
      return await startupAttachment.stop();
    }
    if (launchUncertain) throw new Error(`LaunchServices receipt unavailable: inspect the owned disposable profile ${userDataDir} and bundle ${bundle} before releasing the native batch.`);
    if (running()) {
      if (externalPid) execFileSync(urlLauncher, ["terminate", bundle, String(externalPid), String(externalGeneration)], { timeout: 2000, stdio: "pipe" }); else child.kill('SIGTERM');
      const deadline = Date.now() + 5000;
      while (running() && Date.now() < deadline) await delay(50);
      if (running()) {
        if (externalPid) execFileSync(urlLauncher, ["force-terminate", bundle, String(externalPid), String(externalGeneration)], { timeout: 2000, stdio: "pipe" }); else child.kill('SIGKILL');
        if (appearanceArtifact) {
          const killDeadline = Date.now() + 5000;
          while (running() && Date.now() < killDeadline) await delay(50);
          if (running()) throw new Error("Original LS appearance process retirement unverified; slot and artifacts retained");
        } else while (running()) await delay(50);
      }
    }
    const retiredOriginalChannel = appearanceChannelRetirement?.pid === externalPid &&
      appearanceChannelRetirement?.externalGeneration === externalGeneration &&
      appearanceChannelRetirement?.generation === generation && appearanceChannelRetirement?.receipt.removed === true;
    if (retiredOriginalChannel) appearanceArtifact.validate();
    if (appearanceArtifact && externalPid && !fileAppearance && !retiredOriginalChannel) {
      throw new AggregateError(appearanceOwnerFailure ? [appearanceOwnerFailure] : [],
        'Original LS appearance channel cleanup unowned; guardian and slot retained', { cause: appearanceOwnerFailure });
    }
    if (fileAppearance) {
      const original = { pid: externalPid, externalGeneration, generation };
      const receipt = await fileAppearance.removeAfterOriginalRetirement();
      if (externalPid !== original.pid || externalGeneration !== original.externalGeneration || generation !== original.generation || receipt?.removed !== true)
        throw new Error('Original channel retirement identity changed; guardian and slot retained');
      appearanceChannelRetirement = Object.freeze({ ...original, receipt }); fileAppearance = undefined;
    }
    if (launchQuarantine) { await launchQuarantine.clearAfterOriginalRetirement(); launchQuarantine = undefined; }
    slot?.release(); slot = undefined;
  }
  const api = {
    startPrivateObservation,
    get privateObservation() {
      if (!privatePair || !privateOwner) throw new Error('No original private observation owner');
      privateOwner.assertLive();
      return Object.freeze({ pid: privateOwner.pid, generation: privateOwner.generation, windowId: privateWindowId,
        candidate: structuredClone(privateCaptureCandidate), packagedRuntimeArtifact: privatePair.artifact, runtimeStatus: 'inactive-private',
        observe: selection => { if (selection?.windowId !== privateWindowId) return Promise.reject(new Error('Foreign private observation window')); return privateOwner.observe(selection); },
        assertLive: privateOwner.assertLive, closed: privateOwner.closed });
    },
    async attachStartup(owner) {
      if (privatePair) throw new Error('Private observation cannot borrow another startup owner');
      if (startupAttachment || child || externalPid || launchUncertain)
        throw new Error('App already has an original launch owner');
      const { readAuxStartupAttachment } = await import('./startup-helper-launch.mjs');
      const observed = readAuxStartupAttachment(owner);
      if (startupAttachment || child || externalPid || launchUncertain || observed.bundle !== bundle ||
          realpathSync(observed.fixtureRoot) !== realpathSync(profileRoot) ||
          realpathSync(observed.userDataDir) !== realpathSync(userDataDir) || activeProfile !== 'Default')
        throw new Error('Foreign or replaced original startup fixture');
      observed.assertLive(); startupOwner = owner; startupAttachment = observed;
      generation = observed.generation;
      observed.closed.then(() => { if (startupOwner === owner) startupRetired = true; });
      assertStartupAttachment(); return api;
    },
    configurePerformanceMailbox() {
      if (performanceMailbox) return performanceMailbox;
      if (!running() || externalPid || !child?.stderr ||
          launchArgs.filter(arg => arg === '--aux-native-performance-observer').length !== 1 ||
          launchArgs.includes('--aux-native-appearance-observer'))
        throw new Error('Hardware measurement requires its opted-in current direct child without appearance sampling');
      const observedChild = child, observedPid = child.pid, observedGeneration = generation;
      const mailbox = createPerformanceMailbox({ userDataDir, pid: observedPid, generation: observedGeneration });
      const onData = bytes => mailbox.write(bytes, { pid: observedPid, generation: observedGeneration });
      const onExit = () => mailbox.dispose();
      observedChild.stderr.on('data', onData); observedChild.once('close', onExit); observedChild.once('error', onExit);
      performanceDetach = () => { observedChild.stderr.off('data', onData); observedChild.off('close', onExit); observedChild.off('error', onExit); };
      performanceMailbox = mailbox; return mailbox;
    },
    async createAppearanceHelper() {
      if (!appearanceArtifact || !running()) throw new Error('No original admitted appearance process');
      const observedPid = api.pid, observedGeneration = generation;
      appearanceArtifact.validate();
      const helper = await createAxClient(observedPid, { compilerArtifact: readPackagedRuntimePair(appearancePair).compilerArtifact });
      try {
        appearanceArtifact.validate();
        if (!running() || api.pid !== observedPid || generation !== observedGeneration) throw new Error('Original appearance process retired during helper creation');
        return helper;
      } catch (error) {
        try { await helper.close(); } catch (cleanup) { throw new AggregateError([error, cleanup], 'Appearance helper admission and cleanup failed'); }
        throw error;
      }
    },
    async configureLaunchServicesAppearance(candidate, helper) {
      disposeAppearance();
      if (!appearanceArtifact || !externalPid || !running() || child || launch.perf || activeProfile !== 'Default') throw new Error('No admitted original LS appearance process');
      const configuration = appearanceConfiguration;
      const observedPid = externalPid, observedGeneration = generation, observedExternalGeneration = externalGeneration;
      const original = Object.freeze({ pid: observedPid, generation: observedExternalGeneration, root: profileRoot,
        assertLive() {
          appearanceArtifact.validate();
          if (!running() || child || externalPid !== observedPid || generation !== observedGeneration || externalGeneration !== observedExternalGeneration || appearanceConfiguration !== configuration) throw new Error('Original LS appearance owner retired');
        }, readIdentity: () => api.identity(),
        async confirmRetirement() {
          appearanceArtifact.validate();
          const same = () => !child && externalPid === observedPid && generation === observedGeneration && externalGeneration === observedExternalGeneration && !launchUncertain;
          if (!same() || running()) throw new Error('Original LS generation retirement unverified');
          appearanceArtifact.validate();
          if (!same() || running()) throw new Error('Original LS generation changed during retirement');
          return true;
        } });
      let owner;
      try {
        owner = await createLaunchServicesAppearanceOwner({ original, pair: appearancePair, helper, candidate });
        original.assertLive(); fileAppearance = owner; appearanceOwnerFailure = undefined;
      } catch (error) {
        appearanceOwnerFailure ??= error;
        try { owner?.retire(); } catch (cleanup) { throw new AggregateError([error, cleanup], 'Original appearance authentication and cleanup failed'); }
        throw error;
      }
    },
    get launchServicesQuarantineOwner() {
      if (!appearanceArtifact || !appearanceLaunchReserved) return null;
      const epoch = generation;
      return Object.freeze({ pid: null, generation: null, async observeAbsent() {
        appearanceArtifact.validate();
        if (generation !== epoch || !appearanceLaunchAttempted || launchUncertain || !Number.isInteger(externalPid) || !Number.isFinite(externalGeneration)) throw new Error('Original LS generation unknown or replaced; retirement cannot be proven');
        const pid = externalPid, launchGeneration = externalGeneration;
        const absent = !running();
        appearanceArtifact.validate();
        if (generation !== epoch || externalPid !== pid || externalGeneration !== launchGeneration || launchUncertain) throw new Error('Original LS cleanup owner replaced');
        return absent;
      } });
    },
    get launchServicesQuarantineReceipt() {
      if (!launchQuarantine) return null;
      const { token: _token, ...receipt } = launchQuarantine.receipt;
      return Object.freeze(receipt);
    },
    get fileObservation() {
      if (!appearanceArtifact || !fileAppearance || !externalPid || !running()) throw new Error('No original admitted LS appearance owner');
      appearanceArtifact.validate();
      return Object.freeze({ pid: externalPid, observe: selection => fileAppearance.observe(selection),
        discoverUtility: selection => fileAppearance.discoverUtility(selection), proof: raw => fileAppearance.proof(raw) });
    },
    appearanceFileProof(raw) {
      if (!fileAppearance) throw new Error('No original signed file receipt');
      return fileAppearance.proof(raw);
    },
    configureAppearance(candidate) {
      disposeAppearance();
      if (!running() || externalPid || !child?.stderr || launch.perf ||
          launchArgs.filter(arg => arg === '--aux-native-appearance-observer').length !== 1)
        throw new Error('Appearance observation requires an opted-in owned direct child outside performance runs');
      const observedChild = child, observedPid = child.pid, observedGeneration = generation;
      const stream = createAppearanceStream({ pid: observedPid, generation: observedGeneration, candidate });
      const pip = createPipAppearanceStream({ pid: observedPid, generation: observedGeneration, candidate });
      const onData = bytes => {
        const source = { pid: observedPid, generation: observedGeneration };
        stream.write(bytes, source); pip.write(bytes, source);
      };
      const onExit = () => { stream.dispose(); pip.dispose(); };
      observedChild.stderr.on('data', onData); observedChild.once('close', onExit); observedChild.once('error', onExit);
      appearanceDetach = () => { observedChild.stderr.off('data', onData); observedChild.off('close', onExit); observedChild.off('error', onExit); };
      appearanceStream = stream; pipAppearanceStream = pip;
    },
    observeAppearance(selection) {
      if (fileAppearance) return fileAppearance.observe(selection);
      if (!running() || externalPid || !appearanceStream) return Promise.reject(new Error('No owned appearance stream for current child'));
      return appearanceStream.observe(selection);
    },
    async discoverUtilityAppearance(selection) {
      if (fileAppearance) return fileAppearance.discoverUtility(selection);
      if (!running() || externalPid || !appearanceStream) throw new Error('No owned utility stream for current child');
      const originalChild = child, originalGeneration = generation, originalStream = appearanceStream;
      const raw = await originalStream.discoverUtility(selection);
      if (!running() || externalPid || child !== originalChild || generation !== originalGeneration || appearanceStream !== originalStream)
        throw new Error('Original utility appearance child retired during discovery');
      return raw;
    },
    discoverPipAppearance(selection) {
      if (!running() || externalPid || !pipAppearanceStream) return Promise.reject(new Error('No current owned child discovery stream'));
      return pipAppearanceStream.discover(selection);
    },
    observePipAppearance(selection) {
      if (!running() || externalPid || !pipAppearanceStream) return Promise.reject(new Error('No owned child appearance stream for current child'));
      return pipAppearanceStream.observe(selection);
    },
    prepareImportSourceHome(fixtureUrl) {
      if (privatePair || startupAttachment || running() || importSourceLease || importSourcePreparationFailure) throw new Error('Import source must be prepared once before an owned regular launch');
      try { importSourceLease = createImportSourceHome(importSourceOwner, fixtureUrl); }
      catch (error) { importSourcePreparationFailure = error; throw error; }
      const receipt = readImportSourceHome(importSourceLease, importSourceOwner);
      env.AUX_IMPORT_SOURCE_HOME = receipt.home;
      return receipt;
    },
    prepareImportInterruptionSourceHome(fixtureUrl) {
      if (privatePair || startupAttachment || running() || importSourceLease || importSourcePreparationFailure) throw new Error('Import source must be prepared once before an owned regular launch');
      try { importSourceLease = createImportInterruptionSourceHome(importSourceOwner, fixtureUrl); }
      catch (error) { importSourcePreparationFailure = error; throw error; }
      const receipt = readImportSourceHome(importSourceLease, importSourceOwner);
      env.AUX_IMPORT_SOURCE_HOME = receipt.home;
      return receipt;
    },
    readImportSourceHome() {
      if (!importSourceLease) throw new Error('No original import source lease');
      assertImportSource();
      return readImportSourceHome(importSourceLease, importSourceOwner);
    },
    disposeImportSourceHome() {
      if (running() || startupAttachment || !importSourceLease) throw new Error('Import source cleanup requires its stopped original App');
      disposeImportSourceHome(importSourceLease, importSourceOwner);
      importSourceLease = undefined;
      delete env.AUX_IMPORT_SOURCE_HOME;
    },
    prepareFixtureEnv(extra, fixtureUrl) {
      if (privatePair) throw new Error('Private observation uses only its original fixed environment');
      if (running()) throw new Error('Fixture transport must be prepared before launch');
      validateFixtureEnv(extra, fixtureUrl, userDataDir);
      Object.assign(env, extra);
    },
    acceptCreatedProfile(profileId) {
      if (!running() || !acceptance) throw new Error('Created Profile acceptance needs this running owned development fixture');
      const added = extendDevelopmentAcceptance({userDataDir, profileId, token:acceptance.token,
        features:launch.devAcceptance.features, sourceCommit:launch.devAcceptance.sourceCommit});
      acceptance.markers.push(...added.markers);
      return {profileId, restartRequired:true};
    },
    start, async restart(options) { if (startupAttachment || privatePair) throw new Error("Attached startup cannot use another launcher"); await quit(); externalPid = undefined; externalGeneration = undefined; return start(options); }, quit, profileRoot, userDataDir,
    async openExternal(url) { if (startupAttachment || privatePair) throw new Error("Attached startup is observation-only"); if (!running()) throw new Error("Disposable Aux is not running"); return launchUrl(url, [], api.pid); },
    async openAux(url, {cold = false, background = false} = {}) {
      if (startupAttachment || privatePair) throw new Error("Attached startup is observation-only");
      // Validate before quitting the existing owned generation.
      validateAuxEnvelope(url);
      if (cold) { await quit(); externalPid = undefined; externalGeneration = undefined; return start({auxUrl:url,background}); }
      if (!running()) throw new Error("Disposable Aux is not running");
      return launchUrl(url, [], api.pid, true, background);
    },
    async appleScript(body) {
      if (startupAttachment || privatePair) throw new Error("Attached startup is observation-only");
      if (!running()) throw new Error("Disposable Aux is not running");
      ensureUrlLauncher();
      const pid = api.pid;
      const generation = externalGeneration ?? JSON.parse(execFileSync(urlLauncher,["receipt",bundle,String(pid)],{encoding:"utf8",timeout:2000})).generation;
      return await new Promise((resolveScript,rejectScript)=>{
        const child = spawn(urlLauncher,["script",bundle,String(pid),String(generation)],{stdio:["pipe","pipe","pipe"]});
        let stdout = "", stderr = "";
        const timer = setTimeout(()=>{child.kill();rejectScript(new Error("Owned AppleScript timed out"));},12000);
        child.stdout.on("data",bytes=>{stdout=(stdout+bytes).slice(-16384);});child.stderr.on("data",bytes=>{stderr=(stderr+bytes).slice(-4096);});
        child.once("error",error=>{clearTimeout(timer);rejectScript(error);});
        child.once("close",exitCode=>{clearTimeout(timer);resolveScript({stdout,stderr,exitCode});});
        child.stdin.on("error",error=>{clearTimeout(timer);child.kill();rejectScript(error);});child.stdin.end(body);
      });
    },
    get processObservation() { return observeJourneyProcess({ child, externalPid, generation, spawnError }); },
    get pid() { if (startupAttachment) { assertStartupAttachment(); return startupAttachment.browserPid; } return externalPid ?? child?.pid; }, get log() { return stderr + (existsSync(nativeLog) ? readFileSync(nativeLog, "utf8").slice(-65536) : ""); }, descriptor,
    async identity() {
      if (privatePair) throw new Error('Private observation has no active runtime identity');
      const attachedOwner = startupOwner;
      if (startupAttachment) assertStartupAttachment();
      const describe = await createRpc(() => descriptor())('runtime.describe');
      if (startupAttachment) {
        if (startupOwner !== attachedOwner) throw new Error("Startup owner changed during identity validation");
        assertStartupAttachment();
      }
      if (!describe.nativeIdentity || !describe.runtimeIdentity) throw new Error('Runtime did not advertise native and runtime identities');
      const manifestHash = describe.nativeIdentity.buildId?.split('+')[1];
      if (!/^[a-f0-9]{64}$/.test(manifestHash)) throw new Error('Native identity has no valid host manifest hash');
      return { native: { ...describe.nativeIdentity, manifestHash }, runtime: describe.runtimeIdentity };
    },
  };
  if (privatePair) privateApps.set(api, privatePair);
  if (appearanceArtifact) fileApps.set(api, appearancePair);
  return api;
}
