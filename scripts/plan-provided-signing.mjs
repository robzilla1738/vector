#!/usr/bin/env node
// Static copied-input inspection and policy output only; never signs or launches.
import { lstat, readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { generateProvidedSigningPolicy } from './lib/provided-signing-policy.mjs';
const options = {}, names = new Set(['--package', '--browser-review', '--output']);
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = process.argv[++i];
  if (!names.has(flag) || options[flag] || !value || value.startsWith('--')) throw new Error('Usage: plan-provided-signing.mjs --package PATH --browser-review FILE --output NEW_FILE');
  options[flag] = resolve(value);
}
if ([...names].some(name => !options[name])) throw new Error('Package, actual browser review and new output are required');
const root = options['--package'], output = options['--output'], review = options['--browser-review'];
if (output === root || output.startsWith(root + '/') || await realpath(dirname(output)) !== dirname(output)) throw new Error('New policy output must have a canonical parent outside the copied package');
try { await lstat(output); throw new Error('Signing policy output already exists'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const stat = await lstat(review);
if (!stat.isFile() || stat.isSymbolicLink() || stat.mode & 0o022 || await realpath(review) !== review) throw new Error('Regular immutable browser review required');
const policy = await generateProvidedSigningPolicy({ root, browserReview: JSON.parse(await readFile(review, 'utf8')) });
await writeFile(output, JSON.stringify(policy, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
console.log(`Wrote ${policy.targets.length} explicit prehashed targets; no signing or launch performed.`);
