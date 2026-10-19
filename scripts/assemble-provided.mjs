#!/usr/bin/env node
// Resources only: never launches, signs or installs an incomplete browser.
import { resolve } from 'node:path';
import { assembleProvidedResources } from './lib/provided-assembly.mjs';
const args = process.argv.slice(2), options = {};
for (let i = 0; i < args.length; i++) {
  const key = args[i];
  if (!['--stage', '--output'].includes(key) || options[key] || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Usage: assemble-provided.mjs [--stage PATH] [--output NEW_DIRECTORY]');
  options[key] = args[++i];
}
const outputRoot = resolve(options['--output'] ?? 'out/provided-resources');
const report = await assembleProvidedResources({ stageRoot: resolve(options['--stage'] ?? 'out/provided-reuse'), outputRoot });
console.log(`Assembled ${report.files.length} supplied resource records: ${outputRoot}`);
console.log('Production ready: false. Native integration, signing and packaged acceptance remain required.');
