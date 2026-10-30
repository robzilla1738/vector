/** The inbox store: inbox messages and web notification grants in the account's state.db. The
 * functions have the supplied names and arguments, since the bundle's channel, push and browser
 * code call them too. A push from an origin with no grant records an implicit one; a revoked
 * origin's pushes are dropped. */
import {randomBytes} from 'node:crypto';

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

const messageFromRow = row => row && {
  id: row.id, source: row.source, externalConversationId: row.external_conversation_id, externalEventId: row.external_event_id,
  threadKey: row.thread_key, title: row.title, preview: row.preview, content: row.content,
  from: row.from === null ? null : JSON.parse(row.from), metadata: JSON.parse(row.metadata),
  receivedAt: row.received_at, deliveryState: row.delivery_state,
};
const grantFromRow = row => row && {origin: row.origin, grantedAt: row.granted_at, grantedBySessionId: row.granted_by_session_id, revokedAt: row.revoked_at};

export function normalizeNotificationGrantOrigin(value) {
  if (!value) return undefined;
  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

export function getNotificationPermissionEventTime(timestamp) {
  if (timestamp === undefined) return now();
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? now() : date.toISOString();
}

export function getWebPushNotificationOrigin(message) {
  if (message.source !== 'web-push-notification') return undefined;
  return normalizeNotificationGrantOrigin(message.metadata.origin) ?? normalizeNotificationGrantOrigin(message.from?.name)
    ?? normalizeNotificationGrantOrigin(message.from?.id) ?? normalizeNotificationGrantOrigin(message.metadata.contextUrl);
}

export function create({stateDb}) {
  const database = accountId => stateDb(accountId).$client;
  const first = (accountId, sql, ...values) => database(accountId).prepare(sql).get(...values);
  const run = (accountId, sql, ...values) => database(accountId).prepare(sql).run(...values);

  const getNotificationGrantRecord = (accountId, origin) =>
    grantFromRow(first(accountId, `select ${GRANT_COLUMNS} from "notification_grants" where "notification_grants"."origin" = ?`, origin));
  const getNotificationGrant = (accountId, origin) =>
    grantFromRow(first(accountId, `select ${GRANT_COLUMNS} from "notification_grants" where (("notification_grants"."origin" = ?) and (("notification_grants"."revoked_at" is null)))`, origin));
  const listNotificationGrants = accountId =>
    database(accountId).prepare(`select ${GRANT_COLUMNS} from "notification_grants" where ("notification_grants"."revoked_at" is null)`).all().map(grantFromRow);
  const revokeNotificationGrant = (accountId, origin, at = now()) => {
    run(accountId, `insert into "notification_grants" (${GRANT_COLUMNS}) values (?, ?, ?, ?) on conflict ("notification_grants"."origin") do update set "revoked_at" = ?`,
      origin, at, null, at, at);
  };
  /** Grants (or re-grants) an origin; `preserveAttribution` keeps the session that first granted it. */
  const upsertNotificationGrant = ({accountId, origin, grantedAt: requested, grantedBySessionId, preserveAttribution}) => {
    const grantedAt = requested ?? now();
    const record = preserveAttribution ? getNotificationGrantRecord(accountId, origin) : undefined;
    const sessionId = preserveAttribution ? record?.grantedBySessionId ?? grantedBySessionId ?? null : grantedBySessionId ?? null;
    run(accountId, `insert into "notification_grants" (${GRANT_COLUMNS}) values (?, ?, ?, ?) on conflict ("notification_grants"."origin") do update set "granted_at" = ?, "granted_by_session_id" = ?, "revoked_at" = ?`,
      origin, grantedAt, sessionId, null, grantedAt, sessionId, null);
    return getNotificationGrant(accountId, origin);
  };
  /** An origin seen sending pushes: a grant record is made if there is none; a revoked one stays revoked. */
  const recordObservedNotificationGrant = ({accountId, origin, grantedAt}) => {
    const normalized = normalizeNotificationGrantOrigin(origin);
    if (!normalized) return undefined;
    const record = getNotificationGrantRecord(accountId, normalized);
    if (record?.revokedAt) return undefined;
    if (record) return record;
    run(accountId, `insert into "notification_grants" (${GRANT_COLUMNS}) values (?, ?, ?, ?)`, normalized, grantedAt ?? now(), null, null);
    return getNotificationGrant(accountId, normalized);
  };
  const syncNotificationGrantFromPermission = ({accountId, origin, permission, timestamp}) => {
    const normalized = normalizeNotificationGrantOrigin(origin);
    if (!normalized) return undefined;
    const at = getNotificationPermissionEventTime(timestamp);
    if (permission === 'allow_for_ai') return upsertNotificationGrant({accountId, origin: normalized, grantedAt: at, preserveAttribution: true});
    revokeNotificationGrant(accountId, normalized, at);
    return undefined;
  };
  const recordObservedWebPushGrant = (accountId, message, origin) => {
    const observed = origin ?? getWebPushNotificationOrigin(message);
    if (observed) recordObservedNotificationGrant({accountId, origin: observed, grantedAt: message.receivedAt});
  };

  /** The message an external event already produced, scoped to its connection (and conversation) when it has one. */
  const existingMessage = (accountId, {source, externalEventId, externalConversationId, metadata}) => {
    const where = '("inbox_messages"."source" = ?) and ("inbox_messages"."external_event_id" = ?)';
    if (!metadata.connectionId) return messageFromRow(first(accountId, `select ${MESSAGE_COLUMNS} from "inbox_messages" where (${where})`, source, externalEventId));
    const conversation = externalConversationId ? '("inbox_messages"."external_conversation_id" = ?)' : '("inbox_messages"."external_conversation_id" is null)';
    return messageFromRow(first(accountId, `select ${MESSAGE_COLUMNS} from "inbox_messages" where (${where} and (${conversation}) and (json_extract("inbox_messages"."metadata", '$.connectionId') = ?))`,
      source, externalEventId, ...externalConversationId ? [externalConversationId] : [], metadata.connectionId));
  };
  const ingestInboxMessage = (accountId, input) => {
    const id = newMessageId(), receivedAt = now(), message = {id, ...input, receivedAt, deliveryState: 'pending'}, origin = getWebPushNotificationOrigin(input);
    if (origin && getNotificationGrantRecord(accountId, origin)?.revokedAt) return {message, inserted: false};
    run(accountId, 'begin');
    let existing;
    try {
      existing = input.externalEventId ? existingMessage(accountId, input) : undefined;
      if (!existing) run(accountId, `insert into "inbox_messages" (${MESSAGE_COLUMNS}) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id, input.source, input.externalConversationId ?? null, input.externalEventId ?? null, input.threadKey ?? null, input.title, input.preview ?? null,
        input.content, input.from ? JSON.stringify(input.from) : null, JSON.stringify(input.metadata), receivedAt, 'pending');
      run(accountId, 'commit');
    } catch (error) {
      run(accountId, 'rollback');
      throw error;
    }
    recordObservedWebPushGrant(accountId, existing ?? message, origin);
    if (existing) return {message: existing, inserted: false};
    run(accountId, 'update "inbox_messages" set "delivery_state" = ? where "inbox_messages"."id" = ?', 'delivered', id);
    return {message, inserted: true};
  };
  const listInboxMessages = (accountId, options) => {
    const {limit = 50, offset = 0} = options ?? {};
    return database(accountId).prepare(`select ${MESSAGE_COLUMNS} from "inbox_messages" order by "inbox_messages"."received_at" desc limit ? offset ?`).all(limit, offset).map(messageFromRow);
  };

  return {ingestInboxMessage, listInboxMessages, recordObservedWebPushGrant, getWebPushNotificationOrigin, normalizeNotificationGrantOrigin,
    recordObservedNotificationGrant, getNotificationGrantRecord, getNotificationGrant, listNotificationGrants, revokeNotificationGrant,
    syncNotificationGrantFromPermission, getNotificationPermissionEventTime, upsertNotificationGrant};
}
