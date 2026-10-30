/** The `inbox` tRPC namespace: inbox messages and web notification grants in the account's
 * state.db. Same input schemas, outputs, SQL effects and ordering as the supplied router.
 * The supplied daemon still opens and migrates state.db; this module only reads and writes
 * rows of `inbox_messages` and `notification_grants`. */
import {randomBytes} from 'node:crypto';

const PERMISSIONS = ['allow_for_ai', 'allow', 'deny', 'default'];
const ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const MESSAGE_COLUMNS = '"id", "source", "external_conversation_id", "external_event_id", "thread_key", "title", "preview", "content", "from", "metadata", "received_at", "delivery_state"';
const GRANT_COLUMNS = '"origin", "granted_at", "granted_by_session_id", "revoked_at"';

/** A 16-character id over [0-9a-zA-Z], uniform: 6-bit samples, 62 and 63 rejected. */
function newMessageId() {
  let id = '';
  while (id.length < 16) for (const byte of randomBytes(32)) if ((byte & 63) < 62 && id.length < 16) id += ID_ALPHABET[byte & 63];
  return id;
}

const now = () => new Date().toISOString();

function normalizeOrigin(value) {
  if (!value) return undefined;
  try { return new URL(value).origin; } catch { return undefined; }
}

function permissionEventTime(timestamp) {
  if (timestamp === undefined) return now();
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? now() : date.toISOString();
}

function webPushOrigin(message) {
  if (message.source !== 'web-push-notification') return undefined;
  return normalizeOrigin(message.metadata.origin) ?? normalizeOrigin(message.from?.name)
    ?? normalizeOrigin(message.from?.id) ?? normalizeOrigin(message.metadata.contextUrl);
}

const messageFromRow = row => row && {
  id: row.id, source: row.source, externalConversationId: row.external_conversation_id, externalEventId: row.external_event_id,
  threadKey: row.thread_key, title: row.title, preview: row.preview, content: row.content,
  from: row.from === null ? null : JSON.parse(row.from), metadata: JSON.parse(row.metadata),
  receivedAt: row.received_at, deliveryState: row.delivery_state,
};
const grantFromRow = row => row && {origin: row.origin, grantedAt: row.granted_at, grantedBySessionId: row.granted_by_session_id, revokedAt: row.revoked_at};

/** Row access for one account's state.db, through the supplied (brokered) connection. */
function inboxStore(database) {
  const query = (sql, ...values) => database.prepare(sql).all(...values);
  const first = (sql, ...values) => database.prepare(sql).get(...values);
  const run = (sql, ...values) => database.prepare(sql).run(...values);
  const grantRecord = origin => grantFromRow(first(`select ${GRANT_COLUMNS} from "notification_grants" where "notification_grants"."origin" = ?`, origin));
  const activeGrant = origin => grantFromRow(first(`select ${GRANT_COLUMNS} from "notification_grants" where (("notification_grants"."origin" = ?) and (("notification_grants"."revoked_at" is null)))`, origin));
  return {
    grantRecord,
    activeGrant,
    activeGrants: () => query(`select ${GRANT_COLUMNS} from "notification_grants" where ("notification_grants"."revoked_at" is null)`).map(grantFromRow),
    messages: limit => query(`select ${MESSAGE_COLUMNS} from "inbox_messages" order by "inbox_messages"."received_at" desc limit ?`, limit).map(messageFromRow),
    transaction(work) {
      run('begin');
      try {
        const result = work();
        run('commit');
        return result;
      } catch (error) {
        run('rollback');
        throw error;
      }
    },
    /** The message an external event already produced, scoped to its connection when it has one.
     * The input schema has no conversation id, so a connection-scoped match is the null conversation. */
    existingMessage({source, externalEventId, metadata}) {
      const where = '("inbox_messages"."source" = ?) and ("inbox_messages"."external_event_id" = ?)';
      if (!metadata.connectionId) return messageFromRow(first(`select ${MESSAGE_COLUMNS} from "inbox_messages" where (${where})`, source, externalEventId));
      return messageFromRow(first(`select ${MESSAGE_COLUMNS} from "inbox_messages" where (${where} and (("inbox_messages"."external_conversation_id" is null)) and (json_extract("inbox_messages"."metadata", '$.connectionId') = ?))`,
        source, externalEventId, metadata.connectionId));
    },
    insertMessage: message => run(`insert into "inbox_messages" (${MESSAGE_COLUMNS}) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      message.id, message.source, null, message.externalEventId ?? null, message.threadKey ?? null, message.title,
      message.preview ?? null, message.content, message.from ? JSON.stringify(message.from) : null, JSON.stringify(message.metadata), message.receivedAt, 'pending'),
    markDelivered: id => run('update "inbox_messages" set "delivery_state" = ? where "inbox_messages"."id" = ?', 'delivered', id),
    insertGrant: (origin, grantedAt) => run(`insert into "notification_grants" (${GRANT_COLUMNS}) values (?, ?, ?, ?)`, origin, grantedAt, null, null),
    upsertGrant: (origin, grantedAt, sessionId) => run(`insert into "notification_grants" (${GRANT_COLUMNS}) values (?, ?, ?, ?) on conflict ("notification_grants"."origin") do update set "granted_at" = ?, "granted_by_session_id" = ?, "revoked_at" = ?`,
      origin, grantedAt, sessionId, null, grantedAt, sessionId, null),
    revokeGrant: (origin, revokedAt) => run(`insert into "notification_grants" (${GRANT_COLUMNS}) values (?, ?, ?, ?) on conflict ("notification_grants"."origin") do update set "revoked_at" = ?`,
      origin, revokedAt, null, revokedAt, revokedAt),
  };
}

/** A push from an origin with no grant record records an implicit grant; an existing or revoked one is left alone. */
function observeGrant(store, origin, grantedAt) {
  const normalized = normalizeOrigin(origin);
  if (!normalized || store.grantRecord(normalized)) return;
  store.insertGrant(normalized, grantedAt);
}

function ingest(store, input) {
  const message = {id: newMessageId(), ...input, receivedAt: now(), deliveryState: 'pending'};
  const origin = webPushOrigin(input);
  if (origin && store.grantRecord(origin)?.revokedAt) return {message, inserted: false};
  const existing = store.transaction(() => {
    const found = input.externalEventId ? store.existingMessage(input) : undefined;
    if (!found) store.insertMessage(message);
    return found;
  });
  const stored = existing ?? message;
  const observed = origin ?? webPushOrigin(stored);
  if (observed) observeGrant(store, observed, stored.receivedAt);
  if (existing) return {message: existing, inserted: false};
  store.markDelivered(message.id);
  return {message, inserted: true};
}

function syncPermission(store, {origin, permission, timestamp}) {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return undefined;
  const at = permissionEventTime(timestamp);
  if (permission !== 'allow_for_ai') {
    store.revokeGrant(normalized, at);
    return undefined;
  }
  store.upsertGrant(normalized, at, store.grantRecord(normalized)?.grantedBySessionId ?? null);
  return store.activeGrant(normalized);
}

/** Procedures for the dispatcher, built on the supplied tRPC procedure, zod and state.db. */
export function create({accountProcedure, z, stateDb}) {
  const store = accountId => inboxStore(stateDb(accountId).$client);
  return {
    ingest: accountProcedure.input(z.object({
      source: z.string(), externalEventId: z.string().optional(), threadKey: z.string().optional(), title: z.string(), content: z.string(), preview: z.string().optional(),
      from: z.object({id: z.string().optional(), name: z.string().optional(), type: z.enum(['user', 'bot', 'system', 'service']).optional()}).optional(),
      metadata: z.record(z.string(), z.string()).optional(),
    })).mutation(({ctx, input}) => ingest(store(ctx.accountId), {...input, metadata: input.metadata ?? {}})),
    overview: accountProcedure.input(z.object({messageLimit: z.number().optional()})).query(({ctx, input}) => {
      const inbox = store(ctx.accountId);
      return {messages: inbox.messages(input.messageLimit ?? 20), notificationGrants: inbox.activeGrants()};
    }),
    listNotificationGrants: accountProcedure.query(({ctx}) => store(ctx.accountId).activeGrants()),
    getNotificationGrant: accountProcedure.input(z.object({origin: z.string()})).query(({ctx, input}) => store(ctx.accountId).activeGrant(input.origin) ?? null),
    revokeNotificationGrant: accountProcedure.input(z.object({origin: z.string()})).mutation(({ctx, input}) => {
      store(ctx.accountId).revokeGrant(input.origin, now());
      return {success: true};
    }),
    syncNotificationPermission: accountProcedure.input(z.object({
      origin: z.string(), permission: z.enum(PERMISSIONS), source: z.enum(['api', 'native_ui']), timestamp: z.number().optional(),
    })).mutation(({ctx, input}) => ({success: true, grant: syncPermission(store(ctx.accountId), input) ?? null})),
  };
}
