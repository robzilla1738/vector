import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  cryptoReady,
  domain,
  open,
  randomKey,
  seal,
  wipe,
} from '../src/cipher/crypto.js';
import { itemFields, itemPatchSchema } from '../src/vault/schema.js';
import { VaultService } from '../src/vault/service.js';

function fixture() {
  const directory = mkdtempSync(join(tmpdir(), 'aux-vault-test-'));
  const store = {
    accounts() {
      return [
        {
          id: 1,
          name: 'Disposable',
          provider: 'local',
          mode: 'local' as const,
          authStatus: 'local',
          createdAt: 1,
        },
      ];
    },
    requireAccount(id: number) {
      assert.equal(id, 1);
      return {
        id: 1,
        name: 'Disposable',
        provider: 'local',
        mode: 'local' as const,
        authStatus: 'local',
        createdAt: 1,
      };
    },
    safeFile(id: number, name: string) {
      assert.equal(id, 1);
      assert.ok(['vault-state.json', 'security-state.json'].includes(name));
      return join(directory, name);
    },
    registerAccountDeletionHandler(
      _handler: (id: number) => Promise<void> | void,
    ) {
      return () => true;
    },
  };
  const vault = new VaultService(store);
  return {
    vault,
    file: join(directory, 'vault-state.json'),
    close() {
      vault.close();
      rmSync(directory, { recursive: true, force: true });
    },
  };
}
test('wrong password stays locked and all item data/history remain encrypted', async () => {
  const fixtureState = fixture();
  try {
    const { vault, file } = fixtureState;
    await vault.setup(1, 'first strong password');
    const vaultId = vault.snapshot(1).vaults[0]?.id;
    assert.ok(vaultId);
    const created = vault.createItems(1, [
      itemFields.parse({
        vaultId,
        category: 'login',
        title: 'private item title',
        urls: ['https://example.com/secret'],
        loginFields: {
          username: 'private username',
          password: 'private secret password',
        },
        notes: 'private note',
      }),
    ]);
    const item = created.items[0];
    assert.ok(item);
    vault.updateItem(
      1,
      item.id,
      {
        loginFields: {
          username: 'private username',
          password: 'replacement secret',
        },
      },
      1,
    );
    assert.equal(
      vault.itemHistory(1, item.id)[0]?.loginFields?.password,
      'private secret password',
    );
    assert.throws(
      () => vault.updateItem(1, item.id, { title: 'stale' }, 1),
      /changed/,
    );
    vault.updateItem(
      1,
      item.id,
      itemPatchSchema.parse({ title: 'Renamed' }),
      2,
    );
    assert.equal(vault.getItem(1, item.id).notes, 'private note');
    assert.deepEqual(vault.getItem(1, item.id).urls, [
      'https://example.com/secret',
    ]);
    const persisted = readFileSync(file, 'utf8');
    for (const secret of [
      'private item title',
      'private secret password',
      'replacement secret',
      'private username',
      'https://example.com/secret',
      'private note',
    ])
      assert.equal(persisted.includes(secret), false);
    vault.lock(1);
    await assert.rejects(
      vault.unlock(1, 'incorrect password'),
      /did not unlock/,
    );
    assert.equal(vault.status(1).locked, true);
    assert.throws(() => vault.snapshot(1), /Unlock/);
    assert.equal(vault.cipherSnapshot(1).items.length, 1);
    await vault.unlock(1, 'first strong password');
    assert.equal(
      vault.getItem(1, item.id).loginFields?.password,
      'replacement secret',
    );
  } finally {
    fixtureState.close();
  }
});
test('ciphertext corruption and cross-account associated data fail authentication', async () => {
  await cryptoReady;
  const key = randomKey();
  try {
    const sealed = seal(
      new TextEncoder().encode('secret'),
      key,
      domain(1, 'item/test/1'),
    );
    assert.throws(() => open(sealed, key, domain(2, 'item/test/1')));
  } finally {
    wipe(key);
  }
  const fixtureState = fixture();
  try {
    const { vault, file } = fixtureState;
    await vault.setup(1, 'tamper test password');
    const vaultId = vault.snapshot(1).vaults[0]?.id;
    assert.ok(vaultId);
    const item = vault.createItems(1, [
      itemFields.parse({
        vaultId,
        category: 'secure-note',
        title: 'Note',
        notes: 'secret',
      }),
    ]).items[0];
    assert.ok(item);
    const persisted = JSON.parse(readFileSync(file, 'utf8'));
    const ciphertext = persisted.items[item.id].sealed.ciphertext;
    persisted.items[item.id].sealed.ciphertext =
      (ciphertext[0] === 'A' ? 'B' : 'A') + ciphertext.slice(1);
    writeFileSync(file, JSON.stringify(persisted));
    assert.throws(() => vault.snapshot(1), /could not be authenticated/);
  } finally {
    fixtureState.close();
  }
});
test('recovery preserves items and invalidates old recovery key and old password', async () => {
  const fixtureState = fixture();
  try {
    const { vault } = fixtureState;
    const initial = await vault.setup(1, 'old password value');
    const vaultId = vault.snapshot(1).vaults[0]?.id;
    assert.ok(vaultId);
    const item = vault.createItems(1, [
      itemFields.parse({
        vaultId,
        category: 'secure-note',
        title: 'Recovery note',
        notes: 'keep me',
      }),
    ]).items[0];
    assert.ok(item);
    vault.lock(1);
    assert.deepEqual(await vault.verifyRecovery(1, initial.recoveryKey), {
      valid: true,
    });
    const recovered = await vault.recoverPassword(
      1,
      initial.recoveryKey,
      'new password value',
    );
    assert.notEqual(recovered.recoveryKey, initial.recoveryKey);
    assert.equal(vault.getItem(1, item.id).notes, 'keep me');
    vault.lock(1);
    await assert.rejects(
      vault.unlock(1, 'old password value'),
      /did not unlock/,
    );
    await assert.rejects(
      vault.verifyRecovery(1, initial.recoveryKey),
      /could not be verified/,
    );
    await vault.unlock(1, 'new password value');
    assert.equal(vault.getItem(1, item.id).notes, 'keep me');
    assert.deepEqual(await vault.verifyRecovery(1, recovered.recoveryKey), {
      valid: true,
    });
    await vault.changePassword(1, 'new password value', 'third password value');
    vault.lock(1);
    await assert.rejects(
      vault.unlock(1, 'new password value'),
      /did not unlock/,
    );
    await vault.unlock(1, 'third password value');
  } finally {
    fixtureState.close();
  }
});
