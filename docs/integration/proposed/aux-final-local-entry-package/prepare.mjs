#!/usr/bin/env node
/** Freeze the named final source stage; never assemble, execute or activate it. */
import { readFile, writeFile, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { projectFinalLocalNativeEntry } from './source/project.mjs';
const here = dirname(fileURLToPath(import.meta.url));
const workspace = fileURLToPath(new URL('../../../../', import.meta.url));
const root = '/Users/rcourson/Documents/Vibe/web';
const stageRoot = join(root, 'out/provided-final-local-completion-20261023-v2');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const json = async path => JSON.parse(await readFile(path, 'utf8'));
const old = await json(join(workspace, 'docs/integration/proposed/aux-native-rebuilt-pty-package/inputs.json'));
const review = await json(join(workspace, 'docs/integration/proposed/aux-native-current-entry-package/inputs.json'));
const mainInputsPath = 'docs/integration/proposed/final-completion/native-build/inputs.json';
const mainGraphRoot = '/private/tmp/aux-final-native-link';
const mainReceiptPath = 'docs/integration/proposed/final-completion/native-build/evidence/results.json';
const retainedReceiptPath = '/private/tmp/aux-final-native-main-20261023/results.json';
const mainInputsRaw = await readFile(join(mainGraphRoot, mainInputsPath));
const mainInputs = JSON.parse(mainInputsRaw);
const mainRaw = await readFile(retainedReceiptPath);
const main = JSON.parse(mainRaw);
if (main.format !== 'aux.final-completion.native-main.build.v1' ||
    main.inputsSha256 !== hash(mainInputsRaw) ||
    main.recipeSha256 !== hash(await readFile(join(mainGraphRoot, 'docs/integration/proposed/final-completion/native-build/build.py'))) ||
    JSON.stringify(main.sourceReplacements) !== JSON.stringify(mainInputs.sourceReplacements) ||
    JSON.stringify(main.objectInputs) !== JSON.stringify(mainInputs.objectInputs) ||
    main.signed !== false || main.executableRun !== false || main.moduleLoaded !== false ||
    main.protectedRuntimeAccess !== false || main.policyActivated !== false ||
    !main.passed || !main.inputsUnchanged || !main.readonlyExecPrivateParentBound || main.privateCapabilitiesExported !== false ||
    main.executableSha256 !== '3e48f01554e35228945604fdeafcb1aaccee248151b2337f3596cfe0d1b75e2e')
  throw Error('Exact actual fresh-owner/exec-parent full link required');
const stageRaw = await readFile(join(stageRoot, 'manifest.json'));
const stage = JSON.parse(stageRaw);
if (stage.identityProfile !== 'aux-v1' || stage.stateIdentityVersion !== 2 || stage.productionReady !== false)
  throw Error('Exact inactive state2 final stage required');
const appsRaw = await readFile(join(stageRoot, 'apps/manifest.json'));
const apps = JSON.parse(appsRaw);
const relativeIndex = 'Contents/Resources/node-development/index.mjs';
const indexRows = apps.components.daemon.files.filter(file => file.path === relativeIndex);
if (indexRows.length !== 1) throw Error('Exactly one staged ordinary index required');
const mainRows = apps.components.daemon.files.filter(file => file.path === 'Contents/MacOS/aux-daemon');
const sidecarRows = apps.components.daemon.files.filter(file => file.path === 'Contents/Resources/native/aux-chatgpt.cjs');
if (mainRows.length !== 1 || sidecarRows.length !== 1) throw Error('One actual staged daemon and ChatGPT sidecar required');
const index = await readFile(join(stageRoot, 'apps', apps.components.daemon.app, relativeIndex));
if (hash(index) !== indexRows[0].outputSha256) throw Error('Actual final index differs from its stage inventory');
const entryInputs = { inputIndexSha256: hash(index), inputIndexBytes: index.length,
  originalDaemon: review.originalDaemon, originalDaemonSha256: review.originalDaemonSha256 };
const original = await readFile(join(root, review.originalDaemon));
const entry = projectFinalLocalNativeEntry(original, index, entryInputs);
const syntax = spawnSync(process.execPath, ['--check', '--input-type=module'],
    { input: entry, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
if (syntax.status !== 0) throw Error('Projected dormant entry syntax refused; nothing was activated');
const sourceFiles = { ...old.sourceFiles };
const externalReferences = { ...old.externalReferences };
for (const [path, expected] of Object.entries(mainInputs.frozenFiles)) {
  if (path.startsWith(workspace)) sourceFiles[path.slice(workspace.length)] = expected;
  else externalReferences[path] = expected;
}
const entryDependencies = {};
for (const path of [
  'docs/integration/proposed/aux-final-local-entry-package/source/project.mjs',
  'docs/integration/proposed/aux-final-local-entry-package/source/resources.mjs',
  'docs/integration/proposed/aux-native-owned-entry-routing/edits.json',
  'docs/integration/proposed/aux-native-owned-entry-routing/source/aux-owned-native.cjs',
  'docs/integration/proposed/aux-native-fixed-pty-loading/transform.mjs',
  'docs/integration/proposed/aux-native-fixed-pty-loading/anchor.json',
  'docs/integration/proposed/aux-native-exec-lifetime/edits.json',
  'vendor/provided/aux-cold-entry-admission.mjs',
  'docs/integration/proposed/aux-cold-entry-admission/inputs.json',
  'vendor/aside/lib/sea.mjs'
]) entryDependencies[path] = hash(await readFile(join(workspace, path)));
Object.assign(sourceFiles, entryDependencies);
for (const path of [
  'docs/integration/proposed/aux-final-local-entry-package/source/package.mjs',
  'docs/integration/proposed/aux-final-local-entry-package/prepare.mjs'
]) sourceFiles[path] = hash(await readFile(join(workspace, path)));
for (const path of [mainInputsPath, 'docs/integration/proposed/final-completion/native-build/prepare.py',
  'docs/integration/proposed/final-completion/native-build/build.py']) {
  const actual = join(mainGraphRoot, path);
  externalReferences[actual] = hash(await readFile(actual));
}
externalReferences[retainedReceiptPath] = hash(mainRaw);
const integratedReceiptPath = join(root, mainReceiptPath);
if (hash(await readFile(integratedReceiptPath)) !== hash(mainRaw))
  throw Error('Integrated full-link receipt differs from retained actual output');
externalReferences[integratedReceiptPath] = hash(mainRaw);
const compositionPath = join(root, 'out/native-reuse-composition-final-peer-20261023/manifest.json');
const compositionRaw = await readFile(compositionPath);
const composition = JSON.parse(compositionRaw);
externalReferences[compositionPath] = hash(compositionRaw);
const compositionPatch = join(root, 'out/native-reuse-composition-final-peer-20261023/combined.patch');
const compositionPatchSha256 = hash(await readFile(compositionPatch));
externalReferences[compositionPatch] = compositionPatchSha256;
if (composition.appliedToNative !== false || composition.compiled !== false ||
    composition.parentCompositionSha256 !== old.compositionSha256 ||
    composition.combinedPatchSha256 !== compositionPatchSha256 || !composition.steps.some(step => JSON.stringify(step).includes('final-completion/native/peer')))
  throw Error('Exact proposed final PEER composition required');
const browserReceiptPath = 'out/native-final-peer-build-20261023.json';
const browserReceiptRaw = await readFile(join(root, browserReceiptPath));
const browserReceipt = JSON.parse(browserReceiptRaw);
if (browserReceipt.buildExitCode !== 0 || browserReceipt.generatedKeyProbePassed !== true ||
    browserReceipt.productionReady !== false || browserReceipt.localDevelopmentOnly !== true ||
    browserReceipt.compositionSha256 !== hash(compositionRaw))
  throw Error('Actual final PEER browser build receipt required');
const receipts = [...old.receipts, {path: browserReceiptPath, sha256: hash(browserReceiptRaw),
  fields: Object.fromEntries(['version', 'implementation', 'productionReady', 'nativeRoot', 'buildRoot',
    'app', 'compositionSha256', 'argsSha256', 'buildExitCode', 'generatedKeyProbePassed',
    'files', 'localDevelopmentOnly'].map(key => [key, browserReceipt[key]]))}];
const mainArtifact = join(mainInputs.output, 'Aux Daemon');
if (hash(await readFile(mainArtifact)) !== main.executableSha256) throw Error('Retained actual executable differs');
const pins = { ...old, format: 'aux.inactive-final-local-native.package-inputs.v1', compositionSha256: hash(compositionRaw),
  compositionPath, nativeBuildInputs: {path: mainInputsPath, retained: join(mainGraphRoot, mainInputsPath), sha256: hash(await readFile(join(mainGraphRoot, mainInputsPath)))}, ...entryInputs,
  stageRoot, stageManifestSha256: hash(stageRaw), stageAppsManifestSha256: hash(appsRaw),
  stageDeclarationSha256: hash(Buffer.from(JSON.stringify(stage))),
  entrySha256: hash(entry), entryBytes: entry.length,
  entryDependencies,
  loader: { path: 'docs/integration/proposed/aux-native-owned-entry-routing/source/aux-owned-native.cjs', sha256: review.loaderSha256 },
  sourceFiles, externalReferences, receipts,
  buildReceipt: { path: mainReceiptPath, retained: retainedReceiptPath, sha256: hash(mainRaw), fields: Object.fromEntries([
    'format', 'passed', 'results', 'inputsUnchanged', 'sourceReplacements', 'objectInputs',
    'readonlyExecPrivateParentBound', 'privateCapabilitiesExported', 'fixedReaderPreserved',
    'inputsSha256', 'recipeSha256', 'protectedRuntimeAccess',
    'actualExportTriePassed', 'policyFormat', 'executableSha256', 'moduleSha256',
    'codeSignatureLoadCommandPresent', 'signed', 'executableRun', 'moduleLoaded',
    'policyActivated', 'acceptedAppChanged', 'nativeCustodyProven'
  ].map(key => [key, main[key]])) },
  replacements: [{ ...old.replacements[0], input: mainArtifact, sha256: main.executableSha256,
    bytes: (await lstat(mainArtifact)).size, previousSha256: mainRows[0].outputSha256, source: 'compiled-final-fresh-owner-exec-parent-native-main' }, old.replacements[1]],
  defaultIndexSha256: hash(index),
  dormantResources: [{ path: old.dormantResources[0].path, sha256: hash(entry), mode: 0o644 }, old.dormantResources[1]],
  providerSidecar: { path: 'apps/daemon/Aux Daemon.app/Contents/Resources/native/aux-chatgpt.cjs', sha256: sidecarRows[0].outputSha256 },
  fixedReaderSha256: '1076fd852428f0db4d0ba4f2a2898b05f88656d9bec36d272418a1fe2bdac2b8'
};
await writeFile(join(here, 'inputs.json'), JSON.stringify(pins, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ prepared: true, inputIndexSha256: pins.inputIndexSha256,
  entrySha256: pins.entrySha256, entryBytes: pins.entryBytes, nativeMainSha256: main.executableSha256,
  readerUnchanged: true, syntaxPassed: true, activated: false }));
