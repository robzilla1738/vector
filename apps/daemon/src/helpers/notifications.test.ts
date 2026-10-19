import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { AgentEngine } from '@aux/agent';
import type { DaemonServices } from '../http/server.js';
import { Store } from '../storage/store.js';
import {
  createNotificationService,
  type NotificationClient,
} from './notifications.js';
import { notificationTools } from './tools.js';

function fixture() {
  const home = mkdtempSync(join(tmpdir(), 'aux-notification-fixture-'));
  const store = new Store(home),
    engine = new AgentEngine(store),
    accountId = store.current();
  let unlocked = true,
    authorization = 'authorized',
    enqueues = 0,
    drains = 0;
  let activations: string[] = [],
    onStatus: (() => void) | undefined;
  let enqueueFailure = false;
  const calls: unknown[] = [];
  const client: NotificationClient = {
    async call(method, params) {
      if (method === 'notifications.status') {
        onStatus?.();
        return { available: true, authorization };
      }
      if (method === 'notifications.takeActivations') {
        drains++;
        const ids = activations;
        activations = [];
        return { operationIds: ids };
      }
      enqueues++;
      if (enqueueFailure)
        throw new Error('Synthetic acknowledgement lost; outcome unknown');
      calls.push(params);
      return {
        enqueued: true,
        operationId: params?.operationId,
        deliveryConfirmed: false,
        replayed: false,
      };
    },
  };
  const bridgeCalls: unknown[] = [];
  const bridge = {
    command: async (...args: unknown[]) => {
      bridgeCalls.push(args);
      return { activated: true, tabId: 8 };
    },
  };
  const service = createNotificationService(
    { store, bridge } as unknown as DaemonServices,
    engine,
    client,
    { isUnlocked: () => unlocked },
  );
  const session = (
    permissionMode: 'guard' | 'full-access' | 'read-only' = 'full-access',
  ) =>
    engine.create({
      accountId,
      permissionMode,
      browserBinding: { profileId: 'fixture-profile', browserMode: 'default' },
    });
  return {
    store,
    engine,
    accountId,
    service,
    session,
    calls,
    bridgeCalls,
    set unlocked(value: boolean) {
      unlocked = value;
    },
    set authorization(value: string) {
      authorization = value;
    },
    set activations(value: string[]) {
      activations = value;
    },
    set onStatus(value: (() => void) | undefined) {
      onStatus = value;
    },
    set enqueueFailure(value: boolean) {
      enqueueFailure = value;
    },
    get enqueues() {
      return enqueues;
    },
    get drains() {
      return drains;
    },
    async close() {
      service.close();
      await engine.close();
      store.close();
      rmSync(home, { recursive: true, force: true });
    },
  };
}
const input = { title: 'Fixture notice', body: 'Synthetic body only' };
const signal = () => new AbortController().signal;

test('notification denies read-only/private/locked/permission-required without native enqueue; clip source is explicit unavailable', async () => {
  const f = fixture();
  try {
    await assert.rejects(
      f.service.enqueue(f.session('read-only'), input, 'read', signal()),
      /Read-only/,
    );
    const privateSession = f.engine.create({
      accountId: f.accountId,
      incognito: true,
      permissionMode: 'full-access',
    });
    await assert.rejects(
      f.service.enqueue(privateSession, input, 'private', signal()),
      /Private/,
    );
    const s = f.session();
    f.unlocked = false;
    await assert.rejects(
      f.service.enqueue(s, input, 'lock', signal()),
      /unlocked/,
    );
    f.unlocked = true;
    f.authorization = 'not-determined';
    await assert.rejects(
      f.service.enqueue(s, input, 'permission', signal()),
      /explicit permission/,
    );
    assert.equal(f.enqueues, 0);
    await f.service.poll();
    assert.equal(f.drains, 0);
    const tools = notificationTools(undefined, s, signal());
    const execute = tools.clip_search?.execute as (
      input: unknown,
      options: unknown,
    ) => Promise<unknown>;
    await assert.rejects(
      Promise.resolve(
        execute({ query: 'fixture' }, { toolCallId: 'clip', messages: [] }),
      ),
      /no owner-authorized clip source/,
    );
  } finally {
    await f.close();
  }
});

test('guard reviews exact notification content; deny and security changes during permission await fail closed', async () => {
  const f = fixture();
  try {
    const s = f.session('guard');
    const run = f.engine.runExternal(f.accountId, s.id, async (runSignal) =>
      f.service.enqueue(s, input, 'guard', runSignal),
    );
    for (
      let n = 0;
      n < 30 && !f.engine.get(f.accountId, s.id).suspensions.length;
      n++
    )
      await new Promise((resolve) => setImmediate(resolve));
    const suspension = f.engine.get(f.accountId, s.id).suspensions[0];
    assert.ok(suspension);
    assert.deepEqual(
      (suspension.request as { operation: unknown }).operation,
      input,
    );
    f.engine.resolve(f.accountId, s.id, 'guard', {
      verdict: 'deny',
      always: false,
    });
    await assert.rejects(run, /denied/);
    assert.equal(f.enqueues, 0);
    f.onStatus = () => {
      f.unlocked = false;
    };
    await assert.rejects(
      f.service.enqueue(f.session(), input, 'changed', signal()),
      /unlocked/,
    );
    assert.equal(f.enqueues, 0);
  } finally {
    await f.close();
  }
});

test('only one issued click activates exact bound ordinary session, replay/unknown/locked clicks are discarded', async () => {
  const f = fixture();
  try {
    const s = f.session();
    await assert.rejects(
      f.service.enqueue(
        s,
        { ...input, sessionLink: 'foreign-session' },
        'foreign',
        signal(),
      ),
      /issuing session/,
    );
    const ack = await f.service.enqueue(
      s,
      { ...input, sessionLink: s.id },
      'one',
      signal(),
    );
    assert.equal(ack.deliveryConfirmed, false);
    assert.deepEqual(
      await f.service.enqueue(
        s,
        { ...input, sessionLink: s.id },
        'one',
        signal(),
      ),
      ack,
    );
    await assert.rejects(
      f.service.enqueue(
        s,
        { ...input, body: 'changed', sessionLink: s.id },
        'one',
        signal(),
      ),
      /content changed/,
    );
    f.activations = [`aux-${'a'.repeat(64)}`, ack.operationId, ack.operationId];
    await f.service.poll();
    assert.equal(f.bridgeCalls.length, 1);
    const [route, command] = f.bridgeCalls[0] as unknown[];
    assert.deepEqual(route, {
      accountId: f.accountId,
      profileId: 'fixture-profile',
      browserMode: 'default',
    });
    assert.deepEqual(command, {
      method: 'chat.activate',
      params: {
        accountId: f.accountId,
        profileId: 'fixture-profile',
        browserMode: 'default',
        sessionId: s.id,
      },
    });
    const second = await f.service.enqueue(
      s,
      { ...input, sessionLink: s.id },
      'two',
      signal(),
    );
    f.activations = [second.operationId];
    f.unlocked = false;
    await f.service.poll();
    assert.equal(f.bridgeCalls.length, 1);
    f.unlocked = true;
    f.activations = [second.operationId];
    await f.service.poll();
    assert.equal(f.bridgeCalls.length, 1);
    assert.equal(f.enqueues, 2);
  } finally {
    await f.close();
  }
});

test('lost native acknowledgement is never reported as delivery or retried, explicit deny applies to full-access', async () => {
  const f = fixture();
  try {
    const s = f.session();
    f.store.set(f.accountId, 'permissions', 'rules', {
      deny: ['notification'],
    });
    await assert.rejects(
      f.service.enqueue(s, input, 'denied', signal()),
      /denied/,
    );
    assert.equal(f.enqueues, 0);
    f.store.set(f.accountId, 'permissions', 'rules', {});
    f.enqueueFailure = true;
    await assert.rejects(
      f.service.enqueue(s, { ...input, sessionLink: s.id }, 'lost', signal()),
      /outcome unknown/,
    );
    f.enqueueFailure = false;
    await assert.rejects(
      f.service.enqueue(s, { ...input, sessionLink: s.id }, 'lost', signal()),
      /outcome is unknown/,
    );
    await f.service.poll();
    assert.equal(f.enqueues, 1);
    assert.equal(f.drains, 0);
  } finally {
    await f.close();
  }
});
