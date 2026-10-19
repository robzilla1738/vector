import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  createVaultBiometryAdapter,
  HelperClient,
} from '../src/helpers/client.js';

test('biometric enrollment identity isolates Aux homes and keeps canonical aliases stable', async () => {
  const root = mkdtempSync(join(tmpdir(), 'aux-biometry-scope-'));
  try {
    for (const name of ['one', 'two']) mkdirSync(join(root, name));
    symlinkSync(join(root, 'one'), join(root, 'alias'));
    async function identity(home: string, accountId: number) {
      const client = new HelperClient(
        '/unlaunched/aux-computer-use',
        join(root, home, 'helper-artifacts'),
      );
      let observed: unknown;
      client.call = async (method, params) => {
        assert.equal(method, 'vault.biometryStatus');
        observed = params;
        return { available: false, enrolled: false };
      };
      await createVaultBiometryAdapter(client).status(accountId);
      await client.close();
      return observed as { accountId: number; vaultId: string };
    }
    const one = await identity('one', 1);
    assert.match(one.vaultId, /^master-[a-f0-9]{64}$/);
    assert.deepEqual(one, await identity('alias', 1));
    assert.notEqual(one.vaultId, (await identity('two', 1)).vaultId);
    assert.notDeepEqual(one, await identity('one', 2));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
