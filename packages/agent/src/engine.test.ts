import assert from 'node:assert/strict';
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
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

test('attachments are explicit, session scoped, durable, and type checked before accepted input', async () => {
  const f = fixture();
  try {
    const first = f.engine.create(
      createSchema.parse({ accountId: f.accountId }),
    );
    const other = f.engine.create(
      createSchema.parse({ accountId: f.accountId }),
    );
    const file = f.engine.attachments.upload(f.accountId, first.id, {
      fileName: '../fixture.txt',
      mediaType: 'text/plain',
      base64: Buffer.from('Synthetic attached context').toString('base64'),
    });
    assert.equal(file.fileName, 'fixture.txt');
    assert.equal(first.context.length, 0);
    assert.ok(
      !JSON.stringify(
        f.engine.attachments.list(f.accountId, first.id),
      ).includes('Synthetic'),
    );
    assert.throws(
      () =>
        f.engine.prompt(f.accountId, other.id, 'Read file', undefined, [
          file.id,
        ]),
      /does not exist/,
    );
    assert.equal(f.engine.get(f.accountId, other.id).messages.length, 0);
    assert.throws(
      () =>
        f.engine.attachments.upload(f.accountId, first.id, {
          fileName: 'fake.pdf',
          mediaType: 'application/pdf',
          base64: Buffer.from('not a PDF').toString('base64'),
        }),
      /media type/,
    );
    f.engine.prompt(f.accountId, first.id, 'Use this context', undefined, [
      file.id,
    ]);
    await f.engine.wait(f.accountId, first.id);
    const persisted = f.engine.get(f.accountId, first.id);
    assert.deepEqual(persisted.messages[0]?.attachmentIds, [file.id]);
    assert.ok(
      JSON.stringify(persisted.context).includes('Synthetic attached context'),
    );
    assert.equal(
      new AgentEngine(f.store).attachments.read(f.accountId, first.id, file.id)
        .sha256,
      file.sha256,
    );
  } finally {
    await f.engine.close();
    f.close();
  }
});

test('full-access skips routine approvals but asks, denial and final confirmations remain enforced', async () => {
  const f = fixture();
  try {
    const session = f.engine.create(
      createSchema.parse({
        accountId: f.accountId,
        permissionMode: 'full-access',
      }),
    );
    const execute = (id: string, finalAction = false) =>
      f.engine.runExternal(f.accountId, session.id, async (signal) => {
        const tools = sessionTools(f.engine, f.accountId, session.id, signal);
        return tools.bash?.execute?.(
          { command: 'printf fixture-output', finalAction, timeoutMs: 1000 },
          {
            toolCallId: id,
            context: undefined,
            messages: [],
            abortSignal: signal,
          },
        );
      });
    const result = (await execute('routine')) as { stdout: string };
    assert.equal(result.stdout, 'fixture-output');
    const browserCalls: string[] = [];
    const browserEngine = new AgentEngine(f.store, {
      command: async (_route, command) => {
        browserCalls.push(command.method);
        return { performed: true };
      },
    });
    const browserSession = browserEngine.create(
      createSchema.parse({
        accountId: f.accountId,
        permissionMode: 'full-access',
        browserBinding: { profileId: 'disposable-fixture' },
      }),
    );
    await browserEngine.runExternal(
      f.accountId,
      browserSession.id,
      async (signal) =>
        sessionTools(
          browserEngine,
          f.accountId,
          browserSession.id,
          signal,
        ).browser_navigate?.execute?.(
          { targetId: 'fixture-target', url: 'https://example.test/' },
          {
            toolCallId: 'fixture-nav',
            context: undefined,
            messages: [],
            abortSignal: signal,
          },
        ),
    );
    assert.deepEqual(browserCalls, ['page.navigate']);
    assert.equal(
      browserEngine.get(f.accountId, browserSession.id).suspensions.length,
      0,
    );
    await browserEngine.close();

    assert.equal(f.engine.get(f.accountId, session.id).suspensions.length, 0);
    const latest = f.engine.get(f.accountId, session.id);
    latest.permissionOverrides = { deny: [], allow: [], ask: ['tool:bash'] };
    f.engine.save(latest);
    const asked = execute('explicit-ask');
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(
      f.engine
        .get(f.accountId, session.id)
        .suspensions.find((row) => !row.resolvedAt)?.kind,
      'approval',
    );
    f.engine.resolve(f.accountId, session.id, 'explicit-ask', {
      verdict: 'allow',
      always: true,
    });
    await asked;
    const clear = f.engine.get(f.accountId, session.id);
    clear.permissionOverrides = { deny: [], allow: [], ask: [] };
    f.engine.save(clear);
    const final = execute('final', true);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(
      f.engine
        .get(f.accountId, session.id)
        .suspensions.find((row) => !row.resolvedAt)?.kind,
      'action-confirmation',
    );
    f.engine.resolve(f.accountId, session.id, 'final', { verdict: 'confirm' });
    await final;
    f.store.set(f.accountId, 'permissions', 'rules', { deny: ['tool:bash'] });
    await assert.rejects(execute('denied'), /denied by account/);
    f.store.set(f.accountId, 'permissions', 'rules', {});
    for (const name of ['installation-private.pem', 'session-secret']) {
      const path = join(f.home, name);
      writeFileSync(path, 'synthetic-auth-fixture', { mode: 0o600 });
      const link = join(f.engine.directory(session), `alias-${name}`);
      symlinkSync(path, link);
      await assert.rejects(
        f.engine.runExternal(f.accountId, session.id, async (signal) =>
          sessionTools(
            f.engine,
            f.accountId,
            session.id,
            signal,
          ).read_file?.execute?.(
            { path: link, startLine: 1, lineCount: 1 },
            {
              toolCallId: `read-${name}`,
              context: undefined,
              messages: [],
              abortSignal: signal,
            },
          ),
        ),
        /credential material/,
      );
    }
  } finally {
    await f.engine.close();
    f.close();
  }
});

test('event redaction preserves numbers, booleans and structural field names', () => {
  const f = fixture();
  try {
    f.engine.credentials.set(f.accountId, 'example', {
      type: 'api_key',
      key: '1',
    });
    const session = f.engine.create(
      createSchema.parse({ accountId: f.accountId, title: 'Fixture' }),
    );
    f.engine.emit(session, 'fixture', {
      count: 1,
      enabled: true,
      text: 'value 1',
      field1: false,
    });
    assert.deepEqual(session.events.at(-1)?.data, {
      count: 1,
      enabled: true,
      text: 'value [redacted]',
      field1: false,
    });
  } finally {
    f.close();
  }
});
