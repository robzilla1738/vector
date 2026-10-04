import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const HASH = /^[a-f0-9]{64}$/;
const targets = ['//chrome:chrome', '//chrome/test:unit_tests', '//chrome/test:browser_tests', '//content/test:content_unittests'];
const dependencies = ['deps', 'public_deps', 'data_deps'];
const inputs = ['sources', 'inputs', 'data', 'script', 'outputs'];
export const stockLfsInventorySha256 = '50d9fbfbff0a832253aefbae477a31661119702dce7e9052a59f7ef90b263eee';
const digest = raw => createHash('sha256').update(raw).digest('hex');
export function readStockEvidenceDocument(artifact, maximum = 64 * 1024 * 1024) {
  assert.equal(typeof artifact?.raw, 'string');
  assert.ok(Buffer.byteLength(artifact.raw) <= maximum);
  assert.ok(HASH.test(artifact.sha256));
  assert.equal(digest(artifact.raw), artifact.sha256, 'Original artifact bytes changed');
  // Parse the original bytes with duplicate-key and nesting checks before JSON.parse.
  const tokens = artifact.raw.match(/"(?:[^"\\]|\\.)*"|[{}[\]:,]|true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/g) ?? [];
  let position = 0;
  function value(depth) {
    assert.ok(depth <= 64, 'Evidence nesting exceeds bound');
    const token = tokens[position++];
    assert.ok(token !== undefined);
    if (token === '{') {
      const seen = new Set();
      if (tokens[position] === '}') { position++; return; }
      for (;;) {
        const key = tokens[position++];
        assert.ok(key?.startsWith('"'));
        const decoded = JSON.parse(key);
        assert.ok(!seen.has(decoded), 'Duplicate evidence key'); seen.add(decoded);
        assert.equal(tokens[position++], ':'); value(depth + 1);
        const delimiter = tokens[position++];
        if (delimiter === '}') return;
        assert.equal(delimiter, ',');
      }
    }
    if (token === '[') {
      if (tokens[position] === ']') { position++; return; }
      for (;;) { value(depth + 1); const delimiter = tokens[position++]; if (delimiter === ']') return; assert.equal(delimiter, ','); }
    }
    assert.ok(!['}', ']', ':', ','].includes(token));
  }
  value(0); assert.equal(position, tokens.length);
  return JSON.parse(artifact.raw);
}
function names(value) { assert.ok(Array.isArray(value)); assert.ok(value.every(item => typeof item === 'string')); return value; }
function path(value) {
  assert.equal(typeof value, 'string');
  assert.ok(value.startsWith('//') && !value.includes('\\') && !value.split('/').includes('..'));
  return value;
}
function missingPath(row) { return `//third_party/litert/src/${row.path}`; }

/** Checks retained candidate evidence only. Expected artifact hashes must come
 * from the independently audited original GN controller, never this verifier.
 * Successful verification does not authorize compilation, launch or Stock11. */
export function verifyStockGraphEvidence({ inventory, graph, commands, loader, loaderSource, expected }) {
  assert.deepEqual(Object.keys(expected).sort(), ['commands', 'graph', 'inventory', 'loader', 'loaderSource'].sort());
  for (const [key, artifact] of Object.entries({ inventory, graph, commands, loader, loaderSource })) {
    assert.ok(HASH.test(expected[key])); assert.equal(artifact.sha256, expected[key], `Unadmitted ${key} artifact`);
  }
  assert.equal(expected.inventory, stockLfsInventorySha256);
  assert.equal(loaderSource.sha256, '66c5b72658d3d50b0ebbf9bff225a28498912e958a10ea0bfe56a4e1e1814611', 'Unreviewed loader source');
  assert.equal(digest(loaderSource.raw), loaderSource.sha256, 'Original loader source changed');
  const original = readStockEvidenceDocument(inventory), nodes = readStockEvidenceDocument(graph), actions = readStockEvidenceDocument(commands), dynamic = readStockEvidenceDocument(loader, 1024 * 1024);
  assert.equal(original.repositoryCount, 136); assert.equal(original.lfsPointerCount, 23);
  assert.equal(original.pointerOnlyCount, 23); assert.equal(original.missingLocalObjectCount, 23);
  assert.equal(original.paths.length, 23);
  const missing = new Set(original.paths.map(missingPath)); assert.equal(missing.size, 23);
  for (const row of original.paths) {
    assert.equal(row.originalCommit, 'f67457790c9c2ab67347d6fe53270e8d3df20868');
    assert.equal(row.localObjectExists, false); assert.equal(row.originalWorkingFileIsPointer, true);
    assert.ok(HASH.test(row.lfsObjectOid)); assert.ok(Number.isSafeInteger(row.lfsObjectSize) && row.lfsObjectSize > 0);
  }
  const reached = new Set(), selected = new Set();
  function visit(label) {
    if (reached.has(label)) return;
    const node = nodes[label]; assert.ok(node && typeof node === 'object', `Missing transitive GN target ${label}`);
    reached.add(label);
    for (const key of inputs) {
      for (const item of typeof node[key] === 'string' ? [node[key]] : names(node[key] ?? [])) selected.add(path(item));
    }
    for (const key of dependencies) for (const child of names(node[key] ?? [])) visit(child);
  }
  for (const target of targets) visit(target);
  assert.deepEqual(names(actions.targetLabels).sort(), [...reached].sort(), 'Command inventory omits selected target');
  assert.equal(actions.dynamicUndeclaredReads, false, 'Unresolved action/script reads');
  assert.ok(Array.isArray(actions.rows));
  const actionTargets = new Set();
  for (const action of actions.rows) {
    assert.ok(reached.has(action.target)); actionTargets.add(action.target);
    assert.ok(HASH.test(action.commandSha256));
    assert.equal(digest(JSON.stringify(names(action.argv))), action.commandSha256, 'Original command argv changed');
    for (const item of names(action.inputs)) selected.add(path(item));
    for (const item of names(action.runtimeLoads)) selected.add(path(item));
  }
  assert.deepEqual([...actionTargets].sort(), [...reached].sort(), 'Missing action closure row');
  assert.equal(dynamic.producer, 'stock-original-litert-loader-closure/v1');
  assert.equal(dynamic.unresolvedDynamicLoads, false, 'Unresolved LiteRT dlopen branch');
  assert.equal(dynamic.effectiveUseLitertTflite, false, 'Default-only LiteRT exclusion is insufficient');
  assert.ok(Array.isArray(dynamic.selectedTargets));
  assert.deepEqual(dynamic.selectedTargets.map(row => row.target).sort(), [...reached].filter(label => label.startsWith('//third_party/litert')).sort());
  for (const row of dynamic.selectedTargets) {
    const originalCommands = actions.rows.filter(action => action.target === row.target);
    assert.ok(Array.isArray(row.commands));
    assert.deepEqual(row.commands.map(command => command.commandSha256).sort(), originalCommands.map(command => command.commandSha256).sort(), 'Loader proof omits original target command');
    for (const witness of row.commands) {
      const command = originalCommands.find(action => action.commandSha256 === witness.commandSha256);
      assert.ok(command, 'Loader macros lack original command join');
      assert.deepEqual(names(witness.defines).sort(), command.argv.filter(arg => arg.startsWith('-D')).map(arg => arg.slice(2)).sort(), 'Loader macros differ from original command');
      assert.ok(HASH.test(witness.commandSha256));

    }
  }
  // Both macOS original missing objects require an explicit exact source witness,
  // even when no selected LiteRT target reaches them.
  assert.equal(dynamic.sourceSha256, loaderSource.sha256);
  assert.equal(dynamic.sourcePath, '//third_party/litert/src/litert/runtime/accelerators/gpu_registry.cc');
  for (const target of reached) {
    const declared = ['sources','inputs','script'].flatMap(key => typeof nodes[target][key] === 'string' ? [nodes[target][key]] : nodes[target][key] ?? []);
    if (declared.includes(dynamic.sourcePath)) assert.ok(actions.rows.some(command => command.target === target && command.inputs.includes(dynamic.sourcePath)), 'Uncaptured selected GPU source');
  }
  const gpuCommands = actions.rows.filter(command => command.inputs.includes(dynamic.sourcePath));
  assert.ok(Array.isArray(dynamic.gpuBranches));
  assert.deepEqual(dynamic.gpuBranches.map(branch => branch.commandSha256).sort(), gpuCommands.map(command => command.commandSha256).sort(), 'Missing selected GPU source branch witness');
  for (const branch of dynamic.gpuBranches) {
    assert.equal(branch.condition, '!defined(LITERT_DISABLE_GPU)');
    assert.equal(branch.active, false, 'Unresolved enabled GPU runtime-directory loader');
    assert.equal(branch.sourceSha256, loaderSource.sha256);
    assert.equal(typeof branch.macroRaw, 'string'); assert.ok(Buffer.byteLength(branch.macroRaw) <= 1024 * 1024);
    assert.equal(digest(branch.macroRaw), branch.macroRawSha256, 'Original effective macro bytes changed');
    const definitions = branch.macroRaw.split('\n').filter(line => /^#define LITERT_DISABLE_GPU(?:\s|$)/.test(line));
    assert.equal(definitions.length, 1, 'No genuine effective GPU-disabled macro');
    assert.ok(!branch.macroRaw.includes('#undef LITERT_DISABLE_GPU'));
  }
  const macos = [...missing].filter(item => item.includes('/macos_arm64/')).sort();
  assert.deepEqual(names(dynamic.macosPaths).sort(), macos);
  for (const item of names(dynamic.runtimeLoads)) selected.add(path(item));
  assert.equal(dynamic.classifications.length, 23);
  assert.deepEqual(dynamic.classifications.map(row => row.path).sort(), [...missing].sort());
  for (const row of dynamic.classifications) {
    assert.equal(row.classification, 'absent_from_selected_graph_and_source_load_closure');
    assert.ok(!selected.has(row.path), `Missing object required by original graph/load closure: ${row.path}`);
  }
  return Object.freeze({ candidateEvidenceVerified: true, classifiedMissingObjects: 23, selectedTargetCount: reached.size,
    compilationAdmitted: false, sdkCompileClosureProven: false, deployedLoadClosureProven: false, stock11Qualified: false });
}
