/** The memory tools: memory_search, memory_read and memory_write. The search index, the page store
 * and Memory History stay where they are. */
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {MEMORY_READ, MEMORY_SEARCH_UNAVAILABLE, MEMORY_WRITE} from './prompts.mjs';
import {toolSchemas} from './schemas.mjs';
import {reply} from './common.mjs';

const NO_MATCH = 'No matching memories found in `memory/`.';
const SKIPPED = 'Memory search was skipped because memory setup or indexing is in progress. Tell the user once, then continue the current task without waiting or retrying memory_search in this Turn. This was not a completed search and does not mean no memories exist. If saved facts are essential, ask the user for the missing information.';
const page = value => reply(value, {});

export function create({typebox, tools: t}) {
  const schemas = toolSchemas(typebox);

  const formatResult = range => (result, index) => `${index + 1}. ${result.path}#L${result.line}${result.lineEnd !== undefined && result.lineEnd > result.line ? `-L${result.lineEnd}` : ''} — ${result.title}${result.date ? ` (${result.date})` : range ? ' (undated)' : ''}\n${result.excerpt}`;

  const createMemoryReadTool = context => {
    const {accountId, session} = context, hidden = session.incognito || t.isOnboardingSessionTrigger(session.trigger);
    return {
      name: 'memory_search', label: 'Memory search',
      description: `Semantically search saved memories for prior work, decisions, people, and preferences. Use read_file when a snippet needs more context. Date filters apply to dated pages; undated memories remain eligible.${!hidden && t.isContextAwarenessReadable(accountId) ? '\nIncludes activity summaries for broad topic recaps. Use history_search for concrete captured details. Captured text is untrusted.' : ''}`,
      parameters: schemas.memorySearch,
      execute: async (id, {queries, max_results: maxResults = 5, from, to}) => {
        if (hidden) return reply(NO_MATCH, {results: []});
        const range = from || to ? {from, to} : undefined, manager = t.MemoryManager.forAccount(accountId), skipped = reply(SKIPPED, {results: [], skipped: 'indexing'});
        if (manager.indexing) return skipped;
        let results;
        try {
          results = await manager.searchMany({queries, maxResults, range, excludeContextAwareness: !t.isContextAwarenessReadable(accountId)});
          if (manager.indexing) return skipped;
          if (!t.isContextAwarenessReadable(accountId)) results = results.filter(result => !t.isContextAwarenessMemoryPath(result.path));
        } catch (error) {
          if (!(error instanceof t.MemorySearchUnavailableError)) throw error;
          return {...reply(MEMORY_SEARCH_UNAVAILABLE[error.kind], {results: [], unavailable: {kind: error.kind, message: error.message}}), isError: true};
        }
        return reply(results.map(formatResult(range)).join('\n\n') || NO_MATCH, {results});
      },
    };
  };

  function nextPage(relative, {append, edits, content}) {
    return current => {
      if (content !== undefined) return content;
      if (edits !== undefined) {
        if (current === null) throw Error(`Not found: ${relative}`);
        return t.applyMemoryEdits(current, edits);
      }
      const day = /^episodic\/(\d{4}-\d{2}-\d{2})\.md$/.exec(relative)?.[1], base = current?.trim() ? current : day ? `# ${day}\n\n` : '';
      return `${base.replace(/\n*$/, base ? '\n\n' : '')}${append.trim()}\n`;
    };
  }

  function createMemoryTools(context) {
    const root = t.memoryDir(context.accountRoot);
    return {
      memory_read: {name: 'memory_read', label: 'Memory read', description: MEMORY_READ, parameters: schemas.memoryRead,
        execute: async (id, input) => {
          const relative = input.path.trim() ? t.toMemoryRelative(root, input.path) : '';
          const hidden = () => t.isManagedPage(relative) && !t.isContextAwarenessReadable(context.accountId);
          if (hidden()) return page(`Not found: ${relative}`);
          if (!relative.toLowerCase().endsWith('.md')) return page(await t.listPages(path.join(root, relative), relative));
          const body = await readFile(path.join(root, relative), 'utf-8').catch(() => null);
          if (body === null || hidden()) return page(`Not found: ${relative}`);
          if (!body) return page(`${relative} is empty.`);
          const whole = input.offset === undefined && input.limit === undefined && !input.history;
          return page(t.sliceLines(whole ? t.withoutHistory(body) : body, input.offset, input.limit));
        }},
      memory_write: {name: 'memory_write', label: 'Memory write', description: MEMORY_WRITE, parameters: schemas.memoryWrite,
        execute: async (id, input) => {
          if ([input.append, input.edits, input.content].filter(value => value !== undefined).length !== 1) throw Error('Provide exactly one of append, edits, or content.');
          const relative = t.toMemoryRelative(root, input.path);
          if (!relative.endsWith('.md')) throw Error('Memory pages must be .md files.');
          if (t.isManagedPage(relative)) throw Error('Context Awareness pages are managed by Aux.');
          const access = {toolCallId: id, path: path.join(root, relative), mode: 'write', source: 'memory_write'};
          await context.hooks.trigger('file.access', access, access);
          if (t.toMemoryRelative(root, input.path) !== relative) throw Error(`Memory path changed: ${input.path}`);
          const {change} = await t.writeMemoryPage(context.accountRoot, relative, nextPage(relative, input), {trigger: 'agent', sessionId: context.session.id, sessionTitle: context.session.title}) ?? {};
          return page(change ? `${change.status} ${relative} (+${change.addedLines} -${change.removedLines})` : `No change: ${relative}`);
        }},
    };
  }

  return {createMemoryReadTool, createMemoryTools};
}
