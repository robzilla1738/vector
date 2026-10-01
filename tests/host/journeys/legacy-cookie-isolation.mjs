import { shell, loadedPage, press } from '../fixtures/legacy-ui.mjs';

export const journey = { id: 'cookie-isolation', title: 'Preserve human cookies while protected requests and responses refuse ambient cookie access', features: ['sitePermissions'], devAcceptance: ['sitePermissions'], needs: ['accessibility', 'screen-recording'], model: 'loopback', launch: { env: { AUX_RUN_ENGINE: 'agent-loop', AUX_EGRESS_DIAGNOSTIC: '1' } }, timeoutMs: 120000, owner: 'LJ' };
export async function run(t) {
  const received = [];
  let humanSeeded = false;
  let responseFinished = false;
  let checkFinished = false;
  const cookieFlags = request => ({ human: String(request.headers.cookie ?? '').includes('aux_human_fixture=1'), protectedResponse: String(request.headers.cookie ?? '').includes('aux_protected_response=1') });
  t.fixture.route('/human-cookie', (_request, response) => {
    if (!humanSeeded) response.setHeader('set-cookie', 'aux_human_fixture=1; Path=/; SameSite=Lax');
    humanSeeded = true;
    return '<!doctype html><title>Human cookie fixture</title><h1>Human cookie fixture</h1><button onclick="fetch(\'/human-cookie-check\').then(()=>document.querySelector(\'output\').textContent=\'Human control finished\')">Check human cookie</button><output>Waiting for human control</output>';
  });
  t.fixture.route('/human-cookie-check', request => { received.push({ phase: 'human', ...cookieFlags(request) }); return 'human control'; });
  t.fixture.route('/protected-cookie', '<!doctype html><title>Protected cookie fixture</title><h1>Protected cookie fixture</h1><button onclick="fetch(\'/protected-cookie-response\',{credentials:\'include\'}).then(()=>fetch(\'/protected-cookie-check\',{credentials:\'include\'})).then(()=>document.querySelector(\'output\').textContent=\'Protected fixture finished\')">Protected cookie request</button><output>Waiting for protected request</output>');
  t.fixture.route('/protected-cookie-response', (request, response) => {
    received.push({ phase: 'protected-response', ...cookieFlags(request) });
    response.setHeader('set-cookie', 'aux_protected_response=1; Path=/; SameSite=Lax');
    response.once('finish', () => { responseFinished = true; });
    return 'protected response';
  });
  t.fixture.route('/protected-cookie-check', (request, response) => {
    received.push({ phase: 'protected-check', ...cookieFlags(request) });
    response.once('finish', () => { checkFinished = true; });
    return 'protected check';
  });
  await t.rpc('settings.set', { modelProvider: 'openai-compatible', compatibleEndpoint: t.model.endpoint, plannerModel: t.model.model });
  await t.step('human native navigation stores the HTTP fixture cookie and sends it to the receiver', { kind: 'ui', features: ['sitePermissions'] }, async () => {
    const page = await loadedPage(t, '/human-cookie');
    await press(t, { name: 'Check human cookie', role: 'AXButton', match: 'exact', scope: 'page', index: 0 });
    await t.until('human cookie reaches disposable receiver', () => received.some(item => item.phase === 'human' && item.human));
    t.assert.ok(received.filter(item => item.phase === 'human').every(item => !item.protectedResponse));
    const ax = await t.ax.dump({ scope: 'page' });
    const rpc = await t.rpc('pages.observe', { pageId: page.pageId });
    await t.capture('cookie-human-positive');
    return { ax, rpc: { page: rpc, received: structuredClone(received) } };
  });
  const protectedPage = await loadedPage(t, '/protected-cookie');
  t.model.respond(async (payload, count) => {
    t.assert.ok(Array.isArray(payload.tools), 'The supported agent-loop fixture request must declare its tools');
    const names = (payload.tools ?? []).map(tool => tool.function?.name);
    if (count === 1) {
      t.assert.ok(names.includes('goal_program'));
      return { tool_calls: [{ id: 'cookie_fixture_click', type: 'function', function: { name: 'goal_program', arguments: JSON.stringify({ code: "page.clickByName('Protected cookie request', 'button');\nif(false) submitResult('fixture continues');", answerLabel: '', deadlineMs: 30000 }) } }] };
    }
    await t.until('protected fixture response and follow-up both finish', () => responseFinished && checkFinished, 30000);
    return { tool_calls: [{ id: 'cookie_fixture_finish', type: 'function', function: { name: 'repl', arguments: JSON.stringify({ code: "submitResult('Disposable cookie boundary verified');", deadlineMs: 30000, yieldTimeMs: 30000 }) } }] };
  });
  let run;
  try {
    await t.step('normal run authority admits same-origin fixture requests without sending or storing protected cookies', { kind: 'rpc', features: ['sitePermissions'] }, async () => {
      run = await t.rpc('runs.start', { goal: 'Press only Protected cookie request on the disposable fixture, then report completion.', pageId: protectedPage.pageId, maxSteps: 4, maxModelCalls: 4, deadlineMs: 60000 });
      let latest;
      try { await t.until('protected requests complete through normal native confirmation', async () => {
        const allow = shell('Allow', 'AXButton');
        if ((await t.ax.query(allow)).length) await press(t, allow);
        const state = latest = await t.rpc('runs.get', { runId: run.runId });
        if (['failed', 'cancelled'].includes(state.run.status)) throw new Error(`Fixture run ${state.run.status}: ${state.run.error ?? state.run.statusMessage ?? ''}; fixture errors: ${JSON.stringify(t.model.errors)}`);
        return responseFinished && checkFinished;
      }, 60000); } catch (error) {
        throw new Error(`${error.message}; normal run diagnostics: ${JSON.stringify({ status: latest?.run.status, statusMessage: latest?.run.statusMessage, error: latest?.run.error, suspension: latest?.suspension, transcript: latest?.transcript, steps: latest?.steps, modelCalls: latest?.modelCalls, fixtureCalls: t.model.calls.map(call => ({ stream: call.stream, tools: call.tools?.map(tool => tool.function?.name) })), fixtureErrors: t.model.errors, received }).slice(0, 12000)}`);
      }
      const protectedRequests = received.filter(item => item.phase.startsWith('protected-'));
      t.assert.equal(protectedRequests.length, 2, 'Both admitted protected requests must reach the actual receiver');
      t.assert.ok(protectedRequests.every(item => !item.human && !item.protectedResponse), 'Protected requests cannot send human or protected-response cookies');
      const nativeReceipts = t.app.log.split('\n').filter(line => /AUX_EGRESS.*kind=subresource.*phase=send/.test(line));
      t.assert.ok(nativeReceipts.some(line => /outcome=admitted.*reason=same_origin/.test(line)), 'Native receipt must admit the same-origin protected request');
      const ax = await t.ax.dump({ scope: 'any' });
      const rpc = await t.rpc('runs.get', { runId: run.runId });
      await t.capture('cookie-protected-boundary');
      return { ax, rpc: { run: rpc, received: structuredClone(received), nativeReceipts } };
    });
  } finally { if (run) await t.rpc('runs.cancel', { runId: run.runId }); }
  await t.step('fresh human document retains its cookie and never receives the protected response cookie', { kind: 'ui', features: ['sitePermissions'] }, async () => {
    const before = received.length;
    const page = await loadedPage(t, '/human-cookie');
    await press(t, { name: 'Check human cookie', role: 'AXButton', match: 'exact', scope: 'page', index: 0 });
    await t.until('final human cookie receiver', () => received.length > before);
    const final = received.slice(before);
    t.assert.equal(final.length, 1);
    t.assert.deepEqual(final[0], { phase: 'human', human: true, protectedResponse: false });
    const ax = await t.ax.dump({ scope: 'page' });
    const rpc = await t.rpc('pages.observe', { pageId: page.pageId });
    await t.capture('cookie-human-restored');
    return { ax, rpc: { page: rpc, received: final } };
  });
}
