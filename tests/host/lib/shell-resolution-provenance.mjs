import assert from 'node:assert/strict';
import { lstatSync, readdirSync, readlinkSync, realpathSync, readFileSync } from 'node:fs';
import { join, relative, isAbsolute } from 'node:path';
import { canonicalPairJson, decodeCanonicalPairDocument, pairHash } from './packaged-runtime-pair-protocol.mjs';

const keys = (value, names) => assert.deepEqual(Object.keys(value).sort(), names.sort(), 'Unexpected resolution document fields');
const within = (root, path) => { const name = relative(root, path); return !isAbsolute(name) && name !== '..' && !name.startsWith('../'); };
const contract = JSON.parse(readFileSync(new URL('./shell-resolution-contract.json', import.meta.url)));
const fixedSource = '/Users/rcourson/aux-chromium-stable/chromium/src';
/** Read only original, externally approved documents and their current complete
 * source trees. This does not execute/import the captured Python tooling. */
export function verifyOriginalResolutionClosure(imports, proof, files) {
  const tools = contract.resolutionSourceTools;
  const read = reference => {
    keys(reference, ['path', 'sha256']);
    const bytes = files.read(reference, 64 * 1024 * 1024);
    assert.equal(pairHash(bytes), reference.sha256); return bytes;
  };
  const document = (reference, schema) => {
    const raw = read(reference).toString('utf8'), value = JSON.parse(raw);
    if (schema) return decodeCanonicalPairDocument(raw, schema);
    assert.equal(raw, canonicalPairJson(value) + '\n', 'Noncanonical original resolution document'); return value;
  };
  const replayInput = document(proof.inputManifest, contract.inputSchema), replayAudit = document(proof.independentPreaudit, contract.externalPreauditSchema);
  assert.equal(replayInput.sourceCommit, proof.sourceCommit); assert.equal(replayInput.sourceRoot, fixedSource);
  assert.equal(replayInput.buildRoot, join(fixedSource, 'out/AuxDev'));
  assert.equal(replayInput.sourceInputRoot, join(fixedSource, 'chrome/browser/resources/aux/assets'));
  assert.equal(replayAudit.manifestSha256, proof.inputManifest.sha256); assert.equal(replayAudit.sourceCommit, proof.sourceCommit);
  assert.equal(replayAudit.controllerSha256, contract.producerSource.sha256); read(contract.producerSource);
  for (const [field, expected] of [['pinnedManifest', proof.pinnedManifest], ['generatedGrd', proof.generatedGrd], ['generatedHeader', proof.generatedHeader],
    ['generatedResourceMap', proof.generatedResourceMap], ['originalBuildPak', proof.originalBuildPak], ['deployedCarriers', proof.deployedCarriers],
    ['originalSuccessfulGraphProof', proof.originalGraphProof], ['originalArgv', imports.originalArgv], ['originalInterpreter', imports.originalInterpreter],
    ['originalImportInputClosureProof', proof.originalImportInputClosureProof], ['actionInputRefs', imports.actionInputRefs]]) assert.deepEqual(replayInput[field], expected);
  assert.deepEqual(replayAudit.deployedCarriers, proof.deployedCarriers);
  assert.equal(replayAudit.originalGraphProofSha256, proof.originalGraphProof.sha256);
  assert.equal(replayAudit.deployedClosureSha256, replayInput.deployedClosureProof.sha256); read(replayInput.deployedClosureProof);
  assert.equal(replayAudit.originalImportInputClosureProofSha256, proof.originalImportInputClosureProof.sha256);
  assert.equal(replayAudit.fullResolutionBaselineSha256, imports.fullResolutionBaseline.sha256);
  assert.equal(replayAudit.resolutionToolSha256, imports.resolutionTool.sha256);
  const pinned = reference => {
    assert.equal(replayInput.pins[reference.path], reference.sha256, 'Unpinned original replay input'); read(reference);
  };
  for (const reference of [...imports.gritSourceRefs, ...imports.interpreterImportRefs, ...imports.actionInputRefs, ...replayInput.responseFiles,
    replayInput.originalInterpreter, replayInput.producerInterpreter, replayInput.pinnedManifest, replayInput.generatedGrd, replayInput.generatedHeader,
    replayInput.generatedResourceMap, replayInput.originalBuildPak, replayInput.originalExpectedOutputs, replayInput.toolchain, ...replayInput.deployedCarriers]) pinned(reference);
  const input = document(imports.derivationInput, contract.derivationInputSchema), audit = document(imports.independentDerivationPreaudit, contract.derivationPreauditSchema);
  keys(input, ['producer', 'version', 'sourceCommit', 'sourceRoot', 'originalInterpreter', 'originalArgv', 'originalResolutionBaseline', 'resolutionTool', 'ownedActionTool', 'actionInputRefs', 'ownedScratchRoot']);
  assert.equal(input.producer, 'aux-shell-action-resolution-derivation-input'); assert.equal(input.version, 1);
  assert.equal(input.sourceRoot, fixedSource); assert.equal(input.sourceCommit, proof.sourceCommit);
  for (const [key, expected] of [['originalInterpreter', imports.originalInterpreter], ['originalArgv', imports.originalArgv],
    ['originalResolutionBaseline', imports.fullResolutionBaseline], ['resolutionTool', imports.resolutionTool], ['actionInputRefs', imports.actionInputRefs]]) assert.deepEqual(input[key], expected);
  assert.deepEqual(imports.resolutionTool, tools.support); read(tools.support); const derivationSource = read(tools.normalStartupDerivation).toString('utf8'); read(input.ownedActionTool);
  assert.equal(imports.ownedScratchRoot, input.ownedScratchRoot);
  keys(audit, ['producer', 'version', 'passed', 'manifestSha256', 'controllerSha256', 'baselineSha256', 'resolutionTool', 'ownedActionTool']);
  assert.equal(audit.producer, 'aux-shell-action-resolution-independent-preaudit'); assert.equal(audit.version, 1); assert.equal(audit.passed, true);
  assert.equal(audit.manifestSha256, imports.derivationInput.sha256); assert.equal(audit.controllerSha256, tools.normalStartupDerivation.sha256);
  assert.equal(audit.baselineSha256, imports.fullResolutionBaseline.sha256);
  assert.deepEqual(audit.resolutionTool, imports.resolutionTool); assert.deepEqual(audit.ownedActionTool, input.ownedActionTool);
  const roots = [join(fixedSource, 'tools/grit'), join(fixedSource, 'third_party/cpython3/host')];
  assert.equal(imports.originalInterpreter.path, join(roots[1], 'bin/python3'));
  assert.deepEqual(imports.closedProbeEnvironment, { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C', PYTHONDONTWRITEBYTECODE: '1',
    PYTHONNOUSERSITE: '1', PYTHONPYCACHEPREFIX: join(input.ownedScratchRoot, 'fresh-empty-pycache') });
  assert.ok(isAbsolute(input.ownedScratchRoot) && !roots.some(root => within(root, input.ownedScratchRoot)), 'Probe output borrowed as original source');
  assert.equal(imports.normalStartupProbeReceipt.path, join(input.ownedScratchRoot, 'original-action-receipt.json'), 'Foreign original probe receipt');
  assert.equal(imports.originalCleanupProof.path, join(input.ownedScratchRoot, 'cleanup-complete.json'), 'Foreign original cleanup receipt');
  const receipt = document(imports.normalStartupProbeReceipt, contract.normalStartupProbeReceiptSchema), cleanup = document(imports.originalCleanupProof, contract.originalCleanupProofSchema);
  keys(receipt, ['argv', 'originalPid', 'originalGroup', 'originalRows', 'exitCode', 'timedOut', 'deadlineSeconds', 'actualGroupRows', 'stdout', 'stderr']);
  assert.ok(Number.isSafeInteger(receipt.originalPid) && receipt.originalPid > 0); assert.equal(receipt.originalGroup, receipt.originalPid);
  assert.equal(receipt.argv.length, 3); assert.equal(receipt.argv[0], imports.originalInterpreter.path); assert.equal(receipt.argv[1], '-c');
  const probeSource = /^PROBE = """([^]*?)"""/m.exec(derivationSource); assert.ok(probeSource, 'Missing fixed original probe source');
  assert.equal(receipt.argv[2], probeSource[1], 'Foreign probe code');
  assert.equal(receipt.exitCode, 0); assert.equal(receipt.timedOut, false); assert.equal(receipt.deadlineSeconds, 300);
  assert.deepEqual(receipt.actualGroupRows, {}); assert.ok(Array.isArray(receipt.originalRows));
  keys(cleanup, ['originalGroup', 'actualRows', 'originalChildReaped', 'cleanupDebt']);
  assert.equal(cleanup.originalGroup, receipt.originalGroup); assert.deepEqual(cleanup.actualRows, []);
  assert.equal(cleanup.originalChildReaped, true); assert.equal(cleanup.cleanupDebt, null);
  assert.equal(receipt.stdout.path, join(input.ownedScratchRoot, 'original-action.stdout'), 'Foreign original probe stdout');
  assert.equal(receipt.stderr.path, join(input.ownedScratchRoot, 'original-action.stderr'), 'Foreign original probe stderr');
  // stdout is the genuine Python probe's JSON print, not a saved canonical
  // controller document. Its original bytes remain held by their approved hash.
  assert.deepEqual(JSON.parse(read(receipt.stdout).toString('utf8')), imports.normalStartupProbe); read(receipt.stderr);
  const baseline = document(imports.fullResolutionBaseline);
  keys(baseline, ['producer', 'version', 'roots', 'inventories', 'inventorySha256', 'admitted', 'originalGritActionDispatched', 'support']);
  assert.deepEqual(baseline.support, tools.support); read(baseline.support);
  assert.equal(baseline.producer, 'aux-shell-action-resolution-inventory-candidate'); assert.equal(baseline.version, 1);
  assert.equal(baseline.admitted, false); assert.equal(baseline.originalGritActionDispatched, false); assert.deepEqual(baseline.roots, roots);
  assert.equal(baseline.inventorySha256, pairHash(canonicalPairJson(baseline.inventories) + '\n'));
  assert.equal(baseline.inventories.length, roots.length);
  const expectedFiles = new Map();
  for (let index = 0; index < roots.length; index++) {
    const tree = baseline.inventories[index]; keys(tree, ['root', 'entries']); assert.equal(tree.root, roots[index]);
    for (const row of tree.entries) if (row.kind === 'file') {
      const path = join(tree.root, row.path); assert.ok(within(tree.root, path)); assert.ok(!expectedFiles.has(path)); expectedFiles.set(path, row);
    }
  }
  for (const [field, select] of [['gritSourceRefs', path => path.startsWith(roots[0] + '/') && path.endsWith('.py')],
    ['interpreterImportRefs', path => path.startsWith(roots[1] + '/')]]) {
    assert.deepEqual(imports[field], [...expectedFiles].filter(([path]) => select(path)).map(([path, row]) => ({ path, sha256: row.sha256 })));
  }
  const probe = imports.normalStartupProbe;
  assert.equal(probe.prefix, roots[1]); assert.equal(probe.basePrefix, roots[1]);
  for (const value of probe.sysPath) {
    const path = value || roots[0]; assert.ok(isAbsolute(path) && (path === roots[0] || within(roots[1], path)), 'Foreign original sys.path');
  }
  for (const path of probe.loadedModuleFiles) assert.ok(expectedFiles.has(path), 'Loaded module absent from complete original inventory');
  const validate = () => {
    const actual = roots.map(root => {
      assert.equal(realpathSync(root), root, 'Original resolution root replaced');
      const entries = [];
      const visit = path => {
        const meta = lstatSync(path), row = { path: relative(root, path) || '.', mode: meta.mode & 0o7777, uid: meta.uid };
        if (meta.isDirectory()) {
          row.kind = 'directory'; entries.push(row);
          for (const name of readdirSync(path).sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)))) visit(join(path, name));
        } else if (meta.isFile()) {
          const expected = expectedFiles.get(path); assert.ok(expected, 'Unknown original resolution file');
          row.kind = 'file'; row.size = meta.size; row.sha256 = expected.sha256; files.retain({ path, sha256: row.sha256 }); entries.push(row);
        } else {
          assert.ok(meta.isSymbolicLink(), 'Unsupported original resolution member'); row.kind = 'symlink'; row.target = readlinkSync(path); row.resolvedPath = realpathSync(path);
          assert.ok(roots.some(candidate => within(candidate, row.resolvedPath)), 'Outside original resolution symlink'); entries.push(row);
        }
      };
      visit(root); return { root, entries };
    });
    assert.deepEqual(actual, baseline.inventories, 'Unknown/changed complete original resolution inventory'); files.validate();
  };
  validate(); return validate;
}
