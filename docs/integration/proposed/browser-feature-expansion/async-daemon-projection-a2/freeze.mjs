// Freeze source-producer inputs only. Does not compose/project or execute product code.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const here = path.dirname(fileURLToPath(import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const [rootArg, pinsArg, outputArg] = process.argv.slice(2);
if (![rootArg,pinsArg,outputArg].every(value => value && path.isAbsolute(value)))
  throw Error('Absolute repository root, fresh pins file and fresh output directory required');
const root = path.resolve(rootArg), output = path.resolve(outputArg);
if (!here.startsWith(root + path.sep) || output !== outputArg ||
    !output.startsWith('/private/tmp/')) throw Error('Run the committed root producer with a fresh /private/tmp output');
try { await fs.lstat(output); throw Error('Output already exists'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const read = async name => JSON.parse(await fs.readFile(name));
const immutablePath = path.join(here,'immutable-inputs.json');
const immutable = await read(immutablePath);
if (immutable.root !== root) throw Error('Immutable input root mismatch');
const inputs = new Map();
const pin = async (name, expected) => {
  const value = sha(await fs.readFile(name));
  if (expected && value !== expected) throw Error('Immutable input changed: ' + name);
  if (inputs.has(name) && inputs.get(name) !== value) throw Error('Input changed while freezing: ' + name);
  inputs.set(name,value);
  return value;
};
for (const item of immutable.inputs) await pin(item.path,item.sha256);
for (const name of ['freeze.mjs','compose.mjs','immutable-inputs.json','README.md'])
  await pin(path.join(here,name));
const listPath = path.join(root,'scripts/lib/provided-stage-inputs.mjs');
await pin(listPath);
const {providedStageInputs} = await import(pathToFileURL(listPath));
if (!Array.isArray(providedStageInputs) || !providedStageInputs.length ||
    new Set(providedStageInputs).size !== providedStageInputs.length)
  throw Error('Unique current feature adapter inventory required');
const featureAdapterInputs = [];
for (const name of providedStageInputs) {
  if (path.isAbsolute(name) || path.normalize(name).startsWith('..')) throw Error('Invalid adapter path');
  featureAdapterInputs.push({path:name,sha256:await pin(path.join(root,name))});
}
await pin(path.join(root,'docs/integration/proposed/browser-feature-expansion/integration/compose-daemon.mjs'));
const predecessorSourcePair = path.join(root,'docs/integration/proposed/profile-isolation-protected-startup/integration/source-pair.json');
const predecessorSourcePairSha256 = await pin(predecessorSourcePair);
const pair = await read(predecessorSourcePair);
if (!pair.passed || pair.coldFeatureEnabled || pair.runtimeAuthorityGranted)
  throw Error('Inactive protected predecessor required');
for (const name of ['source','entry','loader']) await pin(pair[name],pair[name+'Sha256']);
// Original projector also consumes these static supplied operands; bind them now.
const projection = await read(path.join(root,'docs/integration/proposed/aux-final-local-entry-package/inputs.json'));
await pin(path.join(root,projection.originalDaemon),projection.originalDaemonSha256);
await pin(path.join(root,projection.loader.path),projection.loader.sha256);
for (const [name,expected] of inputs) await pin(name,expected);
const result = {format:'aux.async-daemon-projection.inputs.v2',root,producer:here,output,
  asyncIntegration:immutable.asyncIntegration,predecessorSourcePair,predecessorSourcePairSha256,
  featureAdapterInputs,inputs:[...inputs].map(([path,sha256]) => ({path,sha256})),
  preparedOnly:true,productExecuted:false,nativePairingPending:true};
await fs.writeFile(pinsArg,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify({frozen:true,pins:pinsArg,inputs:inputs.size,featureAdapters:featureAdapterInputs.length,
  composed:false,projected:false,productExecuted:false,nativePairingPending:true}));
