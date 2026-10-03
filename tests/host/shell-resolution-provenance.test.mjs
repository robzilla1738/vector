// Controlled source/document fixtures only. No interpreter import, process,
// original GRIT action, graph, carrier extraction or native admission.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { tmpdir } from 'node:os';
import vm from 'node:vm';
import ts from 'typescript';
import * as protocol from './lib/packaged-runtime-pair-protocol.mjs';
const contract = JSON.parse(fs.readFileSync(new URL('./lib/shell-resolution-contract.json', import.meta.url)));
const source = fs.readFileSync(new URL('./lib/shell-resolution-provenance.mjs', import.meta.url), 'utf8');
function fixture() {
  const directory = fs.realpathSync(fs.mkdtempSync(path.join(tmpdir(), 'aux-controlled-resolution-')));
  const sourceRoot = path.join(directory, 'source'), scratch = path.join(directory, 'probe');
  const roots = [path.join(sourceRoot, 'tools/grit'), path.join(sourceRoot, 'third_party/cpython3/host')];
  fs.mkdirSync(path.join(roots[1], 'bin'), { recursive: true }); fs.mkdirSync(roots[0], { recursive: true }); fs.mkdirSync(scratch);
  const documents = new Map();
  const put = (filename, value) => {
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(typeof value === 'string' ? value : protocol.canonicalPairJson(value) + '\n');
    documents.set(filename, bytes); return { path: filename, sha256: protocol.pairHash(bytes) };
  };
  const actualFile = (filename, contents) => { fs.writeFileSync(filename, contents); return put(filename, Buffer.from(contents)); };
  const interpreter = actualFile(path.join(roots[1], 'bin/python3'), 'controlled non-executable source');
  const grit = actualFile(path.join(roots[0], 'grit.py'), 'controlled source only');
  const tools = contract.resolutionSourceTools;
  for (const reference of [tools.support, tools.normalStartupDerivation, contract.producerSource]) documents.set(reference.path, fs.readFileSync(reference.path));
  const ownedTool = put(path.join(directory, 'action-source.py'), 'controlled action source');
  const tree = root => {
    const entries = [];
    const visit = filename => {
      const stat = fs.lstatSync(filename), row = { path: path.relative(root, filename) || '.', mode: stat.mode & 0o7777, uid: stat.uid };
      if (stat.isDirectory()) { row.kind = 'directory'; entries.push(row); for (const name of fs.readdirSync(filename).sort()) visit(path.join(filename, name)); }
      else { Object.assign(row, { kind: 'file', size: stat.size, sha256: protocol.pairHash(fs.readFileSync(filename)) }); entries.push(row); }
    }; visit(root); return { root, entries };
  };
  const inventories = roots.map(tree);
  const baseline = { producer: 'aux-shell-action-resolution-inventory-candidate', version: 1, roots, inventories,
    inventorySha256: protocol.pairHash(protocol.canonicalPairJson(inventories) + '\n'), admitted: false, originalGritActionDispatched: false, support: tools.support };
  const baselineRef = put(path.join(directory, 'baseline.json'), baseline);
  const input = { producer: 'aux-shell-action-resolution-derivation-input', version: 1, sourceRoot, sourceCommit: 'a'.repeat(40), originalInterpreter: interpreter,
    originalResolutionBaseline: baselineRef, resolutionTool: tools.support, ownedActionTool: ownedTool, actionInputRefs: [grit], originalArgv: Array(101).fill('controlled'), ownedScratchRoot: scratch };
  const imports = { sourceCommit: input.sourceCommit, originalInterpreter: interpreter, originalArgv: input.originalArgv, fullResolutionBaseline: baselineRef, resolutionTool: tools.support,
    actionInputRefs: [grit], gritSourceRefs: [grit], interpreterImportRefs: [interpreter], ownedScratchRoot: scratch,
    normalStartupProbe: { prefix: roots[1], basePrefix: roots[1], userSiteEnabled: false, pythonPathEnvironmentPresent: false, pythonHomeEnvironmentPresent: false, sysPath: ['', roots[1]], loadedModuleFiles: [grit.path, interpreter.path] },
    closedProbeEnvironment: { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C', PYTHONDONTWRITEBYTECODE: '1', PYTHONNOUSERSITE: '1', PYTHONPYCACHEPREFIX: path.join(scratch, 'fresh-empty-pycache') } };
  const probeSource = /^PROBE = """([^]*?)"""/m.exec(documents.get(tools.normalStartupDerivation.path).toString())[1];
  const receipt = { argv: [interpreter.path, '-c', probeSource], originalPid: 321, originalGroup: 321, originalRows: ['controlled original kernel row'], exitCode: 0, timedOut: false, deadlineSeconds: 300, actualGroupRows: {},
    stdout: put(path.join(scratch, 'original-action.stdout'), JSON.stringify(imports.normalStartupProbe) + '\n'), stderr: put(path.join(scratch, 'original-action.stderr'), '') };
  const cleanup = { originalGroup: 321, actualRows: [], originalChildReaped: true, cleanupDebt: null };
  const audit = { producer: 'aux-shell-action-resolution-independent-preaudit', version: 1, passed: true, manifestSha256: '', controllerSha256: tools.normalStartupDerivation.sha256,
    baselineSha256: baselineRef.sha256, resolutionTool: tools.support, ownedActionTool: ownedTool };
  const generic = put(path.join(directory, 'original-evidence'), 'controlled original evidence');
  function example(rule, schema) {
    if (rule.$ref) return rule.$ref.endsWith('/reference') ? { ...generic } : example(schema.$defs[rule.$ref.split('/').at(-1)], schema);
    if ('const' in rule) return structuredClone(rule.const);
    if (rule.enum) return rule.enum[0];
    if (rule.type === 'object') return Object.fromEntries((rule.required ?? []).map(key => [key, example(rule.properties[key], schema)]));
    if (rule.type === 'array') return Array.from({ length: rule.minItems ?? 0 }, () => example(rule.items, schema));
    if (rule.type === 'boolean') return false;
    if (rule.type === 'integer') return rule.minimum ?? 0;
    if (rule.pattern === '^[a-f0-9]{40}$') return 'a'.repeat(40);
    if (rule.pattern === '^[a-f0-9]{64}$') return 'b'.repeat(64);
    if (rule.pattern === '^/') return '/controlled/path';
    if (rule.pattern === '^rule ') return 'rule controlled';
    return 'controlled';
  }
  const proof = { sourceCommit: input.sourceCommit, pinnedManifest: generic, generatedGrd: generic, generatedHeader: generic, generatedResourceMap: generic,
    originalBuildPak: generic, deployedCarriers: [generic], originalGraphProof: generic };
  const replayInput = example(contract.inputSchema, contract.inputSchema), replayAudit = example(contract.externalPreauditSchema, contract.externalPreauditSchema);
  const receiptNames = { action: 'original-action-receipt.json', cleanup: 'cleanup-complete.json' };
  const encode = () => {
    imports.fullResolutionBaseline = put(baselineRef.path, baseline); input.originalResolutionBaseline = imports.fullResolutionBaseline; audit.baselineSha256 = imports.fullResolutionBaseline.sha256;
    imports.derivationInput = put(path.join(directory, 'input.json'), input); audit.manifestSha256 = imports.derivationInput.sha256;
    imports.independentDerivationPreaudit = put(path.join(directory, 'audit.json'), audit);
    imports.normalStartupProbeReceipt = put(path.join(scratch, receiptNames.action), receipt); imports.originalCleanupProof = put(path.join(scratch, receiptNames.cleanup), cleanup);
    proof.originalImportInputClosureProof = put(path.join(directory, 'imports.json'), imports);
    Object.assign(replayInput, { sourceCommit: proof.sourceCommit, sourceRoot, buildRoot: path.join(sourceRoot, 'out/AuxDev'), sourceInputRoot: path.join(sourceRoot, 'chrome/browser/resources/aux/assets'),
      originalInterpreter: interpreter, producerInterpreter: generic, originalArgv: imports.originalArgv, actionInputRefs: imports.actionInputRefs, pinnedManifest: generic,
      generatedGrd: generic, generatedHeader: generic, generatedResourceMap: generic, originalBuildPak: generic, deployedCarriers: proof.deployedCarriers, originalSuccessfulGraphProof: generic,
      originalImportInputClosureProof: proof.originalImportInputClosureProof, deployedClosureProof: generic, originalExpectedOutputs: generic, toolchain: generic,
      pins: { [generic.path]: generic.sha256, [interpreter.path]: interpreter.sha256, [grit.path]: grit.sha256 } });
    proof.inputManifest = put(path.join(directory, 'replay-input.json'), replayInput);
    Object.assign(replayAudit, { manifestSha256: proof.inputManifest.sha256, sourceCommit: proof.sourceCommit, controllerSha256: contract.producerSource.sha256,
      deployedCarriers: proof.deployedCarriers, originalGraphProofSha256: generic.sha256, deployedClosureSha256: generic.sha256,
      originalImportInputClosureProofSha256: proof.originalImportInputClosureProof.sha256, fullResolutionBaselineSha256: imports.fullResolutionBaseline.sha256, resolutionToolSha256: tools.support.sha256 });
    proof.independentPreaudit = put(path.join(directory, 'replay-audit.json'), replayAudit);
  };
  const files = { read(reference) { const bytes = documents.get(reference.path); assert.ok(bytes); assert.equal(protocol.pairHash(bytes), reference.sha256); return Buffer.from(bytes); },
    retain(reference) { this.read(reference); }, validate() {} };
  const exported = {}, script = source.replace("'/Users/rcourson/aux-chromium-stable/chromium/src'", JSON.stringify(sourceRoot)).replaceAll('import.meta.url', JSON.stringify(new URL('./lib/shell-resolution-provenance.mjs', import.meta.url).href));
  const dependencies = { 'node:assert/strict': { default: Object.assign((...args) => assert(...args), assert, { deepEqual: (a, b, message) => assert.deepEqual(structuredClone(a), structuredClone(b), message) }) }, 'node:fs': { ...fs, readFileSync(filename, options) { if (String(filename).endsWith('/shell-resolution-contract.json')) return Buffer.from(JSON.stringify(contract).replaceAll('/Users/rcourson/aux-chromium-stable/chromium/src', sourceRoot)); return fs.readFileSync(filename, options); } }, 'node:path': path, './packaged-runtime-pair-protocol.mjs': protocol };
  vm.runInNewContext(ts.transpileModule(script, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
    { exports: exported, Buffer, URL, process, require(name) { assert.ok(dependencies[name], name); return dependencies[name]; } });
  const verify = () => { encode(); return exported.verifyOriginalResolutionClosure(imports, proof, files); };
  return { verify, imports, input, audit, receipt, cleanup, baseline, roots, documents, put, receiptNames, close: () => fs.rmSync(directory, { recursive: true, force: true }) };
}
function run(body) { const f = fixture(); try { body(f); } finally { f.close(); } }
test('original derivation/probe/cleanup joins retain complete current source inventory through revalidation', () => run(f => {
  const validate = f.verify(); validate(); fs.writeFileSync(path.join(f.roots[0], 'added-loader.py'), 'foreign'); assert.throws(validate, /Unknown/);
}));
test('foreign approval, probe code, cleanup debt, input environment and loaded module refuse', () => {
  for (const mutate of [f => { f.audit.controllerSha256 = 'f'.repeat(64); }, f => { f.receipt.argv[2] = 'foreign'; },
    f => { f.cleanup.originalChildReaped = false; }, f => { f.imports.closedProbeEnvironment.PYTHONPATH = '/foreign'; },
    f => { f.imports.normalStartupProbe.loadedModuleFiles.push('/foreign/injected.py'); }, f => { f.input.ownedScratchRoot = f.roots[0]; }]) run(f => {
    mutate(f); assert.throws(f.verify);
  });
});
test('current source replacement and outside resolution symlink refuse without execution', () => run(f => {
  const validate = f.verify(); fs.writeFileSync(path.join(f.roots[0], 'grit.py'), 'changed'); assert.throws(validate);
  fs.writeFileSync(path.join(f.roots[0], 'grit.py'), 'controlled source only'); fs.symlinkSync('/etc', path.join(f.roots[0], 'outside')); assert.throws(validate, /Outside/);
}));

test('actual captured baseline support and fixed original receipt filenames remain mandatory', () => {
  for (const mutate of [f => { f.receiptNames.action = 'foreign-receipt.json'; }, f => { f.receiptNames.cleanup = 'foreign-cleanup.json'; }, f => { f.baseline.support = { ...f.baseline.support, sha256: 'f'.repeat(64) }; },
    f => { f.receipt.stdout = f.put(f.receipt.stdout.path + '.foreign', JSON.stringify(f.imports.normalStartupProbe) + '\n'); },
    f => { f.receipt.stderr = f.put(f.receipt.stderr.path + '.foreign', ''); }]) run(f => { mutate(f); assert.throws(f.verify); });
});
