import assert from 'node:assert/strict';
import test from 'node:test';
import { newChat } from '../host/lib/l10-trust-fixtures.mjs';

function fixture(available, failure) {
  const events = [];
  return { events, ax: {
    async query(selector) { events.push(['query', selector.name]); return available(selector.name) ? [{}] : []; },
    async press(selector) { events.push(['press', selector.name]); },
    async waitFor(selector) { events.push(['wait', selector.name]); if (selector.name === failure) throw new Error('Required control missing'); },
  }};
}

test('ready home starts the actual New chat action and requires composer readiness', async () => {
  const t = fixture(name => name === 'New chat');
  await newChat(t);
  assert.deepEqual(t.events, [['query', 'New chat'], ['wait', 'New chat'], ['press', 'New chat'], ['wait', 'Reply to conversation']]);
});
test('home mount race waits for New chat without requiring a nonexistent Chats button', async () => {
  const t = fixture(() => false);
  await newChat(t);
  assert.equal(t.events.some(([kind, name]) => kind === 'wait' && name === 'Chats'), false);
  assert.deepEqual(t.events.slice(-3), [['wait', 'New chat'], ['press', 'New chat'], ['wait', 'Reply to conversation']]);
});
test('hidden vertical browser sidebar restores then opens its actual Chats disclosure', async () => {
  const t = fixture(name => ['Show sidebar', 'Chats'].includes(name));
  await newChat(t);
  assert.deepEqual(t.events.filter(([kind]) => kind === 'press'), [['press', 'Show sidebar'], ['press', 'Chats'], ['press', 'New chat']]);
});
test('missing New chat remains a failure before any synthetic submit or composer fallback', async () => {
  const t = fixture(() => false, 'New chat');
  await assert.rejects(newChat(t), /Required control missing/);
  assert.equal(t.events.some(([kind]) => kind === 'press'), false);
});
