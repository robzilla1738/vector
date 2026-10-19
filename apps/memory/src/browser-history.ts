import { createHash } from 'node:crypto';
import { fail } from '@aux/agent';
import { z } from 'zod';
import type { MemoryService } from './memory.js';
export const visitSchema = z.object({
  id: z.string().min(1).max(128).optional(),
  profileId: z.string().min(1),
  url: z.url(),
  title: z.string().max(2000),
  content: z.string().max(1000000).default(''),
  visitedAt: z.number().nonnegative(),
  incognito: z.boolean().default(false),
});
export type BrowserVisit = z.infer<typeof visitSchema> & { id: string };
export class BrowsingHistory {
  constructor(readonly memory: MemoryService) {}
  private database(accountId: number) {
    this.memory.initialize(accountId);
    const db = this.memory.store.accountDb(accountId);
    db.exec(
      'CREATE TABLE IF NOT EXISTS browsing_visits (id TEXT NOT NULL,profileId TEXT NOT NULL,visitedAt REAL NOT NULL,value TEXT NOT NULL,PRIMARY KEY(profileId,id)); CREATE INDEX IF NOT EXISTS browsing_visits_time ON browsing_visits(profileId,visitedAt);',
    );
    return db;
  }
  async ingest(accountId: number, input: z.infer<typeof visitSchema>) {
    input = visitSchema.parse(input);
    this.memory.store.requireAccount(accountId);
    if (input.incognito)
      fail('FORBIDDEN', 'Incognito visits cannot enter browsing recall');
    const url = new URL(input.url);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      fail(
        'BAD_REQUEST',
        'Browsing history requires an HTTP(S) URL without credentials',
      );
    const sourceIdentity = url.href;
    for (const key of [...url.searchParams.keys()])
      if (/password|token|secret|key|auth|code|session|credential/i.test(key))
        url.searchParams.set(key, '[redacted]');
    url.hash = '';
    const redact = (value: string) =>
      this.memory.engine.credentials
        .redact(accountId, value)
        .replace(
          /((?:password|api[_ -]?key|access[_ -]?token|secret)\s*[:=]\s*)[^\s,;]+/gi,
          '$1[redacted]',
        );
    let visit: BrowserVisit = {
      ...input,
      title: redact(input.title),
      content: redact(input.content),
      id:
        input.id ??
        createHash('sha256')
          .update(`${input.profileId}\0${sourceIdentity}\0${input.visitedAt}`)
          .digest('hex'),
      url: url.href,
    };
    const db = this.database(accountId);
    let inserted = false;
    try {
      const existing = db
        .prepare('SELECT value FROM browsing_visits WHERE profileId=? AND id=?')
        .get(visit.profileId, visit.id) as { value: string } | undefined;
      if (existing) {
        const old = JSON.parse(existing.value) as BrowserVisit;
        if (old.visitedAt !== visit.visitedAt || old.url !== visit.url)
          fail(
            'CONFLICT',
            'Browsing evidence identity cannot change its original URL or visit time',
          );
        visit = old;
      } else {
        db.prepare('INSERT INTO browsing_visits VALUES (?,?,?,?)').run(
          visit.id,
          visit.profileId,
          visit.visitedAt,
          JSON.stringify(visit),
        );
        inserted = true;
      }
    } finally {
      db.close();
    }
    let indexError: string | undefined;
    try {
      await this.memory.indexSource(
        accountId,
        {
          id: `browser:${visit.profileId}:${visit.id}`,
          kind: 'browser',
          content: `${visit.title}\n${visit.url}\n${visit.content}`,
          profileId: visit.profileId,
          metadata: {
            historyEntryId: visit.id,
            profileId: visit.profileId,
            url: visit.url,
            title: visit.title,
            visitedAt: visit.visitedAt,
          },
        },
        () => this.exists(accountId, visit.profileId, visit.id),
      );
    } catch {
      indexError =
        'Local semantic indexing is unavailable or the source was retired';
    }
    return {
      id: visit.id,
      inserted,
      visitedAt: visit.visitedAt,
      indexState: indexError ? 'pending' : 'indexed',
      ...(indexError ? { indexError } : {}),
    };
  }
  private exists(accountId: number, profileId: string, id: string) {
    const db = this.database(accountId);
    try {
      return !!db
        .prepare('SELECT 1 FROM browsing_visits WHERE profileId=? AND id=?')
        .get(profileId, id);
    } finally {
      db.close();
    }
  }
  list(
    accountId: number,
    profileId: string,
    options: { from?: number; to?: number; limit?: number } = {},
  ) {
    const db = this.database(accountId);
    try {
      return (
        db
          .prepare(
            'SELECT value FROM browsing_visits WHERE profileId=? AND visitedAt>=? AND visitedAt<=? ORDER BY visitedAt DESC LIMIT ?',
          )
          .all(
            profileId,
            options.from ?? 0,
            options.to ?? Number.MAX_SAFE_INTEGER,
            options.limit ?? 100,
          ) as { value: string }[]
      ).map((row) => JSON.parse(row.value) as BrowserVisit);
    } finally {
      db.close();
    }
  }
  async search(
    accountId: number,
    profileId: string,
    queries: string[],
    maxResults = 5,
    options: { from?: number; to?: number } = {},
  ) {
    z.array(z.string().trim().min(1)).min(1).max(3).parse(queries);
    z.number().int().min(1).max(10).parse(maxResults);
    const visits = this.list(accountId, profileId, {
      ...options,
      limit: 100000,
    });
    // Retry indexing persisted imports after a model/runtime outage without losing their original visit times.
    for (const visit of visits)
      await this.memory.indexSource(
        accountId,
        {
          id: `browser:${visit.profileId}:${visit.id}`,
          kind: 'browser',
          content: `${visit.title}\n${visit.url}\n${visit.content}`,
          profileId: visit.profileId,
          metadata: {
            historyEntryId: visit.id,
            profileId: visit.profileId,
            url: visit.url,
            title: visit.title,
            visitedAt: visit.visitedAt,
          },
        },
        () => this.exists(accountId, visit.profileId, visit.id),
      );
    return this.memory.searchIndex(
      accountId,
      queries,
      maxResults,
      'browser',
      profileId,
      new Set(visits.map((visit) => `browser:${profileId}:${visit.id}`)),
    );
  }
  read(accountId: number, profileId: string, ids: string[]) {
    const db = this.database(accountId);
    try {
      return ids.map((id) => {
        const row = db
          .prepare(
            'SELECT value FROM browsing_visits WHERE profileId=? AND id=?',
          )
          .get(profileId, id) as { value: string } | undefined;
        if (!row)
          fail('NOT_FOUND', 'Browsing evidence does not exist in this profile');
        return JSON.parse(row.value) as BrowserVisit;
      });
    } finally {
      db.close();
    }
  }
  remove(accountId: number, profileId: string, ids: string[]) {
    const db = this.database(accountId);
    try {
      db.exec('BEGIN IMMEDIATE');
      for (const id of ids) {
        db.prepare(
          'DELETE FROM browsing_visits WHERE profileId=? AND id=?',
        ).run(profileId, id);
        const source = `browser:${profileId}:${id}`;
        db.prepare('DELETE FROM semantic_sources WHERE id=?').run(source);
        db.prepare('DELETE FROM semantic_chunks WHERE source=?').run(source);
      }
      db.exec('COMMIT');
      return { removed: ids.length };
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    } finally {
      db.close();
    }
  }
}
