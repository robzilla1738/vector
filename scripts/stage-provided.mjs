#!/usr/bin/env node
// Stage the supplied implementation. Never launch it or silently insert reconstructed components.
import { lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { stageProvidedUi } from './lib/provided-ui.mjs';
import { stageProvidedApps } from './lib/provided-apps.mjs';
import { stageProvidedRuntime } from './lib/provided-runtime.mjs';
import { transformProvidedNativeUi, unresolvedNativeCapabilities } from '../vendor/provided/native-ui-compat.mjs';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--replace') { options.replace = true; continue; }
  if (!['--output', '--app-path'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--') || options[args[i]]) throw new Error('Usage: stage-provided.mjs [--output PATH] [--app-path FINAL_AUX_APP] [--replace]');
  options[args[i]] = args[++i];
}
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
const identities = JSON.parse(await readFile(join(repository, 'docs/design/extension-identities.json'), 'utf8'));
const brandPaths = ['assets/brand/arch-mark.svg', 'assets/brand/aux-mark-white.svg', 'assets/brand/Aux.icns', 'vendor/provided-ui/branding/icon48.png', ...[16, 32, 128].map((size) => `assets/brand/Aux.iconset/icon_${size}x${size}.png`)];
const brandInputs = [];
for (const path of brandPaths) brandInputs.push({ path, sha256: createHash('sha256').update(await readFile(join(repository, path))).digest('hex') });
await mkdir(dirname(output), { recursive: true });
const temporary = await mkdtemp(join(dirname(output), '.provided-stack-'));
try {
  const ui = await stageProvidedUi({ sourceRoots: Object.fromEntries(Object.entries(pins.components).map(([name, value]) => [name, value.inputRoot])), outputRoot: join(temporary, 'ui'), identities, transformText: transformProvidedNativeUi });
  // Reports use their final locations, so the outer atomic rename leaves no stale temporary paths.
  for (const [name, component] of Object.entries(ui.components)) component.outputRoot = join(output, 'ui', name);
  await writeFile(join(temporary, 'ui/manifest.json'), `${JSON.stringify(ui, null, 2)}\n`);
  const apps = await stageProvidedApps({ outputRoot: join(temporary, 'apps') });
  const runtimePins = JSON.parse(await readFile(join(repository, 'docs/source/provided-runtime-inputs.json'), 'utf8'));
  const distribution = await stageProvidedRuntime({
    sourceRoot: runtimePins.components.runtime.inputRoot,
    memoryRoot: runtimePins.components.memory.inputRoot,
    outputRoot: join(temporary, 'distribution'),
    runtimeRoot: join(finalApp, 'Contents/Resources/aux/agent-runtime'),
  });
  for (const [name, component] of Object.entries(distribution.components)) component.outputRoot = join(output, 'distribution', name);
  await writeFile(join(temporary, 'distribution/manifest.json'), `${JSON.stringify(distribution, null, 2)}\n`);
  for (const input of brandInputs) {
    if (createHash('sha256').update(await readFile(join(repository, input.path))).digest('hex') !== input.sha256) throw new Error('Aux branding changed during staging; retry with a stable asset snapshot');
  }
  const report = {
    version: 1, implementation: 'supplied', productionReady: false, finalApp, brandInputs,
    components: { ui: 'ui/manifest.json', apps: 'apps/manifest.json', distribution: 'distribution/manifest.json' },
    blockers: [...apps.blockers, ...unresolvedNativeCapabilities, 'Bundled runtime/native startup and memory-cache provisioning acceptance', 'Supplied helper identity adaptation', 'Packaged local UI and behavior acceptance'],
  };
  await writeFile(join(temporary, 'manifest.json'), `${JSON.stringify(report, null, 2)}\n`);
  const backup = `${output}.previous-${randomUUID()}`;
  if (previous) await rename(output, backup);
  try { await rename(temporary, output); }
  catch (error) { if (previous) await rename(backup, output); throw error; }
  if (previous) console.log(`Previous generated stage preserved: ${backup}`);
  console.log(`Staged supplied Agent/Vault UI, daemon, CLI, agent runtime and memory distributions: ${output}`);
  console.log('Incomplete integration; not a runnable production package. See manifest.json blockers.');
} catch (error) { await rm(temporary, { recursive: true, force: true }); throw error; }
