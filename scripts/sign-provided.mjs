#!/usr/bin/env node
// Signs only the explicit copied-package plan; never installs or launches it.
import { readFile, writeFile, realpath, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { planProvidedSigning, runProvidedSigning } from './lib/provided-signing.mjs';
const options = {}, names = new Set(['--package', '--policy', '--receipt']);
let apply = false;
for (let index = 2; index < process.argv.length; index++) {
  const flag = process.argv[index];
  if (flag === '--apply' && !apply) { apply = true; continue; }
  const value = process.argv[++index];
  if (!names.has(flag) || options[flag] || !value || value.startsWith('--')) throw new Error('Usage: sign-provided.mjs --package PATH --policy FILE --receipt NEW_FILE [--apply]');
  options[flag] = resolve(value);
}
if ([...names].some(name => !options[name])) throw new Error('Package, explicit signing policy and new receipt are required');
const root = options['--package'];
if (await realpath(root) !== root) throw new Error('Canonical copied package required');
const receipt = options['--receipt'];
if (receipt === root || receipt.startsWith(root + '/')) throw new Error('Signing receipt must be outside the snapshot');
try { await lstat(receipt); throw new Error('Signing receipt already exists'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const report = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
if (report.version !== 1 || report.implementation !== 'supplied' || report.signed !== false || report.app !== 'Aux.app') throw new Error('A new supplied copied package is required');
const policy = JSON.parse(await readFile(options['--policy'], 'utf8'));
const prefix = 'Aux.app/Contents/Resources/aux';
const cli = `${prefix}/apps/cli/Aux CLI.app`;
const daemon = `${prefix}/apps/daemon/Aux Daemon.app`;
const required = new Set([
  'Aux.app', cli, daemon,
  `${cli}/Contents/MacOS/aux-cli-sea`,
  `${daemon}/Contents/Applications/Aux Password Importer.app`,
  `${daemon}/Contents/Applications/Aux Password Importer.app/Contents/PlugIns/AsidePasswordImporterProvider.appex`,
  `${prefix}/apps/computer-use/Aux Computer Use.app`,
  `${prefix}/native/aux-native-carrier`,
  `${prefix}/native/libaux-native-boundary.dylib`,
  `${daemon}/Contents/Resources/native/aux-native-guard.node`,
  `${cli}/Contents/Resources/native/aux-native-guard.node`,
]);
if (!Array.isArray(policy.targets) || policy.targets.length !== required.size || policy.targets.some(target => !required.delete(target.path)) || required.size) throw new Error('Signing targets must cover exactly the changed supplied hosts, new boundary code and outer app');
const preserved = ['daemon', 'cli'].map(role => `${prefix}/apps/${role}/Aux ${role === 'daemon' ? 'Daemon' : 'CLI'}.app/Contents/Resources/native/provided-native.node`);
const plan = await planProvidedSigning({ root, sourceRoots: report.sourceRoots, targets: policy.targets, verifyPreserved: preserved });
const result = await runProvidedSigning(plan, { mode: apply ? 'sign' : 'verify-only' });
const receiptBytes = JSON.stringify({ ...result, packageRoot: root, nativeReceiptSha256: report.nativeReceiptSha256, compositionSha256: report.compositionSha256, boundaryReceiptSha256: report.boundaryReceiptSha256 }, null, 2) + '\n';
await writeFile(receipt, receiptBytes, { flag: 'wx', mode: 0o600 });
if (apply) await writeFile(join(root, 'package.json'), JSON.stringify({ ...report, signed: true, signingReceiptSha256: createHash('sha256').update(receiptBytes).digest('hex'), remaining: report.remaining.filter(value => value !== 'Explicit inside-out ad hoc signing') }, null, 2) + '\n');
console.log(apply ? `Signed ${result.signed.length} explicit targets; packaged acceptance remains required.` : `Verified ${result.steps} explicit signing targets; no signing performed.`);
