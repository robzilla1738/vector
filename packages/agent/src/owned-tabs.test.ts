import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { Store } from '../../../apps/daemon/src/storage/store.js';
import { AgentEngine } from './engine.js';
import { type Bridge, createSchema } from './types.js';

test('only exact created targets/documents can close; completion and profile changes preserve user tabs', async () => {
  const home = mkdtempSync(join(tmpdir(), 'aux-owned-tabs-')),
    store = new Store(home),
    accountId = store.current();
  const live = new Map<string, Record<string, unknown>>();
  let sequence = 0;
  const closed: string[] = [],
    commands: string[] = [];
  const bridge: Bridge = {
    command: async (route, command) => {
      const p = command.params ?? {};
      commands.push(command.method);
      assert.equal(p.accountId, route.accountId);
      assert.equal(p.profileId, route.profileId);
      assert.equal(p.browserMode, route.browserMode);
      if (command.method === 'tabs.owned.create') {
        const row = {
          ...p,
          targetId: `target-${++sequence}`,
          tabId: sequence,
          documentId: `document-${sequence}`,
          documentUrl: p.url,
          title: 'Fixture tab',
        };
        live.set(String(p.ownershipToken), row);
        return row;
      }
      if (command.method === 'tabs.owned.list')
        return {
          tabs: [...live.values()].filter(
            (row) =>
              row.sessionId === p.sessionId &&
              row.accountId === route.accountId &&
              row.profileId === route.profileId &&
              row.browserMode === route.browserMode,
          ),
        };
      if (command.method === 'tabs.owned.close') {
        const row = live.get(String(p.ownershipToken));
        assert.ok(row);
        for (const key of [
          'sessionId',
          'targetId',
          'tabId',
          'documentId',
          'documentUrl',
        ])
          assert.equal(p[key], row[key]);
        closed.push(String(row.targetId));
        live.delete(String(p.ownershipToken));
        return { closed: true };
      }
      if (command.method === 'tabs.owned.release') {
        live.delete(String(p.ownershipToken));
        return { released: true };
      }
      if (command.method === 'tabs.owned.navigate') {
        const row = live.get(String(p.ownershipToken));
        assert.ok(row);
        const moved = {
          ...row,
          url: p.url,
          documentUrl: p.url,
          documentId: `document-navigated-${++sequence}`,
        };
        live.set(String(p.ownershipToken), moved);
        return moved;
      }
      throw Error('Unowned tab mutation is forbidden in this fixture');
    },
  };
  const engine = new AgentEngine(store, bridge);
  try {
    const session = engine.create(
      createSchema.parse({
        accountId,
        permissionMode: 'full-access',
        browserBinding: { profileId: 'fixture-profile' },
      }),
    );
    const userTab = {
      targetId: 'user-target',
      tabId: 900,
      url: 'https://fixture.test/same-url',
    };
    const tab = await engine.tabs.create(accountId, session.id, {
      url: userTab.url,
    });
    assert.equal(tab.createdByAgent, true);
    assert.equal(tab.autoClosePolicy, 'keep');
    assert.ok(!JSON.stringify(tab).includes('ownershipToken'));
    assert.ok(!JSON.stringify(tab).includes('documentId'));
    await assert.rejects(
      engine.tabs.close(
        accountId,
        session.id,
        tab.id,
        undefined,
        undefined,
        () => {
          throw Error('Account locked during observation');
        },
      ),
      /locked during observation/,
    );
    assert.equal(closed.length, 0);
    await assert.rejects(
      engine.tabs.close(accountId, session.id, tab.id, {
        targetId: userTab.targetId,
        tabId: userTab.tabId,
      }),
      /no longer positively/,
    );
    assert.equal(closed.length, 0);
    const record = [...live.values()][0];
    assert.ok(record);
    record.documentId = 'user-navigation-document';
    assert.deepEqual(await engine.tabs.list(accountId, session.id), []);
    await assert.rejects(
      engine.tabs.close(accountId, session.id, tab.id),
      /no longer positively/,
    );
    assert.equal(closed.length, 0);
    const kept = await engine.tabs.create(accountId, session.id, {
      url: 'https://fixture.test/keep',
    });
    await engine.tabs.navigate(
      accountId,
      session.id,
      kept.targetId,
      'https://fixture.test/agent-navigation',
    );
    assert.equal(
      (await engine.tabs.list(accountId, session.id))[0]?.url,
      'https://fixture.test/agent-navigation',
    );
    await engine.runExternal(accountId, session.id, async () => {
      await engine.tabs.create(accountId, session.id, {
        url: 'https://fixture.test/auto',
        autoClosePolicy: 'on-completion',
      });
    });
    assert.equal(closed.length, 1);
    assert.equal(
      (await engine.tabs.list(accountId, session.id))[0]?.targetId,
      kept.targetId,
    );
    await engine.tabs.terminate(accountId, session.id);
    assert.equal(closed.length, 1);
    assert.deepEqual(await engine.tabs.list(accountId, session.id), []);
    const changed = await engine.tabs.create(accountId, session.id, {
      url: 'https://fixture.test/profile',
    });
    const current = engine.get(accountId, session.id);
    current.browserBinding = {
      profileId: 'different-profile',
      browserMode: 'default',
    };
    engine.save(current);
    assert.deepEqual(await engine.tabs.list(accountId, session.id), []);
    await engine.tabs.terminate(accountId, session.id);
    assert.ok(!closed.includes(changed.targetId));
    assert.ok(!closed.includes(userTab.targetId));
    assert.ok(commands.every((method) => method.startsWith('tabs.owned.')));
  } finally {
    await engine.close();
    store.close();
    rmSync(home, { recursive: true, force: true });
  }
});
