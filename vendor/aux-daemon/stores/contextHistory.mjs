/** What the agent and the settings page read about Context Awareness beyond the ledger's rows: the
 * capture policy, which URLs are already captured, and the history tools' text. */
const DEFAULT_MAX_BYTES = 12288, URL_BATCH = 500;
const COMPUTER_USE_APP = [/^aumid:coursondigital\.auxcomputeruse(?:\.canary)?_[^!]+!computeruse$/, /^win32:.*[\\/]auxcomputeruse\.exe$/];

export function create({contextHistory: h}) {
  function isCaptureAllowed(accountId, {url, typedText, bundleId} = {}) {
    const domain = url ? h.resolveCredentialDomain(url)?.preferredDomain ?? '' : '', settings = h.settings(accountId).get('contextAwareness');
    const refuse = reason => ({allowed: false, reason, domain});
    if (!settings.enabled) return refuse('disabled');
    if (!h.accountHasAllowedPlan(h.AccountRegistry.getAccount(accountId), h.CONTEXT_AWARENESS_ALLOWED_PLANS) && !h.isAccountExperimentalEligibleCached(accountId)) return refuse('plan-required');
    if (settings.pausedUntil !== null && settings.pausedUntil > Date.now()) return refuse('paused');
    if (typedText && !settings.captureTypedText) return refuse('typed-text-disabled');
    if (url && !domain) return refuse('unresolvable-url');
    const app = bundleId?.toLowerCase() ?? '';
    if (process.platform === 'win32' && COMPUTER_USE_APP.some(pattern => pattern.test(app))
      || settings.rules.some(rule => rule.scope === 'app' && rule.bundleId === bundleId && rule.behavior === 'do_not_observe')) return refuse('blocked-app');
    if (url && settings.rules.some(rule => rule.scope === 'url' && rule.behavior === 'do_not_observe' && h.resolveCredentialDomain(rule.urlDomain)?.preferredDomain === domain)) return refuse('blocked-url');
    return {allowed: true, domain};
  }

  /** Of `urls`, those with a captured event in the time range. */
  function findCapturedUrls(accountId, urls, {from, to}) {
    const {ContextAwarenessEventTable: events, and, inArray, gte, lte} = h, captured = new Set();
    for (let start = 0; start < urls.length; start += URL_BATCH) {
      const rows = h.ledgerDb(accountId).selectDistinct({url: events.url}).from(events).where(and(inArray(events.url, urls.slice(start, start + URL_BATCH)),
        from === undefined ? undefined : gte(events.occurredAt, from), to === undefined ? undefined : lte(events.occurredAt, to))).all();
      for (const {url} of rows) if (url) captured.add(url);
    }
    return captured;
  }

  const historyRowAt = row => row.type === 'event' ? row.occurredAt : row.type === 'summary' ? row.windowTo : row.at;
  const cursor = at => h.dayjs.default(at).format('YYYY-MM-DDTHH:mm:ss.SSSZ');

  /** The reply when `offset` leaves no rows. */
  function emptyPage(rows, {moreBelow, nextTo, contextAwareness}) {
    const past = rows.length > 0 ? '(no more matches at this offset)' : undefined;
    if (moreBelow) return `${past ?? '(no matches in the scanned captures)'}\n${nextTo === undefined ? '[Partial scan; narrow from/to, app or domain.]' : `[More: to="${cursor(nextTo)}", offset=0]`}`;
    return past || `(no matching history)\n${contextAwareness ? '[Try fewer or different words, widen from/to, or drop app/domain. Older days rank in memory_search.]' : '[Try fewer or different keywords, or widen from/to.]'}`;
  }

  const repeatsAnEarlierRow = (row, lines) => row.type === 'event' && !row.evidence && row.snippet
    && lines.some(line => line.includes(`⟨e:${row.id}⟩`) && line.replace(/\s+/g, ' ').includes(row.snippet.replace(/^…|…$/g, '').trim()));

  /** One row alone exceeds the page: its head and tail. */
  function clipped(lines, budget) {
    const text = lines.join('\n'), gap = '\n…\n', keep = Math.max(0, Math.floor((budget - Buffer.byteLength(gap) - 2) / 2));
    return `${h.takeBytes(text, keep).text}${gap}${Buffer.from(text).subarray(-keep).toString('utf8').replace(/^�+/, '')}`;
  }

  function formatHistorySearch(rows, options) {
    const visible = rows.slice(options.offset ?? 0);
    if (visible.length === 0) return emptyPage(rows, options);
    const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES, budget = maxBytes - h.HISTORY_SEARCH_FOOTER_BYTES;
    const lines = [];
    let heading = '', shown = 0, bytes = 0, earliest = Infinity, partial = false, stoppedAt = Infinity;
    for (const row of visible) {
      if (shown < options.limit && repeatsAnEarlierRow(row, lines)) {
        shown += 1;
        earliest = Math.min(earliest, h.historyRowStart(row));
        continue;
      }
      const day = h.localDayHeading(row.type === 'summary' ? row.windowFrom : historyRowAt(row));
      let block = [...day === heading ? [] : [day], ...h.renderHistoryRow(row)];
      let size = block.reduce((total, line) => total + Buffer.byteLength(line) + 1, 0);
      if (shown === 0 && size > budget) {
        block = [clipped(block, budget)];
        size = Buffer.byteLength(block[0]) + 1;
        partial = true;
      }
      if (shown >= options.limit || bytes + size > budget) {
        partial = shown < options.limit;
        stoppedAt = historyRowAt(row);
        break;
      }
      lines.push(...block);
      bytes += size;
      shown += 1;
      heading = day;
      earliest = Math.min(earliest, h.historyRowStart(row));
    }
    const hasMore = shown < visible.length || options.moreBelow;
    const next = stoppedAt === Infinity ? options.nextTo ?? earliest - 1 : Math.max(stoppedAt, options.nextTo ?? -Infinity);
    const position = options.offset !== undefined && shown < visible.length ? `offset=${options.offset + shown}` : `to="${cursor(next)}"${options.offset === undefined ? '' : ', offset=0'}`;
    const footer = [hasMore ? `more: ${position}` : '', partial ? 'partial page' : ''].filter(Boolean);
    return [...lines, ...footer.length ? [`[${footer.join(' · ')}]`] : []].join('\n');
  }

  function readTail(entry) {
    if (entry.remainingLines > 0) return !('type' in entry) && entry.since ? `\n[… ${entry.remainingLines} more changed lines. Read ⟨e:${entry.id}⟩ alone for its whole screen.]` : `\n[${entry.remainingLines} more lines · offset=${entry.nextOffset}]`;
    return entry.truncated ? '\n[Partial text]' : '';
  }

  function readPlaceholder(entry) {
    if (entry.offset >= entry.lineCount && entry.lineCount > 0) return `[Offset ${entry.offset} is past the end of ${entry.lineCount} outline lines.]`;
    if (entry.truncated) return '[Stored content unavailable under the read budget.]';
    return entry.match !== undefined && entry.hasAvailableText ? '(no matching lines in the available source text)' : '(no stored text)';
  }

  function formatHistoryRead(entries) {
    if (entries.length === 0) return '(no events or summaries with those ids)';
    return entries.map(entry => `${h.readHead(entry)}\n${entry.notice ? `${entry.notice}\n` : ''}${entry.content || readPlaceholder(entry)}${readTail(entry)}`).join(h.READ_BLOCK_SEPARATOR);
  }

  return {isCaptureAllowed, findCapturedUrls, historyRowAt, formatHistorySearch, formatHistoryRead};
}
