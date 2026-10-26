import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {upgradeCloudTransfers} from '../integration/transform.mjs';
import {transformAuxFinalRuntimeIdentity} from '../../../../../vendor/provided/aux-final-runtime-identity.mjs';
import {transformAuxExperimentalSettings} from '../../../../../vendor/provided/aux-experimental-settings-v2.mjs';
import {transformAuxEventPolling} from '../../../../../vendor/provided/aux-event-poll-integration.mjs';
import {transformAuxOrdinaryChatStartup} from '../../../../../vendor/provided/aux-ordinary-chat-startup.mjs';
import {transformAuxBashCloseLifetime} from '../../../../../vendor/provided/aux-bash-close-lifetime.mjs';
import {transformAuxFixedBuiltinRouting} from '../../../../../vendor/provided/aux-fixed-builtin-routing.mjs';
import {transformAuxEphemeralProtocolIdentity, transformAuxTagIconIdentity} from '../../../../../vendor/provided/aux-ephemeral-protocol-identity.mjs';
import {transformAuxSelectedBrowserResources} from '../desktop/browser-files/transform-resources.mjs';
import {transformAuxPreferenceIdentity} from '../../../../../vendor/provided/aux-password-preference-markers.mjs';
import {transformAuxExcludedProducts} from '../../../../../vendor/provided/aux-excluded-product-pruning.mjs';

const repository = process.cwd();
const here = path.join(repository, 'docs/integration/proposed/completion-20261026/integrator');
const original = path.join(repository, 'out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development');
const generation = process.argv[2] ?? 'a4';
if (!/^a[1-9]\d*$/.test(generation)) throw Error('A finite fresh generation is required.');
const output = path.join(repository, 'out/completion-20261026-paired-source-' + generation);
const sha = text => createHash('sha256').update(text).digest('hex');
const generators = [
  'docs/integration/proposed/completion-20261026/integration/transform.mjs',
  'docs/integration/proposed/completion-20261026/integration/pins.json',
  'docs/integration/proposed/completion-20261026/integration/anchors.json',
  'vendor/provided/cloud-transfer-binding.mjs',
  'vendor/provided/aux-final-runtime-identity.mjs',
  'docs/integration/proposed/completion-20261026/integration/identity/source-pins.json',
  'vendor/provided/aux-experimental-settings-v2.mjs',
  'vendor/provided/aux-event-poll-client.mjs',
  'vendor/provided/aux-event-poll-integration.mjs',
  'docs/integration/proposed/completion-20261026/integration/events/source-pins.json',
  'vendor/provided/aux-ordinary-chat-startup.mjs',
  'docs/integration/proposed/completion-20261026/integration/ordinary-chat/source-pins.json',
  'vendor/provided/aux-bash-close-lifetime.mjs',
  'docs/integration/proposed/completion-20261026/integration/advertised-tools/source-pins.json',
  'vendor/provided/aux-fixed-builtin-routing.mjs',
  'docs/integration/proposed/completion-20261026/runtime/fixed-builtins/entry.anchors.json',
  'vendor/provided/aux-ephemeral-protocol-identity.mjs',
  'vendor/provided/aux-excluded-product-pruning.mjs',
  'docs/integration/proposed/completion-20261026/integration/excluded-products/source-pins.json',
  'docs/integration/proposed/completion-20261026/integrator/materialize-paired-source.mjs',
];
const resourcePins = JSON.parse(await readFile(path.join(here, '../desktop/browser-files/composition-inputs.json'), 'utf8'));
generators.push('docs/integration/proposed/completion-20261026/desktop/browser-files/transform-resources.mjs',
  'docs/integration/proposed/completion-20261026/desktop/browser-files/composition-inputs.json', ...Object.keys(resourcePins.inputs));
const uniqueGenerators = [...new Set(generators)];
const inputs = [];
for (const name of uniqueGenerators) inputs.push({path: name, sha256: sha(await readFile(path.join(repository, name)))});
await mkdir(output);
const files = [];
for (const name of ['index.mjs', 'aux-native-entry.mjs']) {
  const source = await readFile(path.join(original, name), 'utf8');
  const stages = [];
  const cloud = upgradeCloudTransfers(source);
  stages.push({name: 'account-bound cloud transfers', outputSha256: cloud.outputSha256, anchors: cloud.changes});
  const identity = transformAuxFinalRuntimeIdentity({component: 'daemon', path: name, text: cloud.text});
  stages.push({name: 'Aux runtime identity', outputSha256: sha(identity.text), anchors: identity.anchors});
  const experimental = transformAuxExperimentalSettings({component: 'daemon', path: name, text: identity.text});
  stages.push({name: 'experimental settings v2', outputSha256: sha(experimental.text), anchors: experimental.anchors});
  const events = transformAuxEventPolling({text: experimental.text, source: identity.text});
  stages.push({name: 'authenticated cloud invalidation and reconciliation', outputSha256: sha(events.text), anchors: events.anchors});
  const chat = transformAuxOrdinaryChatStartup({text: events.text, source: identity.text});
  stages.push({name: 'ordinary chat startup and original-attempt failure', outputSha256: sha(chat.text), anchors: chat.anchors});
  const bash = transformAuxBashCloseLifetime({text: chat.text, source: identity.text});
  stages.push({name: 'background Bash physical-close retention', outputSha256: sha(bash.text), anchors: bash.anchors});
  const builtins = transformAuxFixedBuiltinRouting({path: name, text: bash.text, source});
  stages.push({name: 'authenticated fixed-image linked builtin routing', outputSha256: sha(builtins.text), anchors: builtins.anchors});
  const protocols = transformAuxEphemeralProtocolIdentity({text: builtins.text, source});
  stages.push({name: 'Aux transient protocol generation 2', outputSha256: sha(protocols.text), anchors: protocols.anchors});
  const tags = transformAuxTagIconIdentity({text: protocols.text, source});
  stages.push({name: 'fresh successor Aux tag icon schema', outputSha256: sha(tags.text), anchors: tags.anchors});
  const preference = transformAuxPreferenceIdentity({text: tags.text, source});
  stages.push({name: 'Aux versioned external password-manager preference markers', outputSha256: sha(preference.text), anchors: preference.anchors});
  const selected = await transformAuxSelectedBrowserResources({path: name, text: preference.text, source, root: repository});
  stages.push(...selected.stages.map(stage => ({...stage, name: stage.kind})));
  const pruned = transformAuxExcludedProducts({text: selected.text, source});
  stages.push({name: 'Remove closed excluded product and unused SEA modules', outputSha256: sha(pruned.text), anchors: pruned.anchors});
  const destination = path.join(output, name);
  await writeFile(destination, pruned.text, {flag: 'wx'});
  const syntax = spawnSync(process.execPath, ['--check', destination], {encoding: 'utf8'});
  if (syntax.status !== 0) throw Error('Combined paired source does not parse: ' + name + '\n' + syntax.stderr);
  files.push({path: destination, input: path.join(original, name), inputSha256: sha(source), outputSha256: sha(pruned.text), stages});
}
const backgroundInput = path.join(repository, 'out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/extension/dist/background.js');
const backgroundSource = await readFile(backgroundInput, 'utf8');
const background = await transformAuxSelectedBrowserResources({path: 'background.js', text: backgroundSource, source: backgroundSource, root: repository});
const backgroundOutput = path.join(output, 'background.js');
await writeFile(backgroundOutput, background.text, {flag: 'wx'});
const backgroundSyntax = spawnSync(process.execPath, ['--check', backgroundOutput], {encoding: 'utf8'});
if (backgroundSyntax.status !== 0) throw Error('Combined Agent background does not parse: ' + backgroundSyntax.stderr);
files.push({path: backgroundOutput, input: backgroundInput, inputSha256: sha(backgroundSource), outputSha256: sha(background.text), stages: background.stages});
for (const input of inputs)
  if (sha(await readFile(path.join(repository, input.path))) !== input.sha256) throw Error('Source generator changed during materialization');
const receipt = {format: 'aux.completion.paired-source.v1', passed: true, files, generators: inputs,
  originalAppChanged: false, suppliedUiRedesigned: false, credentialsAccessed: false,
  productExecuted: false, runtimeAccepted: false, productSigned: false};
await writeFile(path.join(here, 'paired-source-' + generation + '.json'), JSON.stringify(receipt, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({passed: true, output, files: files.map(({path, outputSha256}) => ({path, outputSha256}))}));
