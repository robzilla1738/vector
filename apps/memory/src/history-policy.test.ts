import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { setImmediate as tick } from 'node:timers/promises';
import { AgentEngine, approveOperation, type Session } from '@aux/agent';
import type { ToolSet } from 'ai';
import { HistoryCollector } from '../../daemon/src/history/collector.js';
import type { DaemonServices } from '../../daemon/src/http/server.js';
import { Store } from '../../daemon/src/storage/store.js';
import { BrowsingHistory } from './browser-history.js';
import { ContextService } from './context.js';
import { LocalEmbeddings } from './embeddings.js';
import { historyTools } from './history-tools.js';
import { MemoryService } from './memory.js';
import { memoryTools } from './tools.js';

// Deterministic unit fixture, deliberately not a semantic-model acceptance test.
class FixtureEmbeddings extends LocalEmbeddings {
  wait: (() => Promise<void>) | undefined;
  override async embed(_text: string) {
    await this.wait?.();
    return [1, 0];
  }
  override async close() {}
}
function fixture() {
  const home = mkdtempSync(join(tmpdir(), 'aux-history-policy-'));
  const store = new Store(home),
    engine = new AgentEngine(store);
  const embeddings = new FixtureEmbeddings();
  const memory = new MemoryService(store, engine, embeddings);
  const history = new BrowsingHistory(memory);
  const accountId = store.current(),
    profileId = 'fixture-profile';
  store.bind({ accountId, profileId });
  const create = (permissionMode: Session['permissionMode'] = 'guard') =>
    engine.create({
      accountId,
      permissionMode,
      browserBinding: { profileId, browserMode: 'default' },
    });
  return {
    store,
    engine,
    embeddings,
    memory,
    history,
    accountId,
    profileId,
    create,
    async close() {
      await engine.close();
      store.close();
      rmSync(home, { recursive: true, force: true });
    },
  };
}
async function execute(
  tools: ToolSet,
  name: string,
  input: unknown,
  id = 'call',
) {
  const tool = tools[name];
  assert.ok(tool?.execute);
  return tool.execute(input as never, {
    toolCallId: id,
    messages: [],
    context: undefined,
  });
}
async function suspended(f: ReturnType<typeof fixture>, session: Session) {
  for (let n = 0; n < 100; n++) {
    const pending = f.engine
      .get(f.accountId, session.id)
      .suspensions.find((s) => !s.resolvedAt);
    if (pending) return pending;
    await tick();
  }
  throw new Error('Expected a live approval suspension');
}

test('memory writes use concrete multi-path approval, current policy and stop cancellation', async () => {
  const f = fixture();
  try {
    const before = f.memory.readFile(f.accountId, 'USER.md').content;
    const s = f.create();
    const run = f.engine.runExternal(f.accountId, s.id, (signal) =>
      execute(memoryTools(f.memory, s, signal), 'memory_operators', {
        operation: 'write',
        filePath: 'USER.md',
        content: 'Approved preference',
      }),
    );
    const decision = await suspended(f, s);
    assert.equal(decision.kind, 'approval');
    assert.equal(f.memory.readFile(f.accountId, 'USER.md').content, before);
    f.engine.resolve(f.accountId, s.id, decision.toolCallId, {
      verdict: 'allow',
      always: false,
    });
    await run;
    assert.equal(
      f.memory.readFile(f.accountId, 'USER.md').content,
      'Approved preference',
    );

    const revoked = f.create();
    const pending = f.engine.runExternal(f.accountId, revoked.id, (signal) =>
      execute(memoryTools(f.memory, revoked, signal), 'memory_operators', {
        operation: 'write',
        filePath: 'USER.md',
        content: 'Never written',
      }),
    );
    const rejected = assert.rejects(pending, /denied/);
    const approval = await suspended(f, revoked);
    f.store.set(f.accountId, 'permissions', 'rules', {
      deny: ['memory_operators'],
    });
    f.engine.resolve(f.accountId, revoked.id, approval.toolCallId, {
      verdict: 'allow',
      always: false,
    });
    await rejected;
    assert.equal(
      f.memory.readFile(f.accountId, 'USER.md').content,
      'Approved preference',
    );

    f.store.set(f.accountId, 'permissions', 'rules', {
      allow: [f.memory.path(f.accountId, 'USER.md')],
    });
    const multi = f.create();
    const multiRun = f.engine.runExternal(f.accountId, multi.id, (signal) =>
      approveOperation(
        f.engine,
        f.accountId,
        multi.id,
        'multi',
        'memory_operators',
        'Revert files',
        { files: ['USER.md', 'MEMORY.md'] },
        signal,
        {
          paths: [
            f.memory.path(f.accountId, 'USER.md'),
            f.memory.path(f.accountId, 'MEMORY.md'),
          ],
          mutation: true,
        },
      ),
    );
    const cancelled = assert.rejects(multiRun);
    await suspended(f, multi);
    f.engine.stop(f.accountId, multi.id, 'aborted');
    await cancelled;
    const readonly = f.create('read-only');
    await assert.rejects(
      f.engine.runExternal(f.accountId, readonly.id, (signal) =>
        execute(memoryTools(f.memory, readonly, signal), 'memory_operators', {
          operation: 'write',
          filePath: 'USER.md',
          content: 'No',
        }),
      ),
      /read-only/,
    );
  } finally {
    await f.close();
  }
});

test('native collection requires opt-in and matching route, preserves visit identity, and rolls back opt-out during embedding', async () => {
  const f = fixture();
  let commands = 0;
  let privateBatch = false;
  const bridge = {
    status: () => ({ connected: true }),
    command: async (
      _route: unknown,
      command: { params: Record<string, unknown> },
    ) => {
      commands++;
      return {
        accountId: command.params.accountId,
        profileId: command.params.profileId,
        from: command.params.from,
        browserMode: privateBatch ? 'incognito' : 'default',
        through: command.params.to,
        complete: true,
        visits: [
          {
            id: 'native-visit-7',
            url: 'https://example.test/meeting?token=fixture-secret#private',
            title: 'Meeting',
            content: '',
            visitedAt: 1234,
          },
        ],
      };
    },
  };
  const collector = new HistoryCollector(
    { store: f.store, bridge } as unknown as DaemonServices,
    f.history,
  );
  try {
    await assert.rejects(
      collector.collect(f.accountId, f.profileId, { from: 1000, to: 2000 }),
      /disabled/,
    );
    assert.equal(commands, 0);
    f.store.set(f.accountId, 'settings', 'browsingHistoryEnabled', true);
    privateBatch = true;
    await assert.rejects(
      collector.collect(f.accountId, f.profileId, { from: 1000, to: 2000 }),
    );
    assert.equal(f.history.list(f.accountId, f.profileId).length, 0);
    privateBatch = false;
    await collector.collect(f.accountId, f.profileId, { from: 1000, to: 2000 });
    const visit = f.history.list(f.accountId, f.profileId)[0];
    assert.equal(visit?.id, 'native-visit-7');
    assert.equal(visit?.visitedAt, 1234);
    assert.equal(visit?.url.includes('fixture-secret'), false);
    assert.equal(visit?.url.includes('#'), false);
    assert.equal(
      (
        await collector.collect(f.accountId, f.profileId, {
          from: 1000,
          to: 2000,
        })
      ).inserted,
      0,
    );
    f.history.remove(f.accountId, f.profileId, ['native-visit-7']);
    let release!: () => void;
    let entered!: () => void;
    const ready = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const blocked = new Promise<void>((resolve) => {
      release = resolve;
    });
    f.embeddings.wait = async () => {
      entered();
      await blocked;
    };
    const pending = collector.collect(f.accountId, f.profileId, {
      from: 1000,
      to: 2000,
    });
    const rejected = assert.rejects(pending, /consent changed/);
    await ready;
    f.store.set(f.accountId, 'settings', 'browsingHistoryEnabled', false);
    collector.settingsChanged(f.accountId);
    f.store.set(f.accountId, 'settings', 'browsingHistoryEnabled', true);
    collector.settingsChanged(f.accountId);
    const resetCursor = collector.status(f.accountId, f.profileId).cursor;
    release();
    await rejected;
    assert.equal(
      collector.status(f.accountId, f.profileId).cursor,
      resetCursor,
    );
    assert.equal(f.history.list(f.accountId, f.profileId).length, 0);
    const db = f.store.accountDb(f.accountId);
    try {
      assert.equal(
        (
          db
            .prepare(
              "SELECT count(*) AS n FROM semantic_chunks WHERE kind='browser'",
            )
            .get() as { n: number }
        ).n,
        0,
      );
    } finally {
      db.close();
    }
  } finally {
    collector.close();
    await f.close();
  }
});

test('activity recall excludes other and unknown browser Profiles, and deleted in-flight evidence cannot recreate vectors', async () => {
  const f = fixture();
  try {
    f.store.set(f.accountId, 'settings', 'contextAwarenessEnabled', true);
    const permissions = async () =>
      ({
        semanticCapture: 'granted',
        accessibility: 'granted',
        screenCapture: 'granted',
      }) as const;
    const context = new ContextService(f.memory, {
      permissions,
      requestPermissions: permissions,
    });
    const common = {
      kind: 'window',
      windowTitle: '',
      sensitive: false,
      incognito: false,
      occurredAt: 1234,
      appName: 'Fixture',
      bundleId: 'test.fixture',
      content: 'A permitted appointment',
    };
    const own = await context.ingest(f.accountId, {
      ...common,
      source: 'browser',
      sourceId: 'own',
      profileId: f.profileId,
    });
    await context.ingest(f.accountId, {
      ...common,
      source: 'browser',
      sourceId: 'other',
      profileId: 'other-profile',
    });
    await context.ingest(f.accountId, {
      ...common,
      source: 'browser',
      sourceId: 'unknown',
    });
    const native = await context.ingest(f.accountId, {
      ...common,
      source: 'native-fixture',
      sourceId: 'app',
    });
    assert.deepEqual(
      new Set(
        context
          .events(f.accountId, { profileId: f.profileId })
          .map((e) => e.id),
      ),
      new Set([own.event.id, native.event.id]),
    );
    const s = f.create('full-access');
    const tools = historyTools(
      f.store,
      f.engine,
      f.history,
      context,
      s,
      new AbortController().signal,
    );
    await assert.rejects(
      execute(tools, 'history_read', {
        ids: [
          context
            .events(f.accountId)
            .find((e) => e.profileId === 'other-profile')?.id,
        ],
      }),
      /another browser Profile/,
    );
    f.store.set(f.accountId, 'permissions', 'rules', {
      deny: ['history_read'],
    });
    await assert.rejects(
      execute(tools, 'history_read', { ids: [own.event.id] }),
      /denied/,
    );

    let release!: () => void, entered!: () => void;
    const ready = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const blocked = new Promise<void>((resolve) => {
      release = resolve;
    });
    f.embeddings.wait = async () => {
      entered();
      await blocked;
    };
    const ingest = f.history.ingest(f.accountId, {
      id: 'deleted',
      profileId: f.profileId,
      url: 'https://example.test',
      title: 'Fixture',
      visitedAt: 100,
      content: '',
      incognito: false,
    });
    await ready;
    f.history.remove(f.accountId, f.profileId, ['deleted']);
    release();
    assert.equal((await ingest).indexState, 'pending');
    const db = f.store.accountDb(f.accountId);
    try {
      assert.equal(
        (
          db
            .prepare('SELECT count(*) AS n FROM semantic_chunks WHERE source=?')
            .get(`browser:${f.profileId}:deleted`) as { n: number }
        ).n,
        0,
      );
    } finally {
      db.close();
    }
  } finally {
    await f.close();
  }
});
