/** The Context Awareness ledger, its read side: captured events, the ten-minute summaries made from
 * them, and the counts the settings and status views show. Writing and clearing are in
 * contextWrite.mjs, stored content in contextEvidence.mjs. Making summaries (a model) stays the
 * supplied one, as do the ledger file and its migrations. Queries use the supplied query builder
 * and tables. Times are epoch milliseconds. */
const searchTerms = text => text ? [...new Set(text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}+#._-]*/gu) ?? [])] : [];

/** The first index in `events` (sorted by time) at or after `at`. */
export function eventIndexAt(events, at) {
  let low = 0, high = events.length;
  while (low < high) {
    const middle = low + high >>> 1;
    if (events[middle].occurredAt < at) low = middle + 1;
    else high = middle;
  }
  return low;
}

export function create({stores: {contextLedger: l}}) {
  const {ContextAwarenessEventTable: events, ContextAwarenessSummaryTable: summaries, ContextAwarenessBlobTable: blobs, ContextAwarenessFrameTable: frames} = l.tables;
  const {eq, and, or, gte, lte, gt, lt, like, inArray, desc, asc, isNull, sql, count} = l.operators;
  const ledger = accountId => l.ledgerDb(accountId);
  const value = query => query.get()?.value;

  const toEvent = (row, contentBytes) => ({id: row.id, occurredAt: row.occurredAt, source: row.source, kind: row.kind, appName: row.appName, bundleId: row.bundleId,
    windowTitle: row.windowTitle, url: row.url, domain: row.domain, target: row.target, payload: row.payload, blobId: row.blobId, contentBytes, sessionId: row.sessionId});
  const toSummary = row => ({id: row.id, kind: row.kind, windowFrom: row.windowFrom, windowTo: row.windowTo, createdAt: row.createdAt, title: row.title,
    description: row.description, body: row.body ?? '', apps: row.apps, domains: row.domains, citations: row.citations, sourceIds: row.sourceIds, status: row.status,
    error: row.error, model: row.model, inputTokens: row.inputTokens, outputTokens: row.outputTokens, durationMs: row.durationMs, digestedAt: row.digestedAt});
  const within = (column, from, to) => and(from === undefined ? undefined : gte(column, from), to === undefined ? undefined : lte(column, to));

  /** Newest first, filtered by time, source, kind, app and domain. */
  const listContextAwarenessEvents = (accountId, query) => ledger(accountId)
    .select({row: events, contentBytes: sql`COALESCE(${blobs.redactedBytes}, 0)`}).from(events).leftJoin(blobs, eq(events.blobId, blobs.id))
    .where(and(within(events.occurredAt, query.from, query.to), query.source ? eq(events.source, query.source) : undefined, query.kind ? eq(events.kind, query.kind) : undefined,
      query.bundleId ? eq(events.bundleId, query.bundleId) : undefined, query.domain ? eq(events.domain, query.domain) : undefined))
    .orderBy(desc(events.occurredAt)).limit(query.limit).all().map(({row, contentBytes}) => toEvent(row, contentBytes));

  /** Completed summaries overlapping the range; `text` matches any of its terms in title, description or body. */
  const listHistorySummaries = (accountId, query = {}) => ledger(accountId).select().from(summaries).where(and(eq(summaries.status, 'completed'),
    query.kinds?.length ? inArray(summaries.kind, query.kinds) : undefined, query.from === undefined ? undefined : gt(summaries.windowTo, query.from),
    query.to === undefined ? undefined : lt(summaries.windowFrom, query.to), query.app ? like(summaries.apps, `%${query.app}%`) : undefined,
    query.domain ? like(summaries.domains, `%"${query.domain}"%`) : undefined,
    or(...searchTerms(query.text).map(term => or(like(summaries.title, `%${term}%`), like(summaries.description, `%${term}%`), like(summaries.body, `%${term}%`))))))
    .orderBy(query.oldestFirst ? asc(summaries.windowFrom) : desc(summaries.windowTo)).limit(query.limit ?? 100).all().map(toSummary);

  /** The ten-minute summaries in a range, each with the apps seen during it. */
  const listContextAwarenessView = async (accountId, range) => {
    const seen = ledger(accountId).select({occurredAt: events.occurredAt, bundleId: events.bundleId, appName: events.appName}).from(events)
      .where(and(gte(events.occurredAt, range.from), lte(events.occurredAt, range.to))).orderBy(events.occurredAt).all();
    return (await listHistorySummaries(accountId, {from: range.from, to: range.to, kinds: ['10min'], limit: 2e3, oldestFirst: true}))
      .filter(summary => summary.windowFrom >= range.from && summary.windowFrom < range.to)
      .map(summary => {
        const during = seen.slice(eventIndexAt(seen, summary.windowFrom), eventIndexAt(seen, summary.windowTo));
        return {id: summary.id, windowFrom: summary.windowFrom, windowTo: summary.windowTo, title: summary.title, description: summary.description, narrative: summary.body,
          applications: [...new Map(during.map(event => [event.bundleId || event.appName, {name: event.appName || event.bundleId, bundleId: event.bundleId}])).values()]};
      });
  };

  /** Apps seen most recently, each with up to five of its domains. */
  const listContextAwarenessRecents = (accountId, limit = 10) => {
    if (!l.hasContextAwarenessLedger(accountId)) return [];
    const db = ledger(accountId);
    return db.select({bundleId: events.bundleId, appName: sql`MAX(${events.appName})`, lastSeenAt: sql`MAX(${events.occurredAt})`}).from(events)
      .where(sql`${events.bundleId} != ''`).groupBy(events.bundleId).orderBy(desc(sql`MAX(${events.occurredAt})`)).limit(limit).all()
      .map(app => ({appName: app.appName || app.bundleId, bundleId: app.bundleId,
        domains: db.selectDistinct({domain: events.domain}).from(events).where(and(eq(events.bundleId, app.bundleId), sql`${events.domain} IS NOT NULL`)).limit(5).all()
          .flatMap(row => row.domain ? [row.domain] : [])}));
  };

  /** Whether the user was browsing since `since`, as the browser reported it. */
  const hasRecentAttendedBrowsing = (accountId, since) => l.hasContextAwarenessLedger(accountId) && ledger(accountId).select({id: events.id}).from(events)
    .where(and(eq(events.source, 'aux_dom'), gte(events.occurredAt, since), sql`json_extract(${events.payload}, '$.trigger') IN ('navigation', 'activation', 'interaction')`)).limit(1).get() !== undefined;

  /** Drops a window's ten-minute summary and queues the window to be summarized again. */
  const resetTenMinuteWindow = (accountId, window) => {
    const now = Date.now();
    ledger(accountId).transaction(tx => {
      tx.delete(summaries).where(and(eq(summaries.kind, '10min'), eq(summaries.windowFrom, window.from), eq(summaries.windowTo, window.to))).run();
      const ids = tx.select({id: events.id}).from(events).where(and(gte(events.occurredAt, window.from), lt(events.occurredAt, window.to))).all().map(row => row.id);
      if (ids.length > 0) l.enqueueWindow(accountId, '10min', window, ids, now);
    });
  };

  const getSummaryJobStatus = accountId => {
    const byStatus = ledger(accountId).select({status: summaries.status, count: sql`COUNT(*)`, oldest: sql`MIN(${summaries.windowFrom})`}).from(summaries).groupBy(summaries.status).all();
    const counted = status => Number(byStatus.find(row => row.status === status)?.count ?? 0);
    const oldestPendingAt = byStatus.filter(row => row.status === 'pending' || row.status === 'running').map(row => row.oldest).filter(at => at !== null).sort((a, b) => a - b)[0] ?? null;
    const lastFailure = ledger(accountId).select({error: summaries.error}).from(summaries).where(eq(summaries.status, 'failed')).orderBy(desc(summaries.updatedAt)).limit(1).get();
    return {pending: counted('pending'), running: counted('running'), failed: counted('failed'), oldestPendingAt, lastError: lastFailure?.error ?? null};
  };

  /** Totals for the store and for today (local midnight on). */
  const getContextAwarenessStats = accountId => {
    const db = ledger(accountId), midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const today = midnight.getTime();
    const bySource = db.select({source: events.source, value: count()}).from(events).where(gte(events.occurredAt, today)).groupBy(events.source).all();
    const todayBlobs = db.select({value: count(), bytes: sql`COALESCE(SUM(LENGTH(${blobs.content})), 0)`}).from(blobs).where(gte(blobs.createdAt, today)).get();
    const inlineBytes = value(db.select({value: sql`COALESCE(SUM(LENGTH(${blobs.content})), 0)`}).from(blobs).where(isNull(blobs.frameId))) ?? 0;
    const framed = db.select({frames: count(), storedBytes: sql`COALESCE(SUM(${frames.storedBytes}), 0)`}).from(frames).get();
    return {events: value(db.select({value: count()}).from(events)) ?? 0, blobs: value(db.select({value: count()}).from(blobs)) ?? 0,
      storeBytes: inlineBytes + (framed?.storedBytes ?? 0), footprint: l.getContextAwarenessFootprint(accountId),
      rawBytes: value(db.select({value: sql`COALESCE(SUM(${blobs.redactedBytes}), 0)`}).from(blobs)) ?? 0, frames: framed?.frames ?? 0,
      sessions: value(db.select({value: sql`COUNT(DISTINCT ${events.sessionId})`}).from(events)) ?? 0,
      lastEventAt: value(db.select({value: sql`MAX(${events.occurredAt})`}).from(events)) ?? null, suppressions: l.suppressionSummary(accountId),
      today: {events: bySource.reduce((sum, row) => sum + row.value, 0), bySource: Object.fromEntries(bySource.map(row => [row.source, row.value])),
        ocrRuns: value(db.select({value: count()}).from(events).where(and(gte(events.occurredAt, today), eq(events.kind, 'screen.ocr')))) ?? 0,
        blobs: todayBlobs?.value ?? 0, blobBytes: todayBlobs?.bytes ?? 0}};
  };

  /** Per app since `since`, from the native accessibility sources: events, captures and how many captured only window chrome. */
  const listNativeCaptureHealth = (accountId, since) => ledger(accountId).select({appName: sql`MAX(${events.appName})`, bundleId: events.bundleId, events: count(),
    captures: count(blobs.id), chromeOnly: sql`SUM(CASE WHEN ${blobs.redactedBytes} < ${l.emptyTreeBytes} THEN 1 ELSE 0 END)`,
    maxTreeBytes: sql`COALESCE(MAX(${blobs.redactedBytes}), 0)`}).from(events).leftJoin(blobs, eq(blobs.id, events.blobId))
    .where(and(inArray(events.source, ['mac_ax', 'win_uia']), gte(events.occurredAt, since))).groupBy(events.bundleId).all()
    .map(app => ({...app, chromeOnly: Number(app.chromeOnly ?? 0), maxTreeBytes: Number(app.maxTreeBytes)})).sort((a, b) => b.events - a.events);

  /** What the Context Awareness view shows about capture: state, permissions, freshness, backlog and usage. */
  const getContextAwarenessViewStatus = accountId => {
    const db = ledger(accountId), settings = l.settings(accountId).get('contextAwareness'), helper = l.helper.statusFor(accountId), {health} = helper;
    const stats = getContextAwarenessStats(accountId), jobs = getSummaryJobStatus(accountId);
    const usage = db.select({count: sql`COUNT(*)`, inputTokens: sql`COALESCE(SUM(${summaries.inputTokens}), 0)`, outputTokens: sql`COALESCE(SUM(${summaries.outputTokens}), 0)`}).from(summaries).get();
    const lastBySource = Object.fromEntries(db.select({source: events.source, last: sql`MAX(${events.occurredAt})`}).from(events).groupBy(events.source).all().map(row => [row.source, Number(row.last)]));
    const firstEventAt = db.select({at: sql`MIN(${events.occurredAt})`}).from(events).get()?.at ?? null;
    const paused = settings.pausedUntil !== null && settings.pausedUntil > Date.now();
    const runningState = () => {
      if (process.platform === 'win32' && (helper.state === 'starting' || helper.state === 'running' && health.state === 'starting')) return 'starting';
      if (!helper.built || helper.state === 'unsupported' || helper.state === 'missing') return 'unavailable';
      if (paused || health.state === 'paused') return 'paused';
      return helper.state === 'running' ? 'running' : 'stopped';
    };
    return {state: settings.enabled ? runningState() : 'stopped', platform: process.platform,
      nativeCaptureAvailable: health.nativeCaptureAvailable ?? health.accessibilityTrusted ?? false, inputCaptureAvailable: health.inputCaptureAvailable ?? health.inputMonitoringTrusted ?? false,
      screenOcrAvailable: health.screenOcrAvailable ?? health.screenRecordingTrusted ?? process.platform === 'darwin', screenOcrLanguages: health.screenOcrLanguages ?? [],
      accessibilityTrusted: health.accessibilityTrusted ?? false, inputMonitoringTrusted: health.inputMonitoringTrusted ?? false,
      screenRecordingTrusted: health.screenRecordingTrusted ?? true, secureInput: health.secureInput ?? false, healthy: !settings.enabled || helper.state === 'running',
      message: health.message, firstEventAt, lastEventAt: stats.lastEventAt, lastNativeEventAt: lastBySource[process.platform === 'win32' ? 'win_uia' : 'mac_ax'] ?? null,
      lastBrowserEventAt: lastBySource.aux_dom ?? null, backlog: jobs.pending + jobs.running, storageBytes: stats.footprint.retainedDbBytes,
      summaryCount: Number(usage?.count ?? 0), inputTokens: Number(usage?.inputTokens ?? 0), outputTokens: Number(usage?.outputTokens ?? 0)};
  };

  return {listContextAwarenessEvents, listHistorySummaries, listContextAwarenessView, listContextAwarenessRecents, hasRecentAttendedBrowsing, resetTenMinuteWindow, getSummaryJobStatus,
    getContextAwarenessStats, listNativeCaptureHealth, getContextAwarenessViewStatus, eventIndexAt,
    tenMinuteWindow: at => {
      const from = Math.floor(at / l.tenMinutes) * l.tenMinutes;
      return {from, to: from + l.tenMinutes};
    }};
}
