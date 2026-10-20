import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { transformProvidedNewTabUnavailableControls as transform, unavailableToolbar } from './provided-newtab-unavailable-controls.mjs';

const composerPath = 'assets/session-composer-Dc0LRfZA.js';
const panelPath = 'assets/ask-omnibox-panel-DkxXbN8c.js';

test('anchors are counted, preserve the resolved branch, and do not manufacture account zero', () => {
  const source = 'import{A as P,F as I,rest}return s===null?null:(0,e.jsx)(F,{real:true});value:{accountId:n??0,browserProfile:null,mode:a}';
  const result = transform({ component: 'agent', path: panelPath, text: source });
  assert.equal(result.anchors.length, 3);
  assert.ok(result.text.includes(':(0,e.jsx)(F,{real:true})'));
  assert.ok(result.text.includes('value:{accountId:n,browserProfile:null,mode:a}'));
  assert.throws(() => transform({ component: 'agent', path: panelPath, text: source + source }), /anchor changed/);
  assert.deepEqual(transform({ component: 'vault', path: panelPath, text: source }), { text: source, anchors: [] });
  assert.throws(() => transform({ component: 'agent', path: composerPath, text: 'drift' }), /anchor changed/);
});

test('unavailable render retains supplied row primitives and disables every account/microphone action', () => {
  const primitives = ['uf', 'Ts', 'J', 'nl', 'ws', 'oc', 'ac', 'ic', 'au'];
  const jsx = (type, props) => ({ type, props });
  const context = Object.fromEntries(primitives.map(name => [name, name]));
  context.a = { jsx, jsxs: jsx };
  const render = runInNewContext(`${unavailableToolbar};AuxUnavailableNewTabControls`, context);
  const tree = render();
  const nodes = [];
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    nodes.push(node);
    for (const child of [node.props?.children].flat(Infinity)) walk(child);
  }
  walk(tree);
  assert.equal(tree.props.className, 'mx-auto min-h-12 w-full max-w-200 px-4');
  assert.equal(nodes.filter(node => node.type === 'Ts').length, 2);
  const controls = nodes.filter(node => ['J', 'oc', 'ac', 'ic'].includes(node.type) && !node.props?.render);
  assert.equal(controls.length, 5);
  assert.ok(controls.every(node => node.props.disabled === true));
  const permission = nodes.find(node => node.type === 'oc');
  assert.equal(permission.props.disabled, true);
  assert.equal(nodes.find(node => node.type === 'ac').props.model.modelId, 'Model unavailable');
  assert.equal(nodes.find(node => node.type === 'ic').props.label, 'Reasoning unavailable');
  assert.equal(nodes.find(node => node.props?.role === 'status').props.children, 'Profile disconnected — AI options unavailable');
  assert.ok(!/accountId|mutate|query|fetch|localStorage|warmMic|onClick|onPointerDown/.test(unavailableToolbar));
});

// Opt-in exact static-source check; never executes supplied chunks or launches a browser.
if (process.env.AUX_FROZEN_UI_ROOT) test('pinned original chunks accept all anchors', async () => {
  const manifest = JSON.parse(await readFile(new URL('../../docs/integration/proposed/provided-newtab-unavailable-controls/manifest.json', import.meta.url), 'utf8'));
  const hash = value => createHash('sha256').update(value).digest('hex');
  for (const path of [composerPath, panelPath]) {
    const pin = manifest.files.find(file => file.path === path);
    const source = await readFile(`${process.env.AUX_FROZEN_UI_ROOT}/${path}`, 'utf8');
    assert.equal(hash(source), pin.sourceSha256);
    const result = transform({ component: 'agent', path, text: source });
    assert.equal(hash(result.text), pin.outputSha256);
    assert.ok(result.anchors.length > 0);
    for (const anchor of result.anchors) assert.equal(source.split(anchor.find).length - 1, 1);
    assert.throws(() => transform({ component: 'agent', path, text: result.text }), /anchor changed/);
  }
});
