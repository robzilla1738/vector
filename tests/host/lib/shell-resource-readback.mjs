import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, relative, isAbsolute } from 'node:path';
import { canonicalPairJson, decodeCanonicalPairDocument, pairHash } from './packaged-runtime-pair-protocol.mjs';
import { readShellResourceCarrier } from './shell-resource-carrier.mjs';
import { readShellResourceIndex } from './shell-resource-index.mjs';
import { verifyOriginalResolutionClosure } from './shell-resolution-provenance.mjs';
const schema = JSON.parse(readFileSync(new URL('./shell-resource-readback.schema.json', import.meta.url)));
const replaySchema = JSON.parse(readFileSync(new URL('./shell-action-replay.schema.json', import.meta.url)));
const importSchema = JSON.parse(readFileSync(new URL('./shell-import-input-closure.schema.json', import.meta.url)));
const ref = row => ({ path: row.path, sha256: row.sha256 });
const within = (root, path) => { const name = relative(root, path); return name && name !== '..' && !name.startsWith('../') && !isAbsolute(name); };
export function requireClosureFile(closure, reference) {
  const name = relative(closure.root, reference.path), row = closure.rows.find(item => item.path === name);
  assert.ok(within(closure.root, reference.path) && row?.kind === 'regular', 'Reference is not an original approved closure member');
  assert.equal(reference.sha256, row.sha256, 'Foreign original closure bytes');
  if ('size' in reference) assert.equal(reference.size, row.size);
  if ('mode' in reference) assert.equal(reference.mode, row.mode);
  return row;
}
/** Read-only joins of independently approved originals. Expected transformation
 * output comes from the separate original-source replay, never decoded PAKs. */
export function verifyShellResourceReadback(manifest, files) {
  const shell = manifest.package.shellAssets;
  const read = reference => { const bytes = files.read(ref(reference), 64 * 1024 * 1024); assert.equal(pairHash(bytes), reference.sha256); return bytes; };
  const text = reference => read(reference).toString('utf8');
  const proof = decodeCanonicalPairDocument(text(shell.resourceReadbackProof), schema);
  assert.equal(proof.sourceCommit, manifest.source.productIdentity.commit);
  assert.deepEqual(proof.pinnedManifest, shell.pinnedManifest);
  assert.deepEqual(proof.generatedResourceMap, shell.generatedResourceMap);
  assert.deepEqual(proof.originalBuildPak, shell.generatedPak);
  assert.deepEqual(proof.deployedCarriers, shell.deployedCarriers);
  assert.deepEqual(proof.originalGraphProof, manifest.native.graph.terminalProof);
  assert.equal(proof.dimensionAwareDigest, shell.dimensionAwareDigest);
  assert.equal(proof.passed, true); assert.deepEqual(proof.failures, []);
  const holdReferences = value => {
    if (!value || typeof value !== 'object') return;
    if (typeof value.path === 'string' && typeof value.sha256 === 'string') files.retain(ref(value));
    else for (const child of Object.values(value)) holdReferences(child);
  };
  holdReferences(proof);
  const imports = decodeCanonicalPairDocument(text(proof.originalImportInputClosureProof), importSchema);
  assert.equal(imports.sourceCommit, proof.sourceCommit);
  assert.deepEqual(imports.originalArgv, proof.originalGritAction.argv, 'Foreign original GRIT import invocation');
  holdReferences(imports);
  const validateResolution = verifyOriginalResolutionClosure(imports, proof, files);
  for (const list of [imports.gritSourceRefs, imports.interpreterImportRefs, imports.actionInputRefs])
    assert.equal(new Set(list.map(row => row.path)).size, list.length, 'Duplicate original input/import member');
  requireClosureFile(shell.sourceInputClosure, shell.pinnedManifest);
  assert.equal(shell.pinnedManifest.path, join(shell.sourceInputClosure.root, 'manifest.json'));
  const source = JSON.parse(text(shell.pinnedManifest));
  assert.deepEqual(Object.keys(source).sort(), ['files', 'kind', 'sha256']); assert.equal(source.kind, 'aux-webui-shell-v1');
  assert.equal(source.files.length, 175);
  assert.equal(source.sha256, shell.dimensionAwareDigest);
  assert.equal(pairHash(source.files.map(row => `${row.path}\t${row.bytes}\t${row.sha256}\n`).join('')), source.sha256);
  const index = readShellResourceIndex(text(proof.generatedGrd), text(proof.generatedHeader), text(proof.generatedResourceMap));
  for (const reference of [proof.generatedGrd, proof.generatedHeader, proof.generatedResourceMap, proof.originalBuildPak]) requireClosureFile(manifest.native.compiledClosure, reference);
  const carriers = new Map([proof.originalBuildPak, ...proof.deployedCarriers].map(reference => [reference.path, readShellResourceCarrier(read(reference))]));
  for (const reference of proof.deployedCarriers) requireClosureFile(manifest.package.appClosure, reference);
  const inputs = new Map(source.files.map(row => [row.path, row]));
  assert.equal(inputs.size, 175, 'Duplicate original source path');
  const observedPaths = new Set(), observedIds = new Set(), replays = new Map();
  let expectedCarrier;
  for (const row of proof.rows) {
    const input = inputs.get(row.resourcePath), selected = index.find(item => item.resourcePath === row.resourcePath);
    assert.ok(input && selected && !observedPaths.has(row.resourcePath) && !observedIds.has(row.resourceId), 'Missing/duplicate readback resource');
    observedPaths.add(row.resourcePath); observedIds.add(row.resourceId);
    assert.equal(row.resourceId, selected.resourceId); assert.equal(row.resourceName, selected.resourceName);
    assert.deepEqual(row.selectedInclude, selected.selectedInclude);
    assert.equal(row.sourceInput.path, join(shell.sourceInputClosure.root, input.path));
    requireClosureFile(shell.sourceInputClosure, row.sourceInput);
    assert.equal(row.sourceInput.sha256, input.sha256); assert.equal(row.sourceInputSize, input.bytes);
    assert.equal(selected.selectedInclude.use_base_dir, 'false', 'Unsupported selected GRIT base-directory resolution');
    assert.ok(selected.selectedInclude.file === row.sourceInput.path ||
      (shell.sourceInputClosure.root.endsWith('/chrome/browser/resources/aux/assets') && selected.selectedInclude.file === '${root_src_dir}/chrome/browser/resources/aux/assets/' + input.path), 'Foreign selected GRIT input');
    const originalSource = read(row.sourceInput); assert.equal(originalSource.length, input.bytes);
    let replay = replays.get(row.transform.actionEvidence.path);
    if (!replay) {
      replay = decodeCanonicalPairDocument(text(row.transform.actionEvidence), replaySchema);
      assert.deepEqual(replay.originalImportInputClosureProof, proof.originalImportInputClosureProof, 'Foreign replay import closure');
      assert.equal(replay.inputOrigin, 'original-source'); assert.equal(replay.sourceCommit, proof.sourceCommit);
      assert.equal(replay.exitCode, 0); assert.equal(replay.passed, true); assert.deepEqual(replay.failures, []);
      for (const [key, expected] of [['originalSourceManifest', proof.pinnedManifest], ['originalGeneratedGrd', proof.generatedGrd],
        ['originalGeneratedHeader', proof.generatedHeader], ['originalGeneratedResourceMap', proof.generatedResourceMap], ['originalSuccessfulGraphProof', proof.originalGraphProof]]) assert.deepEqual(replay[key], expected);
      assert.deepEqual(replay.originalGritAction.argv, proof.originalGritAction.argv);
      assert.deepEqual(replay.originalGritAction.responseFiles, proof.originalGritAction.responseFiles);
      assert.equal(new Set(replay.rows.map(item => item.resourcePath)).size, 175);
      const excluded = new Set([proof.originalBuildPak, ...proof.deployedCarriers].map(reference => reference.path));
      for (const reference of replay.originalGritAction.toolAndSourceRefs) assert.ok(!excluded.has(reference.path), 'Carrier borrowed as replay input');
      assert.ok(within(replay.ownedScratchRoot, proof.expectedReplayPak.path) && !within(manifest.package.appRoot, proof.expectedReplayPak.path) && !within(manifest.native.compiledClosure.root, proof.expectedReplayPak.path), 'Expected PAK is not independent replay output');
      expectedCarrier ??= readShellResourceCarrier(read(proof.expectedReplayPak));
      holdReferences(replay); replays.set(row.transform.actionEvidence.path, replay);
    }
    const expected = replay.rows.find(item => item.resourcePath === row.resourcePath);
    assert.ok(expected); assert.deepEqual(expected.failures, []); assert.deepEqual(row.failures, []);
    assert.equal(expected.resourceId, row.resourceId); assert.equal(expected.resourceName, row.resourceName);
    assert.deepEqual(expected.originalSourceInput, row.sourceInput); assert.equal(expected.originalSourceInputSize, row.sourceInputSize);
    assert.equal(expected.actualGritNodeType, selected.selectedInclude.type);
    const includeRaw = text(expected.originalSelectedIncludeEvidence), include = JSON.parse(includeRaw);
    assert.equal(includeRaw, canonicalPairJson(include) + '\n', 'Noncanonical selected include evidence');
    assert.deepEqual(Object.keys(include).sort(), ['element', 'rawAttributes', 'effectiveAttributes', 'originalGeneratedGrd'].sort(), 'Unexpected selected include wrapper');
    assert.equal(include.element, selected.element);
    assert.deepEqual(include.originalGeneratedGrd, proof.generatedGrd);
    assert.deepEqual(include.rawAttributes, selected.rawAttributes);
    assert.deepEqual(include.effectiveAttributes, selected.selectedInclude);
    assert.ok(expected.actualTransformStages.includes('original-input-read'), 'Missing original input replay stage');
    if (selected.selectedInclude.type === 'chrome_html') assert.ok(expected.actualTransformStages.includes('chrome-html-gather'), 'Missing actual chrome_html gather pipeline');
    assert.deepEqual(expected.expectedTransformedArtifact, row.transform.expectedTransformedArtifact);
    assert.equal(expected.expectedTransformedSha256, row.transform.expectedTransformedSha256);
    assert.equal(expected.expectedTransformedSize, row.transform.expectedTransformedSize);
    assert.deepEqual(expected.expandedMinifierArgv, row.transform.minifierArgv);
    for (const artifact of [expected.expectedStoredArtifact, expected.expectedTransformedArtifact])
      assert.ok(within(replay.ownedScratchRoot, artifact.path) && !within(manifest.package.appRoot, artifact.path) && !within(manifest.native.compiledClosure.root, artifact.path), 'Expected artifact is not independent replay output');
    const expectedBytes = read(expected.expectedTransformedArtifact), expectedStored = read(expected.expectedStoredArtifact);
    assert.equal(expectedBytes.length, expected.expectedTransformedSize); assert.equal(pairHash(expectedBytes), expected.expectedTransformedSha256);
    assert.equal(expectedStored.length, expected.expectedStoredSize); assert.equal(pairHash(expectedStored), expected.expectedStoredSha256);

    const sourceEqual = originalSource.equals(expectedBytes);
    assert.equal(expected.sourceEqualsExpectedTransformed, sourceEqual); assert.equal(row.transform.sourceEqualityProved, sourceEqual);
    if (row.transform.kind === 'none-beyond-compression') assert.ok(sourceEqual && !row.transform.minifierConfigured && row.transform.minifierArgv.length === 0 && selected.selectedInclude.preprocess === 'false' && selected.selectedInclude.flattenhtml === 'false');
    const compression = selected.selectedInclude.compress === 'default' ? (/\.(js|html|css|svg|json)$/.test(selected.selectedInclude.file) ? 'gzip' : 'literal') : selected.selectedInclude.compress === 'false' ? 'literal' : selected.selectedInclude.compress;
    const expectedPayload = expectedCarrier.read(row.resourceId, compression);
    assert.equal(expectedPayload.storedSize, expectedStored.length);
    assert.equal(expectedPayload.storedSha256, expected.expectedStoredSha256);
    assert.deepEqual(expectedPayload.bytes, expectedBytes);
    assert.deepEqual(row.deployedPayloads.map(payload => payload.artifact), proof.deployedCarriers);
    assert.deepEqual(row.originalBuildPayload.artifact, proof.originalBuildPak);
    for (const payload of [row.originalBuildPayload, ...row.deployedPayloads]) {
      assert.equal(payload.resourceId, row.resourceId); assert.equal(payload.compression, compression);
      const carrier = carriers.get(payload.artifact.path), actual = carrier.read(row.resourceId, compression);
      assert.equal(payload.aliasOf, carrier.aliases.find(alias => alias.id === row.resourceId)?.targetId ?? null);
      for (const key of ['storedSize', 'storedSha256', 'decodedSize', 'decodedSha256']) assert.equal(payload[key], actual[key]);
      assert.equal(actual.storedSize, expected.expectedStoredSize); assert.equal(actual.storedSha256, expected.expectedStoredSha256); assert.deepEqual(actual.bytes, expectedBytes);
      assert.deepEqual(read(payload.decodedEvidence), actual.bytes);
    }
    assert.ok(row.storedPayloadsEqual && row.decodedPayloadsEqual && row.expectedTransformedPayloadEqual);
  }
  assert.equal(observedPaths.size, 175);
  assert.equal(proof.decodedTotalBytes, expectedCarrier.decodedTotalBytes, 'Readback transformed aggregate differs');
  assert.deepEqual(proof.carrierDecodedTotals, [proof.originalBuildPak, ...proof.deployedCarriers].map(row => carriers.get(row.path).decodedTotalBytes), 'Actual carrier alias-aware totals differ');
  files.validate();
  return Object.freeze({ resources: 175, sourceDigest: source.sha256, originalProof: Object.freeze({ ...shell.resourceReadbackProof }), validate: validateResolution });
}
