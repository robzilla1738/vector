#!/usr/bin/env node
/** Freeze the named final source stage; never assemble, execute or activate it. */
import { readFile, writeFile, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { projectProviderNativeEntry } from './source/project.mjs';
const here = dirname(fileURLToPath(import.meta.url));
const workspace = fileURLToPath(new URL('../../../../', import.meta.url));
const root = '/Users/rcourson/Documents/Vibe/web';
const stageRoot = join(root, 'out/provided-provider-funded-final-20261023');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const json = async path => JSON.parse(await readFile(path, 'utf8'));
const old = await json(join(workspace, 'docs/integration/proposed/aux-native-rebuilt-pty-package/inputs.json'));
const review = await json(join(workspace, 'docs/integration/proposed/aux-native-current-entry-package/inputs.json'));
const mainInputsPath = 'docs/integration/proposed/aux-native-worker-close-main-build/inputs.json';
const mainReceiptPath = 'docs/integration/proposed/aux-native-worker-close-main-build/evidence/results.json';
const mainInputs = await json(join(workspace, mainInputsPath));
const mainRaw = await readFile(join(workspace, mainReceiptPath));
const main = JSON.parse(mainRaw);
if (!main.passed || !main.inputsUnchanged || !main.allFourClassDeclarationsPaired ||
    main.executableSha256 !== '450e4ad830fb169f6342a77e9ef551e519df3a59547823e437448f57e89f8dc2')
  throw Error('Exact actual Worker-retirement full link required');
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
const entry = projectProviderNativeEntry(original, index, entryInputs);
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
  'docs/integration/proposed/aux-native-provider-entry-package/source/project.mjs',
  'docs/integration/proposed/aux-native-provider-entry-package/source/resources.mjs',
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
for (const path of [mainInputsPath, mainReceiptPath,
  'docs/integration/proposed/aux-native-worker-close-main-build/prepare.py',
  'docs/integration/proposed/aux-native-worker-close-main-build/build.py',
  'docs/integration/proposed/aux-native-provider-entry-package/source/package.mjs',
  'docs/integration/proposed/aux-native-provider-entry-package/prepare.mjs'
]) sourceFiles[path] = hash(await readFile(join(workspace, path)));
const mainArtifact = join(mainInputs.output, 'Aux Daemon');
if (hash(await readFile(mainArtifact)) !== main.executableSha256) throw Error('Retained actual executable differs');
const pins = { ...old, format: 'aux.inactive-provider-native.package-inputs.v1', ...entryInputs,
  stageRoot, stageManifestSha256: hash(stageRaw), stageAppsManifestSha256: hash(appsRaw),
  stageDeclarationSha256: hash(Buffer.from(JSON.stringify(stage))),
  entrySha256: hash(entry), entryBytes: entry.length,
  entryDependencies,
  loader: { path: 'docs/integration/proposed/aux-native-owned-entry-routing/source/aux-owned-native.cjs', sha256: review.loaderSha256 },
  sourceFiles, externalReferences,
  buildReceipt: { path: mainReceiptPath, sha256: hash(mainRaw), fields: Object.fromEntries([
    'format', 'passed', 'results', 'inputsUnchanged', 'allFourClassDeclarationsPaired',
    'actualExportTriePassed', 'policyFormat', 'executableSha256', 'moduleSha256',
    'codeSignatureLoadCommandPresent', 'signed', 'executableRun', 'moduleLoaded',
    'policyActivated', 'acceptedAppChanged', 'nativeCustodyProven'
  ].map(key => [key, main[key]])) },
  replacements: [{ ...old.replacements[0], input: mainArtifact, sha256: main.executableSha256,
    bytes: (await lstat(mainArtifact)).size, previousSha256: mainRows[0].outputSha256, source: 'compiled-worker-retirement-native-main' }, old.replacements[1]],
  defaultIndexSha256: hash(index),
  dormantResources: [{ path: old.dormantResources[0].path, sha256: hash(entry), mode: 0o644 }, old.dormantResources[1]],
  providerSidecar: { path: 'apps/daemon/Aux Daemon.app/Contents/Resources/native/aux-chatgpt.cjs', sha256: sidecarRows[0].outputSha256 },
  fixedReaderSha256: '1076fd852428f0db4d0ba4f2a2898b05f88656d9bec36d272418a1fe2bdac2b8'
};
await writeFile(join(here, 'inputs.json'), JSON.stringify(pins, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ prepared: true, inputIndexSha256: pins.inputIndexSha256,
  entrySha256: pins.entrySha256, entryBytes: pins.entryBytes, nativeMainSha256: main.executableSha256,
  readerUnchanged: true, syntaxPassed: true, activated: false }));
