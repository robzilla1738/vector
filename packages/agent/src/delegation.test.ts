import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import type { Tool } from 'ai';
import { Store } from '../../../apps/daemon/src/storage/store.js';
import { AgentEngine } from './engine.js';
import {
  hasLiveChildDecision,
  restrictSubagentTools,
  routeChildSuspension,
  startSubagent,
} from './subagents.js';
import { configureAgentTools } from './tool-services.js';
import { sessionTools } from './tools.js';
import { createSchema, type Session } from './types.js';

function fixture() {
  const home = mkdtempSync(join(tmpdir(), 'aux-delegation-'));
  const store = new Store(home);
  const engine = new AgentEngine(store);
  const accountId = store.current();
  const parent = engine.create(
    createSchema.parse({
      accountId,
      permissionMode: 'full-access',
      browserBinding: {
        profileId: 'fixture',
        windowId: 10,
        anchorTargetId: 'parent-target',
      },
    }),
  );
  // Capture accepted child prompts without invoking any provider.
  engine.prompt = (_account, id, prompt) => {
    const child = engine.get(accountId, id);
    child.messages.push({
      id: 'accepted',
      role: 'user',
      content: prompt,
      turnId: 'fixture',
      createdAt: Date.now(),
    });
    engine.save(child);
    return engine.public(child);
  };
  return {
    home,
    store,
    engine,
    accountId,
    parent,
    close: async () => {
      await engine.close();
      store.close();
      rmSync(home, { recursive: true, force: true });
    },
  };
}
test('fork/custom children retain parent linkage and text context but never handle or transcript call state', async () => {
  const f = fixture();
  try {
    f.parent.context = [
      {
        role: 'assistant',
        content: [
          {
            type: 'tool-call',
            toolCallId: 'parent-call',
            toolName: 'repl',
            input: { handle: 'live' },
          },
        ],
      },
    ];
    f.parent.messages.push(
      {
        id: 'u',
        role: 'user',
        content: 'Keep the accepted constraint',
        turnId: 'p',
        createdAt: 1,
      },
      {
        id: 't',
        role: 'tool',
        content: 'secret-live-handle',
        turnId: 'p',
        createdAt: 2,
      },
    );
    f.engine.save(f.parent);
    const first = await startSubagent(
      f.engine,
      f.accountId,
      f.parent.id,
      { task: 'Inspect context', profile: 'forked' },
      'fork',
      new AbortController().signal,
    );
    const child = f.engine.get(f.accountId, first.id);
    assert.equal(child.parentId, f.parent.id);
    assert.equal(child.ephemeral, true);
    assert.deepEqual(child.browserBinding, {
      profileId: 'fixture',
      browserMode: 'default',
    });
    assert.equal(child.toolCalls.length, 0);
    assert.equal(child.suspensions.length, 0);
    assert.match(JSON.stringify(child.context), /accepted constraint/);
    assert.doesNotMatch(
      JSON.stringify(child.context),
      /parent-call|secret-live-handle/,
    );
    assert.equal(
      (
        await startSubagent(
          f.engine,
          f.accountId,
          f.parent.id,
          { task: 'Inspect context', profile: 'forked' },
          'fork',
          new AbortController().signal,
        )
      ).id,
      child.id,
    );
    assert.equal(f.engine.list(f.accountId).length, 2);
    await assert.rejects(
      startSubagent(
        f.engine,
        f.accountId,
        child.id,
        { task: 'Recurse' },
        'nested',
        new AbortController().signal,
      ),
      /cannot delegate/,
    );
    configureAgentTools(f.engine, {
      customSubagentProfile: (_account, id) =>
        id === 'audit'
          ? {
              id,
              context: 'fresh',
              readOnly: true,
              instructions: 'Report evidence',
              allowedTools: ['read_file'],
            }
          : undefined,
    });
    const custom = await startSubagent(
      f.engine,
      f.accountId,
      f.parent.id,
      { task: 'Audit', profile: 'custom', customProfileId: 'audit' },
      'custom',
      new AbortController().signal,
    );
    const customChild = f.engine.get(f.accountId, custom.id);
    assert.equal(customChild.permissionMode, 'read-only');
    const tools = sessionTools(
      f.engine,
      f.accountId,
      custom.id,
      new AbortController().signal,
    );
    const write = tools.write_file as Tool<
      { path: string; content: string; overwrite: boolean },
      unknown
    >;
    assert.ok(write?.execute);
    assert.deepEqual(
      Object.keys(
        restrictSubagentTools(f.engine, customChild, {
          ...tools,
          injected_mutation: write,
        }),
      ),
      ['read_file'],
    );
    await assert.rejects(
      async () =>
        write.execute?.(
          { path: 'forbidden.txt', content: 'no', overwrite: false },
          { toolCallId: 'mutation', messages: [], context: {} },
        ),
      /read-only/,
    );
    assert.equal(
      f.engine
        .get(f.accountId, custom.id)
        .toolCalls.find((c) => c.id === 'mutation')?.status,
      'errored',
    );
  } finally {
    await f.close();
  }
});
test('delegation limits include idle historical children; explicit unavailable model categories fail', async () => {
  const f = fixture();
  try {
    await assert.rejects(
      startSubagent(
        f.engine,
        f.accountId,
        f.parent.id,
        { task: 'Require category', modelCategory: 'deep' },
        'category',
        new AbortController().signal,
      ),
      /configured available model/,
    );
    for (let i = 0; i < 32; i++)
      f.engine.create(
        createSchema.parse({
          accountId: f.accountId,
          parentId: f.parent.id,
          ephemeral: true,
        }),
      );
    await assert.rejects(
      startSubagent(
        f.engine,
        f.accountId,
        f.parent.id,
        { task: 'Overflow' },
        'overflow',
        new AbortController().signal,
      ),
      /32 child/,
    );
  } finally {
    await f.close();
  }
});
test('routed child decisions persist on parent with unique IDs and cancel cleanly', async () => {
  const f = fixture();
  try {
    const child = f.engine.create(
      createSchema.parse({
        accountId: f.accountId,
        parentId: f.parent.id,
        ephemeral: true,
      }),
    );
    // Model only the central get() live-decision exemption proposed in the integration patch.
    const normalGet = f.engine.get.bind(f.engine);
    f.engine.get = (account, id) =>
      hasLiveChildDecision(f.engine, account, id) || id === child.id
        ? (f.store.get(account, 'sessions', id) as Session)
        : normalGet(account, id);
    const abort = new AbortController();
    const pending = routeChildSuspension(
      f.engine,
      f.accountId,
      child.id,
      'same-id',
      'approval',
      { title: 'Concrete child operation', operation: { path: 'fixture' } },
      abort.signal,
    );
    assert.ok(pending);
    const parent = f.engine.get(f.accountId, f.parent.id);
    const suspension = parent.suspensions.at(-1);
    assert.ok(suspension);
    assert.notEqual(suspension.toolCallId, 'same-id');
    assert.equal(
      (suspension.request as { title: string }).title,
      'Concrete child operation',
    );
    assert.equal(f.engine.get(f.accountId, child.id).suspensions.length, 0);
    f.engine.resolve(f.accountId, f.parent.id, suspension.toolCallId, {
      verdict: 'deny',
      always: false,
    });
    assert.deepEqual(await pending, { verdict: 'deny', always: false });
    assert.equal(f.engine.get(f.accountId, f.parent.id).status, 'idle');
    assert.equal(
      hasLiveChildDecision(f.engine, f.accountId, f.parent.id),
      false,
    );
    const cancelled = routeChildSuspension(
      f.engine,
      f.accountId,
      child.id,
      'cancel',
      'approval',
      { title: 'Cancel' },
      abort.signal,
    );
    assert.ok(cancelled);
    abort.abort(new Error('Child cancelled'));
    await assert.rejects(cancelled, /interrupted|cancelled/i);
    assert.equal(
      f.engine
        .get(f.accountId, f.parent.id)
        .suspensions.filter((s) => !s.resolvedAt).length,
      0,
    );
    assert.equal(
      f.engine.get(f.accountId, f.parent.id).toolCalls.at(-1)?.status,
      'errored',
    );
  } finally {
    await f.close();
  }
});
