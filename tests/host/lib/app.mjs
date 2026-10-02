import { homedir } from 'node:os';
import { spawn, execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { basename, isAbsolute, join, relative, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { acquireNativeSlot } from '../../../scripts/native-slot.mjs';
import { createDevelopmentAcceptance, extendDevelopmentAcceptance, nativeProfileName, validateDisposableProfile } from './dev-acceptance.mjs';
import { createRpc, validateDescriptor } from './rpc.mjs';
import { createAppearanceStream, createPipAppearanceStream } from './appearance-stream.mjs';
import { createStartupTrace } from './startup-evidence.mjs';

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
  let activeProfile = profiles[0];
  if (!Array.isArray(profiles) || !profiles.length) throw new Error('launch.profiles must be native Profile names');
  profiles.forEach(nativeProfileName);
  const acceptance = launch.devAcceptance ? createDevelopmentAcceptance({ userDataDir, profiles, ...launch.devAcceptance }) : null;
  const launchArgs = launch.args ?? [];
  if (!Array.isArray(launchArgs) || launchArgs.some(arg => typeof arg !== 'string' || /^(--user-data-dir|--profile-directory|--remote-debugging|--password-store|--use-mock-keychain)/.test(arg)))
    throw new Error('Launch args must preserve disposable Profile and disabled public debugging');
  const env = { ...process.env, ...launch.env, ...acceptance?.env };
  // Never inherit a developer token unless this launcher made its own marker.
  if (!acceptance) delete env.AUX_DEV_ACCEPTANCE_TOKEN;
  let appearanceStream, pipAppearanceStream, appearanceDetach;
  function disposeAppearance() {
    appearanceDetach?.(); appearanceDetach = undefined;
    appearanceStream?.dispose(); appearanceStream = undefined;
    pipAppearanceStream?.dispose(); pipAppearanceStream = undefined;
  }
  let child;
  let externalPid;
  let externalGeneration;
  let launchUncertain = false;
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
  const recordStartup = (phase, facts) => startupTrace?.record(phase, facts);
  function running() {
    if (externalPid) {
      const receipt = JSON.parse(execFileSync(urlLauncher, ["check", bundle, String(externalPid), String(externalGeneration)], { timeout: 2000, encoding: "utf8", stdio: "pipe" }));
      return externalGenerationRunning(receipt);
    }
    return child && child.exitCode === null && child.signalCode === null && !spawnError;
  }
  async function descriptor(name = activeProfile, { timeoutMs = 30_000 } = {}) {
    nativeProfileName(name);
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
            knownPeers.set(name, { generation, instanceId: value.instanceId });
            return value;
          }
        } catch (error) { recordStartup('peer-unavailable', { aborted: error?.name === 'AbortError' || error?.name === 'TimeoutError' }); }
      }
      await delay(100);
    }
    throw new Error(`Timed out waiting for disposable Profile runtime (${name}); browser stderr retained in launcher.log`);
  }
  async function start({ externalUrl, auxUrl, background = false } = {}) {
    if (running()) throw new Error('Journey Aux is already running');
    if (auxUrl) {
      const selected = new URL(auxUrl).searchParams.get('profile');
      if (selected) { activeProfile = selected === 'default' ? 'Default' : selected; nativeProfileName(activeProfile); }
    }
    externalPid = undefined; externalGeneration = undefined;
    slot = await acquireNativeSlot();
    disposeAppearance();
    generation += 1; spawnError = undefined; stderr = '';
    startupTrace = createStartupTrace();
    const args = [
      `--user-data-dir=${userDataDir}`, `--profile-directory=${activeProfile}`,
      '--no-first-run', '--no-default-browser-check', '--use-mock-keychain', '--password-store=basic',
      '--enable-logging', `--log-file=${nativeLog}`,
      '--disable-background-networking', '--disable-component-update', '--disable-sync',
      ...(launch.perf ? [] : ['--force-renderer-accessibility']), ...launchArgs,
    ];
    try {
      if (externalUrl || auxUrl) {
        const receipt = await launchUrl(auxUrl ?? externalUrl, args, null, !!auxUrl, background);
        externalPid = receipt.pid;
        launchUncertain = false;
      }
      else {
        externalPid = undefined;
        child = spawn(join(bundle, 'Contents/MacOS/Aux'), args, { env: { ...env, AUX_NATIVE_SLOT_TOKEN: slot.token }, stdio: ['ignore', 'ignore', 'pipe'] });
        child.once('error', error => { spawnError = error; });
        child.stderr.on('data', bytes => { stderr = (stderr + bytes.toString()).slice(-65536); });
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
    disposeAppearance();
    if (launchUncertain) throw new Error(`LaunchServices receipt unavailable: inspect the owned disposable profile ${userDataDir} and bundle ${bundle} before releasing the native batch.`);
    if (running()) {
      if (externalPid) execFileSync(urlLauncher, ["terminate", bundle, String(externalPid), String(externalGeneration)], { timeout: 2000, stdio: "pipe" }); else child.kill('SIGTERM');
      const deadline = Date.now() + 5000;
      while (running() && Date.now() < deadline) await delay(50);
      if (running()) {
        if (externalPid) execFileSync(urlLauncher, ["force-terminate", bundle, String(externalPid), String(externalGeneration)], { timeout: 2000, stdio: "pipe" }); else child.kill('SIGKILL');
        while (running()) await delay(50);
      }
    }
    slot?.release(); slot = undefined;
  }
  const api = {
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
      if (!running() || externalPid || !appearanceStream) return Promise.reject(new Error('No owned appearance stream for current child'));
      return appearanceStream.observe(selection);
    },
    observePipAppearance(selection) {
      if (!running() || externalPid || !pipAppearanceStream) return Promise.reject(new Error('No owned child appearance stream for current child'));
      return pipAppearanceStream.observe(selection);
    },
    prepareFixtureEnv(extra, fixtureUrl) {
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
    start, async restart(options) { await quit(); externalPid = undefined; externalGeneration = undefined; return start(options); }, quit, profileRoot, userDataDir,
    async openExternal(url) { if (!running()) throw new Error("Disposable Aux is not running"); return launchUrl(url, [], api.pid); },
    async openAux(url, {cold = false, background = false} = {}) {
      // Validate before quitting the existing owned generation.
      validateAuxEnvelope(url);
      if (cold) { await quit(); externalPid = undefined; externalGeneration = undefined; return start({auxUrl:url,background}); }
      if (!running()) throw new Error("Disposable Aux is not running");
      return launchUrl(url, [], api.pid, true, background);
    },
    async appleScript(body) {
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
    get pid() { return externalPid ?? child?.pid; }, get log() { return stderr + (existsSync(nativeLog) ? readFileSync(nativeLog, "utf8").slice(-65536) : ""); }, descriptor,
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
