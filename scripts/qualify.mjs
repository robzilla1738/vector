#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { closeSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { productIdentity } from './lib/product-identity.mjs';
import { emptyQualification, featureRecord, sha256, sortedQualification, validateJourneyManifest } from './lib/qualification.mjs';

const root = resolve(import.meta.dirname, '..');
const recordPath = join(root, 'docs/qualification.json');
const { values, positionals } = parseArgs({ allowPositionals: true, options: {
  feature: { type: 'string', multiple: true }, all: { type: 'boolean' },
  'changed-since': { type: 'string' }, app: { type: 'string' }, build: { type: 'boolean' },
  'no-record': { type: 'boolean' }, 'dry-run': { type: 'boolean' }, promote: { type: 'boolean' },
  attended: { type: 'boolean' }, 'carry-forward': { type: 'boolean' }, retries: { type: 'string', default: '1' },
  initialize: { type: 'boolean' },
} });

function writeRecords(value) {
  const temporary = `${recordPath}.${process.pid}.tmp`;
  try {
    writeFileSync(temporary, JSON.stringify(sortedQualification(value), null, 2) + '\n', { flag: 'wx' });
    const file = openSync(temporary, 'r');
    try { fsyncSync(file); } finally { closeSync(file); }
    renameSync(temporary, recordPath);
    const directory = openSync(join(root, 'docs'), 'r');
    try { fsyncSync(directory); } finally { closeSync(directory); }
  } finally { rmSync(temporary, { force: true }); }
}

let records = emptyQualification(JSON.parse(readFileSync(recordPath, 'utf8')));
if (values.initialize) {
  assert.equal(Object.keys(values).filter(key => key !== 'initialize' && key !== 'retries').length, 0, '--initialize cannot run journeys');
  writeRecords(records);
  console.log('Initialized schema-2 qualification; legacy feature claims require new journey evidence.');
  process.exit(0);
}

const { journeyRegistry, checkJourneyRegistry, TARGET_FEATURES } = await import('../tests/host/journeys/index.mjs');
const registry = await journeyRegistry();
const requested = [...(values.feature ?? []), ...positionals];
const promotionOnly = values.promote && !values.build && !values.all && !values['changed-since'] && !requested.length;
assert.ok(!values.promote || !values['no-record'], '--promote requires written qualification records');
assert.ok(values.all || requested.length || values['changed-since'] || values.promote,
  'Select --feature <feature>… | --all | --changed-since <commit> | --promote');
if (values['changed-since']) execFileSync('git', ['rev-parse', '--verify', `${values['changed-since']}^{commit}`], { cwd: root });
// Conservative invalidation: a product change can affect shared methods in any journey.
const features = values.all || values['changed-since']
  ? [...new Set([...TARGET_FEATURES, ...Object.keys(records.features)])].sort()
  : requested.length ? [...new Set(requested)].sort() : Object.keys(records.features).sort();
const selected = registry.filter(entry => entry.journey.features.some(feature => features.includes(feature)));
checkJourneyRegistry(selected, features);
assert.ok(selected.length, 'No journeys selected');
for (const feature of features) assert.ok(selected.some(entry => entry.journey.features.includes(feature)), `No journey for ${feature}`);
const retries = Number(values.retries);
assert.ok(Number.isInteger(retries) && retries >= 0 && retries <= 10, '--retries must be an integer from 0 to 10');
if (!values.attended) assert.ok(selected.every(entry => !entry.journey.needs.includes('owner-presence')), 'Selected journeys require --attended and owner presence');
if (values['dry-run']) {
  console.log(JSON.stringify({ identity: productIdentity(root), features, journeys: selected.map(entry => entry.journey.id) }, null, 2));
  process.exit(0);
}

// Re-exec once so every nested stage, build and AX helper inherits the slot token.
if (!process.env.AUX_NATIVE_SLOT_TOKEN) {
  const result = spawnSync(process.execPath, [join(root, 'scripts/native-slot.mjs'), '--', process.execPath,
    join(root, 'scripts/qualify.mjs'), ...process.argv.slice(2)], { cwd: root, stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
const { acquireNativeSlot } = await import('./native-slot.mjs');
const slot = await acquireNativeSlot();
process.env.AUX_NATIVE_SLOT_TOKEN = slot.token;
try {
const identity = productIdentity(root);
assert.equal(identity.dirty, false, 'Commit product changes before qualification');
assert.equal(execFileSync('git', ['status', '--porcelain', '--', 'tests/host'], { cwd: root }).length, 0,
  'Commit the journey harness before qualification');
const appPath = resolve(values.app ?? join(homedir(), 'aux-chromium-stable/chromium/src/out/AuxDev/Aux.app'));
const source = resolve(process.env.AUX_CHROMIUM_SRC ?? join(homedir(), 'aux-chromium-stable/chromium/src'));
const { preflight } = await import('../tests/host/lib/ax.mjs');
const permissions = await preflight();
assert.ok(permissions.accessibility && permissions.screenRecording, 'Grant Accessibility and Screen Recording to the agent host');
const processes = execFileSync('ps', ['-axo', 'command='], { encoding: 'utf8' });
assert.ok(!processes.split('\n').some(command => command.startsWith(join(appPath, 'Contents/MacOS/Aux') + ' ')),
  'Quit AuxDev before qualification');
const awake = spawnSync('which', ['caffeinate'], { encoding: 'utf8' });
assert.equal(awake.status, 0, 'caffeinate is required');
const { spawn } = await import('node:child_process');
const caffeinate = spawn(awake.stdout.trim(), ['-dimsu'], { stdio: 'ignore' });
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env: process.env });
  assert.equal(result.status, 0, `${command} failed`);
}
function build() {
  run('python3', [join(root, 'chromium/aux-chromium'), 'stage-shell']);
  run('python3', [join(root, 'chromium/aux-chromium'), 'build']);
  run(process.execPath, [join(root, 'chromium/stage-runtime.mjs'), appPath]);
}
function staticChecks() {
  const header = readFileSync(join(source, 'chrome/browser/ui/aux/generated/aux_host_methods.h'), 'utf8');
  assert.equal(header.match(/kSourceCommit = "([a-f0-9]{40}(\+dirty)?)"/)?.[1], identity.label, 'Staged native identity mismatch');
  run(process.execPath, [join(root, 'chromium/stage-shell.mjs'), 'verify']);
  assert.deepEqual(JSON.parse(readFileSync(join(appPath, 'Contents/Resources/aux-runtime/aux-runtime-identity.json'), 'utf8')), identity,
    'Staged runtime identity mismatch');
  const tail = readFileSync(join(root, 'chromium/patches/series'), 'utf8').split('\n').filter(line => line && !line.startsWith('#')).at(-1);
  execFileSync('git', ['apply', '--reverse', '--check', join(root, 'chromium/patches', tail)], { cwd: source });
}
try {
  if (values.build) build();
  staticChecks();
  if (promotionOnly) {
    for (const feature of features) {
      const record = records.features[feature];
      assert.equal(record.commit, identity.commit, `${feature} record has a different product commit`);
      assert.equal(record.productTree, identity.tree, `${feature} record has a different product tree`);
      const required = selected.filter(entry => entry.journey.features.includes(feature));
      assert.deepEqual(record.journeys.map(run => run.id).sort(), required.map(entry => entry.journey.id).sort(),
        `${feature} record does not cover the current journeys`);
      for (const proof of record.journeys) {
        assert.ok(proof.manifest.startsWith('release/test-artifacts/') && !proof.manifest.split('/').includes('..'), 'Invalid manifest path');
        const path = resolve(root, proof.manifest);
        const bytes = readFileSync(path);
        assert.equal(sha256(bytes), proof.manifestSha256, 'Recorded manifest changed');
        const entry = required.find(entry => entry.journey.id === proof.id);
        const manifest = validateJourneyManifest(JSON.parse(bytes), { journey: entry.journey, identity, outputDir: dirname(path),
          moduleSha256: sha256(readFileSync(entry.path)), attended: values.attended === true });
        assert.equal(proof.moduleSha256, manifest.moduleSha256, 'Recorded journey changed');
        assert.deepEqual(record.native, { buildId: manifest.native.buildId, manifestHash: manifest.native.manifestHash });
        assert.equal(record.shellDigest, manifest.shellDigest, 'Recorded shell changed');
        assert.equal(record.harnessCommit, manifest.harnessCommit, 'Recorded harness changed');
      }
    }
  } else {
  const runs = [];
  for (const entry of selected) {
    let completed;
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      const outputDir = join(root, 'release/test-artifacts/browser-runtime', identity.commit, `${entry.journey.id}-${Date.now()}-${attempt}`);
      mkdirSync(outputDir, { recursive: true });
      const result = spawnSync(process.execPath, [join(root, 'tests/host/run-journey.mjs'), '--journey', entry.journey.id,
        '--app', appPath, '--output', outputDir, '--attempt', String(attempt), ...(values.attended ? ['--attended'] : [])],
        { cwd: root, stdio: 'inherit', env: process.env });
      if (result.status !== 0) continue;
      const path = join(outputDir, 'manifest.json');
      const bytes = readFileSync(path);
      const manifest = validateJourneyManifest(JSON.parse(bytes), { journey: entry.journey, identity, outputDir,
        moduleSha256: sha256(readFileSync(entry.path)), attended: values.attended === true });
      completed = { manifest, bytes, path: relative(root, path) };
      break;
    }
    assert.ok(completed, `Journey ${entry.journey.id} failed all attempts; no records written`);
    runs.push(completed);
  }
  assert.deepEqual(productIdentity(root), identity, 'Product changed during qualification');
  for (const feature of features) {
    const featureRuns = runs.filter(run => run.manifest.features.includes(feature));
    const previous = records.features[feature];
    records.features[feature] = featureRecord(identity, featureRuns,
      values['carry-forward'] && previous?.productTree === identity.tree && previous.commit !== identity.commit ? previous.commit : undefined);
    if (!values['no-record']) writeRecords(records);
  }
  }
  if (values.promote) {
    assert.ok(!values['no-record'], '--promote requires written qualification records');
    build();
    staticChecks();
    const { createJourneyApp } = await import('../tests/host/lib/app.mjs');
    const { createRpc } = await import('../tests/host/lib/rpc.mjs');
    const app = createJourneyApp({ appPath, launch: {} });
    try {
      await app.start();
      const rpc = createRpc(() => app.descriptor());
      const description = await rpc('runtime.describe', {});
      for (const feature of features) assert.equal(description.featureStages[feature], 'on', `${feature} was not promoted`);
      const { createAxClient } = await import('../tests/host/lib/ax.mjs');
      const ax = await createAxClient(app.pid);
      try {
        const later = { role: 'AXButton', name: 'Finish later', match: 'exact', scope: 'shell' };
        await ax.waitFor(later, 'present', 15000);
        await ax.press(later);
        await ax.waitFor(later, 'absent');
        await ax.key('cmd+,');
        const search = { role: 'AXTextField', name: 'Search settings', match: 'exact', scope: 'shell' };
        await ax.waitFor(search, 'present');
        await ax.type('About Aux', search);
        const about = { role: 'AXButton', name: 'About Aux', match: 'contains', scope: 'shell',
          within: { role: 'AXGroup', name: 'Settings search results', match: 'exact' } };
        await ax.waitFor(about, 'present');
        await ax.press(about);
        const availability = { name: 'Feature availability', match: 'exact', scope: 'shell' };
        await ax.waitFor(availability, 'present');
        await ax.press(availability);
        const panel = { role: 'AXGroup', name: 'General settings', match: 'exact', scope: 'shell' };
        await ax.scroll(panel, 100000);
        for (const feature of [...features].sort()) {
          const status = { role: 'AXGroup', name: `${feature}: on`, match: 'exact', scope: 'shell' };
          await ax.waitFor(status, 'present');
          let visible = false;
          for (let attempt = 0; attempt < 40; attempt++) {
            visible = (await ax.query(status)).some(node => node.frame?.height >= 18 && node.frame?.width > 0);
            if (visible) break;
            await ax.scroll(panel, -150);
          }
          assert.ok(visible, `${feature} promoted shell status was not visible`);
        }
        assert.ok((await ax.dump({ scope: 'shell' })).length, 'Promoted shell did not mount');
      } finally { await ax.close(); }
    } finally { await app.quit(); }
  }
  console.log(`${promotionOnly ? 'Promoted' : 'Qualified'} ${features.join(', ')}${values['no-record'] ? ' (no records written)' : ''}`);
} finally { caffeinate.kill(); }
} finally { slot.release(); }
