import assert from 'node:assert/strict';
import {
  chmodSync,
  linkSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import type { IncomingMessage } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { test } from 'node:test';
import { AgentEngine } from '@aux/agent';
import { Store } from '../storage/store.js';
import { SearchCredentials } from './credentials.js';
import { createSearchService, publicResultUrl } from './index.js';
import {
  publicAddress,
  readSearchResponse,
  type SearchTransport,
} from './transport.js';

const syntheticKey = 'fixture-search-key-not-a-real-credential';
function fixture() {
  const home = mkdtempSync(join(tmpdir(), 'aux-search-fixture-'));
  const store = new Store(home),
    engine = new AgentEngine(store),
    accountId = store.current();
  let calls = 0,
    unlocked = true;
  let operation: SearchTransport = async () => ({
    id: 'fixture-request',
    results: [
      {
        title: 'Fixture source',
        url: 'https://example.com/article',
        snippet: `Synthetic passage ${syntheticKey}`,
        date: '2026-10-19',
      },
    ],
  });
  const service = createSearchService(
    { store },
    engine,
    { isUnlocked: () => unlocked },
    async (...args) => {
      calls++;
      return operation(...args);
    },
  );
  const session = engine.create({ accountId, permissionMode: 'full-access' });
  const configure = () =>
    service.configure(accountId, {
      apiKey: syntheticKey,
      enabled: true,
      maxResults: 5,
    });
  return {
    home,
    store,
    engine,
    accountId,
    service,
    session,
    configure,
    set operation(value: SearchTransport) {
      operation = value;
    },
    set unlocked(value: boolean) {
      unlocked = value;
    },
    get calls() {
      return calls;
    },
    async close() {
      service.close();
      await engine.close();
      store.close();
      rmSync(home, { recursive: true, force: true });
    },
  };
}
const signal = () => new AbortController().signal;

test('write-only account search key is owner-private, redacted and rejects symlink/hardlink/broad modes', async () => {
  const f = fixture();
  try {
    assert.equal(f.service.status(f.accountId).configured, false);
    const status = f.configure();
    assert.equal(JSON.stringify(status).includes(syntheticKey), false);
    const path = join(
      f.store.accountHome(f.accountId),
      'search-credentials.json',
    );
    assert.equal(statSync(path).mode & 0o777, 0o600);
    assert.equal(
      f.service.redact(f.accountId, `secret=${syntheticKey}`),
      'secret=[REDACTED]',
    );
    const credentials = new SearchCredentials(f.store);
    chmodSync(path, 0o644);
    assert.throws(() => credentials.status(f.accountId), /owner-only/);
    chmodSync(path, 0o600);
    const linked = join(f.home, 'linked-fixture');
    linkSync(path, linked);
    assert.throws(() => credentials.status(f.accountId), /owner-only/);
    rmSync(linked);
    const data = readFileSync(path);
    rmSync(path);
    const target = join(f.home, 'target-fixture');
    writeFileSync(target, data, { mode: 0o600 });
    symlinkSync(target, path);
    assert.throws(() => credentials.status(f.accountId), /inaccessible/);
  } finally {
    await f.close();
  }
});

test('real adapter response bounds reject redirects, errors, huge streams, invalid JSON and private URLs/IPs', async () => {
  function response(
    body: Buffer | string,
    statusCode = 200,
    headers = { 'content-type': 'application/json' },
  ) {
    return Object.assign(Readable.from([Buffer.from(body)]), {
      statusCode,
      headers,
    }) as IncomingMessage;
  }
  assert.deepEqual(await readSearchResponse(response('{"results":[]}')), {
    results: [],
  });
  await assert.rejects(
    readSearchResponse(response('hidden', 302)),
    /redirects/,
  );
  await assert.rejects(
    readSearchResponse(response(syntheticKey, 401)),
    /HTTP 401/,
  );
  await assert.rejects(
    readSearchResponse(response(Buffer.alloc(512001))),
    /size limit/,
  );
  await assert.rejects(readSearchResponse(response('invalid')), /invalid JSON/);
  for (const address of [
    '127.0.0.1',
    '10.0.0.1',
    '169.254.169.254',
    '100.64.0.1',
    '::1',
    '::ffff:127.0.0.1',
    'fd00::1',
    '2001:db8::1',
  ])
    assert.equal(publicAddress(address), false, address);
  for (const address of ['8.8.8.8', '1.1.1.1', '2606:4700:4700::1111'])
    assert.equal(publicAddress(address), true, address);
  for (const url of [
    'file:///fixture',
    'https://localhost/a',
    'http://127.0.0.1',
    'https://[::1]/',
    'https://user:password@example.com/',
  ])
    assert.equal(publicResultUrl(url), undefined);
});

test('unconfigured/disabled/denied/locked search never calls provider; approved query returns attributed actual fixture results', async () => {
  const f = fixture();
  try {
    await assert.rejects(
      f.service.search(f.session, { query: 'fixture' }, 'absent', signal()),
      /unavailable/,
    );
    f.configure();
    f.service.setEnabled(f.accountId, false);
    await assert.rejects(
      f.service.search(f.session, { query: 'fixture' }, 'disabled', signal()),
      /unavailable/,
    );
    f.service.setEnabled(f.accountId, true);
    f.store.set(f.accountId, 'permissions', 'rules', { deny: ['websearch'] });
    await assert.rejects(
      f.service.search(f.session, { query: 'fixture' }, 'deny', signal()),
      /denied/,
    );
    f.store.set(f.accountId, 'permissions', 'rules', {});
    f.unlocked = false;
    await assert.rejects(
      f.service.search(f.session, { query: 'fixture' }, 'locked', signal()),
      /unlocked/,
    );
    assert.equal(f.calls, 0);
    f.unlocked = true;
    const result = await f.service.search(
      f.session,
      { queries: ['fixture', 'fixture'] },
      'actual',
      signal(),
    );
    assert.equal(f.calls, 1);
    assert.equal(
      result.batches[0]?.results[0]?.url,
      'https://example.com/article',
    );
    assert.equal(
      result.batches[0]?.results[0]?.snippet,
      'Synthetic passage [REDACTED]',
    );
    assert.equal(
      result.batches[0]?.results[0]?.citation.provider,
      'perplexity',
    );
    assert.equal(JSON.stringify(result).includes(syntheticKey), false);
  } finally {
    await f.close();
  }
});

test('revocation/cancellation after dispatch discards results and does not retry or expose raw provider errors', async () => {
  const f = fixture();
  try {
    f.configure();
    f.operation = async () => {
      f.service.setEnabled(f.accountId, false);
      return { id: 'stale', results: [] };
    };
    await assert.rejects(
      f.service.search(f.session, { query: 'fixture' }, 'stale', signal()),
      /authorization changed/,
    );
    f.service.setEnabled(f.accountId, true);
    f.operation = async () => {
      throw Object.assign(new Error(syntheticKey), {
        code: 'RAW_PROVIDER_ERROR',
      });
    };
    await assert.rejects(
      f.service.search(f.session, { query: 'fixture' }, 'error', signal()),
      (error) =>
        error instanceof Error && !error.message.includes(syntheticKey),
    );
    assert.equal(f.calls, 2);
  } finally {
    await f.close();
  }
});

test('guard approval displays exact external queries; read-only searches obey explicit ask rules', async () => {
  const f = fixture();
  try {
    f.configure();
    const session = f.engine.create({
      accountId: f.accountId,
      permissionMode: 'read-only',
    });
    f.store.set(f.accountId, 'permissions', 'rules', { ask: ['websearch'] });
    const run = f.engine.runExternal(f.accountId, session.id, (runSignal) =>
      f.service.search(
        session,
        { queries: ['synthetic one', 'synthetic two'], maxResults: 2 },
        'review',
        runSignal,
      ),
    );
    for (
      let n = 0;
      n < 30 && !f.engine.get(f.accountId, session.id).suspensions.length;
      n++
    )
      await new Promise((resolve) => setImmediate(resolve));
    const suspension = f.engine.get(f.accountId, session.id).suspensions[0];
    assert.ok(suspension);
    assert.deepEqual((suspension.request as { operation: unknown }).operation, {
      provider: 'perplexity',
      endpoint: 'https://api.perplexity.ai/search',
      queries: ['synthetic one', 'synthetic two'],
      maxResults: 2,
    });
    assert.equal(f.calls, 0);
    f.engine.resolve(f.accountId, session.id, 'review', {
      verdict: 'allow',
      always: false,
    });
    const result = await run;
    assert.equal(result.batches.length, 2);
    assert.equal(f.calls, 2);
  } finally {
    await f.close();
  }
});
