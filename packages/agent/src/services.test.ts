import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { BridgeRegistry } from '../../../apps/daemon/src/bridge/registry.js';
import {
  pollRoutines,
  triggerEventRoutines,
} from '../../../apps/daemon/src/routines/index.js';
import { createAgentRouters } from '../../../apps/daemon/src/sessions/index.js';
import { Store } from '../../../apps/daemon/src/storage/store.js';
import { procedure, t } from '../../../apps/daemon/src/trpc/core.js';
import { AgentEngine } from './engine.js';

test('routine scheduler and replayed event deliver accepted input exactly once', async () => {
  const home = mkdtempSync(join(tmpdir(), 'aux-scheduler-test-'));
  const store = new Store(home);
  const engine = new AgentEngine(store);
  const accountId = store.current();
  const caller = t
    .router(
      createAgentRouters(
        { store, bridge: new BridgeRegistry(), t, procedure },
        engine,
      ),
    )
    .createCaller({ store, clientKind: 'cli' });
  try {
    const once = await caller.routines.create({
      accountId,
      name: 'One time',
      prompt: 'Keep this scheduled input',
      kind: 'cron',
      triggerKind: 'schedule',
      scheduleKind: 'once',
      runAt: new Date(Date.now() - 1000).toISOString(),
      timezone: 'UTC',
      permissionMode: 'guard',
      source: 'user',
      state: 'active',
      projectId: null,
    });
    pollRoutines(store, engine);
    pollRoutines(store, engine);
    const sessions = engine.list(accountId);
    assert.equal(sessions.length, 1);
    assert.equal(
      sessions[0]?.messages[0]?.content,
      'Keep this scheduled input',
    );
    assert.equal(
      (await caller.routines.get({ accountId, routineId: once.id })).state,
      'completed',
    );
    const session = sessions[0];
    assert.ok(session);
    await engine.wait(accountId, session.id);
    const eventRoutine = await caller.routines.create({
      accountId,
      name: 'Inbox event',
      prompt: 'Handle inbox event',
      kind: 'heartbeat',
      targetSessionId: session.id,
      triggerKind: 'event',
      eventFilter: { source: 'test-inbox' },
      timezone: 'UTC',
      permissionMode: 'guard',
      source: 'user',
      state: 'active',
      projectId: null,
    });
    triggerEventRoutines(store, engine, accountId, {
      id: 'unique-event',
      source: 'test-inbox',
    });
    triggerEventRoutines(store, engine, accountId, {
      id: 'unique-event',
      source: 'test-inbox',
    });
    await engine.wait(accountId, session.id);
    assert.equal(
      engine
        .get(accountId, session.id)
        .messages.filter((m) => m.content === 'Handle inbox event').length,
      1,
    );
    const db = store.accountDb(accountId);
    try {
      assert.equal(
        (
          db
            .prepare(
              'SELECT count(*) AS count FROM routine_executions WHERE routineId=?',
            )
            .get(eventRoutine.id) as { count: number }
        ).count,
        1,
      );
    } finally {
      db.close();
    }
    await assert.rejects(
      () =>
        caller.routines.create({
          accountId,
          name: 'Bad heartbeat',
          prompt: 'x',
          kind: 'heartbeat',
          triggerKind: 'event',
          eventFilter: { source: 'test-inbox' },
          timezone: 'UTC',
          permissionMode: 'guard',
          source: 'user',
          state: 'active',
          projectId: null,
        }),
      /requires a target/,
    );
  } finally {
    await engine.close();
    store.close();
    rmSync(home, { recursive: true, force: true });
  }
});
