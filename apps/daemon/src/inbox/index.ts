/** Implements docs/spec/daemon/services.md Inbox and notifications. */
import { randomUUID } from 'node:crypto';
import { type AgentEngine, fail, scope } from '@aux/agent';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
import { triggerEventRoutines } from '../routines/index.js';

const ingestSchema = scope.extend({
  source: z.string().min(1),
  externalEventId: z.string().min(1).optional(),
  threadKey: z.string().optional(),
  title: z.string().max(2000),
  content: z.string().max(1000000),
  preview: z.string().max(5000).optional(),
  from: z
    .object({
      id: z.string(),
      name: z.string().optional(),
      type: z.string().optional(),
    })
    .optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});
interface InboxMessage extends z.infer<typeof ingestSchema> {
  id: string;
  createdAt: number;
  origin: string | null;
}
interface Grant {
  origin: string;
  permission: 'granted' | 'default' | 'denied';
  source: 'api' | 'native_ui';
  timestamp: number;
}
export function notificationOrigin(value: string) {
  const url = new URL(value);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password
  )
    fail(
      'BAD_REQUEST',
      'Notification origin must be an HTTP(S) site without credentials',
    );
  return url.origin;
}
export class InboxService {
  constructor(
    readonly store: DaemonServices['store'],
    readonly engine: AgentEngine,
  ) {}
  private database(accountId: number) {
    const db = this.store.accountDb(accountId);
    db.exec(
      'CREATE TABLE IF NOT EXISTS inbox_messages (id TEXT PRIMARY KEY,source TEXT NOT NULL,externalEventId TEXT,origin TEXT,createdAt INTEGER NOT NULL,value TEXT NOT NULL,UNIQUE(source,externalEventId)); CREATE TABLE IF NOT EXISTS notification_grants (origin TEXT PRIMARY KEY,value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS inbox_deliveries (id TEXT PRIMARY KEY,messageId TEXT NOT NULL,routineId TEXT NOT NULL,state TEXT NOT NULL,error TEXT);',
    );
    return db;
  }
  grants(accountId: number) {
    const db = this.database(accountId);
    try {
      return (
        db
          .prepare('SELECT value FROM notification_grants ORDER BY origin')
          .all() as { value: string }[]
      ).map((row) => JSON.parse(row.value) as Grant);
    } finally {
      db.close();
    }
  }
  grant(accountId: number, origin: string) {
    return (
      this.grants(accountId).find(
        (grant) => grant.origin === notificationOrigin(origin),
      ) ?? null
    );
  }
  setPermission(
    accountId: number,
    input: {
      origin: string;
      permission: Grant['permission'];
      source: Grant['source'];
      timestamp?: number;
    },
  ) {
    const origin = notificationOrigin(input.origin);
    let timestamp = input.timestamp ?? Date.now();
    const db = this.database(accountId);
    try {
      db.exec('BEGIN IMMEDIATE');
      const old = db
        .prepare('SELECT value FROM notification_grants WHERE origin=?')
        .get(origin) as { value: string } | undefined;
      if (old && input.timestamp === undefined)
        timestamp = Math.max(
          timestamp,
          (JSON.parse(old.value) as Grant).timestamp + 1,
        );
      if (old && (JSON.parse(old.value) as Grant).timestamp > timestamp)
        fail('CONFLICT', 'Notification permission update is stale');
      const grant: Grant = {
        origin,
        permission: input.permission,
        source: input.source,
        timestamp,
      };
      db.prepare('INSERT OR REPLACE INTO notification_grants VALUES (?,?)').run(
        origin,
        JSON.stringify(grant),
      );
      if (input.permission !== 'granted')
        db.prepare(
          "UPDATE inbox_deliveries SET state='cancelled' WHERE state='pending' AND messageId IN (SELECT id FROM inbox_messages WHERE origin=?)",
        ).run(origin);
      db.exec('COMMIT');
      return grant;
    } catch (error) {
      if (db.isTransaction) db.exec('ROLLBACK');
      throw error;
    } finally {
      db.close();
    }
  }
  ingest(raw: z.infer<typeof ingestSchema>) {
    const input = ingestSchema.parse(raw);
    const accountId = input.accountId;
    const origin = input.metadata?.origin
      ? notificationOrigin(input.metadata.origin)
      : null;
    const db = this.database(accountId);
    let message: InboxMessage;
    let inserted = false;
    const matched: string[] = [];
    try {
      db.exec('BEGIN IMMEDIATE');
      if (origin) {
        const row = db
          .prepare('SELECT value FROM notification_grants WHERE origin=?')
          .get(origin) as { value: string } | undefined;
        if (!row || (JSON.parse(row.value) as Grant).permission !== 'granted')
          fail(
            'FORBIDDEN',
            'Notification origin does not have a current grant',
          );
      }
      const existing = input.externalEventId
        ? (db
            .prepare(
              'SELECT value FROM inbox_messages WHERE source=? AND externalEventId=?',
            )
            .get(input.source, input.externalEventId) as
            | { value: string }
            | undefined)
        : undefined;
      if (existing) {
        message = JSON.parse(existing.value) as InboxMessage;
      } else {
        message = JSON.parse(
          this.engine.credentials.redact(
            accountId,
            JSON.stringify({
              ...input,
              id: randomUUID(),
              createdAt: Date.now(),
              origin,
            }),
          ),
        ) as InboxMessage;
        db.prepare('INSERT INTO inbox_messages VALUES (?,?,?,?,?,?)').run(
          message.id,
          message.source,
          message.externalEventId ?? null,
          origin,
          message.createdAt,
          JSON.stringify(message),
        );
        inserted = true;
        for (const row of db
          .prepare("SELECT value FROM kv WHERE namespace='routines'")
          .all() as { value: string }[]) {
          const parsed = z
            .object({
              id: z.string(),
              state: z.string(),
              triggerKind: z.string(),
              eventFilter: z.object({ source: z.string() }).optional(),
              expiresAt: z.string().optional(),
            })
            .safeParse(JSON.parse(row.value));
          if (!parsed.success) continue;
          const routine = parsed.data;
          if (
            routine.state !== 'active' ||
            routine.triggerKind !== 'event' ||
            routine.eventFilter?.source !== input.source ||
            (routine.expiresAt && Date.parse(routine.expiresAt) <= Date.now())
          )
            continue;
          matched.push(routine.id);
          db.prepare(
            'INSERT OR IGNORE INTO inbox_deliveries VALUES (?,?,?,?,NULL)',
          ).run(
            `${message.id}:${routine.id}`,
            message.id,
            routine.id,
            'pending',
          );
        }
      }
      db.exec('COMMIT');
    } catch (error) {
      if (db.isTransaction) db.exec('ROLLBACK');
      throw error;
    } finally {
      db.close();
    }
    if (!inserted) {
      const db = this.database(accountId);
      try {
        for (const row of db
          .prepare('SELECT routineId FROM inbox_deliveries WHERE messageId=?')
          .all(message.id) as { routineId: string }[])
          matched.push(row.routineId);
      } finally {
        db.close();
      }
    }
    const deliveries = this.dispatch(accountId, message.id);
    return {
      message,
      inserted,
      matchedRoutines: matched.length
        ? matched
        : deliveries.map((delivery) => delivery.routineId),
      deliveries,
    };
  }
  dispatch(accountId: number, messageId?: string) {
    const db = this.database(accountId);
    const rows = db
      .prepare(
        "SELECT d.id,d.messageId,d.routineId,m.value FROM inbox_deliveries d JOIN inbox_messages m ON m.id=d.messageId WHERE d.state='pending' AND (? IS NULL OR d.messageId=?)",
      )
      .all(messageId ?? null, messageId ?? null) as {
      id: string;
      messageId: string;
      routineId: string;
      value: string;
    }[];
    db.close();
    const results: { routineId: string; state: string; error?: string }[] = [];
    for (const row of rows) {
      const message = JSON.parse(row.value) as InboxMessage;
      let state = 'delivered',
        error: string | undefined;
      if (
        message.origin &&
        this.grant(accountId, message.origin)?.permission !== 'granted'
      )
        state = 'cancelled';
      else
        try {
          const matched = triggerEventRoutines(
            this.store,
            this.engine,
            accountId,
            {
              id: message.id,
              source: message.source,
              routineIds: [row.routineId],
              context: JSON.stringify({
                source: message.source,
                title: message.title,
                content: message.content,
                from: message.from,
                metadata: message.metadata,
              }),
            },
          );
          if (!matched.length) state = 'cancelled';
        } catch (cause) {
          state = 'pending';
          error = this.engine.credentials.redact(
            accountId,
            cause instanceof Error ? cause.message : String(cause),
          );
        }
      const target = this.database(accountId);
      try {
        target
          .prepare('UPDATE inbox_deliveries SET state=?,error=? WHERE id=?')
          .run(state, error ?? null, row.id);
      } finally {
        target.close();
      }
      results.push({
        routineId: row.routineId,
        state,
        ...(error ? { error } : {}),
      });
    }
    return results;
  }
  overview(accountId: number, messageLimit = 30) {
    const db = this.database(accountId);
    try {
      const messages = (
        db
          .prepare('SELECT value FROM inbox_messages ORDER BY createdAt DESC')
          .all() as { value: string }[]
      )
        .map((row) => JSON.parse(row.value) as InboxMessage)
        .filter(
          (message) =>
            !message.origin ||
            this.grant(accountId, message.origin)?.permission === 'granted',
        )
        .slice(0, messageLimit);
      const ids = new Set(messages.map((message) => message.id));
      const deliveries = (
        db.prepare('SELECT * FROM inbox_deliveries').all() as {
          id: string;
          messageId: string;
          routineId: string;
          state: string;
          error: string | null;
        }[]
      ).filter((delivery) => ids.has(delivery.messageId));
      return { messages, deliveries };
    } finally {
      db.close();
    }
  }
}
export function createInboxRouter(
  { t, procedure }: DaemonServices,
  inbox: InboxService,
) {
  return t.router({
    ingest: procedure
      .input(ingestSchema)
      .mutation(({ input }) => inbox.ingest(input)),
    overview: procedure
      .input(
        scope.extend({
          messageLimit: z.number().int().min(1).max(200).default(30),
        }),
      )
      .query(({ input }) =>
        inbox.overview(input.accountId, input.messageLimit),
      ),
    listNotificationGrants: procedure
      .input(scope)
      .query(({ input }) => inbox.grants(input.accountId)),
    getNotificationGrant: procedure
      .input(scope.extend({ origin: z.url() }))
      .query(({ input }) => inbox.grant(input.accountId, input.origin)),
    revokeNotificationGrant: procedure
      .input(scope.extend({ origin: z.url() }))
      .mutation(({ input }) =>
        inbox.setPermission(input.accountId, {
          origin: input.origin,
          permission: 'denied',
          source: 'api',
        }),
      ),
    syncNotificationPermission: procedure
      .input(
        scope.extend({
          origin: z.url(),
          permission: z.enum(['granted', 'default', 'denied']),
          source: z.enum(['api', 'native_ui']),
          timestamp: z.number().nonnegative().optional(),
        }),
      )
      .mutation(({ input }) =>
        inbox.setPermission(input.accountId, {
          origin: input.origin,
          permission: input.permission,
          source: input.source,
          ...(input.timestamp !== undefined
            ? { timestamp: input.timestamp }
            : {}),
        }),
      ),
    retryDeliveries: procedure
      .input(scope)
      .mutation(({ input }) => inbox.dispatch(input.accountId)),
  });
}
