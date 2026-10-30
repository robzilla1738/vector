/** The `memory` tRPC namespace: the account's memory pages, their index, history, dreaming and
 * extraction. Context Awareness pages stay out of reach here; they are managed automatically.
 * The memory manager, page writer, history and model calls stay the supplied ones. */
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';

export function create({accountProcedure, z, TRPCError, memory: m}) {
  const directoryOf = accountId => m.memoryDir(m.getAccountRoot(accountId));
  /** A memory page inside the account's memory directory that the settings UI may touch. */
  const pagePath = (accountId, filePath, verb) => {
    const directory = directoryOf(accountId), target = path.resolve(path.join(directory, filePath));
    m.assertWithinDirectory(directory, target);
    if (!target.endsWith('.md')) throw new TRPCError({code: 'BAD_REQUEST', message: `Only markdown memory files can be ${verb}`});
    if (m.isContextAwarenessMemoryPath(target)) throw new TRPCError({code: 'BAD_REQUEST', message: 'Context Awareness pages are managed automatically'});
    return {directory, target};
  };
  const historyEntry = async (accountId, historyEntryId) => {
    const entry = await m.getMemoryHistoryEntry(m.getAccountRoot(accountId), historyEntryId);
    if (!entry) throw new TRPCError({code: 'NOT_FOUND', message: 'History entry not found'});
    return m.withoutContextAwarenessArtifacts(entry);
  };
  const memoryEnabled = accountId => {
    if (!m.settings(accountId).get('memory').enabled) throw new TRPCError({code: 'BAD_REQUEST', message: 'Memory is disabled'});
  };
  const bySession = accountProcedure.input(z.object({sessionId: z.string()})).use(async ({input, ctx, next}) => {
    const session = m.SessionStore.get(ctx.accountId, input.sessionId);
    if (!session) throw new TRPCError({code: 'NOT_FOUND', message: 'Session not found'});
    return next({ctx: {...ctx, session}});
  });

  return {
    getDirectory: accountProcedure.query(({ctx}) => directoryOf(ctx.accountId)),
    indexStatus: accountProcedure.query(({ctx}) => m.MemoryManager.forAccount(ctx.accountId).getIndexStatus()),
    rebuildIndex: accountProcedure.mutation(async ({ctx}) => {
      await m.MemoryManager.forAccount(ctx.accountId).startRebuild();
      return {started: true};
    }),
    search: accountProcedure.input(z.object({queries: z.array(z.string().min(1)).min(1).max(3), maxResults: z.number().int().min(1).max(10).optional()})).query(async ({input, ctx}) => {
      const readable = m.isContextAwarenessReadable(ctx.accountId);
      try {
        const results = await m.MemoryManager.forAccount(ctx.accountId).searchMany({...input, excludeContextAwareness: !readable});
        // Context Awareness may have been turned off during the search.
        return m.isContextAwarenessReadable(ctx.accountId) ? results : results.filter(result => !m.isContextAwarenessMemoryPath(result.path));
      } catch (error) {
        throw error instanceof m.MemorySearchUnavailableError ? new TRPCError({code: 'PRECONDITION_FAILED', message: error.message}) : error;
      }
    }),
    listFiles: accountProcedure.query(async ({ctx}) => {
      const directory = directoryOf(ctx.accountId);
      if (!(await stat(directory).catch(() => null))?.isDirectory()) return [];
      const started = performance.now(), counts = {directoriesScanned: 0, entriesScanned: 0, dotEntriesSkipped: 0, nonMarkdownEntriesSkipped: 0, markdownFiles: 0};
      const files = await m.listMarkdownFiles(directory, '', counts), durationMs = Math.floor(performance.now() - started);
      if (durationMs >= m.slowListMs) m.logger.info('[Memory] listFiles slow', {accountId: ctx.accountId, durationMs, ...counts});
      return files;
    }),
    readFile: accountProcedure.input(z.object({filePath: z.string()})).query(async ({input, ctx}) => {
      const {target} = pagePath(ctx.accountId, input.filePath, 'read');
      try {
        return {content: await readFile(target, 'utf-8'), absolutePath: target, lastUpdatedAt: await m.getLastUpdatedAt(target)};
      } catch {
        return {content: '', absolutePath: target, lastUpdatedAt: null};
      }
    }),
    writeFile: accountProcedure.input(z.object({filePath: z.string(), content: z.string()})).mutation(async ({input, ctx}) => {
      const {directory, target} = pagePath(ctx.accountId, input.filePath, 'written');
      const relative = path.relative(directory, target).split(path.sep).join('/');
      const written = await m.writeMemoryPage(m.getAccountRoot(ctx.accountId), relative, existing => existing === null ? undefined : input.content, {trigger: 'settings_ui'});
      if (!written) throw new TRPCError({code: 'NOT_FOUND', message: 'Memory file not found'});
      return {content: input.content, absolutePath: target, lastUpdatedAt: await m.getLastUpdatedAt(target)};
    }),
    listHistory: accountProcedure.input(z.object({limit: z.number().int().min(1).max(100).optional(), cursor: z.string().optional()})).query(async ({input, ctx}) => {
      const page = await m.listMemoryHistory(m.getAccountRoot(ctx.accountId), input);
      return {...page, entries: page.entries.map(m.withoutContextAwarenessArtifacts)};
    }),
    getHistoryEntry: accountProcedure.input(z.object({historyEntryId: z.string()})).query(({input, ctx}) => historyEntry(ctx.accountId, input.historyEntryId)),
    getDreamState: accountProcedure.query(({ctx}) => m.loadDreamState(m.getAccountRoot(ctx.accountId))),
    runDreaming: accountProcedure.input(z.object({force: z.literal(true)})).mutation(async ({ctx}) => {
      memoryEnabled(ctx.accountId);
      if (m.dreamingAccounts.has(ctx.accountId)) throw new TRPCError({code: 'CONFLICT', message: 'Dreaming is already running for this account'});
      m.dreamingAccounts.add(ctx.accountId);
      try {
        const result = await m.runDreaming({accountId: ctx.accountId, accountRoot: m.getAccountRoot(ctx.accountId), force: true, history: {trigger: 'manual_dreaming'}});
        if (!result.historyEntry) throw new TRPCError({code: 'INTERNAL_SERVER_ERROR', message: 'Dreaming history entry was not written'});
        return m.withoutContextAwarenessArtifacts(result.historyEntry);
      } catch (error) {
        throw error instanceof m.DreamingModelResolveError ? new TRPCError({code: 'BAD_REQUEST', message: error.message}) : error;
      } finally {
        m.dreamingAccounts.delete(ctx.accountId);
      }
    }),
    rerunExtraction: bySession.mutation(async ({ctx}) => {
      const {session, accountId} = ctx;
      const refuse = message => { throw new TRPCError({code: 'BAD_REQUEST', message}); };
      if (session.incognito) refuse('Incognito sessions do not write memory');
      if (session.runtimeConfig.memoryExtractionDisabled) refuse('Memory extraction is disabled for this session');
      if (m.isMemoryExtractionDisabledByPlan(accountId, session)) refuse('Memory extraction is unavailable for free Aux plan sessions');
      if (m.runningStatuses.has(session.status)) refuse('Cannot rerun extraction while the session is active');
      const messages = await m.SessionStore.listAllMessages(accountId, session.id);
      if (messages.length === 0) refuse('Session has no messages');
      memoryEnabled(accountId);
      const registry = m.models(accountId), resolved = await registry.resolve(session.model.modelId, session.model.provider);
      if (!resolved || resolved.model.provider !== session.model.provider) refuse('Cannot resolve selected session extraction model');
      const result = await m.extractMemories({accountId, accountRoot: m.getAccountRoot(accountId), sessionId: session.id, systemPrompt: session.systemPrompt, messages,
        thinkingLevel: session.model.thinkingLevel, model: resolved.model, getApiKey: async provider => registry.getApiKeyForProvider(provider),
        history: {trigger: 'manual_extraction', writeSkipped: true}});
      if (!result.historyEntry) throw new TRPCError({code: 'INTERNAL_SERVER_ERROR', message: 'Extraction history entry was not written'});
      return m.withoutContextAwarenessArtifacts(result.historyEntry);
    }),
    revertHistoryEntry: accountProcedure.input(z.object({historyEntryId: z.string()})).mutation(async ({input, ctx}) => {
      const target = await historyEntry(ctx.accountId, input.historyEntryId);
      if (target.status !== 'success') throw new TRPCError({code: 'BAD_REQUEST', message: 'Only successful history entries can be reverted'});
      if (target.changes.length === 0) throw new TRPCError({code: 'BAD_REQUEST', message: 'History entry has no file changes'});
      const reverted = await m.revertMemoryHistoryEntry({accountRoot: m.getAccountRoot(ctx.accountId), target});
      if (reverted.conflicts.length > 0) throw new TRPCError({code: 'CONFLICT', message: `Cannot revert because ${reverted.conflicts[0]?.path ?? 'a memory file'} changed`, cause: reverted.entry});
      return reverted.entry;
    }),
  };
}
