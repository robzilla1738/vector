import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const body = readFileSync(new URL('./disposable-model-credential-lifetime.mjs', import.meta.url), 'utf8')
  .replace(/^import[^\n]+\n/gm, '').replace(/^export /gm, '');
function clock() {
  let now = 1, scheduled, cleared;
  const wait = new Function('assert', 'performance', 'setTimeout', 'clearTimeout', body + '\nreturn awaitOriginalCredentialClose;')
    (assert, { now: () => now }, (callback, remaining) => { scheduled = { callback, remaining }; return 7; }, id => { cleared = id; });
  return { wait, expire() { now = 150; scheduled.callback(); }, get scheduled() { return scheduled; }, get cleared() { return cleared; }, late() { now = 150; } };
}
test('original close result retains exact identity under original remaining deadline', async () => {
  const c = clock(), original = { code: 0, signal: null };
  assert.equal(await c.wait(Promise.resolve(original), 150), original);
  assert.equal(c.scheduled.remaining, 149); assert.equal(c.cleared, 7);
});
test('expired reservation issues no wait or renewed interval', async () => {
  const c = clock(); await assert.rejects(c.wait(new Promise(() => {}), 1));
  assert.equal(c.scheduled, undefined);
});
test('held original close times out without consuming late original receipt', async () => {
  const c = clock(); let release; const original = new Promise(resolve => { release = resolve; });
  const rejected = assert.rejects(c.wait(original, 150), /original owner and debt retained/);
  c.expire(); await rejected; const receipt = { closed: true }; release(receipt);
  assert.equal(await original, receipt); assert.equal(c.cleared, 7);
});
test('close delivered at original deadline cannot bless cleanup', async () => {
  const c = clock(); let release; const original = new Promise(resolve => { release = resolve; });
  const rejected = assert.rejects(c.wait(original, 150)); c.late(); release({ closed: true }); await rejected;
});
