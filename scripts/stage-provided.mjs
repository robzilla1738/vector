#!/usr/bin/env node
import { resolveProtocolIdentity, resolveStateIdentityVersion } from '../vendor/provided/aux-protocol-identity.mjs';
// Stage the supplied implementation. Never launch it or silently insert reconstructed components.
import { lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { composeCloudDesktop } from '../vendor/provided/cloud-desktop-composition.mjs';
import { resolveCloudServicePolicy } from '../vendor/provided/cloud-service-policy.mjs';
import { stageProvidedUi } from './lib/provided-ui.mjs';
import { stageProvidedApps } from './lib/provided-apps.mjs';
import { stageProvidedRuntime } from './lib/provided-runtime.mjs';
import { stageProvidedComputerUse } from './lib/provided-computer-use.mjs';
import { providedStageInputs } from './lib/provided-stage-inputs.mjs';
import { resolveProvidedSourceSnapshot } from './lib/provided-source-snapshot.mjs';
import { transformProvidedSettingsImportCopy } from './lib/provided-settings-import-copy.mjs';
import { transformProvidedPendingFiles } from './lib/provided-pending-files.mjs';
import { transformProvidedNotificationRouting } from './lib/provided-notification-routing.mjs';
import { transformProvidedLassoOwnership } from './lib/provided-lasso-ownership.mjs';
import { transformProvidedDraftFlush } from './lib/provided-draft-flush.mjs';
import { transformProvidedPasswordManagerScope } from './lib/provided-password-manager-scope.mjs';
import { transformProvidedUiBoundary } from './lib/provided-ui-boundary.mjs';
import { transformProvidedNewTabUnavailableControls } from './lib/provided-newtab-unavailable-controls.mjs';
import { transformProvidedNativeUi, unresolvedNativeCapabilities } from '../vendor/provided/native-ui-compat.mjs';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--replace') { options.replace = true; continue; }
  if (!['--output', '--app-path', '--source-snapshot', '--cloud-profile', '--identity-profile', '--state-identity-version'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--') || options[args[i]]) throw new Error('Usage: stage-provided.mjs [--output PATH] [--app-path FINAL_AUX_APP] [--source-snapshot ROOT] [--cloud-profile development|production] [--identity-profile compatibility|aux-v1] [--state-identity-version 1|2] [--replace]');
  options[args[i]] = args[++i];
}
const identityProfile = resolveProtocolIdentity(options['--identity-profile']);
const stateIdentityVersion = resolveStateIdentityVersion(options['--state-identity-version'] === undefined ? 1 : Number(options['--state-identity-version']), identityProfile);
const cloudOptions = options['--cloud-profile'] ? { enableCloud: true, profile: options['--cloud-profile'] } : {};
const cloudPolicy = resolveCloudServicePolicy(cloudOptions);
const output = resolve(options['--output'] ?? join(repository, 'out/provided-reuse'));
const finalApp = resolve(options['--app-path'] ?? join(homedir(), 'Applications/Aux.app'));
let previous = false;
let outputExists = false;
try {
  const stat = await lstat(output);
  outputExists = true;
  if (!options.replace) throw new Error(`Output already exists: ${output}. Use --replace for a generated supplied stage.`);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Replacement destination must be a generated stage directory');
  const existing = JSON.parse(await readFile(join(output, 'manifest.json'), 'utf8'));
  if (existing.version !== 1 || existing.implementation !== 'supplied') throw new Error('Replacement destination is not a supplied stage');
  previous = true;
}
catch (error) { if (error.code !== 'ENOENT' || outputExists) throw error; }
const pins = JSON.parse(await readFile(join(repository, 'docs/source/provided-ui-inputs.json'), 'utf8'));
const sourceSnapshot = await resolveProvidedSourceSnapshot({ snapshotRoot: options['--source-snapshot'] && resolve(options['--source-snapshot']), repositoryRoot: repository });
const identities = JSON.parse(await readFile(join(repository, 'docs/design/extension-identities.json'), 'utf8'));
const brandPaths = ['assets/brand/arch-mark.svg', 'assets/brand/aux-mark-white.svg', 'assets/brand/Aux.icns', 'vendor/provided-ui/branding/icon48.png', ...[16, 32, 128].map((size) => `assets/brand/Aux.iconset/icon_${size}x${size}.png`), ...(stateIdentityVersion === 2 ? ['assets/brand/Aux.iconset/icon_512x512.png', 'vendor/provided-ui/branding/aux-browser-icon.webp'] : [])];
const brandInputs = [];
for (const path of brandPaths) brandInputs.push({ path, sha256: createHash('sha256').update(await readFile(join(repository, path))).digest('hex') });
const adaptationInputs = [];
for (const path of providedStageInputs) adaptationInputs.push({ path, sha256: createHash('sha256').update(await readFile(join(repository, path))).digest('hex') });
await mkdir(dirname(output), { recursive: true });
const temporary = await mkdtemp(join(dirname(output), '.provided-stack-'));
try {
  const ui = await stageProvidedUi({ sourceRoots: Object.fromEntries(Object.entries(pins.components).map(([name, value]) => [name, sourceSnapshot?.roots[name] ?? value.inputRoot])), outputRoot: join(temporary, 'ui'), identities, identityProfile, stateIdentityVersion, ...(cloudPolicy.mode !== 'local' ? { cloudProfile: cloudPolicy.mode } : {}), transformText(input) {
    const scope = transformProvidedPasswordManagerScope(input);
    const native = transformProvidedNativeUi({ ...input, text: scope.text });
    const boundary = transformProvidedUiBoundary({ ...input, text: native.text });
    const controls = transformProvidedNewTabUnavailableControls({ ...input, text: boundary.text });
    const settings = transformProvidedSettingsImportCopy({ ...input, text: controls.text });
    const drafts = transformProvidedDraftFlush({ ...input, text: settings.text });
    const pendingFiles = transformProvidedPendingFiles({ ...input, text: drafts.text });
    const lasso = transformProvidedLassoOwnership({ ...input, text: pendingFiles.text });
    const notifications = transformProvidedNotificationRouting({ ...input, text: lasso.text });
    const cloud = input.component === 'agent' ? composeCloudDesktop({ ...input, text: notifications.text }, cloudOptions) : { text: notifications.text, anchors: [] };
    return { text: cloud.text, anchors: [...scope.anchors, ...native.anchors, ...boundary.anchors, ...controls.anchors, ...settings.anchors, ...drafts.anchors, ...pendingFiles.anchors, ...lasso.anchors, ...notifications.anchors, ...cloud.anchors] };
  } });
  // Reports use their final locations, so the outer atomic rename leaves no stale temporary paths.
  for (const [name, component] of Object.entries(ui.components)) component.outputRoot = join(output, 'ui', name);
  await writeFile(join(temporary, 'ui/manifest.json'), `${JSON.stringify(ui, null, 2)}\n`);
  const apps = await stageProvidedApps({ ...(sourceSnapshot ? { sourceRoots: { daemon: sourceSnapshot.roots.daemon, cli: sourceSnapshot.roots.cli } } : {}), outputRoot: join(temporary, 'apps'), cloudOptions, identityProfile, stateIdentityVersion });
  const runtimePins = JSON.parse(await readFile(join(repository, 'docs/source/provided-runtime-inputs.json'), 'utf8'));
  const distribution = await stageProvidedRuntime({
    sourceRoot: sourceSnapshot?.roots.runtime ?? runtimePins.components.runtime.inputRoot,
    memoryRoot: sourceSnapshot?.roots.memory ?? runtimePins.components.memory.inputRoot,
    outputRoot: join(temporary, 'distribution'),
    runtimeRoot: join(finalApp, 'Contents/Resources/aux/agent-runtime'),
  });
  for (const [name, component] of Object.entries(distribution.components)) component.outputRoot = join(output, 'distribution', name);
  await writeFile(join(temporary, 'distribution/manifest.json'), `${JSON.stringify(distribution, null, 2)}\n`);
  const helperPins = JSON.parse(await readFile(join(repository, 'docs/source/provided-computer-use-inputs.json'), 'utf8'));
  await mkdir(join(temporary, 'computer-use'));
  const computerUse = await stageProvidedComputerUse({
    sourceRoot: sourceSnapshot?.roots.computerUse ?? helperPins.inputRoot,
    outputRoot: join(temporary, 'computer-use/Aux Computer Use.app'),
    identities: { browserBundleId: 'dev.aux.browser', canaryBundleId: 'dev.aux.browser.canary', bundleId: 'dev.aux.browser.computer-use' },
  });
  computerUse.outputRoot = join(output, 'computer-use/Aux Computer Use.app');
  await writeFile(join(temporary, 'computer-use/manifest.json'), `${JSON.stringify(computerUse, null, 2)}\n`);
  for (const input of [...brandInputs, ...adaptationInputs]) {
    if (createHash('sha256').update(await readFile(join(repository, input.path))).digest('hex') !== input.sha256) throw new Error('Aux artwork or adaptation code changed during staging; retry with stable inputs');
  }
  const report = {
    version: 1, implementation: 'supplied', identityProfile, stateIdentityVersion, productionReady: false, finalApp, brandInputs, adaptationInputs,
    ...(cloudPolicy.mode !== 'local' ? { cloudPolicy } : {}),
    components: { ui: 'ui/manifest.json', apps: 'apps/manifest.json', distribution: 'distribution/manifest.json', computerUse: 'computer-use/manifest.json' },
    blockers: [...apps.blockers, ...unresolvedNativeCapabilities, 'Bundled runtime/native startup and memory-cache provisioning acceptance', ...computerUse.remaining, 'Packaged local UI and behavior acceptance'],
  };
  await writeFile(join(temporary, 'manifest.json'), `${JSON.stringify(report, null, 2)}\n`);
  const backup = `${output}.previous-${randomUUID()}`;
  if (previous) await rename(output, backup);
  try { await rename(temporary, output); }
  catch (error) { if (previous) await rename(backup, output); throw error; }
  if (previous) console.log(`Previous generated stage preserved: ${backup}`);
  console.log(`Staged supplied Agent UI and archival Vault inputs, daemon, CLI, agent/memory distributions and Computer Use helper: ${output}`);
  console.log('Incomplete integration; not a runnable production package. See manifest.json blockers.');
} catch (error) { await rm(temporary, { recursive: true, force: true }); throw error; }
