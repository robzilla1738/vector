import assert from 'node:assert/strict';
import { captureHomeState } from './home-capture.mjs';

/** Observe the existing genuine Ask refusal; no extra failure, focus or input action. */
export async function captureCommandRefusalAppearance(t, { field, prompt, pages }) {
  if (!t.appearanceEnabled) return { status: 'not-requested' };
  const app = t.app, ax = t.ax, pid = app.pid;
  const stable = () => assert.ok(t.app === app && t.ax === ax && Number.isInteger(pid) && pid > 0 && app.pid === pid && ax.pid === pid && !t.signal?.aborted, 'Original command appearance owner retired');
  stable();
  const inventory = async () => {
    const windows = (await ax.windows()).filter(window => window.layer === 0 && window.width > 0 && window.height > 0);
    stable(); assert.equal(windows.length, 1); assert.ok(Number.isInteger(windows[0].id) && windows[0].id > 0); return windows[0].id;
  };
  const windowId = await inventory();
  const workspace = await t.rpc('workspace.get'); stable();
  const settings = await t.rpc('settings.get'); stable();
  assert.equal(settings.modelConfigured, false, 'Original refusal must have an actually unavailable model');
  const check = async () => {
    stable();
    const input = await ax.query(field); stable();
    assert.equal(input.length, 1); assert.equal(input[0].value, prompt); assert.equal(input[0].focused, true);
    assert.match(JSON.stringify(await ax.dump({ scope: 'shell' })), /Ask is unavailable/); stable();
    assert.deepEqual(await t.rpc('pages.list'), pages); stable();
    assert.deepEqual(await t.rpc('runs.list'), [], 'Refused Ask must not create a run'); stable();
    assert.deepEqual(await t.rpc('workspace.get'), workspace); stable();
    assert.deepEqual(await t.rpc('settings.get'), settings); stable();
    assert.equal(await inventory(), windowId);
  };
  await check();
  const capture = await captureHomeState(t, 'command-ask-unavailable-retained-focused', 'command-ask-unavailable-retained-prompt-focused');
  await check();
  return { status: 'observed', capture };
}
