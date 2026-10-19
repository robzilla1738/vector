import { approveOperation, fail, type Session } from '@aux/agent';
import { type ToolSet, tool } from 'ai';
import { z } from 'zod';
import type { MemoryService } from './memory.js';
export function memoryTools(
  memory: MemoryService,
  session: Session,
  signal: AbortSignal,
): ToolSet {
  const current = () => {
    signal.throwIfAborted();
    const latest = memory.engine.get(session.accountId, session.id);
    if (latest.incognito || latest.browserBinding?.browserMode === 'incognito')
      fail('FORBIDDEN', 'Incognito sessions cannot use durable memory');
    if (
      memory.store.get(latest.accountId, 'settings', 'memoryEnabled') === false
    )
      fail('PRECONDITION_FAILED', 'Memory is disabled');
    return latest;
  };
  return {
    memory_search: tool({
      description:
        'Find relevant durable local memory using local semantic embeddings. Disabled in incognito. Returns passages with source paths and similarity scores.',
      inputSchema: z.object({
        queries: z.array(z.string().trim().min(1)).min(1).max(3),
        maxResults: z.number().int().min(1).max(10).default(5),
      }),
      execute: async (input, { toolCallId }) => {
        current();
        await approveOperation(
          memory.engine,
          session.accountId,
          session.id,
          toolCallId,
          'memory_search',
          'Search local memory',
          input,
          signal,
          { mutation: false, defaultAsk: false },
        );
        current();
        const result = await memory.search(
          session.accountId,
          input.queries,
          input.maxResults,
        );
        current();
        return result;
      },
    }),
    memory_operators: tool({
      description:
        'Read or edit existing ordinary Markdown memory files and list/revert their history. No incognito writes. Changes preserve edit history and reject conflicting reversions.',
      inputSchema: z.discriminatedUnion('operation', [
        z.object({ operation: z.literal('list') }),
        z.object({ operation: z.literal('read'), filePath: z.string() }),
        z.object({
          operation: z.literal('write'),
          filePath: z.string(),
          content: z.string().max(2000000),
        }),
        z.object({ operation: z.literal('history') }),
        z.object({
          operation: z.literal('revert'),
          historyEntryId: z.string(),
        }),
      ]),
      execute: async (input, { toolCallId }) => {
        current();
        // Prepare the concrete revert for review before requesting approval.
        const paths =
          'filePath' in input
            ? [memory.path(session.accountId, input.filePath)]
            : input.operation === 'revert'
              ? memory
                  .history(session.accountId, input.historyEntryId)
                  .changes.map((change) =>
                    memory.path(session.accountId, change.filePath),
                  )
              : [];
        const operation =
          input.operation === 'revert'
            ? {
                ...input,
                changes: memory.history(session.accountId, input.historyEntryId)
                  .changes,
              }
            : input;
        await approveOperation(
          memory.engine,
          session.accountId,
          session.id,
          toolCallId,
          'memory_operators',
          input.operation === 'revert'
            ? 'Revert local memory'
            : input.operation === 'write'
              ? 'Edit local memory'
              : 'Read local memory',
          operation,
          signal,
          {
            paths,
            mutation: ['write', 'revert'].includes(input.operation),
            defaultAsk: ['write', 'revert'].includes(input.operation),
          },
        );
        current();
        if (input.operation === 'list')
          return memory.listFiles(session.accountId);
        if (input.operation === 'read')
          return memory.readFile(session.accountId, input.filePath);
        if (input.operation === 'write')
          return memory.writeFile(
            session.accountId,
            input.filePath,
            input.content,
          );
        if (input.operation === 'history')
          return memory.listHistory(session.accountId);
        return memory.revert(session.accountId, input.historyEntryId);
      },
    }),
  };
}
