import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createHash, randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { applyCloudSyncAdapter, cloudSyncHelpers } from './cloud-sync-adapter.mjs';

const originalPath = '/Users/rcourson/Downloads/aside-rea 2/extracted/daemon-app/index.mjs';
test('cloud sync patch count-checks every supplied source anchor and refuses reapplication', async () => {
  const source = await readFile(originalPath, 'utf8');
  const result = applyCloudSyncAdapter(source);
  assert.equal(result.anchors.length, 10);
  assert.ok(result.text.includes('ni.bytes,ni.path'));
  assert.throws(() => applyCloudSyncAdapter(result.text), /anchor changed/);
  assert.throws(() => applyCloudSyncAdapter(source.replace('function requireEtag(Cn){', 'function changedRequireEtag(Cn){')), /anchor changed/);
});

function fixture() {
  const key = randomBytes(32), account = { userId: 'disposable-test-user', createdAt: '2026-10-21' };
  let generation = 0;
  const context = vm.createContext({ Buffer, Uint8Array, Map, Set, JSON, Number, Error,
    getValidAccessToken: async () => 'test-token',
    AccountRegistry: { getAccount: () => account, getSession: () => ({ accessToken: 'test-token' }) },
    readAccessTokenSyncGeneration: () => generation,
    fetchAccountSyncPassphrase: async () => key.toString('base64'),
    isValidAgentFilePath: path => typeof path === 'string' && path.split('/').every(part => part && part !== '.' && part !== '..'),
    sha256Hex: bytes => createHash('sha256').update(bytes).digest('hex'),
    agentFileHeadSchema: { parse: head => ({ formatVersion: 1, files: head.files.map(({ path, sha256, size }) => ({ path, sha256, size })) }) },
  });
  new vm.Script(cloudSyncHelpers, { importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER }).runInContext(context);
  return { context, account, changeGeneration: () => { generation += 1; } };
}

test('supplied-client adapter roundtrips credential bytes and rejects wrong account/path/generation', async () => {
  const { context, account, changeGeneration } = fixture();
  const bytes = Buffer.from('{"provider":{"type":"api_key","key":"disposable-fixture"}}');
  const hash = createHash('sha256').update(bytes).digest('hex');
  const encrypted = await context.auxCloudEncryptFile(1, hash, bytes, 'credentials.json');
  assert.notEqual(encrypted.entry.objectSha256, hash);
  context.fetchAsideAPIAuthenticatedRequest = async (_accountId, route) => {
    assert.equal(route, `/sync/agent-files/objects/${encrypted.entry.objectSha256}`);
    return new Response(encrypted.bytes);
  };
  assert.deepEqual(Buffer.from(await context.auxCloudDecryptFile(1, hash, 'credentials.json')), bytes);
  const wireHead = await context.auxCloudWriteHead(1, { formatVersion: 1, files: [{ path: 'credentials.json', sha256: hash, size: bytes.length }] });
  const returned = await context.auxCloudReadHead(1, wireHead);
  assert.equal(returned.files[0].sha256, hash);
  assert.equal(returned.files[0].objectSha256, undefined);
  await assert.rejects(context.auxCloudDecryptFile(1, hash, 'other.json'), /mapping missing/);
  account.userId = 'other-user';
  await assert.rejects(context.auxCloudReadHead(1, wireHead).then(() => context.auxCloudDecryptFile(1, hash, 'credentials.json')));
  account.userId = 'disposable-test-user';
  changeGeneration();
  await assert.rejects(context.auxCloudReadHead(1, wireHead), /metadata/);
});

test('adapter ignores remembered ETags after process restart until mappings are reloaded', async () => {
  const { context } = fixture();
  assert.equal(await context.auxCloudHasHeadCache(1), false);
  await assert.rejects(context.auxCloudWriteHead(1, { formatVersion: 1, files: [{ path: 'AGENTS.md', sha256: 'a'.repeat(64), size: 4 }] }), /mapping missing/);
});
