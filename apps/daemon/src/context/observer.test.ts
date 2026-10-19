import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { AgentEngine } from '@aux/agent';
import {
  type CaptureAdapter,
  type CapturePermissions,
  ContextService,
  LocalEmbeddings,
  MemoryService,
} from '@aux/memory';
import type { DaemonServices } from '../http/server.js';
import { Store } from '../storage/store.js';
import { createContextObserver } from './observer.js';

class FixtureEmbeddings extends LocalEmbeddings {
  wait: (() => Promise<void>) | undefined;
  override async embed(_text: string) {
    await this.wait?.();
    return [1, 0];
  }
  override async close() {}
}
function fixture() {
  const home = mkdtempSync(join(tmpdir(), 'aux-observer-'));
  const store = new Store(home),
    engine = new AgentEngine(store),
    embeddings = new FixtureEmbeddings();
  const memory = new MemoryService(store, engine, embeddings),
    accountId = store.current();
  let unlocked = true,
    captures = 0,
    prepares = 0;
  let permission: CapturePermissions['semanticCapture'] = 'granted';
  let preparation: (() => Promise<void>) | undefined;
  let body: (() => Promise<void>) | undefined;
  const candidate = {
    id: 'fixture-window',
    pid: 4321,
    bundleId: 'test.fixture',
    appName: 'Fixture',
  };
  const adapter: CaptureAdapter = {
    permissions: async () => ({
      semanticCapture: permission,
      accessibility: 'granted',
      screenCapture: 'denied',
    }),
    requestPermissions: async () => {
      throw new Error('Tests must not request OS permissions');
    },
    prepare: async () => {
      prepares++;
      await preparation?.();
      return { state: 'ready', candidate };
    },
    capture: async () => {
      captures++;
      await body?.();
      return {
        state: 'captured',
        candidateId: candidate.id,
        pid: candidate.pid,
        bundleId: candidate.bundleId,
        appName: candidate.appName,
        windowTitle: 'Fixture appointment',
        content: 'A local appointment moved to Thursday.',
        occurredAt: Date.now(),
      };
    },
  };
  const context = new ContextService(memory, adapter);
  const bridge = { status: () => ({ connected: false }) };
  const services = { store, bridge } as unknown as DaemonServices;
  const observer = createContextObserver(services, context, {
    isUnlocked: () => unlocked,
  });
  return {
    store,
    engine,
    context,
    observer,
    embeddings,
    accountId,
    adapter,
    services,
    get captures() {
      return captures;
    },
    get prepares() {
      return prepares;
    },
    set unlocked(value: boolean) {
      unlocked = value;
    },
    set permission(value: CapturePermissions['semanticCapture']) {
      permission = value;
    },
    set preparation(value: (() => Promise<void>) | undefined) {
      preparation = value;
    },
    set body(value: (() => Promise<void>) | undefined) {
      body = value;
    },
    async close() {
      await observer.close();
      await engine.close();
      store.close();
      rmSync(home, { recursive: true, force: true });
    },
  };
}
function barrier() {
  let enter!: () => void, release!: () => void;
  const entered = new Promise<void>((resolve) => {
    enter = resolve;
  });
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  return {
    entered,
    release,
    wait: async () => {
      enter();
      await blocked;
    },
  };
}
test('capture status needs a live observer; opt-in/exclusions/permission gates precede capture and cycles do not overlap', async () => {
  const f = fixture();
  try {
    assert.equal((await f.context.status(f.accountId)).capturing, false);
    f.observer.start(60000);
    await f.observer.tick();
    assert.equal(f.prepares, 0);
    f.store.set(f.accountId, 'settings', 'contextAwarenessEnabled', true);
    f.context.setExclusions(f.accountId, {
      applications: ['test.fixture'],
      domains: [],
    });
    await f.observer.tick();
    assert.equal(f.captures, 0);
    f.context.setExclusions(f.accountId, { applications: [], domains: [] });
    const hold = barrier();
    f.body = hold.wait;
    const run = f.observer.tick();
    await hold.entered;
    const concurrent = f.observer.tick();
    assert.equal(f.captures, 1);
    assert.equal((await f.context.status(f.accountId)).capturing, true);
    hold.release();
    await Promise.all([run, concurrent]);
    assert.equal(f.context.events(f.accountId).length, 1);
    await f.observer.tick();
    assert.equal(f.context.events(f.accountId).length, 1);
    f.permission = 'denied';
    await f.observer.tick();
    assert.equal((await f.context.status(f.accountId)).observing, false);
    const old = f.captures;
    await f.observer.tick();
    assert.equal(f.captures, old);
    await f.observer.close();
    assert.equal(
      (await f.context.status(f.accountId)).observer.phase,
      'stopped',
    );
  } finally {
    await f.close();
  }
});
test('lock or pause/resume generation changes discard in-flight content and dependent vectors', async () => {
  const f = fixture();
  try {
    f.store.set(f.accountId, 'settings', 'contextAwarenessEnabled', true);
    const hold = barrier();
    f.embeddings.wait = hold.wait;
    f.observer.start(60000);
    const run = f.observer.tick();
    await hold.entered;
    f.unlocked = false;
    f.observer.changed(f.accountId);
    hold.release();
    await run;
    assert.equal(f.context.events(f.accountId).length, 0);
    const db = f.store.accountDb(f.accountId);
    try {
      assert.equal(
        (
          db
            .prepare(
              "SELECT count(*) AS n FROM semantic_chunks WHERE kind='context'",
            )
            .get() as { n: number }
        ).n,
        0,
      );
    } finally {
      db.close();
    }
    f.unlocked = true;
    f.embeddings.wait = undefined;
    const next = barrier();
    f.body = next.wait;
    const pending = f.observer.tick();
    await next.entered;
    f.context.pause(f.accountId, {});
    await f.context.resume(f.accountId);
    next.release();
    await pending;
    assert.equal(f.context.events(f.accountId).length, 0);
  } finally {
    await f.close();
  }
});
test('closed observer aborts an active adapter without persisting content', async () => {
  const f = fixture();
  try {
    f.store.set(f.accountId, 'settings', 'contextAwarenessEnabled', true);
    const entered = barrier();
    f.adapter.capture = async (_accountId, _candidate, signal) => {
      entered.release();
      await new Promise<void>((_resolve, reject) =>
        signal.addEventListener('abort', () => reject(signal.reason), {
          once: true,
        }),
      );
      throw new Error('Cancelled capture cannot succeed');
    };
    f.observer.start(60000);
    await entered.wait();
    await f.observer.close();
    assert.equal(f.context.events(f.accountId).length, 0);
  } finally {
    await f.close();
  }
});

test('browser activity requires an exact ordinary native route and current exclusions', async () => {
  const f = fixture();
  let mode = 'incognito';
  const profileId = 'fixture-profile';
  let commands = 0;
  f.store.bind({ accountId: f.accountId, profileId });
  f.store.set(f.accountId, 'settings', 'contextAwarenessEnabled', true);
  f.adapter.prepare = async () => ({
    state: 'skipped',
    reason: 'browser-content-requires-native-profile-proof',
  });
  const bridge = {
    status: () => ({ connected: true }),
    command: async (route: { accountId: number; profileId: string }) => {
      commands++;
      return {
        state: 'captured',
        ...route,
        browserMode: mode,
        targetId: 'stable-target',
        tabId: 7,
        url: 'https://fixture.test/appointment',
        title: 'Fixture appointment',
        content: '',
        occurredAt: Date.now(),
      };
    },
  };
  const observer = createContextObserver(
    { ...f.services, bridge } as unknown as DaemonServices,
    f.context,
    { isUnlocked: () => true },
  );
  try {
    observer.start(60000);
    await observer.tick();
    assert.equal(f.context.events(f.accountId).length, 0);
    mode = 'default';
    await observer.tick();
    const events = f.context.events(f.accountId);
    assert.equal(events.length, 1);
    assert.equal(events[0]?.profileId, profileId);
    assert.equal(events[0]?.targetId, 'stable-target');
    assert.equal(events[0]?.content, '');
    f.context.setExclusions(f.accountId, {
      applications: [],
      domains: ['fixture.test'],
    });
    await observer.tick();
    assert.equal(f.context.events(f.accountId).length, 0);
    f.context.setExclusions(f.accountId, {
      applications: ['dev.aux.browser'],
      domains: [],
    });
    const before = commands;
    await observer.tick();
    assert.equal(commands, before);
    assert.equal(f.captures, 0);
  } finally {
    await observer.close();
    await f.close();
  }
});

test('permission revocation and current-account changes during capture are rejected before persistence', async () => {
  const f = fixture();
  try {
    f.store.set(f.accountId, 'settings', 'contextAwarenessEnabled', true);
    const first = barrier();
    f.body = first.wait;
    f.observer.start(60000);
    const pending = f.observer.tick();
    await first.entered;
    f.permission = 'denied';
    first.release();
    await pending;
    assert.equal(f.context.events(f.accountId).length, 0);
    f.permission = 'granted';
    const next = barrier();
    f.body = next.wait;
    const second = f.observer.tick();
    await next.entered;
    const other = f.store.add('Disposable second account', 'local').id;
    f.store.setCurrent(other);
    next.release();
    await second;
    assert.equal(f.context.events(f.accountId).length, 0);
    assert.equal(f.context.events(other).length, 0);
  } finally {
    await f.close();
  }
});
