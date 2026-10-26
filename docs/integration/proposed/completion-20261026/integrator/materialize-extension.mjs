import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {transformAuxAgentActiveIdentity} from '../../../../../vendor/provided/aux-agent-active-identity.mjs';
import {transformAuxAgentRemainingIdentity} from '../../../../../vendor/provided/aux-agent-remaining-identity.mjs';
import {transformAuxTrustedTypes} from '../../../../../vendor/provided/aux-final-identity-v2.mjs';

const root = process.cwd();
const here = path.join(root, 'docs/integration/proposed/completion-20261026/integrator');
const prefix = 'Contents/Resources/aux/apps/extension/dist/';
const original = path.join(root, 'out/provided-candidate-local-completion-20261025-a38/Aux.app');
const generation = process.argv[2] ?? 'a1';
if (!/^a[1-9]\d*$/.test(generation)) throw Error('Fresh finite extension generation required');
const output = path.join(root, 'out/completion-20261026-extension-' + generation);
const sha = value => createHash('sha256').update(value).digest('hex');
const generatorNames = ['vendor/provided/aux-agent-active-identity.mjs',
  'docs/integration/proposed/completion-20261026/desktop/agent-active-identity/source-pins.json',
  'vendor/provided/aux-agent-remaining-identity.mjs',
  'docs/integration/proposed/completion-20261026/desktop/agent-remaining-identity/source-pins.json',
  'vendor/provided/aux-final-identity-v2.mjs',
  'docs/integration/proposed/completion-20261026/integration/final-identity/source-pins.json',
  'docs/integration/proposed/completion-20261026/integrator/materialize-extension.mjs'];
const generators = await Promise.all(generatorNames.map(async name => ({path: name, sha256: sha(await readFile(path.join(root, name)))})));
await mkdir(output);
const files = [];
const activePins = JSON.parse(await readFile(path.join(root, generatorNames[1]), 'utf8'));
const remainingPins = JSON.parse(await readFile(path.join(root, 'docs/integration/proposed/completion-20261026/desktop/agent-remaining-identity/source-pins.json'), 'utf8'));
const names = [...new Set([...activePins.files, ...remainingPins.files].map(file => file.path.slice(prefix.length))
  .filter(name => !name.startsWith('assets/') && name !== 'background.js'))];
for (const name of names) {
  const source = await readFile(path.join(original, prefix + name), 'utf8');
  const active = transformAuxAgentActiveIdentity({path: name, text: source, source});
  const trusted = name === 'content/content.js'
    ? transformAuxTrustedTypes({path: name, text: active.text, source}) : {text: active.text, anchors: []};
  const remaining = transformAuxAgentRemainingIdentity({path: name, text: trusted.text, source});
  const destination = path.join(output, name);
  await mkdir(path.dirname(destination), {recursive: true});
  await writeFile(destination, remaining.text, {flag: 'wx'});
  if (name.endsWith('.json')) JSON.parse(remaining.text);
  else if (name.endsWith('.js')) {
    const result = spawnSync(process.execPath, ['--check', destination], {encoding: 'utf8'});
    if (result.status !== 0) throw Error('Combined extension script does not parse: ' + name + '\n' + result.stderr);
  }
  files.push({path: prefix + name, input: path.join(original, prefix + name), inputSha256: sha(source),
    output: destination, outputSha256: sha(remaining.text), anchors: [...active.anchors, ...trusted.anchors, ...remaining.anchors]});
}
for (const input of generators)
  if (sha(await readFile(path.join(root, input.path))) !== input.sha256) throw Error('Extension generator changed during materialization');
const receipt = {format: 'aux.completion.extension-source.v1', passed: true, files, generators,
  geometryOrCssDeclarationValuesChanged: false, selectorBrandingChanged: true, productExecuted: false, candidateChanged: false, productSigned: false};
await writeFile(path.join(here, 'extension-source-' + generation + '.json'), JSON.stringify(receipt, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({passed: true, files: files.length, output}));
