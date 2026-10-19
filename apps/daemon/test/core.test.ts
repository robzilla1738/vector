import assert from 'node:assert/strict';
import { sign } from 'node:crypto';
import { once } from 'node:events';
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { AUTH_DOMAIN, AUTH_PROTOCOL } from '@aux/contracts';
import { WebSocket } from 'ws';
import { Authority } from '../src/auth/authority.js';
import { createDaemon } from '../src/http/server.js';
import { Store } from '../src/storage/store.js';

const temporary = () => mkdtempSync(join(tmpdir(), 'aux-core-'));
test('challenge consumption, expiration, JWT authority and owner key mode', () => {
  const home = temporary();
  try {
    let now = Date.now();
    const authority = new Authority(home, () => now);
    const key = readFileSync(join(home, 'installation-private.pem'));
    const challenge = authority.challenge('cli');
    const signature = sign(
      'sha256',
      Buffer.concat([
        Buffer.from(AUTH_DOMAIN),
        Buffer.from(challenge.challenge, 'base64'),
      ]),
      key,
    ).toString('base64');
    const session = authority.session(challenge.challengeId, signature);
    assert.ok(session);
    assert.equal(authority.verify(session.access_token), 'cli');
    assert.equal(authority.session(challenge.challengeId, signature), null);
    const bad = authority.challenge('cli');
    assert.equal(authority.session(bad.challengeId, 'bad'), null);
    assert.equal(authority.session(bad.challengeId, signature), null);
    const expired = authority.challenge('cli');
    now += 30001;
    assert.equal(authority.session(expired.challengeId, signature), null);
    now += 86400000;
    assert.equal(authority.verify(session.access_token), null);
    assert.equal(
      statSync(join(home, 'installation-private.pem')).mode & 0o777,
      0o600,
    );
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
test('accounts, profile identity, deleted identity and settings survive restart', async () => {
  const home = temporary();
  try {
    let store = new Store(home);
    const a = store.current(),
      b = store.add('Other', 'local').id;
    store.set(a, 'settings', 'theme', 'dark');
    assert.equal(store.get(b, 'settings', 'theme'), null);
    const bound = store.bind({
      profileId: 'profile-a',
      accountId: a,
      profilePath: '/disposable/A',
    });
    assert.equal(bound.id, a);
    store.close();
    store = new Store(home);
    assert.equal(store.get(a, 'settings', 'theme'), 'dark');
    assert.equal(
      store.bind({ profileId: 'profile-a', profilePath: '/disposable/A' }).id,
      a,
    );
    assert.throws(
      () =>
        store.bind({ profileId: 'profile-a', profilePath: '/disposable/B' }),
      /already bound to another directory/,
    );
    assert.equal(
      store.bind({ profileId: 'profile-renamed', profilePath: '/disposable/A' })
        .id,
      a,
    );
    assert.equal(
      store
        .bindings()
        .filter((binding) => binding.profilePath === '/disposable/A').length,
      1,
    );
    await store.deleteAccount(b);
    assert.ok(store.add('New', 'local').id > b);
    assert.throws(() => store.safeFile(a, '../outside'));
    store.close();
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
test('HTTP auth and host denial; WS registration, command correlation, cancellation and restart', async () => {
  const home = temporary();
  const daemon = await createDaemon({ home, port: 0 });
  const base = `http://127.0.0.1:${daemon.port}`;
  let ws: WebSocket | undefined;
  try {
    assert.equal(
      await new Promise((resolve) => {
        const req = request(
          `${base}/health`,
          { headers: { host: 'evil.example' } },
          (res) => {
            res.resume();
            resolve(res.statusCode);
          },
        );
        req.end();
      }),
      403,
    );
    assert.equal(
      (
        await fetch(`${base}/health`, {
          headers: { origin: 'https://evil.example' },
        })
      ).status,
      403,
    );
    assert.equal((await fetch(`${base}/trpc/accounts.list`)).status, 401);
    const challenge = (await (
      await fetch(`${base}/auth/daemon/challenge?clientKind=cli`)
    ).json()) as { challengeId: string; challenge: string };
    const signedChallenge = sign(
      'sha256',
      Buffer.concat([
        Buffer.from(AUTH_DOMAIN),
        Buffer.from(challenge.challenge, 'base64'),
      ]),
      readFileSync(join(home, 'installation-private.pem')),
    ).toString('base64');
    const authResponse = await fetch(`${base}/auth/daemon/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        challengeId: challenge.challengeId,
        signedChallenge,
      }),
    });
    const session = (await authResponse.json()) as { access_token: string };
    const headers = {
      authorization: `AuxDaemonSessionToken ${session.access_token}`,
    };
    assert.equal(
      (await fetch(`${base}/auth/daemon/verify`, { headers })).status,
      200,
    );
    const response = (await (
      await fetch(`${base}/trpc/accounts.list`, { headers })
    ).json()) as { result: { data: { accounts: { id: number }[] } } };
    const account = response.result.data.accounts[0];
    assert.ok(account);
    const accountId = account.id;
    const route = {
      accountId,
      profileId: 'test-profile',
      browserMode: 'default' as const,
    };
    ws = new WebSocket(
      `${base.replace('http', 'ws')}/extension-bridge/extension`,
      [AUTH_PROTOCOL + session.access_token],
    );
    await once(ws, 'open');
    const registered = once(ws, 'message');
    ws.send(JSON.stringify({ method: 'register', connectionId: 'one', route }));
    assert.equal(
      JSON.parse(String((await registered)[0])).method,
      'registered',
    );
    const received = once(ws, 'message');
    const command = daemon.bridge.command(route, {
      method: 'tabs.query',
      params: {},
    });
    const message = JSON.parse(String((await received)[0]));
    ws.send(JSON.stringify({ id: message.id, result: [{ id: 7 }] }));
    assert.deepEqual(await command, [{ id: 7 }]);
    const controller = new AbortController();
    const next = once(ws, 'message');
    const cancelled = daemon.bridge.command(
      route,
      { method: 'tabs.query' },
      { signal: controller.signal },
    );
    await next;
    controller.abort();
    await assert.rejects(cancelled, /cancelled/);
    const replacement = new WebSocket(
      `${base.replace('http', 'ws')}/extension`,
      [AUTH_PROTOCOL + session.access_token],
    );
    await once(replacement, 'open');
    const ack = once(replacement, 'message');
    replacement.send(
      JSON.stringify({ method: 'register', connectionId: 'two', route }),
    );
    await ack;
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(daemon.bridge.status(route).connectionCount, 1);
    replacement.close();
    ws.close();
    const closed = once(daemon.server, 'close');
    const shutdown = await fetch(`${base}/shutdown`, {
      method: 'POST',
      headers,
    });
    assert.deepEqual(await shutdown.json(), { status: 'shutting_down' });
    await closed;
  } finally {
    ws?.terminate();
    await daemon.close();
    rmSync(home, { recursive: true, force: true });
  }
});
