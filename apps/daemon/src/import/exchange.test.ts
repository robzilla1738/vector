import assert from 'node:assert/strict';
import { generateKeyPairSync, randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { BridgeRegistry } from '../bridge/registry.js';
import { Store } from '../storage/store.js';
import { VaultService } from '../vault/service.js';
import { CredentialExchange, type ExchangeHelper } from './exchange.js';

function recordPassword() {
  return {
    kind: 'password',
    sourceId: 'fixture-record-password',
    title: 'Fixture login',
    subtitle: '',
    urls: ['https://fixture.invalid/login'],
    tags: [],
    favorite: false,
    username: 'fixture-user',
    password: 'disposable-exchange-password',
    notes: 'Fixture private note',
  };
}
function recordPasskey(curve = 'prime256v1') {
  const { privateKey } = generateKeyPairSync('ec', { namedCurve: curve });
  return {
    kind: 'passkey',
    sourceId: 'fixture-record-passkey',
    title: 'Fixture passkey',
    subtitle: '',
    urls: ['https://fixture.invalid'],
    tags: [],
    favorite: false,
    credentialId: Buffer.from('fixture-credential-id').toString('base64'),
    rpId: 'fixture.invalid',
    userName: 'fixture-user',
    displayName: 'Fixture user',
    userId: Buffer.from('fixture-user-handle').toString('base64'),
    privateKey: privateKey
      .export({ format: 'der', type: 'pkcs8' })
      .toString('base64'),
  };
}
class FixtureHelper implements ExchangeHelper {
  id = '';
  receiptId = randomUUID();
  state = 'waiting';
  cursor = 0;
  records: ReturnType<typeof recordPassword | typeof recordPasskey>[] = [];
  supported = true;
  secretReads = 0;
  readGate: Promise<void> | undefined;
  status() {
    return {
      sessionId: this.id,
      receiptId:
        this.state === 'waiting' || this.state === 'importing'
          ? null
          : this.receiptId,
      state: this.state,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      passwordTotal: this.records.filter((record) => record.kind === 'password')
        .length,
      passkeyTotal: this.records.filter((record) => record.kind === 'passkey')
        .length,
      passwordCompleted: 0,
      passkeyCompleted: 0,
      unsupported: {},
      cursor: this.cursor,
    };
  }
  async call(
    method: Parameters<ExchangeHelper['call']>[0],
    params: Record<string, unknown>,
  ) {
    if (method === 'capabilities')
      return {
        nativeCredentialExchange: {
          supported: this.supported,
          reason: this.supported ? 'fixture' : 'os-authorized-signing-required',
        },
      };
    if (method === 'exchange.begin') {
      this.id = String(params.sessionId);
      this.receiptId = randomUUID();
      this.cursor = 0;
      this.state = 'waiting';
    }
    if (method === 'exchange.read') {
      this.secretReads++;
      if (this.readGate) await this.readGate;
      return {
        sessionId: this.id,
        receiptId: this.receiptId,
        cursor: this.cursor,
        records: this.records.slice(this.cursor),
        done: true,
      };
    }
    if (method === 'exchange.ack') this.cursor += Number(params.count);
    if (method === 'exchange.cancel') this.state = 'cancelled';
    if (method === 'exchange.finish') this.state = 'succeeded';
    return this.status();
  }
}
async function fixture() {
  const home = mkdtempSync(join(tmpdir(), 'aux-exchange-daemon-')),
    store = new Store(home),
    bridge = new BridgeRegistry();
  let connected = true;
  bridge.status = () => ({ connected, connectionCount: Number(connected) });
  const accountId = store.current(),
    profileId = 'fixture-exchange-profile';
  store.bind({ accountId, profileId, profilePath: join(home, 'profile') });
  const vault = new VaultService(store);
  await vault.setup(accountId, 'fixture exchange unlock password');
  const vaultId = vault.snapshot(accountId).vaults[0]?.id;
  assert.ok(vaultId);
  const helper = new FixtureHelper(),
    exchange = new CredentialExchange({ store, bridge }, vault, helper);
  return {
    home,
    store,
    vault,
    helper,
    exchange,
    scope: { accountId, profileId, vaultId, browserMode: 'default' as const },
    disconnect: () => {
      connected = false;
    },
    async close() {
      await exchange.close();
      bridge.close();
      vault.close();
      store.close();
      rmSync(home, { recursive: true, force: true });
    },
  };
}
async function acceptReady(f: Awaited<ReturnType<typeof fixture>>, id: string) {
  const beforeReads = f.helper.secretReads;
  await f.exchange.poll();
  assert.equal(f.helper.secretReads, beforeReads);
  const received = await f.exchange.status(f.scope.accountId, id);
  assert.equal(received.needsAcceptance, true);
  assert.ok(received.receiptId);
  await assert.rejects(
    f.exchange.accept(f.scope.accountId, id, randomUUID()),
    /export changed/,
  );
  await f.exchange.accept(f.scope.accountId, id, received.receiptId);
}
test('accepted native passwords and validated ES256 keys persist only in appropriate encrypted collections and deduplicate', async () => {
  const f = await fixture();
  try {
    const password = recordPassword(),
      passkey = recordPasskey();
    f.helper.records = [password, passkey];
    const started = await f.exchange.begin(f.scope);
    f.helper.state = 'ready';
    await acceptReady(f, started.id);
    await f.exchange.poll();
    const completed = await f.exchange.status(f.scope.accountId, started.id);
    assert.equal(completed.state, 'succeeded');
    assert.equal(completed.passwordsCreated, 1);
    assert.equal(completed.passkeysCreated, 1);
    assert.equal(
      f.vault.snapshot(f.scope.accountId).items[0]?.loginFields?.password,
      password.password,
    );
    assert.equal(f.vault.readPasskeys(f.scope.accountId).length, 1);
    const ordinary = JSON.stringify(f.vault.snapshot(f.scope.accountId));
    assert.ok(!ordinary.includes(passkey.privateKey));
    const encrypted = readFileSync(
      f.store.safeFile(f.scope.accountId, 'vault-state.json'),
      'utf8',
    );
    assert.ok(!encrypted.includes(password.password));
    assert.ok(!encrypted.includes(passkey.privateKey));
    assert.ok(!JSON.stringify(completed).includes(password.password));
    const retried = await f.exchange.begin(f.scope);
    f.helper.state = 'ready';
    await acceptReady(f, retried.id);
    await f.exchange.poll();
    const retry = await f.exchange.status(f.scope.accountId, retried.id);
    assert.equal(retry.passwordsSkipped, 1);
    assert.equal(retry.passkeysSkipped, 1);
    assert.equal(f.vault.snapshot(f.scope.accountId).items.length, 1);
    assert.equal(f.vault.readPasskeys(f.scope.accountId).length, 1);
  } finally {
    await f.close();
  }
});
test('late helper batches cannot write after cancellation, and invalid private keys fail before password acceptance', async () => {
  const f = await fixture();
  try {
    f.helper.records = [recordPassword()];
    const started = await f.exchange.begin(f.scope);
    f.helper.state = 'ready';
    await acceptReady(f, started.id);
    let release: () => void = () => {};
    f.helper.readGate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const pending = f.exchange.poll();
    await new Promise((resolve) => setImmediate(resolve));
    await f.exchange.cancel(f.scope.accountId, started.id);
    release();
    await pending;
    assert.equal(
      (await f.exchange.status(f.scope.accountId, started.id)).state,
      'cancelled',
    );
    assert.equal(f.vault.snapshot(f.scope.accountId).items.length, 0);
    f.helper.readGate = undefined;
    f.helper.records = [recordPassword(), recordPasskey('secp384r1')];
    const malformed = await f.exchange.begin(f.scope);
    f.helper.state = 'ready';
    await acceptReady(f, malformed.id);
    await f.exchange.poll();
    assert.equal(
      (await f.exchange.status(f.scope.accountId, malformed.id)).state,
      'failed',
    );
    assert.equal(f.vault.snapshot(f.scope.accountId).items.length, 0);
    assert.equal(f.vault.readPasskeys(f.scope.accountId).length, 0);
  } finally {
    await f.close();
  }
});
test('lock pauses secret access until explicit destination reauthorization; missing bridge and unsigned capability refuse', async () => {
  const f = await fixture();
  try {
    f.helper.records = [recordPassword()];
    const started = await f.exchange.begin(f.scope);
    f.helper.state = 'ready';
    f.vault.lock(f.scope.accountId);
    await f.exchange.poll();
    assert.equal(
      (await f.exchange.status(f.scope.accountId, started.id))
        .needsAuthorization,
      true,
    );
    await f.vault.unlock(f.scope.accountId, 'fixture exchange unlock password');
    await f.exchange.poll();
    assert.equal(f.vault.snapshot(f.scope.accountId).items.length, 0);
    await f.exchange.resume(f.scope.accountId, started.id);
    await acceptReady(f, started.id);
    await f.exchange.poll();
    assert.equal(
      (await f.exchange.status(f.scope.accountId, started.id)).state,
      'succeeded',
    );
    f.helper.supported = false;
    await assert.rejects(
      f.exchange.begin(f.scope),
      /OS-authorized credential provider/,
    );
    f.helper.supported = true;
    f.disconnect();
    await assert.rejects(
      f.exchange.begin(f.scope),
      /ordinary browser account and profile/,
    );
  } finally {
    await f.close();
  }
});

test('idle sessions time out without accepting a late batch and terminal status expires', async (t) => {
  const f = await fixture();
  try {
    f.helper.records = [recordPassword()];
    const started = await f.exchange.begin(f.scope);
    t.mock.timers.enable({ apis: ['Date'], now: Date.now() });
    t.mock.timers.tick(600_001);
    assert.equal(
      (await f.exchange.status(f.scope.accountId, started.id)).state,
      'timeout',
    );
    f.helper.state = 'ready';
    await f.exchange.poll();
    assert.equal(f.vault.snapshot(f.scope.accountId).items.length, 0);
    await assert.rejects(
      f.exchange.resume(f.scope.accountId, started.id),
      /active exchange session/,
    );
    t.mock.timers.tick(86400_001);
    await assert.rejects(
      f.exchange.status(f.scope.accountId, started.id),
      /expired/,
    );
  } finally {
    t.mock.timers.reset();
    await f.close();
  }
});
