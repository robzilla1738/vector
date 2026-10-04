import assert from 'node:assert/strict';
import { captureHomeState } from './home-capture.mjs';
export const MODEL_DISCOVERY_APPEARANCE_ID = 'model-discovery-appearance';
export const discoveryModel = 'aux-owned-discovered-model';
const route = '/appearance-model-discovery/v1/models';
const shell = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell' });
const composer = shell('Reply to conversation', 'AXTextArea');
export function requireModelDiscoveryAppearance({ journeyId, appearance, pair }) {
  assert.equal(journeyId, MODEL_DISCOVERY_APPEARANCE_ID); assert.equal(appearance, true); assert.ok(pair, 'Original admitted appearance pair required');
}
/** No timer or renderer injection: the original GET remains pending until explicitly released. */
export function holdModelDiscovery(fixture, signal) {
  assert.ok(signal instanceof AbortSignal && !signal.aborted);
  let release; const gate = new Promise(resolve => { release = resolve; });
  const receipts = []; let released = false, cancelled = false;
  const cancel = () => { cancelled = true; release(); };
  assert.equal(typeof fixture.claimRoute, 'function', 'Original route ownership capability required');
  const lease = fixture.claimRoute(route, async (request, response) => {
    assert.ok(lease.current(), 'Original discovery route owner retired');
    assert.equal(request.method, 'GET'); assert.equal(request.url, route); assert.equal(receipts.length, 0, 'Discovery is one original request');
    const receipt = { method: request.method, path: request.url, status: 200, state: 'pending' }; receipts.push(receipt);
    const disconnect = () => { if (!response.writableEnded) { receipt.state = 'disconnected'; cancel(); } };
    response.once('close', disconnect);
    await gate;
    if (!lease.current() || cancelled || signal.aborted) { receipt.state = 'cancelled'; response.destroy(); return; }
    receipt.state = 'released'; response.once('finish', () => { receipt.state = 'delivered'; });
    return { data: [{ id: discoveryModel }] };
  }, { headers: { 'content-type': 'application/json' } });
  signal.addEventListener('abort', cancel, { once: true });
  return { endpoint: `${fixture.url}/appearance-model-discovery/v1`, receipts,
    requirePending() { assert.ok(lease.current()); assert.ok(!released && !cancelled && receipts.length === 1 && receipts[0].state === 'pending', 'Original discovery response is no longer pending'); },
    release() { assert.ok(lease.current()); assert.ok(!cancelled && !released); released = true; release(); },
    dispose() { cancel(); signal.removeEventListener('abort', cancel); lease.remove(); },
  };
}
export async function captureModelDiscoveryAppearance(t) {
  assert.equal(t.appearanceEnabled, true);
  const app = t.app, ax = t.ax, fixture = t.fixture, model = t.model, calls = model.calls, pid = app.pid;
  const processOwner = structuredClone(app.processObservation);
  assert.equal(processOwner.pid, pid); assert.ok(Number.isSafeInteger(processOwner.generation) && processOwner.generation > 0);
  assert.equal(processOwner.launchKind, 'child'); assert.deepEqual(calls, []);
  const stable = () => assert.ok(t.app === app && t.ax === ax && t.fixture === fixture && t.model === model && model.calls === calls && app.pid === pid && ax.pid === pid && Number.isInteger(pid) && pid > 0 && !t.signal.aborted, 'Original discovery owner retired');
  const live = () => { stable(); assert.deepEqual(app.processObservation, processOwner, 'Original discovery process generation changed'); assert.deepEqual(calls, [], 'Discovery appearance cannot call the model'); };
  const owned = async action => { live(); const value = await action(); live(); return value; };
  assert.equal((await owned(() => ax.query(shell('Search settings', 'AXTextField')))).length, 0, 'Discovery fixture begins with Settings closed');
  const settings = await owned(() => t.rpc('settings.get')), pages = await owned(() => t.rpc('pages.list')), runs = await owned(() => t.rpc('runs.list')), workspace = await owned(() => t.rpc('workspace.get'));
  assert.deepEqual(pages, []); assert.deepEqual(runs, []); assert.equal(settings.modelProvider, 'openai-compatible', 'Original model fixture must already own compatible provider configuration'); assert.equal(settings.modelProbe, undefined, 'A saved connection probe cannot be erased by appearance preparation');
  const inputs = await owned(() => ax.query(composer)); assert.equal(inputs.length, 1); const draft = inputs[0].value; assert.equal(typeof draft, 'string');
  const windows = (await owned(() => ax.windows())).filter(row => row.layer === 0 && row.width > 0 && row.height > 0); assert.equal(windows.length, 1); const windowId = windows[0].id; assert.ok(Number.isInteger(windowId) && windowId > 0);
  assert.equal(typeof settings.compatibleEndpoint, 'string'); assert.equal(typeof settings.plannerModel, 'string'); const restore = { compatibleEndpoint: settings.compatibleEndpoint };
  const http = holdModelDiscovery(t.fixture, t.signal); let changed = false, opened = false, primary, result; const debts = [];
  const unchanged = async () => {
    assert.deepEqual(await owned(() => t.rpc('pages.list')), pages); assert.deepEqual(await owned(() => t.rpc('runs.list')), runs); assert.deepEqual(await owned(() => t.rpc('workspace.get')), workspace);
    const current = await owned(() => t.rpc('settings.get')); assert.equal(current.modelProvider, 'openai-compatible'); assert.equal(current.compatibleEndpoint, http.endpoint); assert.equal(current.plannerModel, settings.plannerModel);
    const observed = (await owned(() => ax.windows())).filter(row => row.layer === 0 && row.width > 0 && row.height > 0); assert.equal(observed.length, 1); assert.equal(observed[0].id, windowId);
  };
  try {
    changed = true; await owned(() => t.rpc('settings.set', { compatibleEndpoint: http.endpoint }));
    opened = true; await owned(() => ax.key('command+,', 'hid')); await owned(() => ax.press(shell('Models', 'AXButton')));
    await owned(() => t.until('original discovery GET reached owned loopback', () => http.receipts.length === 1));
    await owned(() => ax.waitFor(shell('Discovering…', 'AXButton'))); const loading = await owned(() => ax.query(shell('Discovering…', 'AXButton'))); assert.equal(loading.length, 1); assert.equal(loading[0].enabled, false);
    http.requirePending(); await unchanged(); await owned(() => captureHomeState(t, 'provider-model-discovery-pending', 'provider-model-discovery-real-http-pending')); http.requirePending(); await unchanged();
    http.release(); await owned(() => ax.waitFor(shell('Discover models', 'AXButton'))); assert.equal((await owned(() => ax.query(shell('Discover models', 'AXButton'))))[0]?.enabled, true);
    await owned(() => t.until('original model response actually delivered', () => http.receipts[0].state === 'delivered'));
    const planner = shell('Planner model', 'AXComboBox'); await owned(() => ax.focus(planner)); const modelInput = await owned(() => ax.query(planner)); assert.equal(modelInput.length, 1); assert.equal(modelInput[0].focused, true); assert.equal(modelInput[0].value, settings.plannerModel);
    await unchanged(); await owned(() => captureHomeState(t, 'provider-model-discovery-released-focused', 'provider-model-discovery-released-planner-focused')); await unchanged();
    result = { ax: await owned(() => ax.dump()), rpc: { settings: await owned(() => t.rpc('settings.get')), pages, runs, workspace }, http: http.receipts, unknownAvailability: { status: 'unproven', reason: 'Configured IDs are merged into the real catalog; editable datalist is not an unknown-model availability witness' } };
  } catch (error) { primary = error; }
  finally {
    try { http.dispose(); } catch (error) { debts.push(error); }
    if (opened) try { if ((await owned(() => ax.query(shell('Search settings', 'AXTextField')))).length) { await owned(() => ax.key('escape', 'hid')); await owned(() => ax.waitFor(shell('Search settings', 'AXTextField'), 'absent')); } } catch (error) { debts.push(error); }
    if (changed) try { await owned(() => t.rpc('settings.set', restore)); await owned(() => t.until('exact original model settings restored', async () => { assert.deepEqual(await t.rpc('settings.get'), settings); return true; })); } catch (error) { debts.push(error); }
    try { assert.deepEqual(await owned(() => t.rpc('pages.list')), pages); assert.deepEqual(await owned(() => t.rpc('runs.list')), runs); assert.deepEqual(await owned(() => t.rpc('workspace.get')), workspace); const current = await owned(() => ax.query(composer)); assert.equal(current.length, 1); assert.equal(current[0].value, draft); await owned(() => ax.focus(composer)); assert.equal((await owned(() => ax.query(composer)))[0]?.focused, true); } catch (error) { debts.push(error); }
  }
  if (debts.length) throw new AggregateError([primary, ...debts].filter(Boolean), 'Model discovery or original restoration unresolved');
  if (primary) throw primary; return result;
}
