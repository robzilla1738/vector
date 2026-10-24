/** Focused actual-source replay and inert consumer checks. No app or provider. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
import {applyAuxUiPeerIdentity} from '../../../../../vendor/provided/aux-ui-peer-identity.mjs';

const root = '/Users/rcourson/Documents/Vibe/web';
const here = path.join(root, 'docs/integration/proposed/standard-profile-isolation/ui-peer-identity-a1');
const snapshot = path.join(root, 'out/provided-source-snapshot-1.26.1016.1852/agent');
const previous = path.join(root, 'out/standard-profile-finish-stage-pair-20261024/desktop-v1/ui/agent');
const output = '/private/tmp/aux-ui-peer-identity-20261024-a2';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const pins = JSON.parse(await fs.readFile(path.join(here, 'inputs.json'), 'utf8'));
await fs.mkdir(output, {mode: 0o700});
const files = [], transformed = new Map();
for (const pin of pins.files) {
  const original = await fs.readFile(path.join(snapshot, pin.path), 'utf8');
  const before = await fs.readFile(path.join(previous, pin.path), 'utf8');
  const result = applyAuxUiPeerIdentity({component: 'agent', path: pin.path, text: before, original, stateIdentityVersion: 2});
  let replay = before;
  for (const rule of result.anchors) {
    assert.equal(replay.split(rule.find).length - 1, rule.count);
    replay = replay.split(rule.find).join(rule.replace);
  }
  assert.equal(result.text, replay);
  const destination = path.join(output, pin.path);
  await fs.mkdir(path.dirname(destination), {recursive: true});
  await fs.writeFile(destination, result.text, {flag: 'wx'});
  const syntax = spawnSync(process.execPath, ['--check', destination], {encoding: 'utf8'});
  assert.equal(syntax.status, 0, syntax.stderr);
  assert.throws(() => applyAuxUiPeerIdentity({component:'agent', path:pin.path, text:result.text, original, stateIdentityVersion:2}), /anchor differs/);
  assert.throws(() => applyAuxUiPeerIdentity({component:'agent', path:pin.path, text:before, original:original+' ', stateIdentityVersion:2}), /source differs/);
  assert.equal(applyAuxUiPeerIdentity({component:'agent', path:pin.path, text:before, original, stateIdentityVersion:1}).text, before);
  files.push({path: pin.path, beforeSha256: sha(before), afterSha256: sha(replay), sourceSha256: sha(original), anchors: result.anchors});
  transformed.set(pin.path, replay);
}

// Verify the complete pinned supplied Agent cohort, rather than assuming the
// selected files contain all publishers/readers. Standard HTML ASIDE is untouched.
const totals = new Map(pins.files.flatMap(file => file.rules.map(rule => [rule.find, 0])));
async function scan(directory) {
  for (const item of await fs.readdir(directory, {withFileTypes: true})) {
    const absolute = path.join(directory, item.name);
    assert(!item.isSymbolicLink());
    if (item.isDirectory()) {await scan(absolute); continue;}
    if (!/\.(?:js|json|html|css)$/.test(item.name)) continue;
    const text = await fs.readFile(absolute, 'utf8');
    for (const needle of totals.keys()) totals.set(needle, totals.get(needle) + text.split(needle).length - 1);
  }
}
await scan(snapshot);
for (const [needle, count] of totals) {
  const expected = pins.files.flatMap(file => file.rules).filter(rule => rule.find === needle).reduce((sum, rule) => sum + rule.count, 0);
  assert.equal(count, expected, 'Unaccounted supplied UI peer: ' + needle);
}
const content = transformed.get('content/content.js');
const start = content.indexOf('isCaptureUiEvent(e){'), end = content.indexOf('moveToolbar(', start);
assert(start >= 0 && end > start);
const method = content.slice(start, end);
class Element {constructor(tagName) {this.tagName = tagName;}}
const capture = runInNewContext('new(class {' + method + '})', {HTMLElement: Element});
assert.equal(capture.isCaptureUiEvent({composedPath: () => [new Element('AUX-CAPTURE-SHRINK')]}), true);
assert.equal(Boolean(capture.isCaptureUiEvent({composedPath: () => [new Element('ASIDE')]})), false);
const daemon = await fs.readFile('/private/tmp/aux-standard-daemon-projection-20261024-a6/index.mjs', 'utf8');
assert.equal(daemon.split('AUX_LOCAL_ACCOUNT_ALREADY_SIGNED_IN').length - 1, 1);
assert(transformed.get('assets/-types-Wy38XkNB.js').includes('AUX_LOCAL_ACCOUNT_ALREADY_SIGNED_IN'));
const report = {format: 'aux.ui-peer-identity.actual.v1', passed: true, output, files,
  changedFiles: files.length, totalAnchors: files.reduce((sum, file) => sum + file.anchors.length, 0),
  completeOriginalPeerCohortChecked: true, actualDaemonAccountCodePaired: true,
  captureConstructorEventConsumerPaired: true, syntaxChecked: true,
  repeatedGenerationRefused: true, sourceDriftRefused: true, compatibilityStageUnchanged: true,
  cssChanged: false, htmlSemanticsChanged: false, persistentStateChanged: false,
  productExecuted: false, packaged: false};
await fs.writeFile(path.join(here, 'actual-a2.json'), JSON.stringify(report, null, 2) + '\n', {flag:'wx'});
console.log(JSON.stringify({passed: true, changedFiles: files.length, totalAnchors: report.totalAnchors, productExecuted:false}));
