import assert from 'node:assert/strict';
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { Store } from '../../../apps/daemon/src/storage/store.js';
import { AgentEngine } from './engine.js';
import { sessionTools } from './tools.js';
import { createSchema } from './types.js';

function fixture() {
  const home = mkdtempSync(join(tmpdir(), 'aux-agent-test-'));
  const store = new Store(home);
  const engine = new AgentEngine(store);
  const accountId = store.current();
  return {
    home,
    store,
    engine,
    accountId,
    close: () => {
      store.close();
      rmSync(home, { recursive: true, force: true });
    },
  };
}
test('credentials are private, atomically replaced, redacted, and scoped to account', () => {
  const f = fixture();
  try {
    const second = f.store.add('Second', 'local').id;
    f.engine.credentials.set(f.accountId, 'example', {
      type: 'api_key',
      key: 'private-test-value',
    });
    assert.equal(
      statSync(join(f.store.accountHome(f.accountId), 'credentials.json'))
        .mode & 0o777,
      0o600,
    );
    assert.equal(
      JSON.stringify(f.engine.credentials.list(f.accountId)).includes(
        'private-test-value',
      ),
      false,
    );
    assert.equal(f.engine.credentials.status(second, 'example').exists, false);
    assert.equal(
      f.engine.credentials.redact(f.accountId, 'Value private-test-value'),
      'Value [redacted]',
    );
    f.engine.credentials.remove(f.accountId, 'example');
    assert.equal(
      f.engine.credentials.status(f.accountId, 'example').exists,
      false,
    );
  } finally {
    f.close();
  }
});
test('session accepted input survives missing provider; restart does not replay tools', async () => {
  const f = fixture();
  try {
    const s = f.engine.create(createSchema.parse({ accountId: f.accountId }));
    f.engine.prompt(f.accountId, s.id, 'Retain this accepted request', 'once');
    await f.engine.wait(f.accountId, s.id);
    const persisted = f.engine.get(f.accountId, s.id);
    assert.equal(persisted.status, 'errored');
    assert.equal(
      persisted.messages[0]?.content,
      'Retain this accepted request',
    );
    const revision = persisted.transcriptRevision;
    f.engine.prompt(f.accountId, s.id, 'Retain this accepted request', 'once');
    assert.equal(f.engine.get(f.accountId, s.id).transcriptRevision, revision);
    persisted.status = 'running';
    f.engine.save(persisted);
    const restarted = new AgentEngine(f.store);
    assert.equal(restarted.get(f.accountId, s.id).status, 'interrupted');
    const other = f.store.add('Other', 'local').id;
    assert.throws(() => f.engine.get(other, s.id), /account/);
  } finally {
    await f.engine.close();
    f.close();
  }
});
test('human decision resolves once; tool path denies credentials and read-only mutation', async () => {
  const f = fixture();
  const controller = new AbortController();
  try {
    const s = f.engine.create(
      createSchema.parse({
        accountId: f.accountId,
        permissionMode: 'read-only',
      }),
    );
    const pending = f.engine.suspend(
      f.accountId,
      s.id,
      'call-1',
      'approval',
      { operation: 'review' },
      controller.signal,
    );
    // A live run normally owns the session; restore running status to test resolution without model calls.
    const decision = { verdict: 'allow', always: false };
    f.engine.resolve(f.accountId, s.id, 'call-1', decision);
    assert.deepEqual(await pending, decision);
    assert.throws(
      () => f.engine.resolve(f.accountId, s.id, 'call-1', decision),
      /already resolved/,
    );
    const tools = sessionTools(f.engine, f.accountId, s.id, controller.signal);
    await assert.rejects(
      () =>
        Promise.resolve(
          tools.write_file?.execute?.(
            { path: 'test.txt', content: 'x', overwrite: false },
            {
              toolCallId: 'write',
              context: undefined,
              messages: [],
              abortSignal: controller.signal,
            },
          ),
        ),
      /read-only/,
    );
    f.engine.credentials.set(f.accountId, 'example', {
      type: 'api_key',
      key: 'not-for-tools',
    });
    const link = join(f.engine.directory(s), 'secret-link');
    symlinkSync(
      join(f.store.accountHome(f.accountId), 'credentials.json'),
      link,
    );
    await assert.rejects(
      () =>
        Promise.resolve(
          tools.read_file?.execute?.(
            { path: link, startLine: 1, lineCount: 500 },
            {
              toolCallId: 'read',
              context: undefined,
              messages: [],
              abortSignal: controller.signal,
            },
          ),
        ),
      /credential/,
    );
    assert.equal(
      readFileSync(
        join(f.store.accountHome(f.accountId), 'credentials.json'),
        'utf8',
      ).includes('not-for-tools'),
      true,
    );
  } finally {
    controller.abort();
    f.close();
  }
});

test('shutdown never starts queued work and duplicate queue keys are retained once', async () => {
  const f = fixture();
  try {
    const s = f.engine.create(createSchema.parse({ accountId: f.accountId }));
    f.engine.prompt(f.accountId, s.id, 'First request', 'first');
    f.engine.queue(f.accountId, s.id, 'Second request', 'prompt', 'second');
    f.engine.queue(f.accountId, s.id, 'Second request', 'prompt', 'second');
    assert.equal(f.engine.get(f.accountId, s.id).queue.length, 1);
    await f.engine.close();
    assert.equal(f.engine.get(f.accountId, s.id).messages.length, 1);
    assert.throws(
      () => f.engine.prompt(f.accountId, s.id, 'After shutdown'),
      /shutting down/,
    );
  } finally {
    f.close();
  }
});

test('external execution owns suspensions and cancellation closes cleanly', async () => {
  const f = fixture();
  try {
    const s = f.engine.create(createSchema.parse({ accountId: f.accountId }));
    const run = f.engine.runExternal(f.accountId, s.id, (signal) =>
      f.engine.suspend(
        f.accountId,
        s.id,
        'external-call',
        'approval',
        { operation: 'external' },
        signal,
      ),
    );
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(f.engine.get(f.accountId, s.id).status, 'suspended');
    f.engine.resolve(f.accountId, s.id, 'external-call', {
      verdict: 'allow',
      always: false,
    });
    assert.deepEqual(await run, { verdict: 'allow', always: false });
    assert.equal(f.engine.get(f.accountId, s.id).status, 'idle');
    const cancelled = f.engine.runExternal(
      f.accountId,
      s.id,
      (signal) =>
        new Promise((_resolve, reject) =>
          signal.addEventListener(
            'abort',
            () => reject(new Error('Cancelled')),
            { once: true },
          ),
        ),
    );
    const rejected = assert.rejects(cancelled, /shutting down|Cancelled/);
    await new Promise((resolve) => setImmediate(resolve));
    await f.engine.close();
    await rejected;
    assert.equal(f.engine.get(f.accountId, s.id).status, 'interrupted');
  } finally {
    f.close();
  }
});
