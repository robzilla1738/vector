#!/usr/bin/env node
import { seedProvidedMemory } from './lib/provided-state.mjs';
const args = process.argv.slice(2), options = {};
for (let i = 0; i < args.length; i += 2) {
  if (!['--stage', '--home'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--') || options[args[i]]) throw new Error('Usage: provision-provided-home.mjs --stage PATH --home NEW_DIRECTORY');
  options[args[i]] = args[i + 1];
}
if (!options['--stage'] || !options['--home']) throw new Error('Both --stage and --home are required');
const report = await seedProvidedMemory({ stageRoot: options['--stage'], home: options['--home'] });
console.log(`Seeded ${report.files} pinned static memory files into new private Aux home: ${report.home}`);
console.log('No account, profile, credential or Keychain state was copied or initialized.');
