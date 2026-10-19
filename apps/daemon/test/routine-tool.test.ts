import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { AgentEngine, createSchema } from '@aux/agent';
import { createRoutineToolAdapter } from '../src/routines/tool-adapter.js';
import { Store } from '../src/storage/store.js';
import { procedure, t } from '../src/trpc/core.js';

test('routine tool shares schedule validation, keeps suggestions drafts and guards stale approvals/replay', async () => {
  const home = mkdtempSync(join(tmpdir(), 'aux-routine-tool-'));
  const store = new Store(home);
  const engine = new AgentEngine(store);
  const accountId = store.current();
  const session = engine.create(
    createSchema.parse({ accountId, permissionMode: 'guard' }),
  );
  const prepare = createRoutineToolAdapter(
    { store, t, procedure, bridge: undefined as never },
    engine,
  );
  const signal = new AbortController().signal;
  const record = {
    name: 'Fixture',
    prompt: 'Inspect fixture',
    kind: 'heartbeat',
    targetSessionId: session.id,
    scheduleKind: 'recurring',
    rrule: 'FREQ=DAILY;BYHOUR=9',
  };
  try {
    await assert.rejects(
      prepare(
        session,
        { operation: 'create', record: { ...record, rrule: 'invalid' } },
        'invalid',
        signal,
      ),
      /recurrence/,
    );
    const suggestion = await prepare(
      session,
      { operation: 'suggest', record },
      'create',
      signal,
    );
    assert.equal(Object.keys(store.all(accountId, 'routines')).length, 0);
    const created = (await suggestion.execute()) as {
      id: string;
      state: string;
    };
    assert.equal(created.state, 'draft');
    assert.equal(
      JSON.stringify(await suggestion.execute()),
      JSON.stringify(created),
    );
    const pause = await prepare(
      session,
      { operation: 'pause', routineId: created.id },
      'pause',
      signal,
    );
    const paused = (await pause.execute()) as { state: string };
    assert.equal(paused.state, 'paused');
    const stale = await prepare(
      session,
      { operation: 'resume', routineId: created.id },
      'resume',
      signal,
    );
    store.set(accountId, 'routines', created.id, {
      ...(store.get(accountId, 'routines', created.id) as object),
      name: 'Changed during approval',
    });
    await assert.rejects(stale.execute(), /changed while awaiting approval/);
    await assert.rejects(
      prepare(
        session,
        {
          operation: 'create',
          record: { ...record, permissionMode: 'full-access' },
        },
        'widen',
        signal,
      ),
      /cannot exceed/,
    );
    const uncertain = await prepare(
      session,
      { operation: 'create', record },
      'uncertain',
      signal,
    );
    store.set(accountId, 'routineToolResults', `${session.id}:uncertain`, {
      status: 'pending',
      preview: JSON.stringify(uncertain.preview),
    });
    await assert.rejects(uncertain.execute(), /uncertain outcome/);
  } finally {
    await engine.close();
    store.close();
    rmSync(home, { recursive: true, force: true });
  }
});
