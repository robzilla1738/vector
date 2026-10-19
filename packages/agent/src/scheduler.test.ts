/** No-provider scheduler fixtures; shared engine patch is part of this slice. */
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { Store } from '../../../apps/daemon/src/storage/store.js';
import { AgentEngine } from './engine.js';
import { waitForSubagents } from './subagents.js';
import { createSchema } from './types.js';

// Explicit test-only scratch bundle permits verification before the integrator
// applies the owned shared engine patch. Normal workspace tests use real source.
const Engine: typeof AgentEngine = process.env.AUX_TEST_SCHEDULER_ENGINE
  ? (
      await import(
        pathToFileURL(resolve(process.env.AUX_TEST_SCHEDULER_ENGINE)).href
      )
    ).AgentEngine
  : AgentEngine;
const waiting = () => new Promise<void>((resolve) => setImmediate(resolve));
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
function fixture(concurrency = 2) {
  const home = mkdtempSync(join(tmpdir(), 'aux-owned-scheduler-'));
  const store = new Store(home);
  const engine = new Engine(store, undefined, concurrency);
  const accountId = store.current();
  const create = (parentId?: string) =>
    engine.create(
      createSchema.parse({
        accountId,
        ...(parentId ? { parentId, ephemeral: true } : {}),
      }),
    );
  const counters = () =>
    engine as unknown as { running: number; heldPermits: Set<string> };
  const check = () => {
    assert(counters().running >= 0);
    assert(counters().running <= concurrency);
    assert(counters().heldPermits.size <= counters().running);
  };
  return {
    engine,
    store,
    accountId,
    create,
    check,
    counters,
    close: async () => {
      await engine.close();
      assert.equal(counters().running, 0);
      assert.equal(counters().heldPermits.size, 0);
      store.close();
      rmSync(home, { recursive: true, force: true });
    },
  };
}
test('two parents yield owned permits so two queued children finish with concurrency two', {
  timeout: 10000,
}, async () => {
  const f = fixture();
  const both = deferred();
  let started = 0;
  let children = 0;
  try {
    const parents = [f.create(), f.create()];
    await Promise.all(
      parents.map((parent) =>
        f.engine.runExternal(f.accountId, parent.id, async (signal) => {
          f.check();
          if (++started === 2) both.resolve();
          await both.promise;
          const child = f.create(parent.id);
          const running = f.engine.runExternal(
            f.accountId,
            child.id,
            async () => {
              f.check();
              children++;
              await waiting();
              f.check();
              return child.id;
            },
          );
          const results = await waitForSubagents(
            f.engine,
            f.accountId,
            parent.id,
            [child.id],
            signal,
          );
          await running;
          f.check();
          assert.equal(results[0]?.sessionId, child.id);
          return results;
        }),
      ),
    );
    assert.equal(children, 2);
    f.check();
    assert.equal(f.counters().running, 0);
  } finally {
    await f.close();
  }
});
test('parent cancellation during child wait releases no unowned permit and aborts children', {
  timeout: 10000,
}, async () => {
  const f = fixture();
  const childStarted = deferred();
  try {
    const parent = f.create();
    const child = f.create(parent.id);
    const run = f.engine
      .runExternal(f.accountId, parent.id, async (signal) => {
        const owned = f.engine
          .runExternal(f.accountId, child.id, async (childSignal) => {
            childStarted.resolve();
            await new Promise<void>((_, reject) => {
              childSignal.addEventListener(
                'abort',
                () => reject(childSignal.reason),
                { once: true },
              );
            });
          })
          .catch((error) => error);
        try {
          return await waitForSubagents(
            f.engine,
            f.accountId,
            parent.id,
            [child.id],
            signal,
          );
        } finally {
          await owned;
        }
      })
      .catch((error) => error);
    await childStarted.promise;
    f.check();
    f.engine.stop(f.accountId, parent.id, 'aborted');
    assert.match((await run).message, /abort|interrupt/i);
    assert.equal(f.engine.get(f.accountId, child.id).status, 'aborted');
    f.check();
    assert.equal(f.counters().running, 0);
  } finally {
    await f.close();
  }
});
test('cancellation while reacquiring an owned slot does not double-decrement another run', {
  timeout: 10000,
}, async () => {
  const f = fixture(1);
  const childStarted = deferred(),
    blockerStarted = deferred(),
    releaseChild = deferred(),
    releaseBlocker = deferred();
  let blockRun: Promise<unknown> | undefined;
  try {
    const parent = f.create(),
      child = f.create(parent.id),
      blocker = f.create();
    const run = f.engine
      .runExternal(f.accountId, parent.id, async () => {
        const childRun = f.engine.runExternal(
          f.accountId,
          child.id,
          async () => {
            childStarted.resolve();
            await releaseChild.promise;
          },
        );
        blockRun = f.engine.runExternal(f.accountId, blocker.id, async () => {
          blockerStarted.resolve();
          await releaseBlocker.promise;
        });
        const scheduler = f.engine as AgentEngine & {
          yieldRunSlot: <T>(
            accountId: number,
            id: string,
            operation: () => Promise<T>,
          ) => Promise<T>;
        };
        return scheduler.yieldRunSlot(f.accountId, parent.id, () => childRun);
      })
      .catch((error) => error);
    await childStarted.promise;
    releaseChild.resolve();
    await blockerStarted.promise;
    f.check();
    f.engine.stop(f.accountId, parent.id, 'aborted');
    assert.match((await run).message, /abort|interrupt/i);
    // The unrelated blocker still owns exactly one permit.
    assert.equal(f.counters().running, 1);
    f.check();
    releaseBlocker.resolve();
    await blockRun;
    assert.equal(f.counters().running, 0);
    f.check();
  } finally {
    releaseChild.resolve();
    releaseBlocker.resolve();
    await f.close();
  }
});
