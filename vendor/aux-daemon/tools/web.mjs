/** The tools that read the web and the user's history: webfetch, websearch, history_search and
 * history_read. Fetching, Markdown conversion, the history ledger and the search client stay the
 * supplied ones. */
import {createWriteStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {pipeline} from 'node:stream/promises';
import {CONTEXT_AWARENESS_DISABLED, WEB_SEARCH} from './prompts.mjs';
import {toolSchemas} from './schemas.mjs';
import {reply} from './common.mjs';

const DEFAULT_TIMEOUT_SEC = 30, MAX_TIMEOUT_SEC = 120, MAX_RESPONSE_SIZE = 5242880, REDDIT_HOSTS = ['reddit.com', 'www.reddit.com', 'sh.reddit.com'];
const CITATION = source => `<webfetch-citation source_id="${source.id}" />`;
const TOO_LARGE = 'Response too large (exceeds 5MB limit)';

export function create({typebox, tools: t}) {
  const schemas = toolSchemas(typebox);

  /** Saves a response that is not inline text and tells the model where it went. */
  async function download(context, response, url, disposition, statusLine, mime) {
    const directory = context.sessionDir ? t.ensureSessionTmpDir(context.sessionDir) : '/tmp';
    const name = t.sanitizeDownloadFilename(t.getContentDispositionFilename(disposition) ?? t.getUrlFilename(response.url || url)), file = path.join(directory, name);
    await pipeline(response, t.brokerBoundary().outputStream(() => createWriteStream(file)));
    const {size} = await stat(file), source = t.generateCitationSource({url, title: name});
    return reply(`${CITATION(source)}\n${statusLine}\nDownloaded to: ${file}\nMIME type: ${mime}\nFile size: ${size} bytes`, {sources: [source], title: name});
  }

  const createWebFetchTool = (context = {}) => ({
    name: 'webfetch', label: 'webfetch', description: 'Fetch content from a URL and return it as markdown. Use this tool when you need to inspect search results or read-heavy web URL.', parameters: schemas.webFetch,
    execute: async (id, {url, timeout, include_images: includeImages, useCookies}, signal) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) throw Error('URL must start with http:// or https://');
      using scope = t.timeoutScope({timeoutMs: Math.min(timeout ?? DEFAULT_TIMEOUT_SEC, MAX_TIMEOUT_SEC) * 1e3, parentSignal: signal});
      const headers = {...t.DEFAULT_HEADERS};
      if (useCookies) {
        const cookies = context.getCookiesForUrl ? await context.getCookiesForUrl(url) : await context.browser?.getCookiesForUrl(url);
        if (cookies) headers.Cookie = cookies;
      }
      const target = new URL(url);
      if (REDDIT_HOSTS.includes(target.hostname)) target.hostname = 'old.reddit.com';
      const response = await t.nodeFetch(target, {method: 'GET', headers, signal: scope.signal}, {onRedirect: async next => {
        if (!context.hooks) return;
        const access = {toolCallId: id, url: next.href};
        await context.hooks.trigger('network.access', access, access);
      }});
      const contentType = t.getHeader(response, 'content-type')?.toLowerCase() ?? '';
      let statusLine = response.statusCode && (response.statusCode < 200 || response.statusCode >= 300) ? `HTTP ${response.statusCode} ${response.statusMessage ?? ''}` : '';
      const mime = t.getMimeType(contentType), disposition = t.getHeader(response, 'content-disposition');
      if (/^attachment(?:\s*;|$)/i.test(disposition ?? '') || !t.INLINE_TEXT_MIME_TYPES.has(mime)) return await download(context, response, url, disposition, statusLine, mime);
      const length = t.getHeader(response, 'content-length');
      if (length && Number.parseInt(length, 10) > MAX_RESPONSE_SIZE) throw Error(TOO_LARGE);
      let body = new TextDecoder().decode(await t.readResponseBody(response));
      if (!contentType.includes('text/html')) {
        const source = t.generateCitationSource({url});
        return reply(`${CITATION(source)}\n${statusLine}\n${body}`, {sources: [source]});
      }
      if (context.browser && t.isCloudflareChallenge(body, response)) {
        body = await t.fetchHTMLWithBrowser(context.browser, target.toString());
        if (body.length > MAX_RESPONSE_SIZE) throw Error(TOO_LARGE);
        statusLine = '';
      }
      const page = await t.htmlToReadableMarkdown({html: body, url, options: {removeImages: !includeImages}});
      const source = t.generateCitationSource({url, title: page.title, excerpt: page.description});
      return reply(`${CITATION(source)}\n${statusLine}\n${t.normalizeDefuddleMarkdownOutput(page.content, url)}`, {sources: [source], title: page.title, faviconUrl: page.favicon});
    },
  });

  const createWebSearchTool = context => ({
    name: 'websearch', label: 'Web Search', description: WEB_SEARCH, parameters: schemas.webSearch,
    execute: async (id, {objective, search_queries: queries}, signal) => {
      if (!context.browser) throw Error('Web search needs the Aux browser.');
      const client = new t.GoogleSearchClient({fetch: (url, options) => context.browser.fetch(url, {...options, signal})}), seen = new Set(), results = [];
      for (const found of await Promise.allSettled([objective, ...queries].map(query => client.search(query, {limit: 6}))))
        for (const item of found.status === 'fulfilled' ? found.value : []) {
          if (seen.has(item.url) || results.length >= 10) continue;
          seen.add(item.url);
          results.push({url: item.url, title: item.title, publish_date: item.publishedAtText ?? null, excerpts: item.snippet ? [item.snippet] : []});
        }
      // Results arrive as Google redirect links; a citation should name the site itself.
      await Promise.all(results.map(async item => {
        if (!item.url.startsWith('https://www.google.com/goto?')) return;
        item.url = (await context.browser.fetch(item.url, {redirect: 'manual', signal}).catch(() => null))?.headers.get('location') || item.url;
      }));
      if (!results.length) throw Error(`Web search has no results here. Open https://www.google.com/search?q=${encodeURIComponent(objective)} with openTab and read the page.`);
      const {details, result} = t.buildWebSearchToolResult({session_id: context.session.id, results});
      return reply(JSON.stringify(result), details);
    },
  });

  /** Browsing history for the queries, as visit rows by URL, and how far it reached. */
  async function browsingVisits(context, queries, range, domain, wanted) {
    const visits = new Map(), maxResults = Math.min(wanted, 200);
    const pages = await Promise.all((queries.length > 0 ? queries : ['']).map(query => t.searchBrowsingHistory(
      {query, startTime: range.from ?? t.dayjs.default().subtract(1, 'month').valueOf(), endTime: range.to, maxResults}, context.extensionBridgeRoute?.())));
    let oldest;
    for (const page of pages) if (page.length >= maxResults) oldest = Math.max(oldest ?? -Infinity, Math.min(...page.map(item => item.lastVisitTime)) - 1);
    for (const item of pages.flat()) {
      if (oldest !== undefined && item.lastVisitTime <= oldest || !/^https?:\/\//i.test(item.url)) continue;
      const url = t.scrubUrl(item.url);
      if (domain && t.resolveCredentialDomain(url)?.preferredDomain !== domain) continue;
      const known = visits.get(url);
      if (!known || known.at < item.lastVisitTime) visits.set(url, {type: 'visit', at: item.lastVisitTime, url, title: t.neutralizePromptInjectionSyntax(item.title || url), visitCount: item.visitCount});
    }
    return {visits, truncated: pages.some(page => page.length >= maxResults), oldest};
  }

  const createHistorySearchTool = options => ({
    name: 'history_search', label: 'History Search',
    description: options.contextAwareness ? "Recall the user's captured activity across browser tabs and desktop apps, alongside browsing history. Use history_read for source details."
      : "Search the user's Chrome history by keyword, or list recent visits without queries. Use it to find the exact page or URL behind something the user mentions.",
    parameters: schemas.historySearch(options.contextAwareness),
    execute: async (id, {queries: given, from, to, app, domain, limit = 20, offset = 0}) => {
      const {accountId} = options, readable = options.contextAwareness && t.isContextAwarenessReadable(accountId), epoch = readable ? t.getDeletionEpoch(accountId) : 0;
      const range = t.contextAwarenessSearchQuerySchema.pick({from: true, to: true}).parse({from, to});
      if (range.from !== undefined && range.to !== undefined && range.from > range.to) throw Error('from must be earlier than or equal to to');
      const preferred = domain ? t.resolveCredentialDomain(domain)?.preferredDomain : undefined;
      if (domain && !preferred) throw Error(`not a domain: ${domain}`);
      const queries = [...new Set(given?.map(query => query.trim().toLowerCase()).filter(Boolean) ?? [])];
      const evidence = readable ? await t.assembleHistoryEvidence(accountId, {queries: queries.length ? queries : undefined, ...range, app, domain: preferred, limit, offset}) : {rows: [], moreBelow: false, nextTo: undefined};
      const notBrowser = app !== undefined && !t.isBrowserApp(app);
      let rows = evidence.rows, unavailable = '', truncated = false, oldest, visits = new Map();
      if (!readable || (queries.length > 0 || preferred !== undefined) && !notBrowser) try {
        ({visits, truncated, oldest} = await browsingVisits(options, queries, range, preferred, offset + limit * 2));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!/Extension not connected|Chrome extension not connected|extension disconnected/.test(message)) throw error;
        unavailable = 'Browsing history is unavailable because the browser extension is not connected.';
      }
      const current = readable && t.isContextAwarenessReadable(accountId) && t.getDeletionEpoch(accountId) === epoch;
      if (readable && !current) rows = [];
      const captured = current ? t.findCapturedUrls(accountId, [...visits.keys()], range) : new Set();
      rows.push(...[...visits.values()].filter(visit => !captured.has(visit.url)).sort((a, b) => b.at - a.at));
      if (!readable || queries.length === 0) rows.sort((a, b) => t.historyRowAt(b) - t.historyRowAt(a));
      const body = rows.length === 0 && unavailable ? unavailable : [t.formatHistorySearch(rows, {limit, contextAwareness: current, moreBelow: current && evidence.moreBelow || truncated,
        offset: current && queries.length > 0 ? offset : undefined, nextTo: evidence.nextTo !== undefined && current ? Math.max(evidence.nextTo, oldest ?? -Infinity) : oldest}), unavailable].filter(Boolean).join('\n');
      const items = rows.slice(offset, offset + limit).flatMap(row => row.type === 'visit' ? [{url: row.url, title: row.title, lastVisitTime: row.at}]
        : row.type === 'event' && row.url ? [{url: row.url, title: row.windowTitle, lastVisitTime: row.occurredAt}] : []);
      return reply(body, {items});
    },
  });

  const createHistoryReadTool = ({accountId}) => ({
    name: 'history_read', label: 'Read History', description: 'Read captured activity and summaries by ID, with optional passage matching.', parameters: schemas.historyRead,
    execute: async (id, {ids, offset, match, contextLines}) => {
      if (!t.isContextAwarenessReadable(accountId)) return reply(CONTEXT_AWARENESS_DISABLED, null);
      const events = await t.readContextAwarenessEvents(accountId, {ids, offset, match, contextLines});
      return reply(t.isContextAwarenessReadable(accountId) ? t.formatHistoryRead(events) : CONTEXT_AWARENESS_DISABLED, null);
    },
  });

  return {createWebFetchTool, createWebSearchTool, createHistorySearchTool, createHistoryReadTool};
}
