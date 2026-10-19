#!/usr/bin/env node
// Stage the supplied implementation. Never launch it or silently insert reconstructed components.
import { lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stageProvidedUi } from './lib/provided-ui.mjs';
import { stageProvidedApps } from './lib/provided-apps.mjs';
import { transformProvidedNativeUi, unresolvedNativeCapabilities } from '../vendor/provided/native-ui-compat.mjs';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--output')) throw new Error('Usage: stage-provided.mjs [--output PATH]');
const output = resolve(args[1] ?? join(repository, 'out/provided-reuse'));
try { await lstat(output); throw new Error(`Output already exists: ${output}`); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const pins = JSON.parse(await readFile(join(repository, 'docs/source/provided-ui-inputs.json'), 'utf8'));
const identities = JSON.parse(await readFile(join(repository, 'docs/design/extension-identities.json'), 'utf8'));
await mkdir(dirname(output), { recursive: true });
const temporary = await mkdtemp(join(dirname(output), '.provided-stack-'));
try {
  const ui = await stageProvidedUi({ sourceRoots: Object.fromEntries(Object.entries(pins.components).map(([name, value]) => [name, value.inputRoot])), outputRoot: join(temporary, 'ui'), identities, transformText: transformProvidedNativeUi });
  // Reports use their final locations, so the outer atomic rename leaves no stale temporary paths.
  for (const [name, component] of Object.entries(ui.components)) component.outputRoot = join(output, 'ui', name);
  await writeFile(join(temporary, 'ui/manifest.json'), `${JSON.stringify(ui, null, 2)}\n`);
  const apps = await stageProvidedApps({ outputRoot: join(temporary, 'apps') });
  const report = {
    version: 1, implementation: 'supplied', productionReady: false,
    components: { ui: 'ui/manifest.json', apps: 'apps/manifest.json' },
    blockers: [...apps.blockers, ...unresolvedNativeCapabilities, 'Supplied agent/memory runtime integration', 'Supplied helper identity adaptation', 'Packaged local UI and behavior acceptance'],
  };
  await writeFile(join(temporary, 'manifest.json'), `${JSON.stringify(report, null, 2)}\n`);
  await rename(temporary, output);
  console.log(`Staged supplied Agent/Vault UI, daemon and CLI: ${output}`);
  console.log('Incomplete integration; not a runnable production package. See manifest.json blockers.');
} catch (error) { await rm(temporary, { recursive: true, force: true }); throw error; }
