import assert from 'node:assert/strict';
import { captureHomeState } from './home-capture.mjs';

const shell = name => ({ name, match: 'exact', scope: 'shell', index: 0 });
const composer = shell('Reply to conversation');
const disclosure = shell('Error details');
const categoryLabels = { configuration: 'Configuration', authentication: 'Authentication', quota: 'Usage limit', rate_limit: 'Rate limit', network: 'Network', timeout: 'Timeout', provider: 'Provider', model_output: 'Model response', capability: 'Capability', permission: 'Permission', unknown: 'Run' };
const question = 'Explain the owned loopback provider availability without reading or opening a page.';
const route = '/appearance-provider-failure/v1/chat/completions';

/** Actual HTTP error response, not a thrown model mock or injected renderer failure. */
export function installFailedTurnHttpRoute(fixture) {
  const receipts = [];
  const remove = fixture.route(route, async request => {
    let body = '';
    for await (const chunk of request) { body += chunk.toString(); assert.ok(Buffer.byteLength(body) <= 1024 * 1024); }
    const payload = JSON.parse(body); assert.ok(Array.isArray(payload.messages));
    receipts.push({ method: request.method, path: request.url, request: payload, status: 503 });
    return { error: { message: 'Owned loopback provider temporarily unavailable', type: 'service_unavailable', code: 'aux_owned_503' } };
  }, { method: 'POST', status: 503, headers: { 'content-type': 'application/json' } });
  return { receipts, remove, endpoint: `${fixture.url}/appearance-provider-failure/v1` };
}

export async function captureFailedTurnDetailsAppearance(t) {
  if (!t.appearanceEnabled) return { status: 'not-requested' };
  const app = t.app, ax = t.ax, pid = app.pid;
  const stable = () => assert.ok(t.app === app && t.ax === ax && Number.isInteger(pid) && pid > 0 && app.pid === pid && ax.pid === pid && !t.signal?.aborted, 'Failed-turn original owner retired');
  stable();
  const settings = await t.rpc('settings.get'); stable();
  const restore = {};
  for (const key of ['modelProvider', 'compatibleEndpoint', 'plannerModel']) { assert.equal(typeof settings[key], 'string'); restore[key] = settings[key]; }
  const pages = await t.rpc('pages.list'), workspace = await t.rpc('workspace.get'), beforeRuns = await t.rpc('runs.list'); stable();
  const input = await ax.query(composer); stable(); assert.equal(input.length, 1); assert.equal(typeof input[0].value, 'string');
  const originalDraft = input[0].value;
  const ids = new Set(beforeRuns.map(run => run.runId));
  const originalWindows = (await ax.windows()).filter(window => window.layer === 0 && window.width > 0 && window.height > 0);
  assert.equal(originalWindows.length, 1); const windowId = originalWindows[0].id; assert.ok(Number.isInteger(windowId) && windowId > 0); stable();
  const http = installFailedTurnHttpRoute(t.fixture);
  let changedSettings = false, changedDraft = false, primary, result, started;
  const debts = [];
  const replaceDraft = async text => { stable(); const current = await ax.query(composer); stable(); assert.equal(current.length, 1); assert.ok([originalDraft, question, ""].includes(current[0].value), "A newer person draft must not be overwritten"); await ax.focus(composer); stable(); await ax.key('command+a', 'hid'); stable(); if (text) await ax.type(text, composer); else await ax.key('backspace', 'hid'); stable(); assert.equal((await ax.query(composer))[0]?.value, text); };
  try {
    changedSettings = true;
    await t.rpc('settings.set', { modelProvider: 'openai-compatible', compatibleEndpoint: http.endpoint, plannerModel: 'fixture-model' }); stable();
    const prepared = await t.rpc("settings.get"); stable();
    assert.equal(prepared.modelProvider, "openai-compatible"); assert.equal(prepared.compatibleEndpoint, http.endpoint); assert.equal(prepared.plannerModel, "fixture-model");
    changedDraft = true; await replaceDraft(question);
    await ax.press({ ...shell('Send message'), role: 'AXButton' }); stable();
    const failed = await t.until('original loopback HTTP503 turn is durably failed', async () => {
      stable(); const runs = await t.rpc('runs.list'); stable();
      const run = runs.find(item => !ids.has(item.runId) && item.goal === question);
      if (!run) return false;
      assert.equal(runs.filter(item => !ids.has(item.runId)).length, 1); assert.deepEqual(run.pageIds, []);
      started = run;
      if (run.status !== 'failed') return false;
      const detail = await t.rpc('runs.get', { runId: run.runId }); stable();
      return detail.run.status === 'failed' && detail.run.failure && detail.transcript?.items.some(item => item.kind === 'error') && detail;
    });
    assert.ok(http.receipts.some(row => row.request.messages.some(message => message.role === "user" && typeof message.content === "string" && message.content.includes(question))), "Original failed question must actually reach the owned HTTP route");
    assert.ok(http.receipts.length > 0); assert.ok(http.receipts.every(row => row.method === 'POST' && row.path === route && row.status === 503));
    assert.deepEqual(failed.run.pageIds, []); assert.equal(failed.run.goal, question);
    const diagnostic = failed.transcript.items.find(item => item.kind === 'error');
    assert.equal(diagnostic.message, failed.run.failure.message);
    assert.ok(categoryLabels[diagnostic.category]);
    const alert = shell(`${categoryLabels[diagnostic.category]} error`);
    await replaceDraft(originalDraft);
    await ax.waitFor(shell(question));
    await ax.waitFor(disclosure);
    assert.equal((await ax.query(alert)).length, 0, 'Recorded diagnostics must be genuinely collapsed before capture');
    const unchanged = async () => {
      stable(); assert.deepEqual(await t.rpc('pages.list'), pages); assert.deepEqual(await t.rpc('workspace.get'), workspace);
      const currentRuns = await t.rpc('runs.list'); assert.deepEqual(currentRuns.filter(run => ids.has(run.runId)), beforeRuns);
      assert.equal(currentRuns.filter(run => !ids.has(run.runId)).length, 1);
      assert.deepEqual(await t.rpc('runs.get', { runId: failed.run.runId }), failed);
      assert.equal((await ax.query(composer))[0]?.value, originalDraft);
      const windows = (await ax.windows()).filter(window => window.layer === 0 && window.width > 0 && window.height > 0);
      assert.equal(windows.length, 1); assert.equal(windows[0].id, windowId); stable();
    };
    await unchanged();
    await captureHomeState(t, 'failed-turn-error-details-collapsed', 'failed-turn-error-details-collapsed'); stable();
    await ax.focus(disclosure); await ax.key('space', 'hid');
    await ax.waitFor(alert); await ax.waitFor(shell(diagnostic.message));
    assert.equal((await ax.query(disclosure))[0]?.focused, true);
    await unchanged(); await captureHomeState(t, 'failed-turn-error-details-expanded-focused', 'failed-turn-error-details-expanded-focused'); stable();
    await ax.key('space', 'hid'); await ax.waitFor(alert, 'absent');
    assert.equal((await ax.query(disclosure))[0]?.focused, true);
    await unchanged(); await captureHomeState(t, 'failed-turn-error-details-collapsed-focused', 'failed-turn-error-details-collapsed-focused'); stable();
    result = { status: 'observed', failed, http: http.receipts, ax: await ax.dump(), rpc: { failed, pages } };
  } catch (error) { primary = error; }
  finally {
    if (primary && started && !["completed", "failed", "cancelled"].includes(started.status)) try {
      stable(); const current = await t.rpc('runs.get', { runId: started.runId }); stable();
      assert.equal(current.run.runId, started.runId); assert.equal(current.run.goal, question); assert.deepEqual(current.run.pageIds, []);
      if (!['completed', 'failed', 'cancelled'].includes(current.run.status)) {
        await t.rpc('runs.stop', { runId: started.runId }); stable();
        await t.until('original owned incomplete failure turn stopped', async () => { stable(); const stopped = await t.rpc('runs.get', { runId: started.runId }); return stopped.run.runId === started.runId && stopped.run.goal === question && ['completed', 'failed', 'cancelled'].includes(stopped.run.status); });
      }
    } catch (error) { debts.push(error); }
    if (changedSettings) try { stable(); await t.rpc('settings.set', restore); stable(); await t.until('original model settings restored', async () => { stable(); return JSON.stringify(await t.rpc('settings.get')) === JSON.stringify(settings); }); } catch (error) { debts.push(error); }
    if (changedDraft) try { await replaceDraft(originalDraft); assert.equal((await ax.query(composer))[0]?.focused, true); } catch (error) { debts.push(error); }
    try { http.remove(); } catch (error) { debts.push(error); }
  }
  if (debts.length) throw new AggregateError([primary, ...debts].filter(Boolean), 'Failed-turn appearance or original state restoration unresolved');
  if (primary) throw primary;
  return result;
}
