import assert from 'node:assert/strict';
import test from 'node:test';
import { dismissFreshSetup } from '../host/lib/dismiss-fresh-setup.mjs';
function fixture({ status = 'later', remains = false, clickFails = false } = {}) {
  const events = [];
  return { events, assert, async step(_name, _options, run) { return run(); },
    ax: {
      async waitFor(selector, state, timeout) { events.push(['wait', selector, state, timeout]); if (state === 'absent' && remains) throw new Error('Setup remains visible'); },
      async click(selector) { events.push(['click', selector]); if (clickFails) throw new Error('Native click refused'); },
      async dump() { return ['original AX observation']; },
    },
    async rpc(method) { events.push(['rpc', method]); return method === 'onboarding.get' ? { status, revision: 1 } : { activePageId: null }; },
  };
}
test('actual selector-bound click requires absent UI and actual saved later receipt', async () => {
  const t = fixture(); const result = await dismissFreshSetup(t);
  assert.equal(t.events[0][3], 15_000);
  assert.equal(t.events[1][0], 'click');
  assert.deepEqual(t.events[1][1], t.events[0][1]);
  assert.equal(t.events[2][2], 'absent');
  assert.equal(result.onboarding.status, 'later');
  assert.equal(result.rpc.activePageId, null);
});
test('successful click acknowledgement cannot bypass still-visible setup', async () => {
  const t = fixture({ remains: true });
  await assert.rejects(dismissFreshSetup(t), /Setup remains visible/);
  assert.equal(t.events.some(([kind]) => kind === 'rpc'), false);
});
test('missing persisted later receipt stays a failure after visual dismissal', async () => {
  const t = fixture({ status: 'active' });
  await assert.rejects(dismissFreshSetup(t), /actual setup receipt/);
});
test('refused genuine click is retained without AXPress or direct runtime mutation fallback', async () => {
  const t = fixture({ clickFails: true });
  await assert.rejects(dismissFreshSetup(t), /Native click refused/);
  assert.equal(t.events.length, 2);
});
