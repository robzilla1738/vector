import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { SETUP_APPEARANCE_ID, requireSetupAppearance, setupDisposition, captureSetupDisclosures } from './lib/setup-appearance.mjs';
import { journey, run } from './appearance-journeys/setup-appearance.mjs';

test('only exact paired appearance setup retains the dialog', () => {
  assert.equal(setupDisposition(SETUP_APPEARANCE_ID, true, Object.freeze({})), 'retain');
  for (const id of ['home-composer', 'setup', 'setup-appearance-extra', undefined]) {
    assert.equal(setupDisposition(id, true, Object.freeze({})), 'dismiss');
    assert.throws(() => requireSetupAppearance({ journeyId: id, appearance: true, pair: {} }), /exact setup/);
  }
});

test('ordinary and unpaired setup cannot skip mandatory dismissal', () => {
  for (const args of [[SETUP_APPEARANCE_ID, false, {}], [SETUP_APPEARANCE_ID, true, undefined]])
    assert.throws(() => setupDisposition(...args), /requires/);
  assert.equal(setupDisposition('first-chat', false, undefined), 'dismiss');
});


function fixture() {
  const events = [], settings = { modelConfigured: false, theme: 'system', memory: false };
  const t = { appearanceEnabled: true, app: { pid: 711 }, assert,
    ax: { pid: 711, windows: async () => [{ id: 73, layer: 0, width: 810, height: 700 }],
      waitFor: async (selector, state) => events.push(['wait', selector.name, state]), click: async selector => events.push(['click', selector.name]),
      dump: async () => ({ current: 'controlled source fixture only' }) },
    rpc: async method => method === 'settings.get' ? { ...settings } : [],
    capture: async (name, options) => events.push(['capture', name, options]),
    step: async (_name, _options, effect) => effect() };
  return { t, events, settings };
}

test('actual disclosure helper drives only tips and navigation, with original window-bound capture states', async () => {
  const { t, events } = fixture();
  await run(t);
  assert.equal(run, captureSetupDisclosures);
  assert.deepEqual(events.filter(row => row[0] === 'capture').map(row => row[1]),
    ['setup-welcome', 'setup-welcome-tips-expanded', 'setup-welcome-tips-collapsed', 'setup-model-data-unreviewed', 'setup-permissions-ungranted', 'setup-permissions-details-expanded', 'setup-permissions-details-collapsed']);
  for (const row of events.filter(row => row[0] === 'capture')) assert.equal(row[2].windowId, 73);
  assert.deepEqual(events.filter(row => row[0] === 'click').map(row => row[1]),
    ['Setup tips', 'Setup tips', '3. model', '6. permissions', 'How permissions and browsing work', 'How permissions and browsing work', '1. welcome']);
  assert.deepEqual(journey.launch, {});
});

test('actual disclosure helper refuses configured model, page/run creation and changed settings', async () => {
  for (const mutation of ['model', 'page', 'run', 'settings']) {
    const { t, settings } = fixture();
    if (mutation === 'model') settings.modelConfigured = true;
    if (mutation === 'page' || mutation === 'run') {
      const rpc = t.rpc; t.rpc = async method => method === (mutation === 'page' ? 'pages.list' : 'runs.list') ? [{ id: 'foreign' }] : rpc(method);
    }
    if (mutation === 'settings') { const click = t.ax.click; t.ax.click = async selector => { settings.memory = true; return click(selector); }; }
    await assert.rejects(run(t), /genuinely|browser page|chat run|change model/);
  }
});

test('capture refuses original owner retirement and ambiguous native inventory', async () => {
  for (const mutation of ['retired', 'ambiguous']) {
    const { t } = fixture();
    t.ax.windows = async () => {
      if (mutation === 'retired') t.app.pid++;
      return [{ id: 73, layer: 0, width: 810, height: 700 }, ...(mutation === 'ambiguous' ? [{ id: 74, layer: 0, width: 810, height: 700 }] : [])];
    };
    await assert.rejects(run(t), /owner changed|exactly one/);
  }
});

test('runner keeps setup outside functional registry and only retains admitted appearance scope', () => {
  const runner = readFileSync(new URL('./run-journey.mjs', import.meta.url), 'utf8');
  assert.match(runner, /setupDisposition\(journey.id, Boolean\(values.appearance\), appearancePair\)/);
  const registry = readFileSync(new URL('./journeys/index.mjs', import.meta.url), 'utf8');
  assert.ok(!registry.includes(SETUP_APPEARANCE_ID));
});

test('permission captures require all five genuinely observed policy states before each capture', async () => {
  for (const state of ['visible', 'absent']) {
    const {t, events}=fixture(),wait=t.ax.waitFor;
    t.ax.waitFor=async (selector, requested)=> {
      if (selector.name.startsWith('Browser tasks use') && requested===state) throw new Error('Original policy readiness refused');
      return wait(selector,requested);
    };
    await assert.rejects(run(t),/policy readiness refused/);
    assert.ok(!events.some(row=>row[0]==='capture' && row[1]==='setup-permissions-details-expanded'));
    assert.ok(!events.some(row=>row[0]==='capture' && row[1]==='setup-permissions-details-collapsed'));
  }
});

test('permission disclosure changes cannot be captured as ungranted after settings drift', async () => {
  const {t,events,settings}=fixture(),click=t.ax.click;
  t.ax.click=async selector=> {
    const result=await click(selector);
    if(selector.name==='How permissions and browsing work') settings.memory=true;
    return result;
  };
  await assert.rejects(run(t),/change model, theme or permissions/);
  assert.ok(!events.some(row=>row[0]==='capture' && row[1]==='setup-permissions-details-expanded'));
});
