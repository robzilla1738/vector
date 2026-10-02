import assert from 'node:assert/strict';
import { fixturePage } from './fixture.mjs';

export function installTrustPages(fixture) {
  fixture.route('/l10/mentions/a', fixturePage('Aux mention A', '<p>A-only evidence: violet-271.</p><a href="/l10/mentions/replaced">Replace A document</a>'));
  fixture.route('/l10/mentions/b', fixturePage('Aux mention B', '<p>B-only evidence: amber-839.</p>'));
  fixture.route('/l10/mentions/replaced', fixturePage('Aux replacement A', '<p>A was replaced by the person.</p>'));
  let logins = 0, deletes = 0;
  fixture.route('/l10/trust/login-action', () => ({ accepted: ++logins }), { method: 'POST', headers: { 'content-type': 'application/json' } });
  fixture.route('/l10/trust/delete-action', () => ({ deleted: ++deletes }), { method: 'POST', headers: { 'content-type': 'application/json' } });
  fixture.route('/l10/trust/account', fixturePage('Aux synthetic account', `<form id="login" action="/l10/trust/login-action" method="post"><label>Synthetic username<input autocomplete="username"></label><label>Synthetic password<input type="password" autocomplete="current-password"></label></form><button form="login" type="submit">Sign in</button><button id="delete" type="button">Delete synthetic item</button><output id="status">Synthetic account ready</output><script>document.querySelector('#login').addEventListener('submit', async event => { event.preventDefault(); const response = await fetch('/l10/trust/login-action', { method: 'POST' }); const result = await response.json(); document.querySelector('#status').textContent = 'Sign in confirmed synthetic login ' + result.accepted; });document.querySelector('#delete').addEventListener('click', async () => { const response = await fetch('/l10/trust/delete-action', { method: 'POST' }); const result = await response.json(); document.querySelector('#status').textContent = 'Delete confirmed synthetic item ' + result.deleted; });</script>`));
  return { logins: () => logins, deletes: () => deletes };
}
export function tool(name, input, id = 'l10-tool') {
  return { tool_calls: [{ id, type: 'function', function: { name, arguments: JSON.stringify(input) } }] };
}
export function objects(payload) {
  const found = [];
  function visit(value) {
    if (typeof value === 'string') { try { visit(JSON.parse(value)); } catch {} return; }
    if (!value || typeof value !== 'object') return;
    found.push(value);
    for (const child of Object.values(value)) visit(child);
  }
  for (const message of payload.messages) visit(message.content);
  return found;
}
export function observations(payload) {
  return objects(payload).flatMap(value => {
    if (!Number.isInteger(value.revision)) return [];
    const text = value.text ?? value.content?.text;
    if (typeof text !== 'string') return [];
    const pageId = value.pageId ?? text.match(/^page: (.+)$/m)?.[1];
    return pageId ? [{ pageId, text, observationId: value.observationId, revision: value.revision }] : [];
  });
}
export async function configureModel(t) {
  await t.rpc('settings.set', { modelProvider: 'openai-compatible', compatibleEndpoint: t.model.endpoint, plannerModel: t.model.model });
}
export async function newChat(t) {
  const create = { role: 'AXButton', name: 'New chat', match: 'exact', scope: 'shell', index: 0 };
  if (!(await t.ax.query(create)).length) {
    const sidebar = { role: 'AXButton', name: 'Show sidebar', match: 'exact', scope: 'shell', index: 0 };
    if ((await t.ax.query(sidebar)).length) await t.ax.press(sidebar);
    const chats = { role: 'AXButton', name: 'Chats', match: 'exact', scope: 'shell', index: 0 };
    await t.ax.waitFor(chats); await t.ax.press(chats);
  }
  await t.ax.waitFor(create); await t.ax.press(create);
  await t.ax.waitFor({ name: 'Reply to conversation', match: 'exact', scope: 'shell', index: 0 });
}
export async function mentionedRun(t, title, text, interact = false) {
  const old = new Set((await t.rpc('runs.list')).map(run => run.runId));
  await newChat(t);
  const composer = { name: 'Reply to conversation', match: 'exact', scope: 'shell', index: 0 };
  await t.ax.type(`@${title}${interact ? ' · interact' : ''}`, composer);
  await t.ax.waitFor({ name: 'Mention a source', match: 'exact', scope: 'shell', index: 0 });
  await t.ax.key('enter', 'hid');
  await t.ax.waitFor({ name: 'Mention a source', match: 'exact', scope: 'shell', index: 0 }, 'absent');
  await t.ax.type(` ${text}`, composer);
  await t.ax.press({ role: 'AXButton', name: 'Send message', match: 'exact', scope: 'shell', index: 0 });
  return t.until('the mentioned run exists', async () => (await t.rpc('runs.list')).find(run => !old.has(run.runId)), 30_000);
}
export async function finished(t, runId) {
  return t.until('the real run completes', async () => {
    const details = await t.rpc('runs.get', { runId });
    assert.notEqual(details.run.status, 'failed', details.run.statusMessage);
    return details.run.status === 'completed' && details;
  }, 30_000);
}
