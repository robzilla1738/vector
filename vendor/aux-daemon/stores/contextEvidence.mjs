/** The Context Awareness ledger's stored content: reading it back, sealing cold blobs into
 * compressed frames, and verifying the store. A blob is encrypted on its own until it goes cold;
 * then blobs of one window share an encrypted, zstd-compressed frame. The evidence key and the
 * encryption stay the supplied ones, as do history search and capture text projection. */
import {createHash} from 'node:crypto';
import {constants, zstdCompressSync, zstdDecompressSync} from 'node:zlib';

const FRAME_CACHE_MAX_BYTES = 16777216, FRAME_COLD_AGE_MS = 6e5, FRAME_IDLE_SEAL_MS = 12e5, FRAME_MAX_MEMBERS = 32, FRAME_MAX_RAW_BYTES = 4194304, FRAME_ZSTD_LEVEL = 12;
const SEAL_BATCH_BLOBS = 1024, QUERY_BATCH = 500, VERIFY_BATCH = 200, DEFAULT_VERIFY_SAMPLE = 64;
const SOURCE_CHARS = 1e5, CONTENT_BYTE_BUDGET = 67108864, BLOB_SCAN_LIMIT = 6e3, READ_BYTE_BUDGET = 33554432;
const READ_CALL_BYTES = 30720, READ_BLOCK_OVERHEAD_BYTES = 160, READ_BLOCK_RESERVE_BYTES = 2048;
/** Thrown inside a frame transaction when its members changed; the frame is abandoned. */
const ABANDON = Error('frame membership changed during seal');

const compress = bytes => zstdCompressSync(bytes, {params: {[constants.ZSTD_c_compressionLevel]: FRAME_ZSTD_LEVEL}});
/** A JSON line of member lengths, then the members. */
const packFramePayload = members => Buffer.concat([Buffer.from(`${JSON.stringify(members.map(member => member.length))}\n`, 'utf8'), ...members]);
function parseFramePayload(payload) {
  const lineEnd = payload.indexOf(10), members = [];
  let offset = lineEnd + 1;
  for (const length of JSON.parse(payload.subarray(0, lineEnd).toString('utf8'))) {
    members.push(payload.subarray(offset, offset + length).toString('utf8'));
    offset += length;
  }
  return members;
}

const windowIdentity = row => row.source === 'aux_dom' ? row.targetId ?? row.url ?? row.windowTitle : row.windowTitle;
const stayKey = row => row.source === 'aux_dom' ? `${row.appName}\n${windowIdentity(row)}\n${row.url ?? row.windowTitle}` : `${row.appName}\n${row.windowTitle}`;

/** Shares `budget` bytes among blocks of `sizes`, smallest first; `reserved` blocks (diffs that depend on an earlier block) go last with a floor. */
function fairShares(sizes, budget, reserved) {
  const shares = Array(sizes.length).fill(0), indexes = sizes.map((_, index) => index);
  const floor = Math.min(indexes.reduce((total, index) => total + (reserved[index] ? Math.min(sizes[index], READ_BLOCK_RESERVE_BYTES) : 0), 0), Math.floor(Math.max(0, budget) / 2));
  let remaining = Math.max(0, budget) - floor;
  const share = group => group.sort((a, b) => sizes[a] - sizes[b]).forEach((index, position, sorted) => {
    shares[index] = Math.min(sizes[index], Math.floor(remaining / (sorted.length - position)));
    remaining -= shares[index];
  });
  share(indexes.filter(index => !reserved[index]));
  remaining += floor;
  share(indexes.filter(index => reserved[index]));
  return shares;
}

export function create({stores: {contextEvidence: l}}) {
  const {ContextAwarenessEventTable: events, ContextAwarenessBlobTable: blobs, ContextAwarenessFrameTable: frames} = l.tables;
  const {eq, and, gt, lt, asc, inArray, isNull, sql} = l.operators;
  const ledger = accountId => l.ledgerDb(accountId), epochOf = accountId => l.getDeletionEpoch(accountId), now = () => performance.now();
  const frameCaches = new Map;
  l.deletionEpochPurges.add(accountId => frameCaches.delete(accountId));

  function evictCachedFrame(accountId, frameId) {
    const cache = frameCaches.get(accountId), cached = cache?.frames.get(frameId);
    if (cache && cached) {
      cache.bytes -= cached.bytes;
      cache.frames.delete(frameId);
    }
  }

  function cacheFrame(accountId, frameId, members) {
    const bytes = members.reduce((total, member) => total + Buffer.byteLength(member, 'utf8'), 0);
    if (bytes > FRAME_CACHE_MAX_BYTES) return;
    const cache = frameCaches.get(accountId) ?? {frames: new Map, bytes: 0};
    frameCaches.set(accountId, cache);
    evictCachedFrame(accountId, frameId);
    cache.frames.set(frameId, {members, bytes});
    cache.bytes += bytes;
    while (cache.bytes > FRAME_CACHE_MAX_BYTES) {
      const oldest = cache.frames.keys().next().value;
      cache.bytes -= cache.frames.get(oldest).bytes;
      cache.frames.delete(oldest);
    }
  }

  async function decodeFrame(accountId, frameId, {cache}) {
    const cached = frameCaches.get(accountId)?.frames.get(frameId);
    if (cached) return cached.members;
    const epoch = epochOf(accountId), row = ledger(accountId).select({content: frames.content}).from(frames).where(eq(frames.id, frameId)).get();
    if (!row) return null;
    const members = parseFramePayload(zstdDecompressSync(await l.decryptEvidenceBytes(accountId, row.content)));
    if (epochOf(accountId) !== epoch) return null;
    if (cache) cacheFrame(accountId, frameId, members);
    return members;
  }

  /** Blob id → text; empty if the account's captures were deleted meanwhile. */
  async function decodeBlobContent(accountId, rows) {
    const epoch = epochOf(accountId), content = new Map, byFrame = new Map;
    for (const row of rows) {
      if (row.frameId === null) continue;
      const members = byFrame.get(row.frameId) ?? [];
      byFrame.set(row.frameId, members);
      members.push(row);
    }
    for (const [frameId, members] of byFrame) {
      const decoded = await decodeFrame(accountId, frameId, {cache: true});
      if (decoded) for (const row of members) {
        const text = decoded[row.frameIndex ?? -1];
        if (text !== undefined) content.set(row.id, text);
      }
    }
    for (const row of rows) if (row.frameId === null) content.set(row.id, await l.decryptEvidence(accountId, row.content));
    return epochOf(accountId) === epoch ? content : new Map;
  }

  const contentColumns = {id: blobs.id, content: blobs.content, frameId: blobs.frameId, frameIndex: blobs.frameIndex};

  async function readEventContent(accountId, ids) {
    if (ids.length === 0) return [];
    const rows = ledger(accountId).select({...contentColumns, id: events.id}).from(events).innerJoin(blobs, eq(events.blobId, blobs.id)).where(inArray(events.id, ids)).all();
    const content = await decodeBlobContent(accountId, rows);
    return rows.flatMap(row => content.has(row.id) ? [{id: row.id, content: content.get(row.id)}] : []);
  }

  async function readBlobContent(accountId, ids) {
    const content = new Map;
    for (let start = 0; start < ids.length; start += QUERY_BATCH) {
      const rows = ledger(accountId).select(contentColumns).from(blobs).where(inArray(blobs.id, ids.slice(start, start + QUERY_BATCH))).all();
      for (const [id, text] of await decodeBlobContent(accountId, rows)) content.set(id, text);
    }
    return content;
  }

  /** Reads blobs under a byte budget and keeps their projections; stops once the deadline, the signal or a deletion says so. */
  function createEvidenceReader(accountId, options = {}) {
    const epoch = epochOf(accountId), content = new Map, projections = new Map;
    let bytesRead = 0, overBudget = false;
    const active = () => epochOf(accountId) === epoch && !options.signal?.aborted && (options.deadline === undefined || now() < options.deadline);
    return {content, active,
      get timeRemaining() { return (options.deadline ?? Infinity) - now(); },
      get limited() { return overBudget || !active(); },
      async read(rows, budget = CONTENT_BYTE_BUDGET) {
        const wanted = new Set;
        let left = Math.min(budget, CONTENT_BYTE_BUDGET - bytesRead);
        for (const row of rows) {
          if (row.blobId === null || content.has(row.blobId) || wanted.has(row.blobId)) continue;
          if (row.contentBytes > left || content.size + wanted.size >= BLOB_SCAN_LIMIT) {
            overBudget = true;
            continue;
          }
          wanted.add(row.blobId);
          left -= row.contentBytes;
        }
        if (!active()) return;
        const texts = await readBlobContent(accountId, [...wanted]);
        if (epochOf(accountId) !== epoch || options.signal?.aborted) {
          content.clear();
          projections.clear();
          return;
        }
        for (const [id, text] of texts) {
          content.set(id, text);
          bytesRead += Buffer.byteLength(text);
        }
      },
      project(row) {
        const text = row.blobId === null ? undefined : content.get(row.blobId);
        if (text === undefined) return undefined;
        const shape = l.captureShape(row.source, row.kind, row.shape ?? undefined), key = `${row.blobId}:${shape}`;
        let projection = projections.get(key);
        if (!projection) projections.set(key, projection = l.projectCapture(text.slice(0, SOURCE_CHARS), shape));
        return projection;
      }};
  }

  const neutralize = text => l.neutralizePromptInjectionSyntax(text);
  const eventIdentity = row => ({id: row.id, occurredAt: row.occurredAt, source: row.source, kind: row.kind, appName: neutralize(row.appName), windowTitle: neutralize(row.windowTitle),
    url: row.url === null ? null : neutralize(row.url), domain: row.domain === null ? null : neutralize(row.domain), contentBytes: row.contentBytes, axMode: row.axMode, submitted: row.submitted === 1});
  const lineCount = text => text === '' ? 0 : text.split('\n').length;

  /** One event per stored text and window; a later identical one is listed in `sameAs`. */
  function groupRepeats(rows) {
    const groups = new Map;
    for (const row of rows) {
      const key = row.blobId === null ? row.id : [row.blobId, row.source, row.kind, row.submitted, row.appName, windowIdentity(row), l.localDayHeading(row.occurredAt)].join('\n');
      const group = groups.get(key);
      if (group) {
        group.sameAs.push(row.id);
        group.lastOccurredAt = row.occurredAt;
      } else groups.set(key, {row, sameAs: [], lastOccurredAt: row.occurredAt});
    }
    return [...groups.values()];
  }

  function eventEntries(rows, reader, query, offset) {
    const previous = new Map;
    return groupRepeats(rows).map(({row, sameAs, lastOccurredAt}) => {
      const source = row.blobId === null ? '' : reader.content.get(row.blobId) ?? '';
      let projection = source === '' ? undefined : reader.project(row), since;
      // Each later outline of one stay reads as what changed since the one before it.
      if (projection?.outline && query.match === undefined && offset === 0) {
        const key = stayKey(row), before = previous.get(key);
        previous.set(key, {id: row.id, projection});
        const changes = before && l.projectCaptureSince(before.projection, projection);
        if (changes) {
          since = before.id;
          projection = changes;
        }
      }
      const text = projection === undefined ? '' : neutralize(projection.text);
      return {result: {...eventIdentity(row), content: '', hasAvailableText: text !== '', truncated: row.blobId !== null && !reader.content.has(row.blobId) || source.length > SOURCE_CHARS, sameAs, lastOccurredAt,
        remainingLines: 0, nextOffset: offset, lineCount: lineCount(text), offset, ...projection?.truncation && {notice: '[Partial capture]'}, ...projection?.changes && {changes: projection.changes}, ...since && {since}}, text};
    });
  }

  function summaryEntry(summary, offset) {
    const sources = summary.citations.map(citation => (`⟨${citation.type === 'event' ? 'e' : 's'}:${citation.id}⟩ ${neutralize([citation.title ?? '', citation.url ?? ''].filter(Boolean).join(' ')).slice(0, 240)}`).trim());
    const text = [neutralize(l.flattenObservedHeadings(summary.body)), ...sources.length > 0 ? ['Sources:', ...sources] : []].join('\n');
    return {result: {id: summary.id, type: 'summary', kind: summary.kind, windowFrom: summary.windowFrom, windowTo: summary.windowTo, title: neutralize(summary.title).slice(0, 200), content: '',
      hasAvailableText: text !== '', truncated: false, remainingLines: 0, nextOffset: offset, lineCount: lineCount(text), offset}, text};
  }

  /** Narrows an entry to the lines around `match`, merging overlapping ranges. */
  function keepMatches(entry, match, contextLines) {
    const needle = match.toLowerCase(), lines = entry.text.split('\n'), ranges = [];
    lines.forEach((line, index) => {
      if (!line.toLowerCase().includes(needle)) return;
      const from = Math.max(0, index - contextLines), to = Math.min(lines.length, index + contextLines + 1), last = ranges.at(-1);
      if (last && last.to >= from) last.to = to;
      else ranges.push({from, to});
    });
    entry.text = ranges.map(({from, to}) => `[Lines ${from + 1}-${to} of ${lines.length}]\n${lines.slice(from, to).join('\n')}`).join('\n');
    entry.result.match = match;
    entry.result.lineCount = lineCount(entry.text);
  }

  /** Events and summaries by id, each cut to a fair share of one read's bytes. */
  async function readContextAwarenessEvents(accountId, input) {
    const epoch = epochOf(accountId), reader = createEvidenceReader(accountId), query = l.readQuerySchema.parse(input), ids = [...new Set(query.ids)], offset = query.offset ?? 0;
    const rows = l.selectEvents(accountId).where(inArray(events.id, ids)).orderBy(events.occurredAt).all();
    await reader.read(rows, READ_BYTE_BUDGET);
    const eventIds = new Set(rows.map(row => row.id));
    const entries = [...eventEntries(rows, reader, query, offset), ...l.listSummariesByIds(accountId, ids.filter(id => !eventIds.has(id))).map(summary => summaryEntry(summary, offset))];
    if (query.match !== undefined) for (const entry of entries) keepMatches(entry, query.match, query.contextLines ?? 10);
    const overhead = entries.reduce((total, {result}) => total + Buffer.byteLength(l.readHead(result)) + READ_BLOCK_OVERHEAD_BYTES + (result.notice ? Buffer.byteLength(result.notice) + 1 : 0), 0);
    const shares = fairShares(entries.map(entry => l.takeLines(entry.text, Infinity, offset).bytes), READ_CALL_BYTES - overhead, entries.map(({result}) => 'since' in result && result.since !== undefined));
    entries.forEach((entry, index) => {
      let share = shares[index];
      const firstLineBytes = Buffer.byteLength(entry.text.split('\n')[offset] ?? '');
      if (entries.length === 1 && firstLineBytes > share) {
        const notice = `[Line ${offset + 1} exceeds this read; remaining text on that line omitted.]`;
        entry.result.notice = [entry.result.notice, notice].filter(Boolean).join('\n');
        share = Math.max(0, share - Buffer.byteLength(notice) - 1);
      }
      const taken = l.takeLines(entry.text, share, offset), skippedLine = entries.length > 1 && firstLineBytes > share;
      entry.result.content = taken.text;
      entry.result.remainingLines = taken.remaining + +skippedLine;
      entry.result.nextOffset = offset + taken.shown - +skippedLine;
      entry.result.truncated ||= taken.truncated;
    });
    return epochOf(accountId) === epoch ? entries.map(entry => entry.result) : [];
  }

  const unframed = (tx, ids) => tx.select({id: blobs.id}).from(blobs).where(and(inArray(blobs.id, ids), isNull(blobs.frameId))).all();
  const frameRow = (id, content, memberCount) => ({id, content, memberCount, storedBytes: content.byteLength, createdAt: Date.now()});

  /** Moves blobs into one new frame, unless a member changed meanwhile. */
  async function commitFrame(accountId, members, epoch) {
    const db = ledger(accountId), ids = members.map(member => member.id);
    const stored = db.select({id: blobs.id, content: blobs.content}).from(blobs).where(and(inArray(blobs.id, ids), isNull(blobs.frameId))).all();
    if (stored.length !== ids.length) return null;
    const contentById = new Map(stored.map(row => [row.id, row.content])), plain = [];
    for (const id of ids) plain.push(Buffer.from(await l.decryptEvidence(accountId, contentById.get(id)), 'utf8'));
    const content = await l.encryptEvidenceBytes(accountId, compress(packFramePayload(plain))), frameId = l.nanoid();
    try {
      db.transaction(tx => {
        if (epochOf(accountId) !== epoch || unframed(tx, ids).length !== ids.length) throw ABANDON;
        tx.insert(frames).values(frameRow(frameId, content, ids.length)).run();
        for (const [frameIndex, id] of ids.entries()) tx.update(blobs).set({frameId, frameIndex, content: Buffer.alloc(0)}).where(eq(blobs.id, id)).run();
      });
    } catch (error) {
      if (error === ABANDON) return null;
      throw error;
    }
    return {frames: 1, members: ids.length, rawBytes: plain.reduce((total, member) => total + member.length, 0), storedBytes: content.byteLength};
  }

  /** Seals one window's cold blobs into frames of bounded size; a window still growing keeps its last, part-filled frame open. */
  async function sealGroup(accountId, group, at, epoch, totals) {
    let batch = [], batchBytes = 0;
    const flush = async mayKeepOpen => {
      if (batch.length === 0 || mayKeepOpen && batch.length < FRAME_MAX_MEMBERS && batch.at(-1).createdAt > at - FRAME_IDLE_SEAL_MS) return;
      const sealed = await commitFrame(accountId, batch, epoch);
      if (sealed) for (const key of Object.keys(totals)) totals[key] += sealed[key];
      batch = [];
      batchBytes = 0;
    };
    for (const blob of group) {
      if (batch.length >= FRAME_MAX_MEMBERS || batchBytes + blob.redactedBytes > FRAME_MAX_RAW_BYTES) await flush(false);
      batch.push(blob);
      batchBytes += blob.redactedBytes;
      if (blob.redactedBytes > FRAME_MAX_RAW_BYTES) await flush(false);
    }
    await flush(true);
  }

  async function sealContextAwarenessFrames(accountId, at = Date.now()) {
    const totals = {frames: 0, members: 0, rawBytes: 0, storedBytes: 0};
    const cold = ledger(accountId).select({id: blobs.id, createdAt: blobs.createdAt, redactedBytes: blobs.redactedBytes, groupKey: sql`(
        SELECT e.source || '|' || e.bundle_id || '|' || e.window_title
        FROM context_awareness_events e
        WHERE e.blob_id = context_awareness_blobs.id
        ORDER BY e.occurred_at LIMIT 1)`}).from(blobs).where(and(isNull(blobs.frameId), lt(blobs.createdAt, at - FRAME_COLD_AGE_MS))).orderBy(asc(blobs.createdAt)).limit(SEAL_BATCH_BLOBS).all();
    const groups = new Map;
    for (const blob of cold) {
      if (blob.groupKey === null) continue;
      const group = groups.get(blob.groupKey) ?? [];
      groups.set(blob.groupKey, group);
      group.push(blob);
    }
    const epoch = epochOf(accountId);
    for (const [key, group] of groups) try {
      await sealGroup(accountId, group, at, epoch, totals);
    } catch (error) {
      l.logger.warn('[context-awareness] frame seal skipped a window group', {accountId, group: key.split('|').slice(0, 2).join('|'), error});
    }
    return totals;
  }

  const frameMembership = db => db.select({id: frames.id, memberCount: frames.memberCount, live: sql`(
        SELECT COUNT(*) FROM context_awareness_blobs b WHERE b.frame_id = context_awareness_frames.id)`}).from(frames).all().filter(frame => frame.live < frame.memberCount);

  /** Rewrites one degraded frame without the members it lost. */
  async function compactFrame(accountId, frame) {
    const db = ledger(accountId), epoch = epochOf(accountId);
    const members = db.select({id: blobs.id, frameIndex: blobs.frameIndex}).from(blobs).where(eq(blobs.frameId, frame.id)).orderBy(asc(blobs.frameIndex)).all();
    const decoded = await decodeFrame(accountId, frame.id, {cache: false});
    if (!decoded) return false;
    const content = await l.encryptEvidenceBytes(accountId, compress(packFramePayload(members.map(member => Buffer.from(decoded[member.frameIndex ?? -1] ?? '', 'utf8'))))), frameId = l.nanoid();
    db.transaction(tx => {
      if (epochOf(accountId) !== epoch || tx.select({id: blobs.id}).from(blobs).where(eq(blobs.frameId, frame.id)).all().length !== members.length) throw ABANDON;
      tx.insert(frames).values(frameRow(frameId, content, members.length)).run();
      for (const [frameIndex, member] of members.entries()) tx.update(blobs).set({frameId, frameIndex}).where(eq(blobs.id, member.id)).run();
      tx.delete(frames).where(eq(frames.id, frame.id)).run();
    });
    return true;
  }

  /** Physically removes cleared members: rewrites each frame that lost some, drops those that lost all. */
  async function compactDegradedContextAwarenessFrames(accountId) {
    const db = ledger(accountId), degraded = frameMembership(db);
    let compacted = 0;
    for (const frame of degraded) {
      evictCachedFrame(accountId, frame.id);
      if (frame.live === 0) {
        db.delete(frames).where(eq(frames.id, frame.id)).run();
        compacted += 1;
        continue;
      }
      try {
        if (await compactFrame(accountId, frame)) compacted += 1;
      } catch (error) {
        if (error !== ABANDON) l.logger.warn('[context-awareness] frame compaction skipped a frame', {accountId, frameId: frame.id, error});
      }
    }
    return {compacted, attempted: degraded.length, remaining: frameMembership(db).length};
  }

  /** Clears the target and everything derived from it; anything left behind is an error. */
  async function clearContextAwarenessAndFrames(accountId, target) {
    const {cleanupErrors, ...cleared} = l.clearContextAwareness(accountId, target), errors = [...cleanupErrors];
    const compaction = await compactDegradedContextAwarenessFrames(accountId).catch(cause => {
      errors.push(Error('Evidence frame cleanup failed', {cause}));
      return null;
    });
    if (compaction?.remaining) errors.push(Error(`${compaction.remaining} evidence frame(s) still contain cleared members`));
    await Promise.resolve().then(() => (l.initDigestHistory(), l.digestHistory)).then(digest => digest.reconcileContextAwarenessDayPages(accountId, target.kind === 'all' ? 'all' : cleared.days))
      .catch(cause => errors.push(Error('Rendered day-page cleanup failed', {cause})));
    await l.MemoryManager.flushForAccountIfIndexed(accountId).catch(cause => errors.push(Error('Memory index cleanup failed', {cause})));
    if (errors.length > 0) throw new AggregateError(errors, `Context Awareness clear left physical residue: ${errors.map(error => error.message).join('; ')}`);
    return cleared;
  }

  /** Decodes every sampled blob and checks it against its stored hash. */
  async function verifyContextAwarenessStore(accountId, options = {}) {
    const db = ledger(accountId), report = {checked: 0, framed: 0, inline: 0, mismatched: []};
    const verify = async rows => {
      const content = await decodeBlobContent(accountId, rows);
      for (const row of rows) {
        report.checked += 1;
        if (row.frameId === null) report.inline += 1;
        else report.framed += 1;
        const text = content.get(row.id);
        if (text === undefined || createHash('sha256').update(text, 'utf8').digest('hex') !== row.contentHash) report.mismatched.push(row.id);
      }
    };
    const columns = {...contentColumns, contentHash: blobs.contentHash};
    if (options.all) {
      for (let after = '', rows; ; after = rows.at(-1).id) {
        rows = db.select(columns).from(blobs).where(gt(blobs.id, after)).orderBy(asc(blobs.id)).limit(VERIFY_BATCH).all();
        if (rows.length === 0) return report;
        await verify(rows);
      }
    }
    const sample = db.select(columns).from(blobs).orderBy(sql`RANDOM()`).limit(options.sample ?? DEFAULT_VERIFY_SAMPLE).all();
    for (let start = 0; start < sample.length; start += VERIFY_BATCH) await verify(sample.slice(start, start + VERIFY_BATCH));
    return report;
  }

  return {readEventContent, createEvidenceReader, readContextAwarenessEvents, sealContextAwarenessFrames, compactDegradedContextAwarenessFrames, clearContextAwarenessAndFrames, verifyContextAwarenessStore};
}
