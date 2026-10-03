import { capturePermissionState } from '../lib/permission-state-capture.mjs';
import { configureModel, finished, installTrustPages, mentionedRun, objects, observations, tool } from '../lib/l10-trust-fixtures.mjs';
export const journey = {
  id: 'agent-site-permissions', title: 'Preapprove synthetic login, still confirm delete, and revoke through Agents settings', features: ['agentSitePermissions'],
  devAcceptance: ['agentSitePermissions', 'tabMentions'], needs: ['accessibility', 'screen-recording'], model: 'loopback', launch: {}, timeoutMs: 180_000, owner: 'L10 Agent trust',
};
export async function run(t) {
  const fixture = installTrustPages(t.fixture); await configureModel(t);
  const readEffects = () => ({ logins: fixture.logins(), deletes: fixture.deletes() });
  const capture = (name, state, logins) => capturePermissionState(t, name, state, readEffects, { logins, deletes: 0 });
  const account = await t.rpc('pages.open', { url: `${t.fixture.url}/l10/trust/account`, activate: true });
  await t.until('the synthetic account is attached', async () => (await t.rpc('pages.list')).some(page => page.pageId === account.pageId && page.sessionId && !page.loading));
  function modelForLogin(target) {
    t.model.respond(payload => {
      if (!payload.tools?.length) return { content: 'Aux synthetic sign in' };
      if (objects(payload).some(value => value.status === 'confirmed' && typeof value.intentId === 'string')) {
        const latest = observations(payload).at(-1);
        t.assert.ok(latest, 'A successful write needs its real observed evidence');
        return tool('submit_result', { report: `Sign in confirmed synthetic login ${target}`, citations: [{ pageId: account.pageId, revision: latest.revision, observationId: latest.observationId, quote: `Sign in confirmed synthetic login ${target}` }] }, `l10-login-${target}-finish`);
      }
      if (fixture.logins() >= target) {
        const latest = observations(payload).at(-1);
        const quote = latest?.text.split('\n').find(line => line.includes(`Sign in confirmed synthetic login ${target}`));
        if (!latest || !quote) return tool('snapshot', {}, `l10-login-${target}-evidence`);
        return tool('reconcile_action', { citation: { pageId: account.pageId, revision: latest.revision, observationId: latest.observationId, quote }, effect: `The observed sign-in confirmation records synthetic login ${target}.` }, `l10-login-${target}-reconcile`);
      }
      const code = `page.clickByName("Sign in", "button"); const observed = snapshot(); display(observed); submitResult("Sign in confirmed synthetic login ${target}", [{ pageId: ${JSON.stringify(account.pageId)}, revision: observed.revision, observationId: observed.observationId, quote: "Sign in confirmed synthetic login ${target}" }]);`;
      return tool('goal_program', { code, answerLabel: '' }, `l10-login-${target}-act`);
    });
  }
  let first;
  await t.step('approve the first actual agent login for this origin', { kind: 'ui', features: ['agentSitePermissions'] }, async () => {
    modelForLogin(1); first = await mentionedRun(t, 'Aux synthetic account', 'Press Sign in without entering either synthetic field.', true);
    const always = { role: 'AXButton', name: `Always allow on ${new URL(t.fixture.url).host}`, match: 'exact', scope: 'shell', index: 0 };
    await t.ax.waitFor(always);
    t.assert.equal(fixture.logins(), 0, 'No login may execute before the person grants consent');
    await capture('site-login-first-approval', 'site-login-first-approval', 0); await t.ax.press(always);
    const details = await finished(t, first.runId);
    t.assert.equal(fixture.logins(), 1);
    return { ax: await t.ax.dump(), rpc: details };
  });
  await t.step('repeat login in a new run without another sheet', { kind: 'ui', features: ['agentSitePermissions'] }, async () => {
    const outsiderDenials = [];
    for (const [method, params] of [
      ['safety.originPolicies.set', { expectedRevision: 0, rules: [{ origin: new URL(t.fixture.url).origin, access: 'allow' }] }],
      ['safety.grants.revoke', { profileId: 'outside-profile' }],
    ]) await t.assert.rejects(() => t.rpc(method, params), error => {
      outsiderDenials.push({ method, code: error.code, message: error.message });
      return error.code === 'permission_denied';
    });
    modelForLogin(2);
    const next = await mentionedRun(t, 'Aux synthetic account', 'Press Sign in again without entering either synthetic field.', true);
    const details = await finished(t, next.runId);
    t.assert.equal(fixture.logins(), 2);
    t.assert.equal((await t.ax.query({ name: 'Allow this action', match: 'exact', scope: 'shell' })).length, 0);
    await capture('site-login-standing-consent', 'site-login-standing-consent', 2);
    return { ax: await t.ax.dump(), rpc: { ...details, outsiderDenials } };
  });
  await t.step('delete still requires a fresh sheet without Always allow', { kind: 'ui', features: ['agentSitePermissions'] }, async () => {
    t.model.respond(payload => {
      if (!payload.tools?.length) return { content: 'Aux synthetic deletion review' };
      if (JSON.stringify(payload.messages).includes('The user declined')) return tool('submit_result', { report: 'Delete was denied; no synthetic item was deleted.' }, 'l10-delete-refused');
      return tool('goal_program', { code: 'page.clickByName("Delete synthetic item", "button"); submitResult("Delete confirmed");', answerLabel: '' }, 'l10-delete-attempt');
    });
    const deletion = await mentionedRun(t, 'Aux synthetic account', 'Delete the synthetic item only after permission.', true);
    await t.ax.waitFor({ name: 'Allow this action', match: 'exact', scope: 'shell', index: 0 });
    t.assert.equal((await t.ax.query({ name: '^Always allow on ', match: 'regex', scope: 'shell' })).length, 0);
    t.assert.equal(fixture.deletes(), 0);
    await capture('site-delete-always-confirm', 'site-delete-always-confirm', 2);
    await t.ax.press({ role: 'AXButton', name: 'Deny', match: 'exact', scope: 'shell', index: 0 });
    const details = await finished(t, deletion.runId);
    t.assert.equal(fixture.deletes(), 0);
    t.assert.match(JSON.stringify(details.transcript), /Delete was denied; no synthetic item was deleted\./);
    await capture('site-delete-denied-no-effect', 'site-delete-denied-no-effect', 2);
    return { ax: await t.ax.dump(), rpc: details };
  });
  await t.step('revoke the exact origin grant through Agents settings', { kind: 'ui', features: ['agentSitePermissions'] }, async () => {
    await t.ax.key('command+,', 'hid');
    await t.ax.waitFor({ role: 'AXButton', name: 'Agents', match: 'exact', scope: 'shell', index: 0 });
    await t.ax.press({ role: 'AXButton', name: 'Agents', match: 'exact', scope: 'shell', index: 0 });
    const site = { name: new URL(t.fixture.url).origin, match: 'exact', scope: 'shell', index: 0 };
    await t.ax.waitFor(site); await t.ax.press(site);
    const revoke = { role: 'AXButton', name: `Revoke login on ${new URL(t.fixture.url).origin}`, match: 'exact', scope: 'shell', index: 0 };
    await t.ax.waitFor(revoke); await t.ax.press(revoke); await t.ax.waitFor(revoke, 'absent');
    await capture('site-login-revoked', 'site-login-revoked', 2); await t.ax.key('escape', 'hid');
    return { ax: await t.ax.dump(), rpc: { logins: fixture.logins(), deletes: fixture.deletes() } };
  });
  await t.step('the next login asks again and external settings cannot replace origin policy', { kind: 'ui', features: ['agentSitePermissions'] }, async () => {
    modelForLogin(3);
    const next = await mentionedRun(t, 'Aux synthetic account', 'Review another synthetic Sign in after revocation.', true);
    await t.ax.waitFor({ name: `Always allow on ${new URL(t.fixture.url).host}`, match: 'exact', scope: 'shell', index: 0 });
    t.assert.equal(fixture.logins(), 2);
    await t.assert.rejects(() => t.rpc('settings.set', { originPolicies: [{ origin: t.fixture.url, access: 'allow' }] }), error => error.code === 'permission_denied');
    await capture('site-login-reapproval', 'site-login-reapproval', 2);
    await t.ax.press({ role: 'AXButton', name: 'Deny', match: 'exact', scope: 'shell', index: 0 });
    await t.rpc('runs.cancel', { runId: next.runId });
    t.assert.equal(fixture.logins(), 2); t.assert.equal(fixture.deletes(), 0); t.assert.equal(t.model.errors.length, 0);
    return { ax: await t.ax.dump(), rpc: await t.rpc('runs.get', { runId: next.runId }) };
  });
}
