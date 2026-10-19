import { fail, type Session } from '@aux/agent';
import { type ToolSet, tool } from 'ai';
import { z } from 'zod';
import type { MemoryService } from './memory.js';
export function memoryTools(memory: MemoryService, session: Session): ToolSet {
  return {
    memory_search: tool({
      description:
        'Find relevant durable local memory using local semantic embeddings. Disabled in incognito. Returns passages with source paths and similarity scores.',
      inputSchema: z.object({
        queries: z.array(z.string().trim().min(1)).min(1).max(3),
        maxResults: z.number().int().min(1).max(10).default(5),
      }),
      execute: (input) => {
        if (session.incognito)
          fail('FORBIDDEN', 'Incognito sessions cannot recall durable memory');
        return memory.search(
          session.accountId,
          input.queries,
          input.maxResults,
        );
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
      execute: (input) => {
        if (session.incognito)
          fail('FORBIDDEN', 'Incognito sessions cannot use durable memory');
        if (input.operation === 'list')
          return memory.listFiles(session.accountId);
        if (input.operation === 'read')
          return memory.readFile(session.accountId, input.filePath);
        if (
          session.permissionMode === 'read-only' &&
          ['write', 'revert'].includes(input.operation)
        )
          fail('FORBIDDEN', 'Read-only sessions cannot mutate memory');
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
