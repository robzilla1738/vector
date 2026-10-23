#!/usr/bin/env node
import {relocateAuxAssetPath} from '../vendor/provided/aux-asset-path-identity.mjs';
import {applyAuxBuiltinIconIdentity} from '../vendor/provided/aux-builtin-icon-identity.mjs';
import {applyAuxRuntimeContractIdentity} from '../vendor/provided/aux-runtime-contract-identity.mjs';
import {CLI_COMMAND} from '../vendor/aside/patches/brand.mjs';
import {disabledSeed} from '../vendor/provided/vault-product-exclusion.mjs';
import {loadAuxBrowserIconReplacement} from './lib/aux-browser-icon.mjs';
import {providedRecoveryEnrollmentUiResources} from './lib/provided-ui.mjs';
// Preservation audit: unchanged source equality is expected, never a clean-room failure.
import { resolveProtocolIdentity, resolveStateIdentityVersion } from '../vendor/provided/aux-protocol-identity.mjs';
import { createHash } from 'node:crypto';
import { lstat, readdir, readFile, readlink } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveCloudServicePolicy } from '../vendor/provided/cloud-service-policy.mjs';
import { providedAppRoots, providedIntegrationFiles, providedIntegrationInput } from './lib/provided-apps.mjs';
import { providedStageInputs } from './lib/provided-stage-inputs.mjs';
import { parseProvidedCheckArguments, resolveProvidedSourceSnapshot } from './lib/provided-source-snapshot.mjs';
import { adaptDaemonCodeWithMacUtilities as adaptDaemonCode, buildDaemonNodeDevelopmentWithMacUtilities as buildDaemonNodeDevelopment, macUtilityResources } from '../vendor/provided/aux-macos-utility-stage.mjs';
import { auxCryptoSeaResources } from '../vendor/provided/aux-crypto-stage.mjs';
import { adaptCliCode } from '../vendor/provided/cli-adapter.mjs';
import { findMachOSeaSection, readSeaBlob } from '../vendor/aside/lib/sea.mjs';
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const checkOptions = parseProvidedCheckArguments(process.argv.slice(2), join(repository, 'out/provided-reuse'));
const output = checkOptions.output;
const sourceSnapshot = await resolveProvidedSourceSnapshot({ snapshotRoot: checkOptions.sourceSnapshotRoot, repositoryRoot: repository });
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const safe = (path) => typeof path === 'string' && path && !path.startsWith('/') && !path.split('/').some((part) => ['', '.', '..'].includes(part));
async function files(root, directory = '') {
  if ((await lstat(join(root, directory))).isSymbolicLink()) throw new Error('Symlink in staged implementation');
  const result = [];
  for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(root, path));
    else if (entry.isFile()) result.push(path);
    else throw new Error(`Nonregular staged implementation: ${path}`);
  }
  return result.sort();
}
const stack = await json(join(output, 'manifest.json'));
const identityProfile = resolveProtocolIdentity(stack.identityProfile);
const stateIdentityVersion = resolveStateIdentityVersion(stack.stateIdentityVersion ?? 1, identityProfile);
const cloudOptions = stack.cloudPolicy ? { enableCloud: true, profile: stack.cloudPolicy.mode } : {};
if (JSON.stringify(resolveCloudServicePolicy(cloudOptions)) !== JSON.stringify(stack.cloudPolicy ?? resolveCloudServicePolicy())) throw new Error('Unreviewed stage cloud policy');
if (stack.version !== 1 || stack.implementation !== 'supplied') throw new Error('Not a supplied implementation stage');
if (JSON.stringify(stack.adaptationInputs?.map((input) => input.path)) !== JSON.stringify(providedStageInputs)) throw new Error('Restage: current adaptation provenance is missing');
for (const input of stack.adaptationInputs) {
  if (hash(await readFile(join(repository, input.path))) !== input.sha256) throw new Error(`Restage changed adaptation: ${input.path}`);
}
if (!stack.brandInputs?.length) throw new Error('Restage: updated canonical Aux logo provenance is missing');
const expectedBrandPaths = ['assets/brand/arch-mark.svg', 'assets/brand/aux-mark-white.svg', 'assets/brand/Aux.icns', 'vendor/provided-ui/branding/icon48.png', ...[16, 32, 128].map((size) => `assets/brand/Aux.iconset/icon_${size}x${size}.png`), ...(stateIdentityVersion === 2 ? ['assets/brand/Aux.iconset/icon_512x512.png', 'vendor/provided-ui/branding/aux-browser-icon.webp'] : [])];
if (JSON.stringify(stack.brandInputs.map((file) => file.path).sort()) !== JSON.stringify(expectedBrandPaths.sort())) throw new Error('Incomplete Aux branding provenance');
for (const input of stack.brandInputs) {
  if (!safe(input.path) || !/^(assets\/brand\/|vendor\/provided-ui\/branding\/)/.test(input.path) || hash(await readFile(join(repository, input.path))) !== input.sha256) throw new Error('Restage: Aux branding assets changed');
}
const pins = await json(join(repository, 'docs/source/provided-ui-inputs.json'));
const ui = await json(join(output, 'ui/manifest.json'));
if ((ui.stateIdentityVersion ?? 1) !== stateIdentityVersion || resolveProtocolIdentity(ui.identityProfile) !== identityProfile) throw Error('UI protocol profile mismatch');
const browserIcon = stateIdentityVersion === 2 ? await loadAuxBrowserIconReplacement() : null;
const reviewedReplacements = browserIcon ? [browserIcon] : [];
let unchanged = 0, changed = 0, css = 0;
for (const component of ['agent', 'vault']) {
  const pinned = pins.components[component], report = ui.components[component], root = join(output, 'ui', component);
  const bySource = new Map();
  const enrollment = component === 'agent' ? await providedRecoveryEnrollmentUiResources(stateIdentityVersion) : {files: [], manifest: undefined};
  if (JSON.stringify(report.recoveryEnrollment) !== JSON.stringify(enrollment.manifest)) throw Error('Unreviewed enrollment UI manifest');
  const generated = report.files.filter(file => file.generatedBy);
  if (generated.length !== enrollment.files.length) throw Error('Missing or additional generated UI files');
  for (const expected of enrollment.files) {
    const matches = generated.filter(file => file.path === expected.path);
    if (matches.length !== 1) throw Error('Missing or duplicate fixed enrollment UI asset');
    const file = matches[0], target = join(root, file.path), stat = await lstat(target), bytes = await readFile(target);
    if (!safe(file.path) || file.sourcePath !== undefined || file.anchors !== undefined || file.added !== true ||
        file.generatedBy !== expected.generatedBy || file.repositorySource !== expected.repositorySource ||
        file.sourceSha256 !== expected.sourceSha256 || file.outputSha256 !== hash(expected.bytes) ||
        file.bytes !== expected.bytes.length || file.outputMode !== expected.mode ||
        JSON.stringify(file.changeKinds) !== JSON.stringify(['integration']) ||
        !stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o777) !== expected.mode || !bytes.equals(expected.bytes)) throw Error('Generated enrollment UI source/hash/mode mismatch');
  }
  for (const file of report.files.filter(file => !file.generatedBy)) {
    if (file.added !== undefined || file.repositorySource !== undefined || file.outputMode !== undefined) throw Error('Unclassified additional UI asset');
    const sourcePath = file.sourcePath ?? file.path;
    if (!safe(file.path) || !safe(sourcePath) || bySource.has(sourcePath)) throw new Error('Duplicate or unsafe preservation record');
    bySource.set(sourcePath, file);
  }
  if (bySource.size !== pinned.files.length) throw new Error('Missing or additional supplied UI source records');
  const actualPaths = await files(root), reportedPaths = report.files.map((file) => file.path).sort();
  if (JSON.stringify(actualPaths) !== JSON.stringify(reportedPaths)) throw new Error('Unreported staged UI files');
  for (const input of pinned.files) {
    const file = bySource.get(input.path);
    if (!file || file.sourceSha256 !== input.sourceSha256) throw new Error('UI source pin mismatch');
    const source = await readFile(join(sourceSnapshot?.roots[component] ?? pinned.inputRoot, input.path)), bytes = await readFile(join(root, file.path));
    if (hash(source) !== input.sourceSha256 || hash(bytes) !== file.outputSha256) throw new Error(`Preservation hash mismatch: ${component}/${file.path}`);
    const relocation = stateIdentityVersion === 2 ? relocateAuxAssetPath({component, path: input.path, bytes, reviewedReplacements}) : null;
    if (file.path !== (relocation?.path ?? input.path).replaceAll('Aside', 'Aux') || JSON.stringify(file.assetRelocation) !== JSON.stringify(relocation?.anchors.length ? relocation.anchors : undefined)) throw Error('Unreported or incorrect UI path identity');
    const brandingReplacement = component === 'agent' && browserIcon && input.path === browserIcon.receipt.path
      ? {repositorySource: browserIcon.repositorySource, receiptSha256: browserIcon.receiptSha256} : undefined;
    if (JSON.stringify(file.brandingReplacement) !== JSON.stringify(brandingReplacement)) throw Error('Unreviewed browser icon replacement');
    if (brandingReplacement && (hash(source) !== browserIcon.receipt.originalSha256 || !bytes.equals(browserIcon.bytes))) throw Error('Canonical browser icon mismatch');
    if (source.equals(bytes)) unchanged++;
    else {
      changed++;
      if (!file.changeKinds.length || file.changeKinds.some((kind) => !['identity', 'branding', 'integration'].includes(kind))) throw new Error('Unclassified supplied UI change');
      if (file.anchors?.length) {
        let text = source.toString('utf8');
        for (const anchor of file.anchors) {
          if (!anchor.find || text.split(anchor.find).length - 1 !== anchor.count) throw new Error('Preservation anchor count mismatch');
          text = text.split(anchor.find).join(anchor.replace);
        }
        if (!Buffer.from(text).equals(bytes)) throw new Error('Unreported UI implementation change');
      } else if (!/^icons\/(?:icon-?\d+|favicon-(?:dark|light))\.png$/.test(input.path) && !brandingReplacement) throw new Error('Unanchored UI implementation change');
    }
    if (input.path.endsWith('.css')) {
      css++;
      if (source.toString('utf8').replaceAll('data-aside-', 'data-aux-').replaceAll('Aside', 'Aux') !== bytes.toString('utf8')) throw new Error('Supplied stylesheet changed beyond font/selector identity branding');
    }
  }
}
const apps = await json(join(output, 'apps/manifest.json'));
if ((apps.stateIdentityVersion ?? 1) !== stateIdentityVersion || resolveProtocolIdentity(apps.identityProfile) !== identityProfile) throw Error('Apps protocol profile mismatch');
const appPins = await json(join(repository, 'docs/source/provided-app-inputs.json'));
let appFiles = 0;
for (const component of ['daemon', 'cli']) {
  const report = apps.components[component];
  const builtinIconEdits = [];
  if (!safe(report.app)) throw new Error('Unsafe app report path');
  for (const name of providedIntegrationFiles[component]) {
    const expected = await providedIntegrationInput(name);
    if (!report.files.some((file) => file.path === `Contents/Resources/native/${name}` && file.repositorySource === expected.repositorySource && file.generatedFrom === expected.generatedFrom)) throw new Error('Restage: fixed native/runtime/memory integration seam is missing');
  }
  const root = join(output, 'apps', report.app);
  const binary = await readFile(join(sourceSnapshot?.roots[component] ?? providedAppRoots[component], 'Contents/MacOS', component === 'daemon' ? 'aside-daemon' : 'aside'));
  const section = findMachOSeaSection(binary), originalCode = readSeaBlob(binary.subarray(section.offset, section.offset + section.size)).code;
  const expected = (component === 'daemon' ? adaptDaemonCode : adaptCliCode)(originalCode, cloudOptions, identityProfile, stateIdentityVersion);
  if (JSON.stringify(expected.cloudPolicy) !== JSON.stringify(report.executable.cloudPolicy) || JSON.stringify(expected.cloudAnchors) !== JSON.stringify(report.executable.cloudAnchors)) throw new Error('Unreported executable cloud composition');
  if (expected.sha256 !== report.executable.codeSha256) throw new Error(`Restage ${component}: current adaptation differs from this candidate`);
  if (JSON.stringify(await files(root)) !== JSON.stringify(report.files.map((file) => file.path).sort())) throw new Error('Unreported app resources');
  const sources = new Map(appPins.components[component].files.map((file) => [file.path, file]));
  const development = component === 'daemon' ? buildDaemonNodeDevelopment(binary, cloudOptions, identityProfile, stateIdentityVersion) : null;
  const cryptoRuntime = component === 'daemon' ? auxCryptoSeaResources(stateIdentityVersion) : null;
  const utilities = component === 'daemon' ? macUtilityResources(stateIdentityVersion) : null;
  if (JSON.stringify(report.macOSUtilities) !== JSON.stringify(utilities?.manifest)) throw new Error('Restage current fixed macOS utilities');
  if (JSON.stringify(report.cryptoRuntime) !== JSON.stringify(cryptoRuntime?.manifest)) throw new Error('Restage current Aux crypto assets');
  const developmentFiles = new Map([...(cryptoRuntime?.files ?? []), ...(utilities?.files ?? []), ...(development?.files ?? [])].map(file => [file.path.slice(`apps/${report.app}/`.length), file]));
  if (development && JSON.stringify(report.nodeDevelopment) !== JSON.stringify(development.manifest)) throw new Error('Restage current supplied daemon development code/assets');
  if (report.files.filter(file => file.generatedBy).length !== developmentFiles.size) throw new Error('Missing or unexpected generated daemon development resources');
  for (const [path, expected] of developmentFiles) {
    if (!report.files.some(file => file.path === path && file.added === true && file.generatedBy === expected.generatedBy && file.outputSha256 === hash(expected.bytes) && file.outputMode === expected.mode)) throw new Error('Missing source-pinned daemon development resource');
  }
  for (const file of [...report.files, ...report.removed]) {
    if (!safe(file.path)) throw new Error('Unsafe app resource path');
    const source = file.sourcePath ?? file.path;
    if (!file.added) {
      if (sources.get(source)?.sha256 !== (file.sourceSha256 ?? file.sha256)) throw new Error('App source pin mismatch');
      sources.delete(source);
    }
    if (file.outputSha256 && hash(await readFile(join(root, file.path))) !== file.outputSha256) throw new Error('App resource output hash mismatch');
    if (file.outputSha256 && source.startsWith('Contents/Resources/static/skills/') && source.endsWith('.md')) {
      const original = await readFile(join(sourceSnapshot?.roots[component] ?? providedAppRoots[component], source));
      if (hash(original) !== (file.sourceSha256 ?? file.sha256)) throw new Error('Skill metadata source drift');
      let text;
      if (component === 'daemon' && source === 'Contents/Resources/static/skills/builtin/password-manager/SKILL.md') {
        text = disabledSeed;
      } else {
        text = original.toString('utf8').replaceAll('Aside', 'Aux');
        if (stateIdentityVersion === 2) {
          text = applyAuxRuntimeContractIdentity({component: 'skill', path: source.slice('Contents/Resources/static/skills/'.length), text, original: original.toString('utf8'), branding: 'aux'}).text;
          if (component === 'daemon' && cloudOptions.enableCloud) {
            const icons = applyAuxBuiltinIconIdentity({component, path: file.path, text, original}, cloudOptions);
            text = icons.text;
            if (icons.anchors.length) builtinIconEdits.push({path: file.path, sourceSha256: hash(original), anchors: icons.anchors});
          }
        }
        text = text.replace(CLI_COMMAND, 'aux ');
      }
      if (!Buffer.from(text).equals(await readFile(join(root, file.path)))) throw new Error('Unreported skill metadata modification');
    }
    if (file.generatedBy) {
      const expected = developmentFiles.get(file.path);
      if (!expected || file.generatedBy !== expected.generatedBy || !file.added || hash(expected.bytes) !== file.outputSha256 || file.outputMode !== expected.mode) throw new Error('Unexpected generated daemon development resource');
      if (((await lstat(join(root, file.path))).mode & 0o777) !== expected.mode) throw new Error('Generated daemon resource mode mismatch');
    }
    if (file.repositorySource) {
      const name = file.path.split('/').at(-1);
      if (!file.added || !providedIntegrationFiles[component].includes(name) || file.path !== `Contents/Resources/native/${name}`) throw new Error('Unexpected fixed integration seam');
      const expected = await providedIntegrationInput(name);
      if (file.repositorySource !== expected.repositorySource || file.generatedFrom !== expected.generatedFrom || hash(expected.bytes) !== file.outputSha256) throw new Error('Restage current fixed integration seam');
    }
    appFiles++;
  }
  if (sources.size) throw new Error('Unreported omitted app source resources');
  if (component === 'daemon' && stateIdentityVersion === 2 && cloudOptions.enableCloud && builtinIconEdits.length !== 47) throw new Error('Incomplete Aux builtin icon relocation');
  const expectedIconIdentity = builtinIconEdits.length ? {format: 'aux.builtin-icon-stage.v1', edits: builtinIconEdits} : undefined;
  if (JSON.stringify(report.builtinIconIdentity) !== JSON.stringify(expectedIconIdentity)) throw new Error('Unreported builtin icon identity changes');
}
let runtimeFiles = 0, memoryFiles = 0;
if (stack.components.distribution) {
  const distribution = await json(join(output, 'distribution/manifest.json'));
  const distributionPins = await json(join(repository, 'docs/source/provided-runtime-inputs.json'));
  if (distribution.runtimeRoot !== join(stack.finalApp, 'Contents/Resources/aux/agent-runtime')) throw new Error('Runtime relocation destination differs from the declared app');
  for (const component of ['runtime', 'memory']) {
    const report = distribution.components[component], pinned = distributionPins.components[component];
    const root = join(output, 'distribution', component), remaining = new Map(pinned.files.map((file) => [file.path, file]));
    const reported = new Set();
    for (const file of report.files) {
      if (!safe(file.path) || reported.has(file.path)) throw new Error('Unsafe or repeated distribution record');
      reported.add(file.path);
      const original = remaining.get(file.path), path = join(root, file.path), stat = await lstat(path);
      if (!original) {
        if (component !== 'runtime' || !['tmp', '.npmrc'].includes(file.path)) throw new Error('Unpinned added distribution input');
        if (file.path === 'tmp' && (!stat.isDirectory() || (await readdir(path)).length || (stat.mode & 0o777) !== 0o700)) throw new Error('Runtime temporary state is not fresh');
        if (file.path === '.npmrc' && (!stat.isFile() || (stat.mode & 0o777) !== 0o600 || (await readFile(path, 'utf8')) !== 'fund=false\naudit=false\nupdate-notifier=false\n')) throw new Error('Unexpected generated npm configuration');
        continue;
      }
      remaining.delete(file.path);
      if (file.type !== original.type || file.mode !== original.mode || (stat.mode & 0o777) !== original.mode) throw new Error('Distribution type or mode mismatch');
      if (file.type === 'directory') {
        if (!stat.isDirectory()) throw new Error('Distribution directory replaced');
      } else if (file.type === 'symlink') {
        if (!stat.isSymbolicLink() || await readlink(path) !== original.linkTarget || file.outputLinkTarget !== original.linkTarget) throw new Error('Distribution dependency link changed');
      } else {
        if (!stat.isFile() || file.sourceSha256 !== original.sourceSha256) throw new Error('Distribution source pin mismatch');
        const bytes = await readFile(path);
        if (hash(bytes) !== file.outputSha256) throw new Error('Distribution output changed');
        if (file.anchors?.length) {
          let text = (await readFile(join(sourceSnapshot?.roots[component] ?? pinned.inputRoot, file.path))).toString('utf8');
          if (hash(text) !== original.sourceSha256) throw new Error('Relocated distribution source changed');
          for (const anchor of file.anchors) {
            if (!anchor.find || text.split(anchor.find).length - 1 !== anchor.count) throw new Error('Distribution relocation count mismatch');
            text = text.split(anchor.find).join(anchor.replace);
          }
          if (!Buffer.from(text).equals(bytes)) throw new Error('Unreported distribution change');
        } else if (file.sourceSha256 !== file.outputSha256) throw new Error('Distribution binary or dependency changed');
        if (component === 'runtime') runtimeFiles++; else memoryFiles++;
      }
    }
    if (remaining.size) throw new Error('Omitted distribution source records');
    async function coverage(directory = '') {
      for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (!reported.has(path)) throw new Error(`Unreported distribution path: ${path}`);
        if (entry.isDirectory()) await coverage(path);
      }
    }
    await coverage();
  }
} else throw new Error('Restage: supplied runtime and memory distributions are missing');
if (!stack.components.computerUse) throw new Error('Restage: branded supplied Computer Use helper is missing');
const helper = await json(join(output, 'computer-use/manifest.json'));
const helperPins = await json(join(repository, 'docs/source/provided-computer-use-inputs.json'));
const helperRoot = join(output, 'computer-use/Aux Computer Use.app');
if (JSON.stringify(await files(helperRoot)) !== JSON.stringify(helper.files.map((file) => file.path).sort())) throw new Error('Unreported helper resources');
const helperSources = new Map(helperPins.files.map((file) => [file.path, file]));
for (const file of helper.files) {
  if (!safe(file.path) || !safe(file.sourcePath)) throw new Error('Unsafe helper resource path');
  const pinned = helperSources.get(file.sourcePath);
  if (!pinned || pinned.sha256 !== file.sourceSha256 || file.outputMode !== pinned.mode) throw new Error('Helper source pin mismatch');
  helperSources.delete(file.sourcePath);
  const source = await readFile(join(sourceSnapshot?.roots.computerUse ?? helperPins.inputRoot, file.sourcePath)), bytes = await readFile(join(helperRoot, file.path));
  if (hash(source) !== pinned.sha256 || hash(bytes) !== file.outputSha256 || ((await lstat(join(helperRoot, file.path))).mode & 0o777) !== pinned.mode) throw new Error('Helper preservation hash or mode mismatch');
  if (file.sourcePath === 'Contents/MacOS/aside-computer-use') {
    const replayed = Buffer.from(source);
    for (const patch of helper.binary.patches) {
      const before = Buffer.from(patch.beforeHex, 'hex'), after = Buffer.from(patch.afterHex, 'hex');
      if (before.length !== after.length || !replayed.subarray(patch.offset, patch.offset + before.length).equals(before)) throw new Error('Helper binary patch anchor drift');
      after.copy(replayed, patch.offset);
    }
    if (!replayed.equals(bytes)) throw new Error('Unreported helper binary modification');
  } else if (file.anchors?.length) {
    if (file.anchors[0].assetPath) {
      const expected = { 'Contents/Resources/AppIcon.icns': 'assets/brand/Aux.icns', 'Contents/Resources/MenuBarIcon.png': 'assets/brand/MenuBarIcon.png', 'Contents/Resources/MenuBarIcon@2x.png': 'assets/brand/MenuBarIcon@2x.png' }[file.path];
      if (!expected || !bytes.equals(await readFile(join(repository, expected)))) throw new Error('Helper does not use current Aux artwork');
    } else {
      let text = source.toString('utf8');
      for (const anchor of file.anchors) {
        if (!anchor.find || text.split(anchor.find).length - 1 !== anchor.count) throw new Error('Helper plist anchor drift');
        text = text.split(anchor.find).join(anchor.replace);
      }
      if (!Buffer.from(text).equals(bytes)) throw new Error('Unreported helper plist change');
    }
  } else if (!source.equals(bytes)) throw new Error('Unreported helper resource change');
}
if (helperSources.size) throw new Error('Omitted helper source resources');
if (sourceSnapshot) console.log(`Frozen sources verified: ${sourceSnapshot.manifestPath}; SHA256 ${sourceSnapshot.manifestSha256}.`);
console.log(`Preservation verified: ${unchanged} unchanged UI files; ${changed} explicitly changed; ${css} stylesheets preserve layout; ${appFiles} app resource records.`);
console.log(`Distribution preservation: ${runtimeFiles} runtime files and ${memoryFiles} memory files, with declared relocations only.`);
console.log(`Helper preservation: ${helper.files.length} files with ${helper.binary.patches.length} exact binary patch ranges and current Aux artwork.`);
console.log(`Production ready: ${stack.productionReady}. This audit verifies recorded preservation, not native integration or runtime/UI acceptance.`);
