import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { AgentEngine } from '@aux/agent';
import { BridgeRegistry } from '../../daemon/src/bridge/registry.js';
import { InboxService } from '../../daemon/src/inbox/index.js';
import { createRoutineRouter } from '../../daemon/src/routines/index.js';
import { Store } from '../../daemon/src/storage/store.js';
import { procedure, t } from '../../daemon/src/trpc/core.js';
import {
  activitySchema,
  type CapturePermissions,
  ContextService,
} from './context.js';
import { MemoryService } from './memory.js';

function fixture() {
  const home = mkdtempSync(join(tmpdir(), 'aux-context-test-'));
  const store = new Store(home);
  const engine = new AgentEngine(store);
  const memory = new MemoryService(store, engine);
  return {
    home,
    store,
    engine,
    memory,
    accountId: store.current(),
    close: async () => {
      await engine.close();
      store.close();
      rmSync(home, { recursive: true, force: true });
    },
  };
}
test('activity pipeline requires opt-in/capability, redacts before persistence, excludes recall, and erases indexes', async () => {
  const f = fixture();
  try {
    const unavailable = new ContextService(f.memory);
    assert.equal(
      (await unavailable.status(f.accountId)).permission.semanticCapture,
      'unavailable',
    );
    await assert.rejects(
      () => unavailable.requestPermissions(f.accountId),
      /unavailable/,
    );
    const grants: CapturePermissions = {
      semanticCapture: 'granted',
      accessibility: 'granted',
      screenCapture: 'granted',
    };
    const context = new ContextService(f.memory, {
      permissions: async () => grants,
      requestPermissions: async () => grants,
    });
    const event = activitySchema.parse({
      source: 'native-test',
      sourceId: 'known-local-event',
      kind: 'window',
      occurredAt: Date.now(),
      appName: 'Calendar',
      bundleId: 'test.calendar',
      windowTitle: 'Client meeting',
      url: 'https://example.com/meeting?token=private',
      content:
        'The customer discussion was moved to Thursday afternoon. password=do-not-store',
    });
    await assert.rejects(() => context.ingest(f.accountId, event), /opt-in/);
    f.store.set(f.accountId, 'settings', 'contextAwarenessEnabled', true);
    const stored = await context.ingest(f.accountId, event);
    assert.equal(stored.indexState, 'indexed');
    assert.equal(stored.event.content.includes('do-not-store'), false);
    assert.equal(stored.event.url?.includes('token=private'), false);
    const found = await context.search(f.accountId, [
      'When will the client conversation happen?',
    ]);
    assert.equal(found.results[0]?.evidenceId, stored.event.id);
    context.pause(f.accountId, {});
    await assert.rejects(
      () => context.ingest(f.accountId, { ...event, sourceId: 'next' }),
      /unpaused/,
    );
    await context.resume(f.accountId);
    context.setExclusions(f.accountId, {
      applications: ['test.calendar'],
      domains: [],
    });
    assert.equal(context.events(f.accountId).length, 0);
    assert.equal(
      (await context.search(f.accountId, ['Client conversation'])).results
        .length,
      0,
    );
    assert.throws(
      () => context.read(f.accountId, [stored.event.id]),
      /excluded/,
    );
    assert.equal(
      context.clear(f.accountId, {
        kind: 'application',
        bundleId: 'test.calendar',
      }).removed,
      1,
    );
    const db = f.store.accountDb(f.accountId);
    try {
      assert.equal(
        (
          db
            .prepare(
              "SELECT count(*) AS count FROM semantic_chunks WHERE kind='context'",
            )
            .get() as { count: number }
        ).count,
        0,
      );
    } finally {
      db.close();
    }
    assert.equal(context.verify(f.accountId).ok, true);
    const signal = await unavailable.reportTabSignal(f.accountId, {
      targetId: 'target',
      url: 'https://example.net/',
      kind: 'activation',
      sequence: 1,
    });
    assert.equal(signal.inserted, true);
    await assert.rejects(
      () =>
        unavailable.reportTabSignal(f.accountId, {
          targetId: 'target',
          url: 'https://example.net/',
          kind: 'activation',
          sequence: 1,
        }),
      /stale/,
    );
  } finally {
    await f.close();
  }
});
test('notification origin grants and external event identities gate exactly-once routine delivery', async () => {
  const f = fixture();
  try {
    const services = {
      store: f.store,
      bridge: new BridgeRegistry(),
      t,
      procedure,
    };
    const caller = t
      .router({ routines: createRoutineRouter(services, f.engine) })
      .createCaller({ store: f.store, clientKind: 'cli' });
    const routine = await caller.routines.create({
      accountId: f.accountId,
      name: 'Handle approved site messages',
      prompt: 'Summarize the authorized incoming message',
      kind: 'cron',
      triggerKind: 'event',
      eventFilter: { source: 'test-site' },
      timezone: 'UTC',
      permissionMode: 'guard',
      projectId: null,
      state: 'active',
      source: 'user',
    });
    const inbox = new InboxService(f.store, f.engine);
    const event = {
      accountId: f.accountId,
      source: 'test-site',
      externalEventId: 'site-event-one',
      title: 'Planning update',
      content: 'The workshop begins Thursday',
      metadata: { origin: 'https://example.com' },
    };
    assert.throws(() => inbox.ingest(event), /current grant/);
    inbox.setPermission(f.accountId, {
      origin: 'https://example.com',
      permission: 'granted',
      source: 'native_ui',
    });
    const first = inbox.ingest(event);
    assert.equal(first.inserted, true);
    assert.deepEqual(first.matchedRoutines, [routine.id]);
    const duplicate = inbox.ingest(event);
    assert.equal(duplicate.inserted, false);
    assert.deepEqual(duplicate.matchedRoutines, [routine.id]);
    assert.equal(f.engine.list(f.accountId).length, 1);
    const session = f.engine.list(f.accountId)[0];
    assert.ok(session);
    assert.ok(
      session.messages[0]?.content.includes('The workshop begins Thursday'),
    );
    await f.engine.wait(f.accountId, session.id);
    assert.throws(
      () =>
        inbox.ingest({
          ...event,
          externalEventId: 'different-port',
          metadata: { origin: 'https://example.com:8443' },
        }),
      /current grant/,
    );
    inbox.setPermission(f.accountId, {
      origin: 'https://example.com',
      permission: 'denied',
      source: 'api',
    });
    assert.throws(
      () => inbox.ingest({ ...event, externalEventId: 'after-revoke' }),
      /current grant/,
    );
    assert.equal(inbox.overview(f.accountId).messages.length, 0);
  } finally {
    await f.close();
  }
});
