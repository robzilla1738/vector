import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { AgentEngine } from '@aux/agent';
import { Store } from '../storage/store.js';
import { ChannelService } from './service.js';

test('identity test never enables receiving and pairing approval rejects a changed reviewed policy', async () => {
  const home = mkdtempSync(join(tmpdir(), 'aux-channel-review-')),
    store = new Store(home),
    accountId = store.current(),
    engine = new AgentEngine(store);
  let probes = 0;
  let releaseProbe: (() => void) | undefined;
  let markStarted: (() => void) | undefined;
  let delayProbe = false;
  const service = new ChannelService(store, engine, {
    identify: async () => {
      probes++;
      if (delayProbe)
        await new Promise<void>((resolve) => {
          releaseProbe = resolve;
          markStarted?.();
        });
      return { id: '123456', name: 'Fixture bot' };
    },
    updates: async () => {
      throw Error('Identity test must not poll');
    },
    send: async () => {
      throw Error('Identity test must not send');
    },
  });
  try {
    const token = '123456:synthetic_fixture_token_value';
    const tested = await service.testConnection(accountId, { token });
    assert.equal(tested.verified, true);
    assert.deepEqual(service.list(accountId), []);
    assert.ok(!JSON.stringify(tested).includes(token));
    const connection = await service.create(accountId, {
      name: 'Fixture',
      token,
      enabled: false,
    });
    await service.testConnection(accountId, { connectionId: connection.id });
    assert.equal(service.list(accountId)[0]?.status, 'stopped');
    assert.equal(probes, 3);
    service.ingest(accountId, connection.id, {
      update_id: 1,
      message: {
        message_id: 1,
        text: 'Synthetic pending request',
        date: 1,
        chat: { id: 42, type: 'private' },
        from: { id: 42, is_bot: false, first_name: 'Fixture' },
      },
    });
    const pairing = service.pairings(accountId)[0];
    assert.ok(pairing);
    const reviewed = service.policy(accountId, connection.id);
    const current = service.updatePolicy(accountId, connection.id, {
      allowTasks: false,
    });
    assert.throws(
      () => service.decide(accountId, pairing.id, true, reviewed),
      /policy changed/,
    );
    assert.equal(service.pairings(accountId)[0]?.state, 'pending');
    service.decide(accountId, pairing.id, true, current);
    assert.equal(engine.list(accountId).length, 0);
    assert.equal(
      service.principals(accountId, connection.id)[0]?.senderId,
      '42',
    );
    delayProbe = true;
    const started = new Promise<void>((resolve) => {
      markStarted = resolve;
    });
    const rotating = service.update(accountId, connection.id, { token });
    await started;
    await service.remove(accountId, connection.id);
    releaseProbe?.();
    await assert.rejects(rotating, /does not exist/);
    assert.deepEqual(service.list(accountId), []);
    assert.equal(
      service.credentials.status(accountId, connection.id).exists,
      false,
    );
  } finally {
    await service.close();
    await engine.close();
    store.close();
    rmSync(home, { recursive: true, force: true });
  }
});
