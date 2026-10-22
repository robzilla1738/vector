import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { findMachOSeaSection, readSeaBlob } from '../aside/lib/sea.mjs';
import { adaptDaemonCode } from './daemon-adapter.mjs';
import { adaptCliCode } from './cli-adapter.mjs';
import { AUX_PROTOCOL_NAMES, applyAuxProtocolIdentity } from './aux-protocol-identity.mjs';

async function original(component) {
  const executable = component === 'daemon' ? 'aside-daemon' : 'aside';
  const binary = await readFile(new URL(`../../out/provided-source-snapshot-1.26.1016.1852/${component}/Contents/MacOS/${executable}`, import.meta.url));
  const section = findMachOSeaSection(binary);
  return readSeaBlob(binary.subarray(section.offset, section.offset + section.size)).code;
}
const daemon = await original('daemon'), cli = await original('cli');

test('actual pinned daemon and CLI compose Aux protocols after cloud integration and still parse', () => {
  for (const [component, source, adapt] of [['daemon', daemon, adaptDaemonCode], ['cli', cli, adaptCliCode]]) {
    for (const options of [{}, { enableCloud: true, profile: 'development' }]) {
      const baseline = adapt(source, options), result = adapt(source, options, 'aux-v1');
      for (const name of Object.keys(AUX_PROTOCOL_NAMES)) assert.equal(result.code.includes(name), false, `${component}: ${name}`);
      if (component === 'daemon') {
        assert.equal(result.code.includes('ei.slice(24).trim()'), false);
        assert.ok(result.code.includes('ti.slice(WEBSOCKET_PROTOCOL_PREFIX.length)'));
        // Renaming wire data must not silently reinterpret old ciphertext.
        assert.equal(result.code.split('aside.dk.').length, baseline.code.split('aside.dk.').length);
      }
      execFileSync(process.execPath, ['--check', '--input-type=module'], { input: result.code, stdio: ['pipe', 'pipe', 'pipe'] });
      assert.equal(adapt(source, options, 'compatibility').code, baseline.code);
    }
    assert.throws(() => adapt(source, {}, 'unknown'), /Unsupported/);
  }
});

test('actual rewritten HTTP/WebSocket parsers retain the whole token and reject old scheme names', async () => {
  const { code } = adaptDaemonCode(daemon, { enableCloud: true, profile: 'development' }, 'aux-v1');
  const token = 'fixture.jwt.payload';
  const received = [];
  const context = vm.createContext({
    WEBSOCKET_PROTOCOL_PREFIX: 'aux.daemon.auth.',
    verifyDaemonSessionToken: async value => { received.push(value); return value === token; },
    verifyDaemonDevAuthToken: async () => false,
    getTokenSigningKey: async () => 'fixture-key',
    jwtVerify: async (value, key, options) => {
      assert.equal(value, token); assert.equal(key, 'fixture-key');
      assert.equal(options.audience, 'aux-daemon-localhost'); assert.equal(options.issuer, 'aux-daemon');
      return { payload: { sub: 'agent-manager-extension' } };
    },
  });
  for (const [start, end] of [
    ['async function verifyDaemonAuthHttpRequest(', 'function pruneExpiredDaemonAuthChallenges('],
    ['async function isBrowserUiDaemonRequest(', 'async function verifyDaemonDevAuthToken('],
  ]) {
    const begin = code.indexOf(start), finish = code.indexOf(end, begin);
    assert.ok(begin >= 0 && finish > begin);
    new vm.Script(code.slice(begin, finish)).runInContext(context);
  }
  const request = headers => ({ headers: new Headers(headers) });
  assert.equal(await context.verifyDaemonAuthHttpRequest(request({ authorization: `AuxDaemonSessionToken ${token}` })), true);
  assert.equal(await context.verifyDaemonAuthHttpRequest(request({ 'sec-websocket-protocol': `other, aux.daemon.auth.${token}` })), true);
  assert.deepEqual(received, [token, token]);
  assert.equal(await context.isBrowserUiDaemonRequest(request({ authorization: `AuxDaemonSessionToken ${token}` })), true);
  assert.equal(await context.verifyDaemonAuthHttpRequest(request({ authorization: `AsideDaemonSessionToken ${token}` })), null);
  assert.equal(await context.verifyDaemonAuthHttpRequest(request({ 'sec-websocket-protocol': `aside.daemon.auth.${token}` })), null);
  assert.equal(await context.isBrowserUiDaemonRequest(request({ authorization: `AsideDaemonSessionToken ${token}` })), false);
  assert.throws(() => applyAuxProtocolIdentity({ component: 'daemon', text: code }, 'aux-v1'), /count drift/);
});
