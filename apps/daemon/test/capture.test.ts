import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import type { BridgeCommand, BridgeRoute } from '@aux/contracts';
import { BridgeRegistry } from '../src/bridge/registry.js';
import { createCaptureService } from '../src/capture/index.js';
import { Store } from '../src/storage/store.js';
import { procedure, t } from '../src/trpc/core.js';

test('capture rejects foreign/locked scope, discards lock races, and distinguishes full page and viewport', async () => {
  const home = mkdtempSync(join(tmpdir(), 'aux-capture-fixture-'));
  const store = new Store(home),
    bridge = new BridgeRegistry();
  const accountId = store.current();
  store.update(accountId, { onboardingCompletedAt: Date.now() });
  store.bind({ profileId: 'capture-fixture' });
  let locked = false,
    captures = 0,
    race = false;
  const modes: unknown[] = [];
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/L9sAAAAASUVORK5CYII=',
    'base64',
  );
  const original = bridge.command.bind(bridge);
  bridge.command = async (_route: BridgeRoute, command: BridgeCommand) => {
    if (command.method === 'capture.verify') return { valid: true };
    assert.equal(command.method, 'capture.page');
    captures++;
    modes.push(command.params?.mode);
    if (race) {
      locked = true;
      service.invalidate(accountId);
    }
    return { data: png.toString('base64') };
  };
  const service = createCaptureService(
    { store, bridge, t, procedure },
    { status: () => ({ initialized: true, locked }) },
  );
  const caller = service.router.createCaller({
    store,
    clientKind: 'agent-manager-extension',
  });
  const input = {
    accountId,
    profileId: 'capture-fixture',
    browserMode: 'default' as const,
    targetId: 'fixture-target',
    documentId: 'fixture-frame:fixture-loader',
    documentUrl: 'https://example.com/',
  };
  try {
    await assert.rejects(
      caller.fullPage({ ...input, profileId: 'foreign' }),
      /not bound/,
    );
    locked = true;
    await assert.rejects(caller.viewport(input), /unlocked/);
    assert.equal(captures, 0);
    locked = false;
    assert.equal((await caller.fullPage(input)).width, 1);
    assert.equal((await caller.viewport(input)).height, 1);
    assert.deepEqual(modes, ['fullPage', 'viewport']);
    await assert.rejects(
      caller.region({
        ...input,
        region: { x: 0, y: 0, width: 10000, height: 10000 },
      }),
      /pixel limit/,
    );
    await assert.rejects(caller.screen(input), /unavailable/);
    race = true;
    await assert.rejects(
      caller.fullPage(input),
      /unlocked|authorization changed/,
    );
    service.close();
    locked = false;
    await assert.rejects(caller.fullPage(input), /unlocked/);
  } finally {
    service.close();
    bridge.command = original;
    bridge.close();
    store.close();
    rmSync(home, { recursive: true, force: true });
  }
});
