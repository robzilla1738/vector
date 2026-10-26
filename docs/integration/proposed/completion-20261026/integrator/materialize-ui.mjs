import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {applyAuxFinalUiIdentity} from '../../../../../vendor/provided/aux-final-ui-identity.mjs';
import {transformAuxFinalRuntimeIdentity} from '../../../../../vendor/provided/aux-final-runtime-identity.mjs';
import {transformAuxExperimentalSettings} from '../../../../../vendor/provided/aux-experimental-settings-v2.mjs';

const repository = process.cwd();
const here = path.join(repository, 'docs/integration/proposed/completion-20261026/integrator');
const app = path.join(repository, 'out/provided-candidate-local-completion-20261025-a38/Aux.app');
const supplied = path.join(repository, 'out/provided-source-snapshot-1.26.1016.1852/agent');
const output = path.join(repository, 'out/completion-20261026-ui-a1');
const sha = text => createHash('sha256').update(text).digest('hex');
const names = ['developers-DTvaoVBC.js', 'connect-dialog-CacgpFap.js', 'newtab-CnOLQ0yu.js',
  'session-feedback-dialog-BjDg0W8m.js', 'mcps-DmPp5oo9.js', 'experimental-Xq3YsEPK.js',
  'session-composer-Dc0LRfZA.js', 'provider-Cw0zhujt.js', '_skillId-CAwCRjA8.js'];
const generators = ['vendor/provided/aux-final-ui-identity.mjs', 'vendor/provided/aux-final-runtime-identity.mjs',
  'docs/integration/proposed/completion-20261026/integration/identity/source-pins.json',
  'vendor/provided/aux-experimental-settings-v2.mjs'];
const inputs = await Promise.all(generators.map(async name => ({path: name, sha256: sha(await readFile(path.join(repository, name)))})));
await mkdir(output);
const files = [];
for (const name of names) {
  const relative = 'Contents/Resources/aux/apps/extension/dist/assets/' + name;
  const text = await readFile(path.join(app, relative), 'utf8');
  const original = await readFile(path.join(supplied, 'assets', name), 'utf8');
  const input = {component: 'agent', path: 'assets/' + name, text, original, stateIdentityVersion: 2};
  const identity = applyAuxFinalUiIdentity(input);
  const feedback = name.startsWith('session-feedback-dialog-')
    ? transformAuxFinalRuntimeIdentity({...input, text: identity.text}) : {text: identity.text, anchors: []};
  const settings = transformAuxExperimentalSettings({...input, text: feedback.text});
  const destination = path.join(output, name);
  await writeFile(destination, settings.text, {flag: 'wx'});
  const syntax = spawnSync(process.execPath, ['--check', destination], {encoding: 'utf8'});
  if (syntax.status !== 0) throw Error('Composed UI script does not parse: ' + name + '\n' + syntax.stderr);
  files.push({path: relative, inputSha256: sha(text), output: destination, outputSha256: sha(settings.text),
    suppliedSourceSha256: sha(original), anchors: [...identity.anchors, ...feedback.anchors, ...settings.anchors]});
}
for (const input of inputs)
  if (sha(await readFile(path.join(repository, input.path))) !== input.sha256) throw Error('UI generator changed during materialization');
const result = {format: 'aux.completion.ui-source.v1', passed: true, files, generators: inputs,
  geometryOrCssChanged: false, productExecuted: false, candidateChanged: false, productSigned: false};
await writeFile(path.join(here, 'ui-source-a1.json'), JSON.stringify(result, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({passed: true, files: files.length, output}));
