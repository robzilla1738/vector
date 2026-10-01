#!/usr/bin/env node
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
import { createFixture } from './lib/fixture.mjs';
import { createEvidence } from './lib/evidence.mjs';
import { createVisual } from './lib/visual.mjs';
import { assertJourneyIdentity } from './lib/identity.mjs';
import { acquireNativeSlot } from '../../scripts/native-slot.mjs';

const root = resolve(import.meta.dirname, '../..');
const { values } = parseArgs({ options: {
  journey: { type: 'string' }, app: { type: 'string' }, output: { type: 'string' },
  attempt: { type: 'string', default: '1' }, attended: { type: 'boolean' },
} });
assert.ok(values.journey && values.app && values.output, 'Usage: run-journey --journey <id> --app <Aux.app> --output <dir>');
if (!process.env.AUX_NATIVE_SLOT_TOKEN) {
  const result = spawnSync(process.execPath, [join(root, 'scripts/native-slot.mjs'), '--', process.execPath,
    join(root, 'tests/host/run-journey.mjs'), ...process.argv.slice(2)], { cwd: root, stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
const slot = await acquireNativeSlot();
process.env.AUX_NATIVE_SLOT_TOKEN = slot.token;
try {
const entry = (await journeyRegistry()).find(entry => entry.journey.id === values.journey);
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
let app, ax, fixture, evidence;
const controller = new AbortController();
const { signal } = controller;
let deadline;
const inputs = [];
const inputCommands = new Set(['press', 'click', 'focus', 'key', 'type', 'drag', 'scroll', 'menu', 'contextMenu', 'savePanel', 'openPanel']);
async function execute() {
  const permissions = await preflight();
  assert.ok(permissions.accessibility && permissions.screenRecording, 'Accessibility and Screen Recording are required');
  fixture = await createFixture();
  let model;
  if (journey.model === 'loopback') {
    const { createModelFixture } = await import('./lib/model-fixture.mjs');
    model = await createModelFixture(fixture);
  }
  const launch = typeof journey.launch === 'function' ? journey.launch({ fixture, model, identity }) : journey.launch ?? {};
  app = createJourneyApp({ appPath: resolve(values.app), launch: {
    ...launch,
    ...(journey.devAcceptance?.length ? { devAcceptance: { features: journey.devAcceptance, sourceCommit: identity.label } } : {}),
  } });
  await app.start();
  signal.throwIfAborted();
  ax = await createAxClient(app.pid);
  signal.throwIfAborted();
  const observedAx = new Proxy({}, { get(_target, property) {
    const member = ax[property];
    if (typeof member !== 'function') return member;
    return async (...args) => {
      signal.throwIfAborted();
      const command = property === 'request' ? args[0] : property;
      const started = performance.now();
      const result = await member.apply(ax, args);
      signal.throwIfAborted();
      if (inputCommands.has(command)) inputs.push({ command, status: 'passed', elapsedMs: performance.now() - started });
      return result;
    };
  } });
  const nativeRpc = createRpc(() => app.descriptor());
  const rpc = async (...args) => { signal.throwIfAborted(); const result = await nativeRpc(...args); signal.throwIfAborted(); return result; };
  evidence = createEvidence(outputDir, observedAx);
  const until = async (name, predicate, timeoutMs = 10_000) => {
    const end = performance.now() + timeoutMs;
    while (performance.now() < end) { signal.throwIfAborted(); const value = await predicate(); if (value) return value; await new Promise(resolve => setTimeout(resolve, 50)); }
    throw new Error(`Timed out: ${name}`);
  };
  const actual = await app.identity();
  const clock = createClock(actual.native.testClockScale);
  const context = { app, rpc, fixture, model, ax: observedAx, assert, until, visual: createVisual(outputDir),
    async restart() {
      signal.throwIfAborted();
      await ax.close();
      ax = undefined;
      await app.restart();
      ax = await createAxClient(app.pid);
      assertJourneyIdentity(await app.identity(), identity);
      signal.throwIfAborted();
    },
    capture: async name => { signal.throwIfAborted(); return evidence.capture(name); }, clock,
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
          assert.ok(step.inputs.length, 'UI step did not drive Accessibility or CGEvent input');
          assert.ok(observations?.ax && observations?.rpc, 'UI step needs AX and RPC/native observations');
        }
        if (options.kind === 'operator') assert.ok(values.attended && journey.needs.includes('owner-presence'), 'Undeclared operator step');
        step.observations = observations;
        step.status = 'passed';
      } catch (error) { step.status = 'failed'; step.error = error.message; throw error; }
    },
  };
  manifest.native = actual.native;
  manifest.runtime = actual.runtime;
  assertJourneyIdentity(actual, identity);
  const finishLater = { role: 'AXButton', name: 'Finish later', match: 'exact', scope: 'shell', index: 0 };
  await observedAx.waitFor(finishLater, 'present', 15_000);
  await context.step('dismiss optional fresh-profile setup', { kind: 'ui', features: [] }, async () => {
    await observedAx.press(finishLater);
    await observedAx.waitFor(finishLater, 'absent');
    return { ax: await observedAx.dump(), rpc: await rpc('workspace.get') };
  });
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
  if (ax) {
    try { writeFileSync(join(outputDir, 'failure-ax.json'), JSON.stringify(await ax.dump(), null, 2)); }
    catch { /* A crashed native app may no longer have an AX tree. */ }
  }
  process.stderr.write(`${manifest.error}\n`);
  process.exitCode = 1;
} finally {
  clearTimeout(deadline);
  controller.abort(new Error('Journey has finished'));
  for (const [name, cleanup] of [['ax', () => ax?.close()], ['app', () => app?.quit()], ['fixture', () => fixture?.close()]]) {
    try { await cleanup(); } catch (error) {
      (manifest.cleanupErrors ??= []).push({ name, error: error.message });
      process.exitCode = 1;
    }
  }
  process.off('SIGINT', interrupted);
  process.off('SIGTERM', interrupted);
  manifest.captures = evidence?.captures ?? [];
  if (app) writeFileSync(join(outputDir, 'launcher.log'), app.log);
  writeFileSync(join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
}
} finally { slot.release(); }
