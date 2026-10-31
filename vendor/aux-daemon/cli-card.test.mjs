import assert from 'node:assert/strict';
import test from 'node:test';
import {dropUnanswerableCard} from './namespaces/sessions.mjs';

const stand = cli => { const rejected = []; return {rejected, isCliSession: () => cli, rejectSuspension: async request => { rejected.push(request); }}; };
const card = {toolCallId: 'call', suspensionId: 'held'};

test('a new CLI message rejects the card its chat was waiting on', async () => {
  const s = stand(true);
  await dropUnanswerableCard(s, 1, {id: 'chat', status: 'suspended', suspension: card});
  assert.deepEqual(s.rejected, [{accountId: 1, sessionId: 'chat', toolCallId: 'call', suspensionId: 'held', error: 'The user moved on with a new message.'}]);
});

test('a card someone can still answer, or one already answered, is left alone', async () => {
  const s = stand(false);
  await dropUnanswerableCard(s, 1, {id: 'panel', status: 'suspended', suspension: card});
  assert.deepEqual(s.rejected, [], 'a chat in the panel has its user');
  const cli = stand(true);
  await dropUnanswerableCard(cli, 1, {id: 'chat', status: 'running'});
  await dropUnanswerableCard(cli, 1, {id: 'chat', status: 'suspended', suspension: {...card, response: {}}});
  await dropUnanswerableCard(cli, 1, {id: 'chat', status: 'suspended', suspension: {...card, error: 'done'}});
  assert.deepEqual(cli.rejected, []);
});
