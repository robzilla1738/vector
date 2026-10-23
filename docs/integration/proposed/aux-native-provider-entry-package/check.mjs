import assert from 'node:assert/strict';
import { readFile, writeFile, copyFile, mkdtemp, mkdir, rm, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { verifyProviderNativePackageInput, replaceCopiedProviderDaemonAndPty } from './source/package.mjs';
import { projectProviderNativeEntry } from './source/project.mjs';
const here = dirname(fileURLToPath(import.meta.url));
const workspace = fileURLToPath(new URL('../../../../', import.meta.url));
const pins = JSON.parse(await readFile(join(here, 'inputs.json')));
const stage = JSON.parse(await readFile(join(pins.stageRoot, 'manifest.json')));
const composition = await readFile('/Users/rcourson/Documents/Vibe/web/out/native-reuse-composition-aux-parent-swift-runtime/manifest.json');
const receiptPath = join(here, '../aux-native-worker-close-main-build/evidence/results.json');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const preflight = (changes = {}) => verifyProviderNativePackageInput({ repositoryRoot: workspace,
  receiptPath, compositionBytes: composition, stage, ...changes });
await assert.rejects(preflight({stage: {...stage, finalApp: stage.finalApp + '.wrong'}}), /Exact inactive state2/);
await assert.rejects(preflight({compositionBytes: Buffer.concat([composition, Buffer.from(' ')])}), /Exact inactive state2/);
const indexPath = 'apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs';
const index = await readFile(join(pins.stageRoot, indexPath));
const original = await readFile(join(workspace, pins.originalDaemon));
assert.throws(() => projectProviderNativeEntry(original, Buffer.concat([index, Buffer.from(' ')]), pins), /Exact reviewed/);
const projected = projectProviderNativeEntry(original, index, pins);
assert.equal(hash(projected), pins.entrySha256);
assert.match(index.toString('utf8', 0, 240), /AUX_STATE_IDENTITY_QUARANTINED/);
const evidence = await preflight();
const resources = await mkdtemp(join(tmpdir(), 'aux-provider-native-package-fixture-'));
try {
  const files = [];
  for (const path of [...pins.replacements.map(item => item.path), pins.helper.path, indexPath, pins.providerSidecar.path]) {
    await mkdir(dirname(join(resources, path)), {recursive: true});
    await copyFile(join(pins.stageRoot, path), join(resources, path));
    files.push({path, type: 'file', sha256: hash(await readFile(join(resources, path))),
      mode: (await lstat(join(resources, path))).mode & 0o777});
  }
  const assembled = {identityProfile: 'aux-v1', stateIdentityVersion: 2,
    daemonRuntime: 'provided-node-development', files};
  await assert.rejects(replaceCopiedProviderDaemonAndPty({resources,
    assembled: {...assembled, providerNativeReplacement: {}}, evidence, repositoryRoot: workspace}), /Fresh exact-byte/);
  const report = await replaceCopiedProviderDaemonAndPty({resources, assembled, evidence, repositoryRoot: workspace});
  assert.equal(report.mode, 'inactive-provider-native-main-with-rebuilt-pty');
  assert.equal(assembled.providerNativeReplacement, report);
  assert.equal(assembled.nativePtyReplacement, undefined);
  assert.equal(report.authorityGranted, false);
  assert.equal(report.nativeEntryProjection.readerSourceLinked, true);
  assert.equal(report.nativeEntryProjection.requiredReaderSha256, pins.fixedReaderSha256);
  for (const artifact of pins.replacements)
    assert.equal(hash(await readFile(join(resources, artifact.path))), artifact.sha256);
  for (const unchanged of [{path: indexPath, sha256: pins.defaultIndexSha256}, pins.helper, pins.providerSidecar])
    assert.equal(hash(await readFile(join(resources, unchanged.path))), unchanged.sha256);
  for (const resource of pins.dormantResources)
    assert.equal(hash(await readFile(join(resources, resource.path))), resource.sha256);
  assert.equal(assembled.files.length, files.length);
  assert.equal(assembled.files.length, 7);
  await assert.rejects(replaceCopiedProviderDaemonAndPty({resources, assembled, evidence, repositoryRoot: workspace}), /Fresh exact-byte/);
} finally {
  await rm(resources, {recursive: true, force: true});
}
await mkdir(join(here, 'evidence'), {recursive: true});
const result = {format: 'aux.provider-native-package.fixture.v1', passed: true,
  finalStageManifestSha256: pins.stageManifestSha256,
  finalIndexSha256: pins.defaultIndexSha256, projectedEntrySha256: pins.entrySha256,
  nativeMainSha256: pins.replacements[0].sha256, ptyModuleSha256: pins.replacements[1].sha256,
  actualFinalLeafFixture: true, staleStageAndCompositionRefused: true,
  alteredIndexRefused: true, mixedProviderModeAndReplayRefused: true,
  ordinaryIndexHelperAndChatgptSidecarUnchanged: true,
  exactTwoNativeReplacementsAndTwoDormantResources: true,
  distinctProviderReport: true, nativeReaderCompileUnnecessary: true,
  signed: false, moduleLoaded: false, executableRun: false, acceptedAppChanged: false,
  temporaryFixtureRemoved: true};
await writeFile(join(here, 'evidence/check.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
