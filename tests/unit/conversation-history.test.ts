import { expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb, Repo } from '@vector/runtime';

it('finds old prompts across all saved history, groups complete chats and paginates tied timestamps', () => {
  const dir = mkdtempSync(join(tmpdir(), 'aux-history-'));
  const db = openDb(join(dir, 'state.sqlite'));
  try {
    const repo = new Repo(db);
    for (let i = 0; i < 605; i++) repo.saveRun({ runId: `run-${String(i).padStart(4, '0')}`, goal: i === 0 ? 'Find 100%_literal needle' : 'A saved prompt', status: 'completed', pageIds: [], createdAt: Math.floor(i / 3), ...(i < 2 ? { config: { chatId: 'old-chat' } } : {}) });
    const found = repo.listRuns(40, { groupByChat: true, query: '100%_literal' });
    expect(found.map(run => run.runId)).toEqual(['run-0001']);
    expect(repo.listRuns(40, { groupByChat: true, query: '100%_missing' })).toEqual([]);
    expect(repo.listRuns(40, { chatId: 'old-chat' }).map(run => run.runId)).toEqual(['run-0001', 'run-0000']);
    const ids: string[] = [];
    let before;
    while (true) {
      const page = repo.listRuns(40, { groupByChat: true, before });
      ids.push(...page.map(run => run.runId));
      if (page.length < 40) break;
      const last = page.at(-1)!;
      before = { createdAt: last.createdAt, runId: last.runId };
    }
    expect(ids.length).toBe(604);
    expect(new Set(ids).size).toBe(604);
    expect(ids.at(-1)).toBe('run-0001');
  } finally { db.close(); rmSync(dir, { recursive: true, force: true }); }
});
