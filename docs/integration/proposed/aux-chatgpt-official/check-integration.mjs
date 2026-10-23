import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Script, runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { findMachOSeaSection, readSeaBlob } from '../../../../vendor/aside/lib/sea.mjs';
import { DAEMON_CODE_SHA256 } from '../../../../vendor/provided/daemon-adapter.mjs';
import { adaptProviderLaunchCode as adaptDaemonCode } from '../../../../vendor/provided/provider-launch-stage.mjs';
import { applyOfficialChatGPTCallbackAsset } from '../../../../vendor/aside/patches/chatgpt.mjs';
const [binaryPath, assetPath] = process.argv.slice(2);
if (!binaryPath || !assetPath) throw Error('Provide pinned supplied daemon binary and shared callback asset paths');
const binary = readFileSync(binaryPath), section = findMachOSeaSection(binary);
const original = readSeaBlob(binary.subarray(section.offset, section.offset + section.size)).code;
assert.equal(createHash('sha256').update(original).digest('hex'), DAEMON_CODE_SHA256);
const baseline = adaptDaemonCode(original, {}, 'aux-v1', 2);
const result = { source: baseline.code, patches: baseline.applied.slice(-24) };
assert.equal(result.patches.at(-1).name, 'no private ChatGPT usage requests');
const temp = mkdtempSync(join(tmpdir(), 'aux-chatgpt-source-check-'));
try {
  // Syntax only: never execute supplied daemon/startup/native code.
  const path = join(temp, 'entry.mjs'); writeFileSync(path, result.source);
  execFileSync(process.execPath, ['--check', path], { stdio: 'pipe' });
  const classStart = result.source.indexOf('CredentialStorage=class Cn{') + 'CredentialStorage='.length;
  const classEnd = result.source.indexOf('}));function normalizeModelRoutingSelection', classStart);
  const classCode = result.source.slice(classStart, classEnd);
  new Script(`(${classCode})`);
  const local = { type: 'oauth', access: 'fixture-private-access', refresh: 'fixture-private-refresh' };
  const writes = [];
  const CredentialStorage = runInNewContext(`(${classCode})`, {
    createModels: () => ({ setProvider() {} }), anthropicMessagesApi: () => ({}), OAUTH_PROVIDERS: [],
    auxChatGPT: () => ({ daemonClient: () => ({ store: { read: () => local } }), localAccount: String })
  });
  let synced = { 'openai-codex': { type: 'oauth', access: 'legacy-fixture' }, openai: { type: 'api_key', key: 'fixture-BYOK' } };
  const credentials = CredentialStorage.fromBackend({ withLock: fn => fn(synced).result });
  assert.equal(credentials.get('openai-codex').access, local.access);
  assert.equal(credentials.getAll()['openai-codex'].type, 'oauth');
  assert.equal(JSON.stringify(credentials.getAll()).includes('fixture-private'), false);
  assert.throws(() => credentials.set('openai-codex', local), /verified local/);
  assert.equal(synced['openai-codex'].access, 'legacy-fixture');
  const callback = applyOfficialChatGPTCallbackAsset(readFileSync(assetPath, 'utf8'));
  assert.equal(callback.includes('http://localhost:1455'), false);
  console.log(JSON.stringify({ schema: 'aux.chatgpt.official-source-check.v1', originalSha256: DAEMON_CODE_SHA256, identity: 'aux-v1', stateVersion: 2, anchors: result.patches, checks: ['full transformed ESM syntax', 'actual supplied CredentialStorage local selection and metadata-only enumeration', 'legacy credential bytes preserved', 'unverified generic writes refused', 'callback IPv4 exact anchor'], network: false, ownerState: false, runtimeAcceptance: false }, null, 2));
} finally { rmSync(temp, { recursive: true, force: true }); }
