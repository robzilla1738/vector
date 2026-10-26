import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import {z} from '../../../../../services/aux-cloud/node_modules/zod/index.js';
import {upgradeCloudTransfers} from '../integration/transform.mjs';
import {transformAuxFinalRuntimeIdentity} from '../../../../../vendor/provided/aux-final-runtime-identity.mjs';
import {migrateAuxExperimentalSettings, transformAuxExperimentalSettings} from '../../../../../vendor/provided/aux-experimental-settings-v2.mjs';

const root = process.cwd();
const here = path.join(root, 'docs/integration/proposed/completion-20261026/integrator');
const resources = path.join(root, 'out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux');
const output = path.join(root, 'out/completion-20261026-experimental-v2');
await mkdir(output);
const records = [];
let daemonSchema, uiSchema;
const hash = text => createHash('sha256').update(text).digest('hex');
for (const name of ['index.mjs', 'aux-native-entry.mjs', 'mcps-DmPp5oo9.js', 'experimental-Xq3YsEPK.js', 'session-composer-Dc0LRfZA.js', 'provider-Cw0zhujt.js', '_skillId-CAwCRjA8.js']) {
  const daemon = name.endsWith('.mjs');
  const relative = daemon ? 'apps/daemon/Aux Daemon.app/Contents/Resources/node-development/' + name : 'apps/extension/dist/assets/' + name;
  const original = await readFile(path.join(resources, relative), 'utf8');
  const identity = daemon ? transformAuxFinalRuntimeIdentity({component: 'daemon', path: name,
    text: upgradeCloudTransfers(original).text}).text : original;
  const input = {component: daemon ? 'daemon' : 'agent', path: daemon ? name : 'assets/' + name, text: identity};
  const result = transformAuxExperimentalSettings(input);
  assert.throws(() => transformAuxExperimentalSettings({...input, source: identity, text: result.text}), /anchor changed/);
  const target = path.join(output, name);
  await writeFile(target, result.text, {flag: 'wx'});
  const syntax = spawnSync(process.execPath, ['--check', target], {encoding: 'utf8'});
  assert.equal(syntax.status, 0, syntax.stderr);
  const schema = result.anchors.find(anchor => anchor.find.startsWith('object({sync:') || anchor.find.startsWith('o({sync:'));
  if (name === 'index.mjs') daemonSchema = new Function('object', 'boolean$1', 'string$3', 'return ' + schema.replace)(z.object, z.boolean, z.string);
  if (name === 'mcps-DmPp5oo9.js') uiSchema = new Function('o', 'm', 't', 'return ' + schema.replace)(z.object, z.boolean, z.string);
  records.push({path: relative, inputSha256: hash(original), composedInputSha256: hash(identity),
    outputSha256: hash(result.text), output: target, anchors: result.anchors});
}
const flags = {sync: true, kakaotalk: false, onboarding: true, compactionLimits: true};
for (const enabled of [false, true]) {
  const legacy = {...flags, asideCode: enabled};
  const before = structuredClone(legacy);
  const converted = daemonSchema.parse(legacy);
  assert.deepEqual(legacy, before);
  assert.deepEqual(converted, {...flags, format: 'aux.experimental.v2', auxCode: enabled});
  assert.deepEqual(uiSchema.parse(converted), converted);
  assert.deepEqual(daemonSchema.parse(uiSchema.parse(legacy)), converted);
  assert.deepEqual(daemonSchema.parse(JSON.parse(JSON.stringify(converted))), converted);
}
for (const schema of [daemonSchema, uiSchema]) {
  assert.equal(schema.parse({}).auxCode, false);
  assert.throws(() => schema.parse({format: 'aux.experimental.v3', auxCode: true}), /Unsupported/);
  assert.throws(() => schema.parse({auxCode: true}), /Ambiguous/);
  assert.throws(() => schema.parse({format: 'aux.experimental.v2', asideCode: true, auxCode: false}), /Ambiguous/);
  assert.throws(() => schema.parse({asideCode: 'true'}));
}
assert.deepEqual(migrateAuxExperimentalSettings(daemonSchema.parse({...flags, asideCode: true})), {...flags, format: 'aux.experimental.v2', auxCode: true});
const evidence = {format: 'aux.experimental-settings-v2.source.v1', passed: true,
  files: records, emittedDaemonAndUiSchemasEvaluated: true, legacyBooleansPreserved: true,
  otherFlagsPreserved: true, inputNotMutated: true, jsonRoundTripPreserved: true,
  ambiguousAndUnknownVersionsRefused: true, pairedContextKey: 'auxCodeAgents',
  installedStateAccessed: false, credentialsOrCryptoChanged: false, appChanged: false,
  runtimeAccepted: false};
await writeFile(path.join(here, 'experimental-settings-v2.json'), JSON.stringify(evidence, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({passed: true, files: records.length, format: evidence.format}));
