import assert from 'node:assert/strict';
import test from 'node:test';
import {
  contextBudget,
  estimateContextTokens,
  planCompaction,
} from './compaction.js';
import type { Session } from './types.js';

test('context threshold plans preserve exact latest input and complete tool pairs', () => {
  const latest = {
    role: 'user' as const,
    content: 'Preserve this exact request',
  };
  const call = {
    role: 'assistant' as const,
    content: [
      {
        type: 'tool-call' as const,
        toolCallId: 'call-2',
        toolName: 'read',
        input: {},
      },
    ],
  };
  const result = {
    role: 'tool' as const,
    content: [
      {
        type: 'tool-result' as const,
        toolCallId: 'call-2',
        toolName: 'read',
        output: { type: 'text' as const, value: 'Recent verified result' },
      },
    ],
  };
  const session = {
    runtimeConfig: { contextWindowTokens: 4096 },
    context: [
      { role: 'user', content: 'x'.repeat(10000) },
      { role: 'assistant', content: 'Earlier completed response' },
      latest,
      call,
      result,
    ],
  } as Session;
  const plan = planCompaction(session);
  assert.ok(plan);
  assert.deepEqual(plan.tail, [latest, call, result]);
  assert.equal(session.context.length, 5);
  assert.equal(contextBudget(session).threshold, 3072);
  assert.ok(
    estimateContextTokens({ type: 'image', image: 'a'.repeat(1000000) }) <
      10000,
  );
  session.runtimeConfig = { ...session.runtimeConfig, autoCompaction: false };
  assert.equal(planCompaction(session), undefined);
});

test('long first tool turn is compactable while oversized single input fails clearly', () => {
  const latest = { role: 'user' as const, content: 'Retain constraint' };
  const session = {
    runtimeConfig: { contextWindowTokens: 4096 },
    context: [
      latest,
      { role: 'assistant', content: 'Prior work '.repeat(2000) },
      { role: 'assistant', content: 'Latest complete answer' },
    ],
  } as Session;
  const plan = planCompaction(session);
  assert.ok(plan);
  assert.equal(plan.tail[0], latest);
  assert.equal(plan.tail.length, 2);
  session.context = [{ role: 'user', content: 'x'.repeat(15000) }];
  assert.throws(() => planCompaction(session), /exceeds the compaction budget/);
});
