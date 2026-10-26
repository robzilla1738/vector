import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import { bindCloudRequestAccount } from './cloud-transfer-binding.mjs';

const original = await fs.readFile('/Users/rcourson/Downloads/aside-rea 2/extracted/daemon-app/index.mjs', 'utf8');
const start = original.indexOf('async function fetchWithAccessTokenRefresh(');
const supplied = original.slice(start, original.indexOf('async function fetchAsideAPIAuthenticated(', start));
const patched = bindCloudRequestAccount(supplied);

test('refresh callback stays bound through initial token lookup and forced refresh', async () => {
  for (const replaceDuring of ['initial', 'refresh', 'response']) {
    let owner = 'original', lookups = 0, sends = 0;
    const context = vm.createContext({
      auxCloudTransferIdentity: () => owner,
      getValidAccessToken: async () => { lookups++; if (replaceDuring === 'initial' || replaceDuring === 'refresh' && lookups === 2) owner = 'replacement'; return 'fixture-token'; },
      isAccessTokenRefreshError: () => true,
      logger: { warn() {} },
    });
    new vm.Script(patched.text).runInContext(context);
    await assert.rejects(context.fetchWithAccessTokenRefresh(1, '/attachments/intents', async () => {
      sends++;
      if (replaceDuring === 'refresh') throw Error('Fixture expired token');
      if (replaceDuring === 'response') owner = 'replacement';
      return 'original account response';
    }), /Account changed/);
    assert.equal(sends, replaceDuring === 'initial' ? 0 : 1);
  }
});

test('same-account token rotation retains one retry and refuses duplicate transformation', async () => {
  let lookups = 0;
  const context = vm.createContext({ auxCloudTransferIdentity: () => 'original', getValidAccessToken: async () => ++lookups,
    isAccessTokenRefreshError: () => true, logger: { warn() {} } });
  new vm.Script(patched.text).runInContext(context);
  assert.equal(await context.fetchWithAccessTokenRefresh(1, '/fixture', async token => { if (token === 1) throw Error('Fixture expired token'); return 'complete'; }), 'complete');
  assert.equal(lookups, 2);
  assert.throws(() => bindCloudRequestAccount(patched.text), /expected one/);
});
