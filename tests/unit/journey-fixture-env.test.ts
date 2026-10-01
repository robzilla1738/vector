import { afterEach, expect, it } from 'vitest';
import { chmodSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateFixtureEnv } from '../host/lib/app.mjs';
const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
function transport() {
  const root = mkdtempSync('/tmp/aux-fixture-env-'); roots.push(root);
  const ca = join(root, 'fixture-ca.pem'); writeFileSync(ca, 'disposable fixture certificate', { mode: 0o600 });
  const proxy = 'http://127.0.0.1:12345';
  return { root, ca, proxy, env: { NODE_USE_ENV_PROXY: '1', HTTPS_PROXY: proxy, NODE_EXTRA_CA_CERTS: ca } };
}
it('accepts only the owned listener and owner-only disposable CA', () => {
  const { env, proxy, root } = transport();
  expect(() => validateFixtureEnv(env, proxy, root)).not.toThrow();
});
it('refuses additional settings, TLS bypass, changed listener, and non-loopback proxy URLs', () => {
  const { env, proxy, root } = transport();
  for (const extra of [{ ...env, NODE_TLS_REJECT_UNAUTHORIZED: '0' }, { ...env, NODE_USE_ENV_PROXY: '0' }, { ...env, HTTPS_PROXY: 'http://127.0.0.1:54321' }])
    expect(() => validateFixtureEnv(extra, proxy, root)).toThrow();
  for (const target of ['https://127.0.0.1:12345', 'http://proxy.example:12345', 'http://user:pass@127.0.0.1:12345', 'http://127.0.0.1:12345/path', `${proxy}?query`, `${proxy}#fragment`])
    expect(() => validateFixtureEnv({ ...env, HTTPS_PROXY: target }, target, root)).toThrow();
});
it('refuses a readable-by-others CA or a symlink escaping disposable user data', () => {
  const { env, proxy, root, ca } = transport();
  chmodSync(ca, 0o644);
  expect(() => validateFixtureEnv(env, proxy, root)).toThrow('owner-only');
  const other = transport();
  const link = join(root, 'outside.pem'); symlinkSync(other.ca, link);
  expect(() => validateFixtureEnv({ ...env, NODE_EXTRA_CA_CERTS: link }, proxy, root)).toThrow('inside disposable');
  expect(() => validateFixtureEnv({ ...env, NODE_EXTRA_CA_CERTS: root }, proxy, root)).toThrow();
});
