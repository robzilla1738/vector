/** The Context Awareness ledger's write side: recording what the native helper and the browser
 * capture, clearing it, retention, and the per-account state both rely on. Text is redacted before
 * it is stored, repeats of a capture are stored as a reference or a diff, and typed drafts and
 * selection bursts coalesce into one event. Encryption, the evidence key, the redaction rules and
 * capture text projection stay the supplied ones, as do the ledger file and its migrations. */
import {createHash, randomUUID} from 'node:crypto';
import {readdirSync, rmSync, statSync} from 'node:fs';
import path from 'node:path';

const NEAR_DUP_MIN_SIMILARITY = 0.95, NEAR_DUP_MAX_AGE_MS = 6e5, NEAR_DUP_MAX_WINDOWS = 50, DELTA_MAX_RATIO = 0.5;
const DRAFT_IDLE_MS = 3e5, DRAFT_ECHO_MS = 6e4, DRAFT_MAX_WINDOWS = 200, SELECTION_BURST_MS = 2e3, SELECTION_BURST_MAX_WINDOWS = 200;
const APP_SESSION_IDLE_MS = 18e5, SUPPRESSION_BUCKET_MS = 36e5, FOOTPRINT_TTL_MS = 3e5, VACUUM_SLACK_MIN_BYTES = 16777216, DELETE_BATCH = 500;
const ACTION_KINDS = new Set(['mouse.click', 'mouse.context_menu', 'mouse.drag', 'keyboard.submit']);

/** Keeps `value` as the newest of an account's bounded recent values. */
function remember(byAccount, accountId, key, value, limit) {
  const recent = byAccount.get(accountId) ?? new Map;
  byAccount.set(accountId, recent);
  recent.delete(key);
  recent.set(key, value);
  if (recent.size > limit) recent.delete(recent.keys().next().value);
}

const continuesDraft = (draft, next) => {
  const before = draft.replace(/\s+/g, ''), after = next.replace(/\s+/g, '');
  return after.includes(before) || before.includes(after) && after.length * 2 >= before.length;
};

/** The two profiles' shared bytes over their combined bytes. */
function contentSimilarity(a, b) {
  if (a.bytes === 0 || b.bytes === 0) return +(a.bytes === b.bytes);
  let shared = 0;
  for (const [chunk, count] of a.chunks) {
    const other = b.chunks.get(chunk);
    if (other !== undefined) shared += Math.min(count, other) * Buffer.byteLength(chunk, 'utf8');
  }
  const overlap = Math.min(shared, a.bytes, b.bytes);
  return overlap / (a.bytes + b.bytes - overlap);
}

/** The key under which a capture's near duplicates are found: one per tab, or per app window for full accessibility trees. */
const nearDupKey = (event, axMode, windowKey) => event.source === 'aux_dom'
  ? event.kind === 'content.snapshot' ? `dom:${event.target.targetId ?? ''}` : null
  : axMode === 'fullTree' ? `ax:${windowKey}` : null;

export function create({stores: {contextWrite: w}}) {
  const {ContextAwarenessEventTable: events, ContextAwarenessSummaryTable: summaries, ContextAwarenessBlobTable: blobs, ContextAwarenessFrameTable: frames} = w.tables;
  const {eq, and, gte, lte, lt, inArray, notExists, desc, sql} = w.operators;
  const deletionEpochs = new Map, sittings = new Map, suppressions = new Map, footprints = new Map;
  const nearDupBaselines = new Map, keyframes = new Map, selectionBursts = new Map, drafts = new Map;
  for (const perAccount of [sittings, footprints, nearDupBaselines, keyframes, selectionBursts, drafts]) w.deletionEpochPurges.add(accountId => perAccount.delete(accountId));

  const getDeletionEpoch = accountId => deletionEpochs.get(accountId) ?? 0;
  function bumpDeletionEpoch(accountId) {
    deletionEpochs.set(accountId, getDeletionEpoch(accountId) + 1);
    for (const purge of w.deletionEpochPurges) purge(accountId);
  }

  /** True until the account is replaced or its captures are deleted. */
  function createContextAwarenessWriteFence(accountId) {
    const account = w.AccountRegistry.getAccount(accountId), epoch = getDeletionEpoch(accountId);
    return () => account !== undefined && w.AccountRegistry.getAccount(accountId)?.createdAt === account.createdAt && getDeletionEpoch(accountId) === epoch;
  }

  function recordContextAwarenessSuppression(accountId, reason, at = Date.now(), count = 1) {
    const counters = suppressions.get(accountId) ?? new Map, key = `${Math.floor(at / SUPPRESSION_BUCKET_MS) * SUPPRESSION_BUCKET_MS}:${reason}`;
    suppressions.set(accountId, counters);
    counters.set(key, (counters.get(key) ?? 0) + count);
  }

  function pruneSuppressions(accountId, shouldDrop) {
    const counters = suppressions.get(accountId);
    if (counters) for (const key of [...counters.keys()]) if (shouldDrop(Number(key.slice(0, key.indexOf(':'))))) counters.delete(key);
  }

  function suppressionSummary(accountId) {
    const totals = {};
    for (const [key, count] of suppressions.get(accountId) ?? []) {
      const reason = key.slice(key.indexOf(':') + 1);
      totals[reason] = (totals[reason] ?? 0) + count;
    }
    return totals;
  }

  function redactText(text, report) {
    if (!text) return text;
    report.inspected += 1;
    const redacted = w.redactSecretsInText(text);
    if (!redacted) return text;
    for (const rule of redacted.rules) report.byRule[rule] = (report.byRule[rule] ?? 0) + 1;
    return redacted.value;
  }

  const redactMetadata = (value, report) => typeof value === 'string' ? redactText(value, report)
    : Array.isArray(value) ? value.map(entry => redactMetadata(entry, report))
      : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, redactMetadata(entry, report)])) : value;

  function contentProfile(text) {
    const chunks = new Map;
    for (const chunk of w.contentChunks(text)) chunks.set(chunk, (chunks.get(chunk) ?? 0) + 1);
    return {chunks, bytes: Buffer.byteLength(text, 'utf8')};
  }

  /** `next` as a diff against the keyframe: empty when unchanged, undefined when a diff would not pay. */
  function deltaAgainst(keyframe, next) {
    if (keyframe.text.trim() === next.trim()) return '';
    const lines = next.split('\n'), {appeared, gone} = w.multisetDiff(keyframe.text.split('\n'), lines);
    if (w.isStructuralChange(Math.max(appeared.length, gone.length), lines.length)) return undefined;
    let delta = w.diff(keyframe.text, next);
    const lastLine = next.trim().split('\n').at(-1);
    if (lastLine.startsWith('… AX tree truncated') && keyframe.text.trim().endsWith(`\n${lastLine}`))
      delta += `@@ -${keyframe.text.trim().split('\n').length} +${next.trim().split('\n').length} @@\n ${lastLine}\n`;
    return Buffer.byteLength(delta, 'utf8') < Buffer.byteLength(next, 'utf8') * DELTA_MAX_RATIO ? delta : undefined;
  }

  /** Whether the change is only the app echoing the user's draft into its composer. */
  function isDraftEcho(keyframe, next, draft) {
    const before = w.splitComposer(keyframe.text, draft.field), after = w.splitComposer(next, draft.field), typed = w.compactText(draft.value);
    if (!before || !after || Math.min(typed.length, after.text.length) < 3 || !after.text.startsWith(typed) && !typed.startsWith(after.text) || before.rest.join('\n') !== after.rest.join('\n')) return false;
    if (before.document === undefined || after.document === undefined) return before.document === after.document;
    const without = (text, part) => text.includes(part) ? text.replace(part, '') : undefined;
    const remainder = without(before.document, before.text);
    return remainder !== undefined && remainder === without(after.document, after.text);
  }

  function resolveContextAwarenessSession(accountId, {source, appName, bundleId, occurredAt, forceNew}) {
    const open = sittings.get(accountId) ?? new Map;
    sittings.set(accountId, open);
    const sitting = open.get(source);
    if (sitting && !forceNew && sitting.bundleId === bundleId && occurredAt - sitting.lastEventAt <= APP_SESSION_IDLE_MS) {
      sitting.lastEventAt = Math.max(sitting.lastEventAt, occurredAt);
      return sitting.id;
    }
    const id = randomUUID();
    open.set(source, {id, appName, bundleId, lastEventAt: occurredAt});
    return id;
  }

  function endContextAwarenessSession(accountId, id) {
    const open = sittings.get(accountId);
    if (open) for (const [source, sitting] of open) if (sitting.id === id) open.delete(source);
  }

  function findLatestContextAwarenessSession(accountId, bundleId) {
    const row = w.ledgerDb(accountId).select({sessionId: events.sessionId}).from(events).where(and(eq(events.bundleId, bundleId), sql`${events.sessionId} IS NOT NULL`)).orderBy(desc(events.occurredAt)).limit(1).get();
    return row?.sessionId ? {id: row.sessionId} : undefined;
  }

  const findBlob = (accountId, contentHash) => w.ledgerDb(accountId).select().from(blobs).where(eq(blobs.contentHash, contentHash)).get();
  const touchBlob = (accountId, id, at) => w.ledgerDb(accountId).update(blobs).set({lastSeenAt: at}).where(eq(blobs.id, id)).run();
  const updateCoalescedEvent = (accountId, id, change) => Number(w.ledgerDb(accountId).update(events).set(change).where(and(eq(events.id, id), eq(events.kind, change.payload.kind))).run().changes) > 0;

  /** Validates, redacts and stores one event. A nulled `eventId` means nothing was stored. */
  async function recordContextAwarenessEvent(accountId, input, options = {}) {
    const startedAt = performance.now();
    const skipped = (contentHash = null) => ({eventId: null, blobId: null, contentHash, deduped: false, nearDeduped: false, storedBytes: 0, storeMs: Math.round(performance.now() - startedAt)});
    if (options.shouldCommit && !options.shouldCommit()) return skipped();
    const event = w.eventInputSchema.parse(input);
    if (event.kind === 'selection.changed' && !('content' in event && event.content)) return skipped();
    if (event.source !== 'aux_dom' && event.url && !w.resolveCredentialDomain(event.url)?.preferredDomain) event.url = undefined;
    const policy = w.isCaptureAllowed(accountId, {bundleId: event.bundleId, url: event.url, typedText: event.kind === 'keyboard.text_input'});
    if (!policy.allowed) {
      recordContextAwarenessSuppression(accountId, policy.reason ?? 'policy', event.occurredAt);
      return skipped();
    }
    const {occurredAt} = event, domain = policy.domain || null;
    const report = {inspected: 'redactions' in event ? event.redactions?.inspected ?? 0 : 0, byRule: 'redactions' in event ? {...event.redactions?.byRule} : {}};
    const appName = redactText(event.appName, report), windowTitle = redactText(event.windowTitle, report), windowKey = `${event.bundleId}\n${windowTitle}`;
    const url = event.url ? w.scrubUrl(event.url, report) : undefined;
    const target = w.eventTargetSchema.parse(Object.fromEntries(Object.entries(event.target).map(([key, value]) => [key, typeof value === 'string' ? redactText(value, report) : value])));
    const payload = 'payload' in event ? w.eventPayloadSchema.parse(redactMetadata(event.payload, report)) : undefined;
    const redacted = 'content' in event && event.content ? redactText(event.content, report) : undefined;
    const epoch = getDeletionEpoch(accountId);
    let content = redacted, axMode = payload && 'axMode' in payload ? payload.axMode : undefined;

    // A full capture repeating the last one stores nothing, or only what changed.
    const fullCapture = axMode === 'fullTree' || event.kind === 'content.snapshot' && event.shape === 'aria';
    const keyframeKey = content !== undefined && fullCapture ? nearDupKey(event, 'fullTree', windowKey) : null;
    const keyframe = keyframeKey === null ? undefined : keyframes.get(accountId)?.get(keyframeKey);
    if (keyframeKey !== null) {
      const base = event.source === 'aux_dom' && keyframe?.url !== url ? undefined : keyframe;
      let delta = base && occurredAt - base.storedAt <= NEAR_DUP_MAX_AGE_MS ? deltaAgainst(base, content) : undefined;
      const draft = drafts.get(accountId)?.get(windowKey);
      const echo = delta !== undefined && delta !== '' && base !== undefined && draft !== undefined && occurredAt - draft.at <= DRAFT_ECHO_MS && isDraftEcho(base, content, draft);
      if (echo) delta = '';
      if (delta === '') {
        if (!ACTION_KINDS.has(event.kind)) {
          recordContextAwarenessSuppression(accountId, echo ? 'draft-echo' : 'unchanged-capture', occurredAt);
          return skipped();
        }
        content = undefined;
      } else if (delta !== undefined) {
        content = delta;
        axMode = 'diffFromPrevious';
        if (payload && 'axMode' in payload) payload.axMode = axMode;
      }
    }

    const contentBytes = Buffer.byteLength(content ?? '', 'utf8');
    let blobId = null, deduped = false, nearDeduped = false, storedBytes = 0, overlay = false;
    let contentHash = content === undefined ? null : createHash('sha256').update(content).digest('hex');
    const stored = eventId => ({eventId, blobId, contentHash, deduped, nearDeduped, storedBytes, storeMs: Math.round(performance.now() - startedAt)});
    if (content !== undefined) {
      const dupKey = nearDupKey(event, axMode, windowKey), profile = dupKey === null ? null : contentProfile(content);
      const baseline = dupKey === null ? undefined : nearDupBaselines.get(accountId)?.get(dupKey);
      const base = event.source === 'aux_dom' && baseline?.url !== url ? undefined : baseline;
      const rememberBaseline = id => {
        if (dupKey !== null) remember(nearDupBaselines, accountId, dupKey, {blobId: id, contentHash, url, ...profile, storedAt: occurredAt}, NEAR_DUP_MAX_WINDOWS);
      };
      const reuse = id => {
        blobId = id;
        deduped = true;
        touchBlob(accountId, id, occurredAt);
      };
      const existing = findBlob(accountId, contentHash);
      if (existing) {
        reuse(existing.id);
        rememberBaseline(existing.id);
      } else if (base !== undefined && profile !== null && occurredAt - base.storedAt <= NEAR_DUP_MAX_AGE_MS && contentSimilarity(base, profile) >= NEAR_DUP_MIN_SIMILARITY) {
        contentHash = base.contentHash;
        nearDeduped = true;
        reuse(base.blobId);
        recordContextAwarenessSuppression(accountId, 'near-duplicate-blob', occurredAt);
      } else {
        const encrypted = await w.encryptEvidence(accountId, content);
        if (getDeletionEpoch(accountId) !== epoch || options.shouldCommit && !options.shouldCommit()) return skipped(contentHash);
        blobId = w.nanoid();
        storedBytes = encrypted.byteLength;
        try {
          w.ledgerDb(accountId).insert(blobs).values({id: blobId, contentHash, content: encrypted, redactedBytes: contentBytes, createdAt: occurredAt, lastSeenAt: occurredAt}).run();
        } catch (error) {
          const raced = findBlob(accountId, contentHash);
          if (!raced) throw error;
          storedBytes = 0;
          reuse(raced.id);
        }
        rememberBaseline(blobId);
      }
      // Far less text than the keyframe at the same place is a popover over it, not the new page.
      overlay = keyframe !== undefined && (keyframe.url === undefined || url === undefined || keyframe.url === url) && redacted !== undefined && redacted.length * 4 < keyframe.text.length;
      if (overlay && payload && 'axMode' in payload) payload.overlay = true;
      if (keyframeKey !== null && !nearDeduped && redacted !== undefined && !overlay) remember(keyframes, accountId, keyframeKey, {text: redacted, url, storedAt: occurredAt}, NEAR_DUP_MAX_WINDOWS);
    }

    const sessionId = resolveContextAwarenessSession(accountId, {source: event.source, appName, bundleId: event.bundleId, occurredAt, forceNew: event.kind === 'session.started'}), eventId = w.nanoid();
    const finalPayload = event.kind === 'content.snapshot' ? {kind: 'content.snapshot', trigger: event.trigger, shape: event.shape, ...event.media && {media: true}, deduped: deduped && !nearDeduped,
      ...axMode === 'diffFromPrevious' && {axMode}, ...overlay && {overlay}, rawBytes: contentBytes, redactedBytes: contentBytes, captureMs: event.captureMs, storeMs: Math.round(performance.now() - startedAt)} : payload;
    const coalesces = (prior, span) => occurredAt >= prior.at && occurredAt - prior.at <= span && w.tenMinuteWindow(occurredAt).from === w.tenMinuteWindow(prior.at).from && prior.sessionId === sessionId
      && (prior.url === null || prior.url === (url ?? null)) && (prior.domain === null || prior.domain === domain);
    const field = {role: target.role, title: target.title, placeholder: target.placeholder, identifier: target.identifier};
    const sameField = other => JSON.stringify(other) === JSON.stringify(field);
    const place = {occurredAt, url, domain, target, blobId};

    const draft = drafts.get(accountId)?.get(windowKey);
    if (draft && (finalPayload.kind === 'keyboard.submit' ? !finalPayload.modifiers?.includes('shift') : ACTION_KINDS.has(event.kind) && !sameField(draft.field))) draft.eventId = null;
    if (finalPayload.kind === 'keyboard.text_input' && (finalPayload.draft || finalPayload.submitted) && content !== undefined && blobId !== null) {
      const characterCount = (draft?.characterCount ?? 0) + finalPayload.characterCount;
      const merged = draft !== undefined && draft.eventId !== null && sameField(draft.field) && continuesDraft(draft.value, content) && coalesces(draft, DRAFT_IDLE_MS)
        && updateCoalescedEvent(accountId, draft.eventId, {...place, payload: {kind: 'keyboard.text_input', characterCount, ...finalPayload.submitted ? {submitted: true} : {draft: true}, coalesced: draft.coalesced + 1}});
      remember(drafts, accountId, windowKey, {eventId: finalPayload.submitted ? null : merged ? draft.eventId : eventId, field, at: occurredAt, characterCount: merged ? characterCount : finalPayload.characterCount,
        coalesced: merged ? draft.coalesced + 1 : 0, value: content, sessionId, url: url ?? null, domain}, DRAFT_MAX_WINDOWS);
      if (merged) return stored(draft.eventId);
    }
    if (finalPayload.kind === 'selection.changed') {
      const burst = selectionBursts.get(accountId)?.get(windowKey);
      if (burst && coalesces(burst, SELECTION_BURST_MS) && updateCoalescedEvent(accountId, burst.eventId, {...place, payload: {...finalPayload, coalesced: burst.coalesced + 1}})) {
        Object.assign(burst, {at: occurredAt, coalesced: burst.coalesced + 1, url: url ?? null, domain});
        return stored(burst.eventId);
      }
      remember(selectionBursts, accountId, windowKey, {eventId, at: occurredAt, coalesced: 0, sessionId, url: url ?? null, domain}, SELECTION_BURST_MAX_WINDOWS);
    }
    w.ledgerDb(accountId).insert(events).values({id: eventId, occurredAt, source: event.source, kind: event.kind, appName, bundleId: event.bundleId, windowTitle, url, domain, target, payload: finalPayload, blobId, sessionId}).run();
    if (event.kind === 'session.ended') endContextAwarenessSession(accountId, sessionId);
    return stored(eventId);
  }

  /** The browser's capture of a page. */
  async function recordCapture(capture, options = {}) {
    const result = await recordContextAwarenessEvent(capture.accountId, {source: 'aux_dom', kind: 'content.snapshot', trigger: capture.trigger ?? 'navigation', shape: capture.shape ?? 'aria', media: capture.media,
      occurredAt: capture.capturedAt ?? Date.now(), appName: w.browserAppName, bundleId: w.browserBundleId, windowTitle: capture.title ?? '', url: capture.url, target: {targetId: capture.targetId ?? 'unknown'},
      content: capture.shape === 'text' ? capture.content : capture.content.replace(w.ariaActorTokens, ''), captureMs: capture.captureMs ?? 0, redactions: capture.redactions}, options);
    return {changed: result.eventId !== null && (!result.deduped || result.nearDeduped)};
  }

  const deleteOrphans = db => {
    const removed = db.delete(blobs).where(notExists(db.select({one: sql`1`}).from(events).where(eq(events.blobId, blobs.id)))).run().changes;
    db.delete(frames).where(notExists(db.select({one: sql`1`}).from(blobs).where(eq(blobs.frameId, frames.id)))).run();
    return {blobs: Number(removed)};
  };

  function clearTargetWhere(target) {
    switch (target.kind) {
      case 'all': return undefined;
      case 'timeRange': return and(target.from === undefined ? undefined : gte(events.occurredAt, target.from), target.to === undefined ? undefined : lte(events.occurredAt, target.to));
      case 'application': return eq(events.bundleId, target.bundleId);
      case 'session': return eq(events.sessionId, target.sessionId);
      default: return eq(events.domain, target.domain);
    }
  }

  /** The summaries built on anything being cleared, following rollups up: a summary counts as cleared once one of its sources is. */
  function dependentSummaries(all, cleared, target) {
    const found = [];
    for (let changed = true; changed;) {
      changed = false;
      for (const summary of all) {
        if (cleared.has(summary.id)) continue;
        if (target.kind === 'all' || summary.sourceIds.some(id => cleared.has(id)) || target.kind === 'timeRange' && summary.windowTo >= target.from && summary.windowFrom <= target.to) {
          found.push(summary);
          cleared.add(summary.id);
          changed = true;
        }
      }
    }
    return found;
  }

  /** Queues a cleared summary's window again over the events that remain. */
  function requeueSummary(tx, summary, now) {
    const sourceIds = (summary.kind === '10min'
      ? tx.select({id: events.id}).from(events).where(and(gte(events.occurredAt, summary.windowFrom), lt(events.occurredAt, summary.windowTo)))
      : tx.select({id: summaries.id}).from(summaries).where(and(eq(summaries.kind, '10min'), gte(summaries.windowFrom, summary.windowFrom), lte(summaries.windowTo, summary.windowTo)))).all().map(row => row.id);
    if (sourceIds.length > 0) tx.insert(summaries).values({id: w.nanoid(), kind: summary.kind === '10min' ? '10min' : '6h', windowFrom: summary.windowFrom, windowTo: summary.windowTo,
      sourceIds, status: 'pending', availableAt: now, createdAt: now, updatedAt: now}).onConflictDoNothing().run();
  }

  /** Deletes the target's events, whatever they alone kept, and the summaries made from them. */
  function clearContextAwareness(accountId, target) {
    if (target.kind === 'today') return clearContextAwareness(accountId, {kind: 'timeRange', from: w.dayjs.default().startOf('day').valueOf(), to: Date.now()});
    bumpDeletionEpoch(accountId);
    const db = w.ledgerDb(accountId), where = clearTargetWhere(target);
    const cleared = db.select({id: events.id, occurredAt: events.occurredAt, sessionId: events.sessionId}).from(events).where(where).all();
    const dependents = dependentSummaries(db.select().from(summaries).all(), new Set(cleared.map(row => row.id)), target);
    let orphans = {blobs: 0};
    db.transaction(tx => {
      if (where) tx.delete(events).where(where).run();
      else tx.delete(events).run();
      const ids = dependents.map(summary => summary.id);
      for (let start = 0; start < ids.length; start += DELETE_BATCH) tx.delete(summaries).where(inArray(summaries.id, ids.slice(start, start + DELETE_BATCH))).run();
      orphans = deleteOrphans(db);
      if (target.kind !== 'all') {
        const now = Date.now();
        for (const summary of dependents) requeueSummary(tx, summary, now);
      }
    });
    db.$client.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    const cleanupErrors = [];
    try {
      rmSync(path.join(w.memoryDir(w.getAccountRoot(accountId)), 'threads'), {recursive: true, force: true});
    } catch (cause) {
      cleanupErrors.push(Error('Legacy thread directory cleanup failed', {cause}));
    }
    if (target.kind === 'all') suppressions.delete(accountId);
    else if (target.kind === 'timeRange') pruneSuppressions(accountId, at => at >= target.from - SUPPRESSION_BUCKET_MS && at <= target.to);
    return {events: cleared.length, blobs: orphans.blobs, sessions: new Set(cleared.flatMap(row => row.sessionId ? [row.sessionId] : [])).size, summaries: dependents.length, cleanupErrors,
      days: [...new Set(dependents.filter(summary => summary.kind === '10min').map(summary => w.dayjs.default(summary.windowFrom).format('YYYY-MM-DD')))].sort()};
  }

  /** Retention: drops what is older than the limit, keeping events a summary still has to be made from. */
  function runContextAwarenessGc(accountId, retentionDays, now = Date.now()) {
    const db = w.ledgerDb(accountId), cutoff = now - retentionDays * 24 * 60 * 6e4;
    db.delete(summaries).where(and(eq(summaries.status, 'failed'), lt(summaries.windowTo, cutoff))).run();
    const pending = new Set(db.select({sourceIds: summaries.sourceIds}).from(summaries).where(inArray(summaries.status, ['pending', 'running', 'failed'])).all().flatMap(row => row.sourceIds));
    const ids = db.select({id: events.id}).from(events).where(lt(events.occurredAt, cutoff)).all().flatMap(row => pending.has(row.id) ? [] : [row.id]);
    for (let start = 0; start < ids.length; start += DELETE_BATCH) db.delete(events).where(inArray(events.id, ids.slice(start, start + DELETE_BATCH))).run();
    const orphans = deleteOrphans(db);
    pruneSuppressions(accountId, at => at < cutoff);
    if (ids.length > 0 || orphans.blobs > 0) bumpDeletionEpoch(accountId);
    return {events: ids.length, blobs: orphans.blobs, sessions: 0, summaries: 0, days: []};
  }

  function reclaimContextAwarenessSpace(accountId) {
    const sqlite = w.ledgerDb(accountId).$client;
    if (Number(sqlite.prepare('PRAGMA auto_vacuum;').get()?.auto_vacuum ?? 0) !== 2) sqlite.exec('PRAGMA auto_vacuum = INCREMENTAL');
    sqlite.exec('PRAGMA incremental_vacuum;');
    const {slackBytes} = w.measureDbFootprint(accountId);
    if (slackBytes >= VACUUM_SLACK_MIN_BYTES) try {
      sqlite.exec('VACUUM');
      w.logger.info('[ContextAwareness] vacuumed ledger slack', {accountId, slackBytes});
    } catch (error) {
      w.logger.warn('[ContextAwareness] VACUUM failed', {accountId, error});
    }
    sqlite.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    footprints.delete(accountId);
  }

  const episodicPages = (directory, prefix) => {
    try {
      return readdirSync(directory).filter(name => name.startsWith(prefix)).map(name => path.join(directory, name));
    } catch {
      return [];
    }
  };
  const fileSize = file => {
    try {
      return statSync(file).size;
    } catch {
      return 0;
    }
  };

  function getContextAwarenessFootprint(accountId, now = Date.now()) {
    const cached = footprints.get(accountId);
    if (cached && now - cached.at < FOOTPRINT_TTL_MS) return cached.value;
    const pages = episodicPages(path.join(w.memoryDir(w.getAccountRoot(accountId)), w.EPISODIC_DIR), w.CONTEXT_AWARENESS_PAGE_PREFIX);
    const value = {...w.measureDbFootprint(accountId), fileBytes: pages.reduce((total, page) => total + fileSize(page), 0)};
    footprints.set(accountId, {at: now, value});
    return value;
  }

  return {getDeletionEpoch, bumpDeletionEpoch, createContextAwarenessWriteFence, findLatestContextAwarenessSession, recordContextAwarenessSuppression, suppressionSummary,
    recordContextAwarenessEvent, recordCapture, clearContextAwareness, runContextAwarenessGc, reclaimContextAwarenessSpace, getContextAwarenessFootprint};
}
