import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { AgentEngine } from '@aux/agent';
import { Store } from '../storage/store.js';
import { ChannelService } from './service.js';
import type { ChannelTransport, TelegramUpdate } from './telegram.js';

test('channel pairing and replay are scoped; uncertain sends cannot retry and tokens stay private', async () => {
  const home = mkdtempSync(join(tmpdir(), 'aux-channel-'));
  const store = new Store(home),
    accountId = store.current(),
    engine = new AgentEngine(store);
  let sends = 0;
  const transport: ChannelTransport = {
    identify: async () => ({ id: '123456', name: 'Fixture bot' }),
    updates: async () => [],
    send: async () => {
      sends++;
      throw Error('synthetic uncertain outcome');
    },
  };
  const channels = new ChannelService(store, engine, transport);
  try {
    const token = '123456:synthetic_fixture_token_value';
    const connection = await channels.create(accountId, {
      name: 'Fixture',
      token,
      enabled: false,
    });
    assert.ok(!JSON.stringify(connection).includes(token));
    assert.equal(
      statSync(join(store.accountHome(accountId), 'channel-credentials.json'))
        .mode & 0o777,
      0o600,
    );
    assert.equal(engine.credentials.redact(accountId, token), '[redacted]');
    const other = store.add('Other', 'local').id;
    assert.throws(() => channels.get(other, connection.id), /does not exist/);
    const update: TelegramUpdate = {
      update_id: 1,
      message: {
        message_id: 1,
        text: 'Synthetic paired task',
        date: Date.now() / 1000,
        chat: { id: 42, type: 'private' },
        from: { id: 42, is_bot: false, first_name: 'Fixture' },
      },
    };
    assert.deepEqual(channels.ingest(accountId, connection.id, update), {
      accepted: true,
      paired: false,
    });
    assert.equal(engine.list(accountId).length, 0);
    const pairing = channels.pairings(accountId, connection.id)[0];
    assert.ok(pairing);
    channels.decide(accountId, pairing.id, true);
    const session = engine.list(accountId)[0];
    assert.ok(session);
    await engine.wait(accountId, session.id);
    assert.equal(engine.get(accountId, session.id).permissionMode, 'read-only');
    assert.equal(engine.get(accountId, session.id).messages.length, 1);
    assert.equal(
      channels.ingest(accountId, connection.id, update).accepted,
      false,
    );
    assert.equal(engine.get(accountId, session.id).messages.length, 1);
    channels.updatePolicy(accountId, connection.id, { allowReplies: true });
    await assert.rejects(
      channels.send(
        accountId,
        connection.id,
        '42',
        'Synthetic text',
        'send-1',
        new AbortController().signal,
      ),
      /uncertain/,
    );
    await assert.rejects(
      channels.send(
        accountId,
        connection.id,
        '42',
        'Synthetic text',
        'send-1',
        new AbortController().signal,
      ),
      /uncertain/,
    );
    assert.equal(sends, 1);
    channels.updatePrincipal(accountId, connection.id, '42', false);
    assert.equal(
      channels.ingest(accountId, connection.id, { ...update, update_id: 2 })
        .accepted,
      false,
    );
    await channels.remove(accountId, connection.id);
    assert.equal(
      channels.credentials.status(accountId, connection.id).exists,
      false,
    );
    assert.deepEqual(channels.list(accountId), []);
  } finally {
    await channels.close();
    await engine.close();
    store.close();
    rmSync(home, { recursive: true, force: true });
  }
});
