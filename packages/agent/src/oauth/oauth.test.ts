import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  chmodSync,
  copyFileSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs';
import { createServer, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { APICallError, generateText } from 'ai';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { Store } from '../../../../apps/daemon/src/storage/store.js';
import { OpenAIOAuth } from './client.js';
import { createOAuthModel } from './model.js';

async function fixture() {
  const home = mkdtempSync(join(tmpdir(), 'aux-oauth-')),
    store = new Store(home),
    accountId = store.current();
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const jwk = await exportJWK(publicKey);
  jwk.kid = 'fixture-key';
  jwk.alg = 'RS256';
  jwk.use = 'sig';
  let origin = '',
    refreshes = 0,
    revocations = 0,
    tokenCalls = 0;
  let badNonce = false,
    badAudience = false,
    badIssuer = false,
    expired = false,
    badSignature = false,
    grant = true,
    refreshDenied = false,
    completion = true,
    inferenceError = false,
    responseCalls = 0,
    revocationFails = false;
  let tokenWait: (() => Promise<void>) | undefined;
  const codes = new Map<string, URL>(),
    spent = new Set<string>();
  const server = createServer((req, res) => {
    void (async () => {
      const url = new URL(req.url ?? '/', origin);
      const reply = (value: unknown, status = 200) => {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(value));
      };
      if (url.pathname === '/discovery')
        return reply({
          issuer: origin,
          authorization_endpoint: `${origin}/authorize`,
          token_endpoint: `${origin}/token`,
          jwks_uri: `${origin}/jwks`,
          revocation_endpoint: `${origin}/revoke`,
        });
      if (url.pathname === '/jwks') return reply({ keys: [jwk] });
      let body = '';
      for await (const chunk of req) body += String(chunk);
      const form = new URLSearchParams(body);
      if (url.pathname === '/revoke') {
        revocations++;
        res.writeHead(revocationFails ? 503 : 200);
        res.end();
        return;
      }
      if (url.pathname === '/token') {
        tokenCalls++;
        await tokenWait?.();
        const refreshing = form.get('grant_type') === 'refresh_token';
        if (refreshing) {
          refreshes++;
          await delay(30);
          if (refreshDenied) return reply({ error: 'invalid_grant' }, 400);
        }
        const code = form.get('code') ?? '',
          attempt = codes.get(code);
        if (!refreshing) {
          if (!attempt || spent.has(code))
            return reply({ error: 'invalid_grant' }, 400);
          spent.add(code);
          if (
            createHash('sha256')
              .update(form.get('code_verifier') ?? '')
              .digest('base64url') !==
              attempt.searchParams.get('code_challenge') ||
            form.get('redirect_uri') !==
              attempt.searchParams.get('redirect_uri') ||
            form.get('client_id') !== 'oaiapp_fixture'
          )
            return reply({ error: 'invalid_grant' }, 400);
        }
        const idToken = await new SignJWT({
          nonce: badNonce ? 'wrong' : attempt?.searchParams.get('nonce'),
          email: 'fixture@example.test',
        })
          .setProtectedHeader({ alg: 'RS256', kid: 'fixture-key' })
          .setSubject('fixture-subject')
          .setIssuer(badIssuer ? 'https://untrusted-issuer.test' : origin)
          .setAudience(badAudience ? 'wrong-client' : 'oaiapp_fixture')
          .setIssuedAt()
          .setExpirationTime(
            expired ? Math.floor(Date.now() / 1000) - 30 : '5m',
          )
          .sign(privateKey);
        return reply({
          access_token: `fixture-access-${tokenCalls}`,
          refresh_token: `fixture-refresh-${tokenCalls}`,
          id_token: badSignature ? `${idToken.slice(0, -8)}AAAAAAAA` : idToken,
          token_type: 'Bearer',
          expires_in: 3600,
          scope: grant ? 'openid chatgpt.tokens.use.direct' : 'openid',
          earliest_refresh_at: 'uninterpreted-fixture',
        });
      }
      if (url.pathname === '/api/v1/models')
        return reply({
          models: [
            {
              slug: 'fixture-model',
              display_name: 'Fixture model',
              visibility: 'list',
            },
            { slug: 'hidden', display_name: 'Hidden', visibility: 'hidden' },
          ],
        });
      if (url.pathname === '/api/v1/responses') {
        responseCalls++;
        if (inferenceError) {
          res.setHeader('x-request-id', 'req_fixture');
          return reply(
            {
              error: {
                code: 'subscription_sharing_usage_limit_exceeded',
                param: null,
                message: `Bearer fixture-access-${tokenCalls}`,
              },
            },
            429,
          );
        }
        const input = JSON.parse(body) as { store?: boolean; stream?: boolean };
        if (input.store !== false || input.stream !== true)
          return reply({ error: 'bad-stream-contract' }, 400);
        const response = {
          id: 'resp_fixture',
          object: 'response',
          created_at: Math.floor(Date.now() / 1000),
          status: 'completed',
          model: 'fixture-model',
          output: [
            {
              type: 'message',
              id: 'msg_fixture',
              role: 'assistant',
              status: 'completed',
              content: [
                {
                  type: 'output_text',
                  text: 'Fixture completion',
                  annotations: [],
                  logprobs: [],
                },
              ],
            },
          ],
          usage: { input_tokens: 1, output_tokens: 2, total_tokens: 3 },
        };
        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        if (completion)
          res.end(
            `data: ${JSON.stringify({ type: 'response.completed', response })}\n\n`,
          );
        else res.end('data: {"type":"response.created"}\n\n');
        return;
      }
      reply({ error: 'not_found' }, 404);
    })().catch(() => {
      res.writeHead(500);
      res.end();
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  origin = `http://127.0.0.1:${address.port}`;
  const network = {
    fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
    endpoints: {
      issuer: origin,
      authorize: `${origin}/authorize`,
      token: `${origin}/token`,
      discovery: `${origin}/discovery`,
      resource: `${origin}/api/v1`,
    },
  };
  const oauth = new OpenAIOAuth(store, network);
  async function start(registrationId?: string) {
    const flow = await oauth.start(accountId, registrationId);
    const authorization = new URL(flow.authorizationUrl);
    const code = `fixture-code-${codes.size}`;
    codes.set(code, authorization);
    return {
      flow,
      authorization,
      callback: new URL(authorization.searchParams.get('redirect_uri') ?? ''),
      code,
    };
  }
  async function completeAttempt(attempt: Awaited<ReturnType<typeof start>>) {
    attempt.callback.search = new URLSearchParams({
      code: attempt.code,
      state: attempt.authorization.searchParams.get('state') ?? '',
      client_id: 'oaiapp_fixture',
    }).toString();
    await fetch(attempt.callback);
    for (let i = 0; i < 100; i++) {
      const state = oauth.flow(accountId, attempt.flow.flowId);
      if (!['pending', 'exchanging'].includes(state.phase)) return state;
      await delay(10);
    }
    throw new Error('Fixture callback did not finish');
  }
  return {
    store,
    oauth,
    home,
    accountId,
    start,
    completeAttempt,
    network,
    get refreshes() {
      return refreshes;
    },
    get tokenCalls() {
      return tokenCalls;
    },
    get revocations() {
      return revocations;
    },
    set tokenWait(v: (() => Promise<void>) | undefined) {
      tokenWait = v;
    },
    set badNonce(v: boolean) {
      badNonce = v;
    },
    set badAudience(v: boolean) {
      badAudience = v;
    },
    set badIssuer(v: boolean) {
      badIssuer = v;
    },
    set expired(v: boolean) {
      expired = v;
    },
    set badSignature(v: boolean) {
      badSignature = v;
    },
    set grant(v: boolean) {
      grant = v;
    },
    set refreshDenied(v: boolean) {
      refreshDenied = v;
    },
    get responseCalls() {
      return responseCalls;
    },
    set inferenceError(v: boolean) {
      inferenceError = v;
    },
    set completion(v: boolean) {
      completion = v;
    },
    set revocationFails(v: boolean) {
      revocationFails = v;
    },
    async close() {
      oauth.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      server.closeAllConnections();
      store.close();
      rmSync(home, { recursive: true, force: true });
    },
  };
}

test('independent Aux registration validates PKCE/JWT and persists encrypted separate identity; refresh coalesces and revocation removes tokens', async () => {
  const f = await fixture();
  try {
    const attempt = await f.start();
    assert.equal(
      attempt.authorization.searchParams.get('client_id'),
      'dynamic_agent_client',
    );
    assert.equal(
      attempt.authorization.searchParams.get('agent_name_hint'),
      'Aux',
    );
    assert.equal(
      attempt.authorization.searchParams.has('id_token_hint'),
      false,
    );
    const complete = await f.completeAttempt(attempt);
    assert.equal(complete.phase, 'complete');
    assert.ok(complete.registrationId);
    const exchanges = f.tokenCalls;
    const replay = await fetch(attempt.callback).catch(() => undefined);
    if (replay) assert.equal(replay.status, 409);
    assert.equal(f.tokenCalls, exchanges);
    const raw = readFileSync(
      join(f.store.accountHome(f.accountId), 'oauth-credentials.json'),
      'utf8',
    );
    assert.equal(raw.includes('fixture-access'), false);
    assert.equal(
      statSync(join(f.store.accountHome(f.accountId), 'oauth-credentials.json'))
        .mode & 0o777,
      0o600,
    );
    assert.equal(raw.includes('fixture@example.test'), false);
    const otherAccount = f.store.add('Fixture isolated account', 'local').id;
    assert.equal(f.oauth.status(otherAccount).exists, false);
    for (const filename of ['oauth-credentials.json', 'oauth-private.key']) {
      const destination = join(f.store.accountHome(otherAccount), filename);
      copyFileSync(
        join(f.store.accountHome(f.accountId), filename),
        destination,
      );
      chmodSync(destination, 0o600);
    }
    assert.throws(() => f.oauth.status(otherAccount), /invalid or unavailable/);

    assert.equal(
      statSync(join(f.store.accountHome(f.accountId), 'oauth-private.key'))
        .mode & 0o777,
      0o600,
    );
    assert.equal(
      f.oauth.list(f.accountId).registrations[0]?.clientId,
      'oaiapp_fixture',
    );
    const before = f.oauth.storage.read(f.accountId);
    const registration = before.registrations[0];
    assert.ok(registration?.tokens);
    registration.tokens.expiresAt = Date.now() - 1;
    f.oauth.storage.write(f.accountId, before);
    const signal = new AbortController().signal;
    await Promise.all([
      f.oauth.accessToken(f.accountId, signal),
      f.oauth.accessToken(f.accountId, signal),
    ]);
    assert.equal(f.refreshes, 1);
    const restarted = new OpenAIOAuth(f.store, f.network);
    assert.equal(restarted.status(f.accountId).exists, true);
    const again = await restarted.start(f.accountId, complete.registrationId);
    const returning = new URL(again.authorizationUrl);
    assert.equal(returning.searchParams.get('client_id'), 'oaiapp_fixture');
    assert.equal(returning.searchParams.has('agent_name_hint'), false);
    assert.equal(
      returning.searchParams.get('ext_agent_host_id'),
      attempt.authorization.searchParams.get('ext_agent_host_id'),
    );
    restarted.cancel(f.accountId, again.flowId);
    restarted.close();
    const catalog = await f.oauth.catalog(f.accountId, signal);
    assert.equal(catalog.length, 1);
    const result = await generateText({
      model: createOAuthModel(f.oauth, f.accountId, 'fixture-model'),
      prompt: 'Fixture only',
      maxRetries: 0,
    });
    assert.equal(result.text, 'Fixture completion');
    f.completion = false;
    await assert.rejects(
      generateText({
        model: createOAuthModel(f.oauth, f.accountId, 'fixture-model'),
        prompt: 'Fixture only',
        maxRetries: 0,
      }),
      /without a completed response/,
    );
    f.inferenceError = true;
    const calls = f.responseCalls;
    await assert.rejects(
      generateText({
        model: createOAuthModel(f.oauth, f.accountId, 'fixture-model'),
        prompt: 'Fixture only',
        maxRetries: 2,
      }),
      (error) => {
        assert.ok(APICallError.isInstance(error));
        assert.equal(error.isRetryable, false);
        assert.equal(error.statusCode, 429);
        assert.equal(error.responseBody?.includes('fixture-access'), false);
        return true;
      },
    );
    assert.equal(f.responseCalls, calls + 1);
    f.revocationFails = true;
    const signedOut = await f.oauth.signOut(
      f.accountId,
      complete.registrationId,
    );
    assert.equal(signedOut.remoteRevocationConfirmed, false);
    assert.equal(f.revocations, 3);
    assert.equal(f.oauth.status(f.accountId).exists, false);
    assert.equal(
      f.oauth.list(f.accountId).registrations[0]?.clientId,
      'oaiapp_fixture',
    );
  } finally {
    await f.close();
  }
});

test('loopback rejects forged Host/state, cancellation consumes attempts, invalid nonce/audience and missing scopes never grant inference', async () => {
  const f = await fixture();
  try {
    const attempt = await f.start();
    const url = new URL(attempt.callback);
    url.search = 'state=wrong&code=forged&client_id=oaiapp_fixture';
    assert.equal((await fetch(url)).status, 403);
    assert.equal(f.tokenCalls, 0);
    assert.equal(
      await new Promise<number>((resolve, reject) => {
        const request = httpRequest(
          url,
          { headers: { Host: 'attacker.test' } },
          (response) => {
            response.resume();
            resolve(response.statusCode ?? 0);
          },
        );
        request.on('error', reject);
        request.end();
      }),
      400,
    );
    assert.equal(f.tokenCalls, 0);
    url.search = new URLSearchParams({
      state: 'é'.repeat(43),
      code: 'forged',
      client_id: 'oaiapp_fixture',
    }).toString();
    assert.equal((await fetch(url)).status, 403);
    f.oauth.cancel(f.accountId, attempt.flow.flowId);
    assert.equal(
      f.oauth.cancel(f.accountId, attempt.flow.flowId).phase,
      'cancelled',
    );
    await assert.rejects(fetch(attempt.callback));
    f.badNonce = true;
    assert.equal((await f.completeAttempt(await f.start())).phase, 'errored');
    assert.equal(f.oauth.status(f.accountId).exists, false);
    const failed = await f.completeAttempt(await f.start());
    assert.equal(failed.retryAvailable, true);
    const retry = await f.oauth.start(f.accountId, undefined, failed.flowId);
    const retryUrl = new URL(retry.authorizationUrl);
    assert.equal(retryUrl.searchParams.get('client_id'), 'oaiapp_fixture');
    assert.equal(retryUrl.searchParams.has('agent_name_hint'), false);
    f.oauth.cancel(f.accountId, retry.flowId);
    f.badNonce = false;
    f.badAudience = true;
    assert.equal((await f.completeAttempt(await f.start())).phase, 'errored');
    assert.equal(f.oauth.status(f.accountId).exists, false);
    f.badAudience = false;
    for (const boundary of ['issuer', 'expiry', 'signature']) {
      f.badIssuer = boundary === 'issuer';
      f.expired = boundary === 'expiry';
      f.badSignature = boundary === 'signature';
      assert.equal((await f.completeAttempt(await f.start())).phase, 'errored');
      assert.equal(f.oauth.status(f.accountId).exists, false);
    }
    f.badIssuer = false;
    f.expired = false;
    f.badSignature = false;
    f.grant = false;
    assert.equal((await f.completeAttempt(await f.start())).phase, 'complete');
    assert.equal(f.oauth.status(f.accountId).planUsageEnabled, false);
    await assert.rejects(
      f.oauth.accessToken(f.accountId, new AbortController().signal),
      /plan usage was not granted/,
    );
  } finally {
    await f.close();
  }
});

test('refresh revocation is permanent until reauthorization and a separate process-style client cannot race the rotating token', async () => {
  const f = await fixture();
  try {
    await f.completeAttempt(await f.start());
    const state = f.oauth.storage.read(f.accountId);
    const registration = state.registrations[0];
    assert.ok(registration?.tokens);
    registration.tokens.expiresAt = 0;
    f.oauth.storage.write(f.accountId, state);
    let release!: () => void;
    let enter!: () => void;
    const ready = new Promise<void>((resolve) => {
      enter = resolve;
    });
    const blocker = new Promise<void>((resolve) => {
      release = resolve;
    });
    const lock = f.oauth.storage.exclusive(f.accountId, async () => {
      enter();
      await blocker;
    });
    await ready;
    const other = new OpenAIOAuth(f.store, f.network);
    await assert.rejects(
      other.accessToken(f.accountId, new AbortController().signal),
      /Another OAuth credential operation/,
    );
    assert.equal(f.refreshes, 0);
    release();
    await lock;
    other.close();
    f.refreshDenied = true;
    await assert.rejects(
      f.oauth.accessToken(f.accountId, new AbortController().signal),
      /invalid_grant/,
    );
    assert.equal(f.oauth.status(f.accountId).reauthorizationRequired, true);
    assert.equal(f.oauth.status(f.accountId).exists, false);
  } finally {
    await f.close();
  }
});

test('pending loopback attempts expire and close without making a token request', async (t) => {
  const f = await fixture();
  try {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
    const attempt = await f.start();
    t.mock.timers.tick(300001);
    assert.equal(
      f.oauth.flow(f.accountId, attempt.flow.flowId).phase,
      'expired',
    );
    assert.equal(f.tokenCalls, 0);
    t.mock.timers.reset();
    await assert.rejects(fetch(attempt.callback));
  } finally {
    t.mock.timers.reset();
    await f.close();
  }
});

test('cancellation during token exchange cannot commit credentials', async () => {
  const f = await fixture();
  let release!: () => void;
  try {
    let enter!: () => void;
    const entered = new Promise<void>((resolve) => {
      enter = resolve;
    });
    const blocker = new Promise<void>((resolve) => {
      release = resolve;
    });
    f.tokenWait = async () => {
      enter();
      await blocker;
    };
    const attempt = await f.start();
    attempt.callback.search = new URLSearchParams({
      code: attempt.code,
      state: attempt.authorization.searchParams.get('state') ?? '',
      client_id: 'oaiapp_fixture',
    }).toString();
    await fetch(attempt.callback);
    await entered;
    f.oauth.cancel(f.accountId, attempt.flow.flowId);
    release();
    await delay(30);
    assert.equal(
      f.oauth.flow(f.accountId, attempt.flow.flowId).phase,
      'cancelled',
    );
    assert.equal(f.oauth.status(f.accountId).exists, false);
  } finally {
    release?.();
    await f.close();
  }
});
