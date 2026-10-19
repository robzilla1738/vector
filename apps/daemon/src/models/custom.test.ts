import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import type { AgentEngine } from '@aux/agent';
import { initTRPC } from '@trpc/server';
import type { DaemonServices } from '../http/server.js';
import { createCustomModelProcedures } from './custom.js';

test('custom provider procedures block active/suspended mutations and return only sanitized records', async () => {
  const home = mkdtempSync(join(tmpdir(), 'aux-custom-route-'));
  const t = initTRPC.create();
  let sessions: { status: string; model?: { provider: string } }[] = [];
  const engine = {
    store: {
      requireAccount: (id: number) => assert.equal(id, 1),
      accountHome: () => home,
    },
    list: () => sessions,
  } as unknown as AgentEngine;
  const router = t.router(
    createCustomModelProcedures(
      { procedure: t.procedure } as unknown as DaemonServices,
      engine,
    ),
  );
  const caller = router.createCaller({});
  const providers = {
    'custom-fixture': {
      name: 'Fixture',
      baseUrl: 'https://example.invalid/v1',
      apiStyle: 'openai-compatible' as const,
      models: [
        {
          id: 'fixture',
          inputModalities: ['text' as const],
          reasoning: false,
          thinkingLevels: [],
        },
      ],
      apiKey: 'fixture-api-secret',
      headers: { Authorization: 'fixture-header-secret' },
    },
  };
  try {
    const created = await caller.setCustomProvidersConfig({
      accountId: 1,
      providers,
    });
    assert.equal(JSON.stringify(created).includes('fixture-api-secret'), false);
    assert.equal(
      JSON.stringify(created).includes('fixture-header-secret'),
      false,
    );
    for (const status of ['running', 'suspended']) {
      sessions = [{ status, model: { provider: 'custom-fixture' } }];
      await assert.rejects(
        caller.setCustomProvidersConfig({ accountId: 1, providers }),
        /Stop or finish/,
      );
      await assert.rejects(
        caller.removeCustomProviderConfig({
          accountId: 1,
          providerId: 'custom-fixture',
        }),
        /Stop or finish/,
      );
    }
    assert.equal(
      (await caller.listCustomProviders({ accountId: 1 })).length,
      1,
    );
    sessions = [];
    assert.deepEqual(
      await caller.removeCustomProviderConfig({
        accountId: 1,
        providerId: 'custom-fixture',
      }),
      { removed: true },
    );
    assert.deepEqual(await caller.listCustomProviders({ accountId: 1 }), []);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
