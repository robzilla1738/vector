import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
import {applyAuxFinalUiIdentity} from '../../../../../vendor/provided/aux-final-ui-identity.mjs';

const repository = process.cwd();
const here = path.join(repository, 'docs/integration/proposed/completion-20261026/integrator');
const app = path.join(repository, 'out/provided-candidate-local-completion-20261025-a38/Aux.app');
const source = path.join(repository, 'out/provided-source-snapshot-1.26.1016.1852/agent');
const output = path.join(repository, 'out/completion-20261026-ui-identity');
const inventory = JSON.parse(await readFile(path.join(here, 'a38-delivered-identity.json'), 'utf8'));
const sha = text => createHash('sha256').update(text).digest('hex');
const files = [];
await mkdir(output);
for (const name of ['developers-DTvaoVBC.js', 'connect-dialog-CacgpFap.js', 'newtab-CnOLQ0yu.js']) {
  const relative = 'Contents/Resources/aux/apps/extension/dist/assets/' + name;
  const text = await readFile(path.join(app, relative), 'utf8');
  assert.equal(sha(text), inventory.files.find(file => file.path === relative).sha256);
  const input = {component: 'agent', path: 'assets/' + name, text,
    original: await readFile(path.join(source, 'assets', name), 'utf8'), stateIdentityVersion: 2};
  const result = applyAuxFinalUiIdentity(input);
  assert.equal(applyAuxFinalUiIdentity({...input, stateIdentityVersion: 1}).text, text);
  assert.throws(() => applyAuxFinalUiIdentity({...input, text: result.text}), /anchor changed/);
  const target = path.join(output, name);
  await writeFile(target, result.text, {flag: 'wx'});
  const syntax = spawnSync(process.execPath, ['--check', target], {encoding: 'utf8'});
  assert.equal(syntax.status, 0, syntax.stderr);
  assert.ok(!/aside/i.test(result.text), name);
  files.push({path: relative, inputSha256: sha(text), outputSha256: sha(result.text),
    output: target, anchors: result.anchors});
}
const result = {format: 'aux.final-ui-identity.source.v1', passed: true, files,
  compatibilityUnchanged: true, repeatedApplicationRefused: true,
  scriptsParse: true, geometryOrCssChanged: false, persistedStorageChanged: false,
  productExecuted: false, candidateChanged: false};
await writeFile(path.join(here, 'ui-identity-source.json'), JSON.stringify(result, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({passed: true, files: files.length,
  replacements: files.flatMap(file => file.anchors).reduce((sum, rule) => sum + rule.count, 0)}));
