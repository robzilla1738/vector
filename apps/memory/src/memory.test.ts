import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { AgentEngine } from '@aux/agent';
import { Store } from '../../daemon/src/storage/store.js';
import { BrowsingHistory } from './browser-history.js';
import { LocalEmbeddings } from './embeddings.js';
import { MemoryService } from './memory.js';

function fixture() {
  const home = mkdtempSync(join(tmpdir(), 'aux-memory-test-'));
  const store = new Store(home);
  const engine = new AgentEngine(store);
  const memory = new MemoryService(store, engine);
  return {
    home,
    store,
    engine,
    memory,
    accountId: store.current(),
    close: async () => {
      await engine.close();
      store.close();
      rmSync(home, { recursive: true, force: true });
    },
  };
}
test('local ONNX semantic recall survives service restart, separates accounts and preserves visit dates', async () => {
  const f = fixture();
  try {
    f.memory.writeFile(
      f.accountId,
      'MEMORY.md',
      '# Health plan\nUse Dr Elena Park at Cedar Dental for the next oral health appointment on Thursday morning.',
    );
    f.memory.writeFile(
      f.accountId,
      'USER.md',
      '# Preferences\nRobert prefers trains over aircraft for travel between major cities.',
    );
    const found = await f.memory.search(
      f.accountId,
      ['Which dentist should I see to have my teeth cleaned?'],
      3,
    );
    assert.equal(found.mode, 'semantic');
    assert.equal(found.results[0]?.filePath, 'MEMORY.md');
    assert.ok((found.results[0]?.score ?? 0) > 0.3);
    const second = f.store.add('Separate account', 'local').id;
    const isolated = await f.memory.search(
      second,
      ['Which dentist should I see?'],
      3,
    );
    assert.equal(
      isolated.results.some((item) => item.content.includes('Cedar Dental')),
      false,
    );
    const restarted = new MemoryService(f.store, f.engine, f.memory.embeddings);
    const recall = await restarted.search(
      f.accountId,
      ['How do I prefer to travel from city to city?'],
      1,
    );
    assert.equal(recall.results[0]?.filePath, 'USER.md');
    const history = new BrowsingHistory(f.memory);
    const originalTime = Date.UTC(2021, 4, 2, 9);
    await history.ingest(f.accountId, {
      profileId: 'profile-one',
      url: 'https://example.com/rail',
      title: 'Train travel routes',
      content: 'Railway timetables for sleeper trains between cities.',
      visitedAt: originalTime,
      incognito: false,
    });
    const visits = await history.search(
      f.accountId,
      'profile-one',
      ['Overnight journeys by rail'],
      2,
    );
    assert.equal(visits.results[0]?.visitedAt, originalTime);
    const other = await history.search(
      f.accountId,
      'profile-two',
      ['Overnight journeys by rail'],
      2,
    );
    assert.equal(other.results.length, 0);
    await assert.rejects(
      () =>
        history.ingest(f.accountId, {
          profileId: 'profile-one',
          url: 'https://example.com/private',
          title: 'Private',
          content: 'Never retain',
          visitedAt: Date.now(),
          incognito: true,
        }),
      /Incognito/,
    );
  } finally {
    await f.close();
  }
});
test('memory edits preserve history, conflict on stale revert, and reject escaping or linked paths', async () => {
  const f = fixture();
  try {
    const original = f.memory.readFile(f.accountId, 'USER.md').content;
    const first = f.memory.writeFile(
      f.accountId,
      'USER.md',
      'First accepted preference',
    );
    const second = f.memory.writeFile(
      f.accountId,
      'USER.md',
      'Updated preference',
    );
    assert.throws(() => f.memory.revert(f.accountId, first.id), /changed/);
    f.memory.revert(f.accountId, second.id);
    f.memory.revert(f.accountId, first.id);
    assert.equal(f.memory.readFile(f.accountId, 'USER.md').content, original);
    assert.equal(f.memory.listHistory(f.accountId).entries.length, 4);
    assert.throws(
      () => f.memory.readFile(f.accountId, '../credentials.json'),
      /Markdown/,
    );
    symlinkSync('/tmp', join(f.memory.directory(f.accountId), 'linked'));
    assert.throws(
      () => f.memory.readFile(f.accountId, 'linked/secret.md'),
      /symbolic/,
    );
    const unavailable = new MemoryService(
      f.store,
      f.engine,
      new LocalEmbeddings(join(f.home, 'missing-model')),
    );
    unavailable.writeFile(
      f.accountId,
      'MEMORY.md',
      'File APIs do not need an embedding model.',
    );
    await assert.rejects(
      () => unavailable.search(f.accountId, ['What is recorded?']),
      /semantic model is unavailable/,
    );
    assert.equal(
      unavailable.readFile(f.accountId, 'MEMORY.md').content,
      'File APIs do not need an embedding model.',
    );
  } finally {
    await f.close();
  }
});
