#!/usr/bin/env node
import { MOUNTED_LONG_IMAGE_APPEARANCE_ID, requireMountedLongImageAppearance } from './appearance-journeys/mounted-long-image-appearance.mjs';
import { MOUNTED_IMAGE_APPEARANCE_ID, requireMountedImageAppearance } from './appearance-journeys/mounted-image-appearance.mjs';
import { requireModelSettingsAppearance } from './lib/model-settings-appearance.mjs';
import { requireModelProbeAppearance } from './lib/model-probe-appearance.mjs';
import { LONG_MODEL_CATALOG_ID, requireLongModelCatalogAppearance } from './lib/long-model-catalog-appearance.mjs';
import { MODEL_DISCOVERY_APPEARANCE_ID, requireModelDiscoveryAppearance } from './lib/model-discovery-appearance.mjs';
import { MEMORY_APPEARANCE_ID, requireMemoryAppearance } from './lib/memory-appearance.mjs';
import { MENTIONS_APPEARANCE_ID, requireMentionsAppearance } from './lib/mentions-appearance.mjs';
import { retainPackagedRuntimePair } from './lib/packaged-runtime-pair-artifact.mjs';
import { preflightAppearancePair } from './lib/appearance-pair-preflight.mjs';
import { PAGE_RECOVERY_APPEARANCE_ID, requirePageRecoveryAppearance } from './lib/page-recovery-appearance.mjs';
import { createLaunchServicesAppearanceProvenance } from './lib/appearance-provenance.mjs';
import { createOwnedNarrowGenerations } from './lib/distinct-narrow-window.mjs';
import { collectNativeKeyEffects } from './lib/native-key-performance.mjs';
import { dismissObservedSetup } from './lib/dismiss-observed-setup.mjs';
import { SETUP_IMPORT_INTERRUPTION_ID, requireImportInterruptionAppearance } from './lib/setup-import-interruption.mjs';
import { SETUP_IMPORT_APPEARANCE_ID, requireSetupImportAppearance, retirePreparedImportSource } from './lib/setup-import-appearance.mjs';
import { SETUP_APPEARANCE_ID, requireSetupAppearance, setupDisposition } from './lib/setup-appearance.mjs';
import { createUntil } from './lib/until.mjs';
import { createClock } from "../../packages/contracts/dist/clock.js";
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { parseArgs } from 'node:util';
import { productIdentity } from '../../scripts/lib/product-identity.mjs';
import { sha256 } from '../../scripts/lib/qualification.mjs';
import { journeyRegistry } from './journeys/index.mjs';
import { createJourneyApp } from './lib/app.mjs';
import { createRpc } from './lib/rpc.mjs';
import { createAxClient, preflight } from './lib/ax.mjs';
import { retainNativeWindowCompiler } from './lib/native-window-compiler-artifact.mjs';
import { createFixture } from './lib/fixture.mjs';
import { createAppearanceProvenance, createPipAppearanceProvenance } from './lib/appearance-provenance.mjs';
import { createEvidence } from './lib/evidence.mjs';
import { createVisual } from './lib/visual.mjs';
import { assertJourneyIdentity } from './lib/identity.mjs';
import { acquireNativeSlot } from '../../scripts/native-slot.mjs';

const root = resolve(import.meta.dirname, '../..');
const { values } = parseArgs({ options: {
  journey: { type: 'string' }, app: { type: 'string' }, output: { type: 'string' },
  'native-window-manifest': { type: 'string' }, 'native-window-manifest-sha': { type: 'string' },
  'native-window-audit': { type: 'string' }, 'native-window-audit-sha': { type: 'string' },
  'appearance-pair': { type: 'string' },
  attempt: { type: 'string', default: '1' }, attended: { type: 'boolean' }, appearance: { type: 'boolean' }, narrow: { type: 'boolean' },
} });
assert.ok(!values.narrow || values.appearance, '--narrow requires --appearance');
assert.ok(!values['appearance-pair'] || values.appearance, '--appearance-pair requires --appearance');
assert.ok(values.journey && values.app && values.output, 'Usage: run-journey --journey <id> --app <Aux.app> --output <dir>');
if (!process.env.AUX_NATIVE_SLOT_TOKEN) {
  const result = spawnSync(process.execPath, [join(root, 'scripts/native-slot.mjs'), '--', process.execPath,
    join(root, 'tests/host/run-journey.mjs'), ...process.argv.slice(2)], { cwd: root, stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
const slot = await acquireNativeSlot();
process.env.AUX_NATIVE_SLOT_TOKEN = slot.token;
try {
let entry;
if (values.journey === MOUNTED_IMAGE_APPEARANCE_ID) {
  requireMountedImageAppearance({ journeyId: values.journey, appearance: Boolean(values.appearance), pair: values['appearance-pair'] });
  const path = join(root, 'tests/host/appearance-journeys/mounted-image-appearance.mjs');
  const module = await import('./appearance-journeys/mounted-image-appearance.mjs');
  entry = { ...module, path };
} else if (values.journey === MOUNTED_LONG_IMAGE_APPEARANCE_ID) {
  requireMountedLongImageAppearance({ journeyId: values.journey, appearance: Boolean(values.appearance), pair: values['appearance-pair'] });
  const path = join(root, 'tests/host/appearance-journeys/mounted-long-image-appearance.mjs');
  const module = await import('./appearance-journeys/mounted-long-image-appearance.mjs');
  entry = { ...module, path };
} else if (values.journey === 'model-settings-appearance') {
  requireModelSettingsAppearance({ journeyId: values.journey, appearance: Boolean(values.appearance), pair: values['appearance-pair'] });
  const path = join(root, 'tests/host/appearance-journeys/model-settings-appearance.mjs');
  const module = await import('./appearance-journeys/model-settings-appearance.mjs');
  entry = { ...module, path };
} else if (values.journey === 'model-probe-success-appearance') {
  requireModelProbeAppearance({ journeyId: values.journey, appearance: Boolean(values.appearance), pair: values['appearance-pair'] });
  const path = join(root, 'tests/host/appearance-journeys/model-probe-success-appearance.mjs');
  const module = await import('./appearance-journeys/model-probe-success-appearance.mjs');
  entry = { ...module, path };
} else if (values.journey === 'model-probe-failure-appearance') {
  requireModelProbeAppearance({ journeyId: values.journey, appearance: Boolean(values.appearance), pair: values['appearance-pair'] });
  const path = join(root, 'tests/host/appearance-journeys/model-probe-failure-appearance.mjs');
  const module = await import('./appearance-journeys/model-probe-failure-appearance.mjs');
  entry = { ...module, path };
} else if (values.journey === LONG_MODEL_CATALOG_ID) {
  requireLongModelCatalogAppearance({ journeyId: values.journey, appearance: Boolean(values.appearance), pair: values['appearance-pair'] });
  const path = join(root, 'tests/host/appearance-journeys/long-model-catalog-appearance.mjs');
  const module = await import('./appearance-journeys/long-model-catalog-appearance.mjs');
  entry = { ...module, path };
} else if (values.journey === PAGE_RECOVERY_APPEARANCE_ID) {
  requirePageRecoveryAppearance({ journeyId: values.journey, appearance: Boolean(values.appearance), pair: values['appearance-pair'] });
  const path = join(root, 'tests/host/appearance-journeys/page-recovery-appearance.mjs');
  const module = await import('./appearance-journeys/page-recovery-appearance.mjs');
  entry = { ...module, path };
} else if (values.journey === MODEL_DISCOVERY_APPEARANCE_ID) {
  requireModelDiscoveryAppearance({ journeyId: values.journey, appearance: Boolean(values.appearance), pair: values['appearance-pair'] });
  const path = join(root, 'tests/host/appearance-journeys/model-discovery-appearance.mjs');
  const module = await import('./appearance-journeys/model-discovery-appearance.mjs');
  entry = { ...module, path };
} else if (values.journey === MEMORY_APPEARANCE_ID) {
  requireMemoryAppearance({ journeyId: values.journey, appearance: Boolean(values.appearance), pair: values['appearance-pair'] });
  const path = join(root, 'tests/host/appearance-journeys/memory-appearance.mjs');
  const module = await import('./appearance-journeys/memory-appearance.mjs');
  entry = { ...module, path };
} else if (values.journey === MENTIONS_APPEARANCE_ID) {
  requireMentionsAppearance({ journeyId: values.journey, appearance: Boolean(values.appearance), pair: values['appearance-pair'] });
  const path = join(root, 'tests/host/appearance-journeys/mentions-appearance.mjs');
  const module = await import('./appearance-journeys/mentions-appearance.mjs');
  entry = { ...module, path };
} else if (values.journey === SETUP_IMPORT_INTERRUPTION_ID) {
  requireImportInterruptionAppearance({ journeyId: values.journey, appearance: Boolean(values.appearance), pair: values['appearance-pair'] });
  const path = join(root, 'tests/host/appearance-journeys/setup-import-interruption-appearance.mjs');
  const module = await import('./appearance-journeys/setup-import-interruption-appearance.mjs');
  entry = { ...module, path };
} else if (values.journey === SETUP_IMPORT_APPEARANCE_ID) {
  requireSetupImportAppearance({ journeyId: values.journey, appearance: Boolean(values.appearance), pair: values['appearance-pair'] });
  const path = join(root, 'tests/host/appearance-journeys/setup-import-appearance.mjs');
  const module = await import('./appearance-journeys/setup-import-appearance.mjs');
  entry = { ...module, path };
} else if (values.journey === SETUP_APPEARANCE_ID) {
  requireSetupAppearance({ journeyId: values.journey, appearance: Boolean(values.appearance), pair: values['appearance-pair'] });
  const path = join(root, 'tests/host/appearance-journeys/setup-appearance.mjs');
  const module = await import('./appearance-journeys/setup-appearance.mjs');
  entry = { ...module, path };
} else entry = (await journeyRegistry()).find(entry => entry.journey.id === values.journey);
assert.ok(entry, `Unknown journey: ${values.journey}`);
const { journey, run } = entry;
assert.ok(!journey.needs.includes('owner-presence') || values.attended, 'Journey requires --attended and owner presence');
const outputDir = resolve(values.output);
mkdirSync(outputDir, { recursive: true });
assert.ok(!existsSync(join(outputDir, 'manifest.json')), 'Evidence manifests must not be overwritten');
const identity = productIdentity(root);
const manifest = { schema: 2, id: journey.id, features: journey.features, needs: journey.needs,
  moduleSha256: sha256(readFileSync(entry.path)), harnessCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  productIdentity: identity, shellDigest: JSON.parse(readFileSync(join(root, 'chromium/shell-assets/manifest.json'), 'utf8')).sha256,
  attempt: Number(values.attempt), startedAt: new Date().toISOString(), steps: [], captures: [],
};
const helperValues = ['native-window-manifest', 'native-window-manifest-sha', 'native-window-audit', 'native-window-audit-sha'].map(key => values[key]);
assert.ok(helperValues.every(Boolean) || helperValues.every(value => value === undefined), 'All four externally approved helper pins are required together');
const helperAdmission = helperValues.every(Boolean) ? { manifestPath: resolve(helperValues[0]), manifestSha256: helperValues[1], auditPath: resolve(helperValues[2]), auditSha256: helperValues[3] } : undefined;
assert.ok(journey.id !== 'cdp-retirement-performance' || helperAdmission, 'M4 requires externally approved original input-helper artifacts');
const compilerArtifact = helperAdmission ? retainNativeWindowCompiler(helperAdmission) : undefined;
let app, ax, fixture, evidence, appearance, pipAppearance, appearancePair;
let importSourcePrepared = false;
if (values['appearance-pair']) appearancePair = retainPackagedRuntimePair(JSON.parse(readFileSync(resolve(values['appearance-pair']), 'utf8')));
const appearanceHelper = () => appearancePair ? app.createAppearanceHelper() : createAxClient(app.pid, compilerArtifact === undefined ? {} : { compilerArtifact });
assert.ok(!appearancePair || !helperAdmission, 'Appearance pair and standalone helper admissions are separate');
async function configureAppearance() {
  if (!values.appearance) return;
  const actual = await app.identity();
  assertJourneyIdentity(actual, identity);
  const candidate = { productIdentity: identity, native: { sourceCommit: actual.native.sourceCommit, buildId: actual.native.buildId, manifestHash: actual.native.manifestHash }, shellDigest: manifest.shellDigest, harnessCommit: manifest.harnessCommit, moduleSha256: manifest.moduleSha256 };
  if (appearancePair && app.processObservation.launchKind === 'launch-services') {
    await app.configureLaunchServicesAppearance(candidate, ax);
    appearance = createLaunchServicesAppearanceProvenance({ app, pair: appearancePair, outputDir, candidate,
      helper: ax, helperSource: ax.helperSource, helperExecutable: ax.helperExecutable });
    pipAppearance = undefined;
    manifest.provenanceProducers = appearance.pins;
    return;
  }
  app.configureAppearance(candidate);
  appearance = createAppearanceProvenance({ outputDir, candidate, targetPid: app.pid, helper: ax, helperSource: ax.helperSource, helperExecutable: ax.helperExecutable, observeWindow: selection => app.observeAppearance(selection), discoverUtilityWindow: selection => app.discoverUtilityAppearance(selection), readIdentity: () => app.identity() });
  pipAppearance = createPipAppearanceProvenance({ outputDir, candidate, targetPid: app.pid, helper: ax, helperSource: ax.helperSource, helperExecutable: ax.helperExecutable, observeWindow: selection => app.observePipAppearance(selection), readIdentity: () => app.identity() });
  manifest.provenanceProducers = appearance.pins;
}
const controller = new AbortController();
const { signal } = controller;
const narrowGenerations = values.narrow ? createOwnedNarrowGenerations(() => ({ app, ax, appearanceEnabled: true, signal, provenance: appearance, readRuntimePages: async () => { const rpc = createRpc(() => app.descriptor()); return rpc('pages.list'); }, capture: (name, options) => evidence.capture(name, options) }), manifest) : undefined;
let deadline;
const inputs = [];
const inputCommands = new Set(['press', 'click', 'focus', 'key', 'type', 'drag', 'scroll', 'menu', 'contextMenu', 'savePanel', 'openPanel']);
async function execute() {
  const permissions = appearancePair ? preflightAppearancePair(appearancePair) : await preflight(compilerArtifact === undefined ? {} : { compilerArtifact });
  assert.ok(permissions.accessibility && permissions.screenRecording, 'Accessibility and Screen Recording are required');
  fixture = await createFixture({ tls: journey.fixture?.tls === true });
  let model;
  if (journey.model === 'loopback') {
    const { createModelFixture } = await import('./lib/model-fixture.mjs');
    model = await createModelFixture(fixture, { signal });
  }
  const launch = typeof journey.launch === 'function' ? journey.launch({ fixture, model, identity, appearance: Boolean(values.appearance) }) : journey.launch ?? {};
  assert.ok(!values.appearance || !launch.perf, 'Appearance sampling must not perturb a performance run');
  app = createJourneyApp({ appPath: resolve(values.app), ...(appearancePair ? { appearancePair } : {}), launch: {
    ...launch,
    ...(values.appearance ? { args: [...(launch.args ?? []), '--aux-native-appearance-observer'] } : {}),
    ...(journey.devAcceptance?.length ? { devAcceptance: { features: journey.devAcceptance, sourceCommit: identity.label } } : {}),
  } });
  if (journey.prepare) {
    const prepared = await journey.prepare({ app: { userDataDir: app.userDataDir }, fixture, model });
    if (prepared?.env) app.prepareFixtureEnv(prepared.env, fixture.url);
    signal.throwIfAborted();
  }
  if (journey.id === SETUP_IMPORT_APPEARANCE_ID || journey.id === SETUP_IMPORT_INTERRUPTION_ID) {
    try {
      if (journey.id === SETUP_IMPORT_INTERRUPTION_ID) app.prepareImportInterruptionSourceHome(fixture.url);
      else app.prepareImportSourceHome(fixture.url);
      importSourcePrepared = true;
    }
    catch (error) { if (error.retainedSourceHome) manifest.importSourcePreparationFailure = error.retainedSourceHome; throw error; }
  }
  await app.start();
  signal.throwIfAborted();
  ax = await appearanceHelper();
  signal.throwIfAborted();
  const observedAx = new Proxy({}, { get(_target, property) {
    const member = ax[property];
    if (typeof member !== 'function') return member;
    return async (...args) => {
      signal.throwIfAborted();
      const command = property === 'request' ? args[0] : property;
      const started = performance.now();
      let result;
      try { result = await member.apply(ax, args); }
      catch (error) {
        if (inputCommands.has(command) || command === 'measureKey') inputs.push({ command: command === 'measureKey' ? 'key' : command,
          status: 'failed', elapsedMs: performance.now() - started, error: error.message });
        throw error;
      }
      signal.throwIfAborted();
      if (command === 'measureKey') inputs.push({ command: 'key', sourceCommand: command, status: 'passed', elapsedMs: performance.now() - started, measurement: result });
      else if (inputCommands.has(command)) inputs.push({ command, status: 'passed', elapsedMs: performance.now() - started });
      return result;
    };
  } });
  const nativeRpc = createRpc(() => app.descriptor());
  const rpc = async (...args) => { signal.throwIfAborted(); const result = await nativeRpc(...args); signal.throwIfAborted(); return result; };
  evidence = createEvidence(outputDir, observedAx, () => appearance, () => pipAppearance);
  await configureAppearance();
  const until = createUntil(signal);
  const actual = await app.identity();
  const clock = createClock(actual.native.testClockScale);
  function savePerformanceReport(prefix, report) {
    assert.match(report.metric, /^[a-z-]{1,40}$/);
    const records = manifest.performance ??= []; assert.ok(records.length < 8, 'Performance report count exceeded');
    const filename = `${prefix}-${report.metric}-${records.length + 1}.json`;
    const bytes = Buffer.from(JSON.stringify(report, null, 2) + '\n');
    assert.ok(bytes.length <= 1048576, 'Performance report exceeds bound');
    writeFileSync(join(outputDir, filename), bytes, { flag: 'wx' });
    records.push({ filename, bytes: bytes.length, sha256: sha256(bytes), status: report.status });
  }
  async function measurePerformance(prefix, produce) {
    signal.throwIfAborted(); assert.ok(!values.appearance, 'Performance trials cannot include appearance sampling');
    let report;
    try { report = await produce(); return report; }
    catch (error) { report = error.report; throw error; }
    finally { if (report) savePerformanceReport(prefix, report); }
  }
  let processMemoryReader;
  const memoryCandidate = () => ({ productIdentity: manifest.productIdentity, native: manifest.native,
    shellDigest: manifest.shellDigest, harnessCommit: manifest.harnessCommit, moduleSha256: manifest.moduleSha256 });
  async function ownedMemoryReader() {
    assert.ok(!values.appearance && launch.perf, 'Native process memory requires its separate performance launch');
    if (!processMemoryReader) {
      const { createNativeProcessMemoryReader } = await import('./lib/native-process-memory.mjs');
      processMemoryReader = createNativeProcessMemoryReader({ transport: app.configurePerformanceMailbox(),
        browserPid: app.pid, candidate: memoryCandidate(), readIdentity: () => app.identity() });
    }
    return processMemoryReader;
  }
  const context = { app, rpc, fixture, model, appearanceEnabled: Boolean(values.appearance), narrowEnabled: Boolean(values.narrow), ax: observedAx, assert, until, visual: createVisual(outputDir),
    async startSubagentMemoryWorkload({ scopedRpc, parent, idlePageIds, parentHold }) {
      const { startSubagentMemoryWorkload } = await import('./lib/native-subagent-memory-workload.mjs');
      const { createNativeWorkloadPreparationAdapter } = await import('./lib/native-memory-workload-collector.mjs');
      const preparation = createNativeWorkloadPreparationAdapter(await ownedMemoryReader());
      const report = { schema: 1, metric: 'subagent-preparation', candidate: memoryCandidate(),
        endpoint: 'original authenticated native paused-parent preparation', attempts: preparation.observations, status: 'running' };
      signal.throwIfAborted();
      let workload, failure;
      try {
        workload = await startSubagentMemoryWorkload({ scopedRpc, model, parent, idlePageIds, parentHold,
          signal, until, readNativePreparation: preparation.readNativePreparation });
        report.status = 'prepared';
      } catch (error) { failure = error; report.status = 'failed'; report.error = error.message; }
      try { savePerformanceReport('performance', report); }
      catch (error) {
        const errors = [failure, error].filter(Boolean);
        if (workload) try { await workload.cleanup(); } catch (cleanupError) { errors.push(cleanupError); }
        throw new AggregateError(errors, 'Native workload preparation report could not be retained');
      }
      if (failure) throw failure;
      return workload;
    },
    async measureCdpRetirement(options) {
      const { collectNativeCdpRetirement } = await import('./lib/native-cdp-retirement-collector.mjs');
      const { execFileSync } = await import('node:child_process');
      return measurePerformance('performance', () => collectNativeCdpRetirement({ ...options,
        app, mailbox: app.configurePerformanceMailbox(), signal, ax: observedAx, compilerArtifact, helperAdmission,
        candidate: memoryCandidate(), readIdentity: () => app.identity(),
        readPower: () => execFileSync('/usr/bin/pmset', ['-g', 'batt'], { encoding: 'utf8', timeout: 5000 }) }));
    },
    async measureProcessMemory({ mode, workload, idlePageIds }) {
      const { collectNativeMemoryBudget } = await import('./lib/native-memory-budget.mjs');
      const reader = await ownedMemoryReader();
      return measurePerformance('performance', () => collectNativeMemoryBudget({ mode, workload, idlePageIds,
        reader, browserPid: app.pid, readPages: () => rpc('pages.list'), signal }, memoryCandidate()));
    },
    async measureGuestPresentations(options) {
      const { collectGuestPresentations } = await import('./lib/native-guest-performance.mjs');
      const candidate = { productIdentity: manifest.productIdentity, native: manifest.native,
        shellDigest: manifest.shellDigest, harnessCommit: manifest.harnessCommit, moduleSha256: manifest.moduleSha256 };
      return measurePerformance('hardware', () => collectGuestPresentations({ ...options, trials: 20, candidate,
        ax: observedAx, transport: app.configurePerformanceMailbox(), readIdentity: () => app.identity() }));
    },
    async measureOrganizationWork(options) {
      const { collectNativeOrganizationWork } = await import('./lib/native-organization-performance.mjs');
      const candidate = { productIdentity: manifest.productIdentity, native: manifest.native,
        shellDigest: manifest.shellDigest, harnessCommit: manifest.harnessCommit, moduleSha256: manifest.moduleSha256 };
      return measurePerformance('performance', () => collectNativeOrganizationWork({ ...options, trials: 20, candidate,
        ax: observedAx, transport: app.configurePerformanceMailbox(), readIdentity: () => app.identity() }));
    },
    async measureShellMemory(options) {
      const { collectShellMemory } = await import('./lib/native-shell-memory.mjs');
      const candidate = { productIdentity: manifest.productIdentity, native: manifest.native,
        shellDigest: manifest.shellDigest, harnessCommit: manifest.harnessCommit, moduleSha256: manifest.moduleSha256 };
      return measurePerformance('performance', () => collectShellMemory({ ...options, trials: 20, candidate,
        browserPid: app.pid, transport: app.configurePerformanceMailbox(), readIdentity: () => app.identity() }));
    },
    async measureNativeKeyEffects(options) {
      const { metric, chord, selector, effect, additionalHiddenSelectors, prepareTrial } = options;
      const candidate = { productIdentity: identity,
        native: { sourceCommit: actual.native.sourceCommit, buildId: actual.native.buildId, manifestHash: actual.native.manifestHash },
        shellDigest: manifest.shellDigest, harnessCommit: manifest.harnessCommit, moduleSha256: manifest.moduleSha256 };
      return measurePerformance('performance', () => collectNativeKeyEffects({ metric, chord, selector, effect,
        additionalHiddenSelectors, prepareTrial, trials: 20, candidate, ax: observedAx, readIdentity: () => app.identity() }));
    },
    async restart(options) {
      if (narrowGenerations) await narrowGenerations.restore();
      signal.throwIfAborted();
      appearance = undefined; pipAppearance = undefined;
      await ax.close();
      ax = undefined;
      await app.restart(options);
      ax = await appearanceHelper();
      assertJourneyIdentity(await app.identity(), identity);
      await configureAppearance();
      if (narrowGenerations) await narrowGenerations.prepare();
      signal.throwIfAborted();
    },
    async openAux(url, options) {
      if (options?.cold && narrowGenerations) await narrowGenerations.restore();
      signal.throwIfAborted();
      if (options?.cold) { appearance = undefined; pipAppearance = undefined; await ax.close(); ax = undefined; }
      const receipt = await app.openAux(url, options);
      if (options?.cold) {
        ax = await appearanceHelper();
        assertJourneyIdentity(await app.identity(), identity);
        await configureAppearance();
        if (narrowGenerations) await narrowGenerations.prepare();
      }
      signal.throwIfAborted();
      return receipt;
    },
    diagnostic(name, value) {
      assert.match(name, /^[a-z0-9-]{1,80}$/);
      const bytes = Buffer.from(JSON.stringify(value, null, 2) + '\n');
      assert.ok(bytes.length <= 65536, 'Journey diagnostic must fit 64 KiB');
      const records = manifest.diagnostics ??= [];
      assert.ok(records.length < 16, 'Journey diagnostic count must be bounded');
      const filename = `diagnostic-${name}.json`;
      writeFileSync(join(outputDir, filename), bytes, { flag: 'wx' });
      records.push({ name, filename, bytes: bytes.length, sha256: sha256(bytes) });
    },
    discoverPipAppearance: async selection => {
      signal.throwIfAborted();
      assert.ok(values.appearance && pipAppearance, 'Counted child capture requires actual appearance enabled');
      return app.discoverPipAppearance(selection);
    },
    capturePip: async (name, options) => { signal.throwIfAborted(); return evidence.capturePip(name, options); },
    captureUtilityNarrowWindow: async (page, name, state) => { signal.throwIfAborted(); assert.ok(narrowGenerations); return narrowGenerations.captureUtility({ windowId: page.windowId, windowKind: page.windowKind }, name, state); },
    captureDistinctNarrowGeneration: async (name, state) => { signal.throwIfAborted(); assert.ok(narrowGenerations); return narrowGenerations.captureDistinct(name, state); },
    capture: async (name, options) => { signal.throwIfAborted(); return evidence.capture(name, options); }, clock,
    async step(name, options, action) {
      signal.throwIfAborted();
      assert.ok(['ui', 'rpc', 'operator'].includes(options.kind), 'Step needs an evidence kind');
      const step = { name, ...options, status: 'running', startedAt: new Date().toISOString() };
      manifest.steps.push(step);
      const start = inputs.length;
      try {
        const observations = await action();
        signal.throwIfAborted();
        step.inputs = inputs.slice(start);
        if (options.kind === 'ui') {
          assert.ok(step.inputs.some(input => input.status === 'passed'), 'UI step did not drive Accessibility or CGEvent input');
          assert.ok(observations?.ax && observations?.rpc, 'UI step needs AX and RPC/native observations');
        }
        if (options.kind === 'operator') assert.ok(values.attended && journey.needs.includes('owner-presence'), 'Undeclared operator step');
        step.observations = observations;
        step.status = 'passed';
      } catch (error) { step.status = 'failed'; step.error = error.message; throw error; }
      finally { step.inputs = inputs.slice(start); }
    },
  };
  manifest.native = actual.native;
  manifest.runtime = actual.runtime;
  assertJourneyIdentity(actual, identity);
  if (journey.id !== SETUP_IMPORT_APPEARANCE_ID && journey.id !== SETUP_IMPORT_INTERRUPTION_ID && setupDisposition(journey.id, Boolean(values.appearance), appearancePair) === 'dismiss')
    await dismissObservedSetup(context, appearance ? windowId => appearance.observeWindowKind(windowId) : undefined);
  if (narrowGenerations) {
    await narrowGenerations.prepare();
    signal.throwIfAborted();
  }
  await run(context);
  manifest.captures = evidence.captures;
  assert.ok(manifest.steps.length && manifest.steps.every(step => step.status === 'passed'), 'Journey did not prove any behavior');
  assert.deepEqual(productIdentity(root), identity, 'Product changed during journey');
  manifest.completedAt = new Date().toISOString();
}
const interrupted = () => controller.abort(new Error(`Journey interrupted: ${journey.id}`));
process.on('SIGINT', interrupted);
process.on('SIGTERM', interrupted);
try {
  const cancelled = new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    deadline = setTimeout(() => controller.abort(new Error(`Journey deadline exceeded: ${journey.id}`)), journey.timeoutMs);
  });
  await Promise.race([execute(), cancelled]);
} catch (error) {
  manifest.error = error.stack ?? String(error);
  if (app) writeFileSync(join(outputDir, 'failure-process.json'), JSON.stringify(app.processObservation, null, 2) + '\n');
  if (ax) {
    try { writeFileSync(join(outputDir, 'failure-ax.json'), JSON.stringify(await ax.dump(), null, 2)); }
    catch { /* A crashed native app may no longer have an AX tree. */ }
  }
  process.stderr.write(`${manifest.error}\n`);
  process.exitCode = 1;
} finally {
  clearTimeout(deadline);
  controller.abort(new Error('Journey has finished'));
  if (narrowGenerations) {
    try { await narrowGenerations.restore(); }
    catch { process.exitCode = 1; } // The original generation retains its actual cleanup error.
  }
  for (const [name, cleanup] of [['ax', () => ax?.close()], ['app', () => importSourcePrepared ? retirePreparedImportSource(app) : app?.quit()], ['fixture', () => fixture?.close()]]) {
    try { await cleanup(); if (name === 'ax') compilerArtifact?.release(); } catch (error) {
      (manifest.cleanupErrors ??= []).push({ name, error: error.message });
      process.exitCode = 1;
    }
  }
  if (appearancePair && app?.launchServicesQuarantineReceipt) manifest.nativeSlotQuarantine = app.launchServicesQuarantineReceipt;
  if (appearancePair && !(manifest.cleanupErrors?.length)) appearancePair.release();
  // A failed original helper/process cleanup retains admission and native slot
  // debt; no caller cached PID is signalled or labelled reaped here.
  process.off('SIGINT', interrupted);
  process.off('SIGTERM', interrupted);
  manifest.captures = evidence?.captures ?? [];
  if (app) writeFileSync(join(outputDir, 'launcher.log'), app.log);
  writeFileSync(join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
}
} finally { slot.release(); }
