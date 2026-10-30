// Host-only: the composed daemon entry, built from the sealed candidate exactly as transforms.mjs
// builds it, serves the calls of parity-scenarios.mjs through the supplied routers and through
// Aux's, each against its own temporary account root. Outputs, the state the namespaces keep and
// the account files must match.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, realpathSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {stageParityEntry} from './parity-stage.mjs';
import {EXTRA_EXPORTS, SCENARIOS} from './parity-scenarios.mjs';
import {NAMESPACES, STORES} from './registry.mjs';

// The real path: /var/folders is a symlink, and the session file checks compare resolved paths.
const scratch = mkdtempSync(path.join(realpathSync(tmpdir()), 'aux-daemon-parity-'));
test.after(() => rmSync(scratch, {recursive: true, force: true}));

function run(entries, mode) {
  const entry = entries[mode];
  const home = mkdtempSync(path.join(scratch, `${mode}-home-`)), out = path.join(scratch, `${mode}.json`);
  const result = spawnSync(process.execPath, [path.join(import.meta.dirname, 'parity-harness.mjs'), entry, mode, out],
    {encoding: 'utf8', env: {PATH: process.env.PATH, HOME: home, TMPDIR: home}, timeout: 180_000});
  assert.equal(result.status, 0, `${mode} harness: ${result.stderr.slice(-4000)}`);
  return {home, ...JSON.parse(readFileSync(out, 'utf8'))};
}

/** What legitimately differs between two runs: the home directory, random 16-character ids
 * (any `…id`/`…Id`/`…_id` value, and UUIDs, numbered by first appearance and replaced everywhere, paths
 * included), SQLite's own unixepoch() defaults and file times (the real clock, not the harness one). */
function comparable({home, outputs, snapshots, agentFileChanges, state, ledger, files, jsonFiles}) {
  let text = JSON.stringify({outputs, snapshots, agentFileChanges, state, ledger, files, jsonFiles}).replaceAll(home, '<home>');
  const ids = new Set();
  JSON.parse(text, (key, value) => {
    if (typeof value !== 'string') return value;
    if (/(^|_)id$|Id$/.test(key) && /^[0-9A-Za-z]{16}$/.test(value) || /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(value)) ids.add(value);
    return value;
  });
  // UUIDs also sit inside the transcripts, which the text holds as strings.
  for (const [uuid] of text.matchAll(/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}/g)) ids.add(uuid);
  [...ids].forEach((id, index) => { text = text.replaceAll(id, `<id ${index}>`); });
  const now = Date.now(), recent = time => Math.abs(time - now) < 86_400_000;
  const result = JSON.parse(text, (key, value) => {
    if (typeof value === 'string' && /^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(value) && recent(Date.parse(value))) return '<sqlite now>';
    if (Number.isInteger(value) && recent(value * 1000)) return '<sqlite now>';
    // File times come from the file system, not the harness clock.
    if (key.endsWith('timeMs') && typeof value === 'number' && recent(value)) return '<file time>';
    return value;
  });
  result.files.sort();
  for (const [namespace, {unordered = []}] of Object.entries(SCENARIOS))
    for (const output of result.outputs[namespace]) if (unordered.includes(output.procedure) && Array.isArray(output.value)) output.value.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return result;
}

const entries = stageParityEntry(scratch, Object.keys(NAMESPACES), EXTRA_EXPORTS);
const suppliedRun = run(entries, 'supplied'), supplied = comparable(suppliedRun);
const auxRun = run(entries, 'aux'), aux = comparable(auxRun);

test('every registered namespace has a scenario, and the daemon root router serves Aux procedures for exactly those', t => {
  assert.deepEqual(Object.keys(SCENARIOS).sort(), Object.keys(NAMESPACES).sort());
  for (const namespace of Object.keys(NAMESPACES)) assert.ok(auxRun.owned[namespace]?.length, namespace);
  const owned = Object.entries(auxRun.owned).flatMap(([namespace, names]) => names.map(name => `${namespace}.${name}`)).sort();
  assert.deepEqual(auxRun.wired.aux, owned);
  assert.deepEqual(auxRun.storesInUse, Object.keys(STORES).sort(), 'the bundle reaches every Aux store');
  assert.deepEqual(suppliedRun.storesInUse, [], 'the reference run uses only the bundle\'s own stores');
  assert.deepEqual(auxRun.wired.schemaMismatches, [], 'each Aux procedure has the kind, route meta and input and output schemas of the one it replaces');
  t.diagnostic(`Aux serves ${owned.length} of ${auxRun.wired.total} tRPC procedures`);
});

for (const namespace of Object.keys(SCENARIOS)) test(`${namespace}: the same outputs from Aux and the supplied router`, () => {
  assert.ok(supplied.outputs[namespace].length, 'the scenario made calls');
  aux.outputs[namespace].forEach((output, index) => assert.deepEqual(output, supplied.outputs[namespace][index], `call ${index}: ${output.procedure}`));
  assert.equal(aux.outputs[namespace].length, supplied.outputs[namespace].length);
  assert.deepEqual(aux.snapshots[namespace], supplied.snapshots[namespace]);
});

test('the same state.db and account files', () => {
  for (const [table, rows] of Object.entries(supplied.state.rows)) assert.deepEqual(aux.state.rows[table], rows, table);
  assert.deepEqual(aux.state, supplied.state);
  assert.ok(supplied.ledger.rows.context_awareness_events.length, 'the ledger has fixture rows');
  assert.deepEqual(aux.ledger, supplied.ledger);
  assert.deepEqual(aux.files, supplied.files);
  for (const [file, content] of Object.entries(supplied.jsonFiles)) assert.equal(aux.jsonFiles[file], content, file);
  assert.ok(supplied.agentFileChanges.length, 'the scenarios send agent file change notifications');
  assert.deepEqual(aux.agentFileChanges, supplied.agentFileChanges);
});
