import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  requestFrom,
  translationResult,
  type UtilityRequest,
  UtilityRun,
} from './contracts';
import { type UtilityDependencies, UtilityRequestRunner } from './runner';

const documentToken = '11111111-1111-4111-8111-111111111111',
  requestId = '22222222-2222-4222-8222-222222222222';
const request: UtilityRequest = {
  type: 'start',
  kind: 'selection',
  source: 'Original text',
  instruction: 'Make it concise',
  documentUrl: 'https://fixture.test/',
  documentToken,
  requestId,
};
test('utility identity drops stale request/session/document chunks and never promotes cancelled partial output', () => {
  const run = new UtilityRun(documentToken);
  run.begin(requestId);
  assert(
    run.accept({
      type: 'started',
      requestId,
      documentToken,
      sessionId: 'session-one',
    }),
  );
  assert(
    run.accept({
      type: 'chunk',
      requestId,
      documentToken,
      sessionId: 'session-one',
      text: 'Partial',
    }),
  );
  assert.equal(
    run.accept({
      type: 'complete',
      requestId,
      documentToken: 'other-document',
      sessionId: 'session-one',
      text: 'Wrong',
    }),
    false,
  );
  assert.equal(
    run.accept({
      type: 'complete',
      requestId,
      documentToken,
      sessionId: 'other-session',
      text: 'Wrong',
    }),
    false,
  );
  run.abort();
  assert.equal(
    run.accept({
      type: 'complete',
      requestId,
      documentToken,
      sessionId: 'session-one',
      text: 'Late',
    }),
    false,
  );
  assert.equal(run.phase, 'aborted');
  run.begin('new-request');
  assert.equal(
    run.accept({
      type: 'chunk',
      requestId,
      documentToken,
      sessionId: 'session-one',
      text: 'Obsolete',
    }),
    false,
  );
  assert.equal(run.text, '');
});
test('translation validates exact complete segment identities and keeps source language distinct', () => {
  const segments = [
    { id: 't0', text: 'Hello' },
    { id: 't1', text: 'World' },
  ];
  assert.deepEqual(
    [
      ...translationResult(
        '{"detectedSource":"English","segments":[{"id":"t1","text":"Monde"},{"id":"t0","text":"Bonjour"}]}',
        segments,
      ).translated,
    ],
    [
      ['t1', 'Monde'],
      ['t0', 'Bonjour'],
    ],
  );
  for (const text of [
    '{"segments":[{"id":"t0","text":"Only partial"}]}',
    '{"segments":[{"id":"t0","text":"one"},{"id":"t0","text":"duplicate"}]}',
    '{"segments":[{"id":"t0","text":"one"},{"id":"t9","text":"foreign"}]}',
  ])
    assert.throws(() => translationResult(text, segments));
  assert.throws(() =>
    requestFrom({ ...request, documentUrl: 'file:///private/fixture' }),
  );
  assert.throws(() => requestFrom({ ...request, source: 'x'.repeat(32001) }));
});
test('runner uses real session procedure shapes and emits completed assistant output, not partial event text', async () => {
  const calls: { procedure: string; input: Record<string, unknown> }[] = [];
  const updates: unknown[] = [];
  const runner = new UtilityRequestRunner(request, {
    context: async () => ({
      accountId: 9,
      profile: { profileId: 'bound-profile' },
      incognito: true,
    }),
    verify: async () => {},
    update: (value) => updates.push(value),
    rpc: async <T>(procedure: string, input: Record<string, unknown>) => {
      calls.push({ procedure, input });
      if (procedure === 'sessions.eventsSince')
        return [
          { cursor: 1, type: 'text-delta', data: { text: 'Partial' } },
        ] as T;
      if (procedure === 'sessions.get') return { status: 'idle' } as T;
      if (procedure === 'sessions.messageRows')
        return [{ role: 'assistant', content: 'Complete output' }] as T;
      return {} as T;
    },
  });
  await runner.run();
  const create = calls.find((call) => call.procedure === 'sessions.create');
  assert.equal(create?.input.ephemeral, true);
  assert.equal(create?.input.incognito, true);
  assert.equal(create?.input.trigger, 'page-utility');
  assert.equal(create?.input.permissionMode, 'read-only');
  assert.deepEqual(create?.input.permissionOverrides, {
    deny: ['*'],
    allow: [],
    ask: [],
  });
  assert.deepEqual(create?.input.browserBinding, {
    profileId: 'bound-profile',
    browserMode: 'incognito',
  });
  assert.deepEqual(
    (updates.at(-1) as { text: string }).text,
    'Complete output',
  );
});
test('cancel during session creation prevents prompt and aborts after the creation race settles', async () => {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const calls: string[] = [];
  const updates: { type: string }[] = [];
  const dependencies: UtilityDependencies = {
    context: async () => ({
      accountId: 1,
      profile: { profileId: 'fixture' },
      incognito: false,
    }),
    verify: async () => {},
    update: (value) => updates.push(value),
    rpc: async <T>(procedure: string) => {
      calls.push(procedure);
      if (procedure === 'sessions.create') await gate;
      return {} as T;
    },
  };
  const runner = new UtilityRequestRunner(request, dependencies);
  const running = runner.run();
  await new Promise((resolve) => setImmediate(resolve));
  await runner.cancel();
  release();
  await running;
  assert(!calls.includes('sessions.prompt'));
  assert(calls.includes('sessions.abort'));
  assert(!updates.some((value) => value.type === 'complete'));
});
test('stale document fails before mutation and source content never becomes trusted instruction', async () => {
  const calls: string[] = [];
  const updates: { type: string }[] = [];
  const runner = new UtilityRequestRunner(request, {
    context: async () => ({
      accountId: 1,
      profile: { profileId: 'p' },
      incognito: false,
    }),
    verify: async () => {
      throw new Error('Stale document');
    },
    update: (value) => updates.push(value),
    rpc: async <T>(procedure: string) => {
      calls.push(procedure);
      return {} as T;
    },
  });
  await runner.run();
  assert.equal(calls.length, 0);
  assert.equal(updates.at(-1)?.type, 'error');
});

test('background sender rejects foreign extension, frame/document, browsing mode and inactive document identities', async () => {
  const { validUtilitySender } = await import('./background');
  const sender = {
    id: 'own',
    frameId: 3,
    documentId: 'committed-document',
    documentLifecycle: 'active',
    url: 'https://fixture.test/frame',
    tab: { id: 5, incognito: false },
  } as chrome.runtime.MessageSender;
  assert.equal(validUtilitySender(sender, 'own', false), true);
  for (const altered of [
    { ...sender, id: 'foreign' },
    { ...sender, documentId: undefined },
    { ...sender, frameId: -1 },
    { ...sender, documentLifecycle: 'cached' },
    { ...sender, url: 'chrome://settings/' },
    { ...sender, tab: { ...sender.tab, incognito: true } },
  ])
    assert.equal(
      validUtilitySender(altered as chrome.runtime.MessageSender, 'own', false),
      false,
    );
});

test('release racing session creation deletes the temporary session after it exists', async () => {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const calls: string[] = [];
  const runner = new UtilityRequestRunner(request, {
    context: async () => ({
      accountId: 1,
      profile: { profileId: 'p' },
      incognito: false,
    }),
    verify: async () => {},
    update: () => {},
    rpc: async <T>(procedure: string) => {
      calls.push(procedure);
      if (procedure === 'sessions.create') await gate;
      return {} as T;
    },
  });
  const running = runner.run();
  await new Promise((resolve) => setImmediate(resolve));
  await runner.dispose();
  release();
  await running;
  assert(calls.includes('sessions.delete'));
  assert(!calls.includes('sessions.prompt'));
});
