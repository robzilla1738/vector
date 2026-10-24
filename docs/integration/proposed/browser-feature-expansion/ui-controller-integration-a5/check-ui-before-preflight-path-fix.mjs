import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const here = new URL('./', import.meta.url);
const root = '/Users/rcourson/Documents/Vibe/web/';
const before = '/private/tmp/aux-feature-completion-ui-stage-20261024-a2/agent/';
const after = '/private/tmp/aux-ui-controller-integration-preflight-20261024-a5/agent/';
const hash = value => createHash('sha256').update(value).digest('hex');
const request = JSON.parse(await readFile(root + 'docs/integration/proposed/standard-profile-isolation/ui-editor-writer-closure-a1/integration-request.json', 'utf8'));
for (const item of request.provenanceInputsToRegister)
  assert.equal(hash(await readFile(root + item.path)), item.sha256);
assert.equal(hash(await readFile(root + request.consumedAdapter.path)), request.consumedAdapter.outputSha256);
const plan = JSON.parse(await readFile(root + 'docs/integration/proposed/standard-profile-isolation/ui-editor-writer-closure-a1/source-plan.json', 'utf8'));
const files = [];
for (const row of plan.files) {
  const a = await readFile(before + row.path, 'utf8'), b = await readFile(after + row.path, 'utf8');
  assert.notEqual(a, b, row.path);
  const check = spawnSync(process.execPath, ['--check', '--input-type=module'], {input:b, encoding:'utf8'});
  assert.equal(check.status, 0, check.stderr);
  const classes = text => [...text.matchAll(/className:"([^"]*)"/g)].map(match => match[1]);
  assert.deepEqual(classes(b), classes(a), row.path + ': existing UI classes changed');
  files.push({relative:row.path, beforeSha256:hash(a), afterSha256:hash(b), syntaxPassed:true,
    originalClassNamesExact:true});
}
assert.equal(files.length, 8);
const result = {format:'aux.ui-controller-integration.composition.actual.v1', passed:true,
  files, fullFeatureComposition:true, actualCompletePreflightCandidate:true,
  workerProtocolSha256:request.protocolSha256, originalUiClassesPreserved:true,
  productExecuted:false, runtimeAcceptance:false};
await writeFile(new URL('actual-ui-composition-a1.json', here), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({passed:true, changedModules:files.length, originalUiClassesPreserved:true}));
