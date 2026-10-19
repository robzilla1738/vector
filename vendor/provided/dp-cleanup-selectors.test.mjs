import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
const { continuationKeys } = createRequire(import.meta.url)('./native-dp-diagnostic.cjs');

test('default account0 and actual PWM nativeSlot derive exact cleanup keys; invalid MCP IDs refuse', () => {
  const home = fs.mkdtempSync(path.join(tmpdir(), 'aux-dp-selector-fixture-'));
  fs.chmodSync(home, 0o700);
  const write = (name, value) => fs.writeFileSync(path.join(home, name), JSON.stringify(value), { mode: 0o600 });
  try {
    write('accounts.json', { version: 1, currentAccountId: 0, accounts: [{ id: 0, provider: 'anonymous', mode: 'local' }], sessions: {}, localBootstraps: {}, profileBindings: {}, profileAccountBindings: {} });
    fs.mkdirSync(path.join(home, 'password-manager'), { mode: 0o700 });
    const pwmId = '00000000-0000-4000-8000-000000000007';
    write('password-manager/accounts.json', { version: 1, accounts: [{ id: pwmId, storage: { nativeSlot: -1 } }], connections: [] });
    write('.aux-dp-test-keys.json', { mcpServers: [{ accountId: 0, serverId: 'fixture-server' }] });
    assert.deepEqual(continuationKeys(home), [
      'aux.csk_0', `aux.pwm.auth_${pwmId}`, 'aside.pwm.session_-1',
      'mcp:index:0', 'mcp:0:fixture-server',
    ]);
    for (const entry of [{ accountId: 1, serverId: 'fixture-server' }, { accountId: 0 }, { accountId: 0, serverId: 123 }, { accountId: 0, serverId: '../owner' }]) {
      write('.aux-dp-test-keys.json', { mcpServers: [entry] });
      assert.throws(() => continuationKeys(home), /invalid-test-server-id/);
    }
    write('accounts.json', { version: 1, accounts: [{ id: -1 }] });
    assert.throws(() => continuationKeys(home), /invalid-test-account-id/);
  } finally { fs.rmSync(home, { recursive: true, force: true }); }
});
