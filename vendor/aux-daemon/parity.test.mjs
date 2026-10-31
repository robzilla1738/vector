// Host-only: the composed daemon entry, built from the sealed candidate exactly as transforms.mjs
// builds it, serves the calls of parity-scenarios.mjs through the supplied routers and through
// Aux's, each against its own temporary account root. Outputs, the state the namespaces keep and
// the account files must match.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {stageParityEntry} from './parity-stage.mjs';
import {EXTRA_EXPORTS, SCENARIOS} from './parity-scenarios.mjs';
import {NAMESPACES, STORES} from './registry.mjs';

// The real path: /var/folders is a symlink, and the session file checks compare resolved paths.
const TOOL_REFERENCE = new URL('../../fixtures/aux-daemon/tools.json', import.meta.url), BRIDGE_REFERENCE = new URL('../../fixtures/aux-daemon/bridge.json', import.meta.url),
  MCP_REFERENCE = new URL('../../fixtures/aux-daemon/mcp.json', import.meta.url), CONTEXT_REFERENCE = new URL('../../fixtures/aux-daemon/context.json', import.meta.url);
const SERVICE_REFERENCES = {ledger: 'ledger', agentServer: 'agent-server', modelCatalog: 'model-catalog'};
const serviceReference = step => new URL(`../../fixtures/aux-daemon/${SERVICE_REFERENCES[step]}.json`, import.meta.url);
const scratch = mkdtempSync(path.join(realpathSync(tmpdir()), 'aux-daemon-parity-'));
test.after(() => rmSync(scratch, {recursive: true, force: true}));

function run(entries, mode) {
  const entry = entries[mode];
  const home = mkdtempSync(path.join(scratch, `${mode}-home-`)), out = path.join(scratch, `${mode}.json`);
  const result = spawnSync(process.execPath, [path.join(import.meta.dirname, 'parity-harness.mjs'), entry, mode, out],
    {encoding: 'utf8', env: {PATH: process.env.PATH, HOME: home, TMPDIR: home, TZ: 'America/Chicago'}, timeout: 180_000});
  assert.equal(result.status, 0, `${mode} harness: ${result.stderr.slice(-4000)}`);
  return {home, ...JSON.parse(readFileSync(out, 'utf8'))};
}

/** What legitimately differs between two runs: the home directory, random 16-character ids
 * (any `…id`/`…Id`/`…_id` value, and UUIDs, numbered by first appearance and replaced everywhere, paths
 * included), SQLite's own unixepoch() defaults and file times (the real clock, not the harness one). */
function comparable({home, outputs, snapshots, steps, agentFileChanges, state, ledger, files, jsonFiles}) {
  let text = JSON.stringify({outputs, snapshots, steps, agentFileChanges, state, ledger, files, jsonFiles}).replaceAll(home, '<home>').replace(/wf-[0-9a-f]{8}/g, '<workflow>').replace(/(sessions\/(?:[\d-]+_)?)[\w-]{21}(?![\w-])/g, '$1<run>');
  const ids = new Set();
  JSON.parse(text, (key, value) => {
    if (typeof value !== 'string') return value;
    if (/(^|_)id$|Id$/.test(key) && /^[0-9A-Za-z]{16}$/.test(value) || /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(value)) ids.add(value);
    return value;
  });
  // UUIDs also sit inside the transcripts, which the text holds as strings.
  for (const [uuid] of text.matchAll(/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}/g)) ids.add(uuid);
  for (const [, id] of text.matchAll(/\\"id\\":\\"([0-9A-Za-z]{16})\\"/g)) ids.add(id);
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
// With AUX_RECORD_FIXTURES set the supplied run writes the reference instead of being checked against it.
if (process.env.AUX_RECORD_FIXTURES) {
  writeFileSync(TOOL_REFERENCE, `${JSON.stringify(supplied.steps.toolLists, null, 1)}\n`);
  writeFileSync(BRIDGE_REFERENCE, `${JSON.stringify(supplied.steps.bridge, null, 1)}\n`);
  writeFileSync(MCP_REFERENCE, `${JSON.stringify(supplied.steps.mcp, null, 1)}\n`);
  writeFileSync(CONTEXT_REFERENCE, `${JSON.stringify(supplied.steps.context, null, 1)}\n`);
  for (const step of Object.keys(SERVICE_REFERENCES)) writeFileSync(serviceReference(step), `${JSON.stringify(supplied.steps[step], null, 1)}\n`);
}
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

/** What the dispatcher runs in browser-only mode; the supplied lists less the rest. */
const LIVE_TOOLS = new Set(['repl', 'read_file', 'webfetch', 'websearch', 'get_time', 'memory_search', 'write_todos', 'history_search', 'history_read', 'ask_user_question', 'request_action_confirmation']);

test('the agent tools: the reference fixture is the supplied bundle, and Aux matches it', () => {
  const reference = JSON.parse(readFileSync(TOOL_REFERENCE, 'utf8'));
  assert.deepEqual(supplied.steps.toolLists, reference);
  const named = ({catalog}, list) => list.error ? list : list.map(index => catalog[index]);
  for (const [name, list] of Object.entries(reference.lists)) {
    if (name === 'orchestrator') continue; // Hosted harness, not one a browser session runs.
    const expected = name === 'alone' || list.error ? named(reference, list) : named(reference, list).filter(tool => LIVE_TOOLS.has(tool.name));
    assert.deepEqual(named(aux.steps.toolLists, aux.steps.toolLists.lists[name]), expected, name);
  }
});

test('the agent tools: the same results, step by step', () => {
  supplied.steps.tools.results.forEach((result, index) => assert.deepEqual(aux.steps.tools.results[index], result, `result ${index}: ${result.tool}`));
  assert.deepEqual(aux.steps.tools, supplied.steps.tools);
});

test('the extension bridge: the reference fixture is the supplied bundle, and Aux matches it', () => {
  const reference = JSON.parse(readFileSync(BRIDGE_REFERENCE, 'utf8'));
  assert.deepEqual(supplied.steps.bridge, reference);
  supplied.steps.bridge.trace.results.forEach((result, index) => assert.deepEqual(aux.steps.bridge.trace.results[index], result, `result ${index}`));
  assert.deepEqual(aux.steps.bridge, reference);
});

test('the MCP manager and connection state: the same results and server traffic', () => {
  supplied.steps.mcp.results.forEach((result, index) => assert.deepEqual(aux.steps.mcp.results[index], result, `result ${index}: ${result.step}`));
  assert.deepEqual(aux.steps.mcp, supplied.steps.mcp);
  assert.deepEqual(supplied.steps.mcp, JSON.parse(readFileSync(MCP_REFERENCE, 'utf8')));
  assert.ok(supplied.steps.mcp.calls.length > 20, 'the stand-in servers were reached');
});

test('Context Awareness: the capture policy and history text match the reference', () => {
  assert.deepEqual(supplied.steps.context, JSON.parse(readFileSync(CONTEXT_REFERENCE, 'utf8')));
  assert.deepEqual(aux.steps.context, supplied.steps.context);
});

for (const [step, label] of Object.entries({ledger: 'the ledger\'s write, content, verify and clear paths', agentServer: 'the agent server', modelCatalog: 'the model catalog'}))
  test(`${label}: the reference fixture is the supplied bundle, and Aux matches it`, () => {
    const reference = JSON.parse(readFileSync(serviceReference(step), 'utf8'));
    assert.deepEqual(supplied.steps[step], reference);
    supplied.steps[step].forEach((result, index) => assert.deepEqual(aux.steps[step][index], result, `result ${index}: ${result.step}`));
    assert.equal(aux.steps[step].length, supplied.steps[step].length);
  });

test('the agent server and the model catalog are Aux\'s, and the catalog stays off the credential paths', () => {
  assert.equal(auxRun.wired.agentServerIsAux, true);
  assert.deepEqual(auxRun.wired.suppliedModelMethods, []);
  const code = readFileSync(new URL('./models/catalog.mjs', import.meta.url), 'utf8').replace(/\/\*\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(code, /[cC]redential|apiKey|[tT]oken|OAuth|resolveAuthHeaders|getAuxProvider|getCachedSubscriptionPlan|setProviderConfig|getProviderConfig/);
});

test('the same state.db and account files', () => {
  for (const [table, rows] of Object.entries(supplied.state.rows)) assert.deepEqual(aux.state.rows[table], rows, table);
  assert.deepEqual(aux.state, supplied.state);
  assert.ok(supplied.ledger.rows.context_awareness_events.length, 'the ledger has fixture rows');
  assert.deepEqual(aux.ledger, supplied.ledger);
  assert.deepEqual(aux.files, supplied.files);
  // The shared clock ticks per call, and a chat's prompt stamp time is not the behaviour compared.
  const unstamped = content => content?.replace(/"at": \d+/g, '"at": 0');
  for (const [file, content] of Object.entries(supplied.jsonFiles)) assert.equal(unstamped(aux.jsonFiles[file]), unstamped(content), file);
  assert.ok(supplied.agentFileChanges.length, 'the scenarios send agent file change notifications');
  assert.deepEqual(aux.agentFileChanges, supplied.agentFileChanges);
});
