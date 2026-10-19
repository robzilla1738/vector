/** Implements docs/spec/daemon/services.md Memory files and recall. */

import { type AgentEngine, scope, sessionScope } from '@aux/agent';
import { MemoryService } from '@aux/memory';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
export function createMemoryRouter(
  { t, procedure }: DaemonServices,
  memory: MemoryService,
) {
  const fileScope = scope.extend({ filePath: z.string().min(1) });
  return t.router({
    getDirectory: procedure
      .input(scope)
      .query(({ input }) => ({ directory: memory.directory(input.accountId) })),
    listFiles: procedure
      .input(scope)
      .query(({ input }) => memory.listFiles(input.accountId)),
    readFile: procedure
      .input(fileScope)
      .query(({ input }) => memory.readFile(input.accountId, input.filePath)),
    writeFile: procedure
      .input(fileScope.extend({ content: z.string().max(2000000) }))
      .mutation(({ input }) =>
        memory.writeFile(input.accountId, input.filePath, input.content),
      ),
    search: procedure
      .input(
        scope.extend({
          queries: z.array(z.string().trim().min(1)).min(1).max(3),
          maxResults: z.number().int().min(1).max(10).default(5),
        }),
      )
      .query(({ input }) =>
        memory.search(input.accountId, input.queries, input.maxResults),
      ),
    listHistory: procedure
      .input(
        scope.extend({
          limit: z.number().int().min(1).max(100).default(50),
          cursor: z.number().int().nonnegative().default(0),
        }),
      )
      .query(({ input }) =>
        memory.listHistory(input.accountId, input.limit, input.cursor),
      ),
    getHistoryEntry: procedure
      .input(scope.extend({ historyEntryId: z.string() }))
      .query(({ input }) =>
        memory.history(input.accountId, input.historyEntryId),
      ),
    revertHistoryEntry: procedure
      .input(scope.extend({ historyEntryId: z.string() }))
      .mutation(({ input }) =>
        memory.revert(input.accountId, input.historyEntryId),
      ),
    rerunExtraction: procedure
      .input(sessionScope)
      .mutation(({ input }) =>
        memory.extract(input.accountId, input.sessionId),
      ),
    getDreamState: procedure
      .input(scope)
      .query(({ input }) => memory.dreamState(input.accountId)),
    runDreaming: procedure
      .input(scope.extend({ force: z.literal(true).default(true) }))
      .mutation(({ input }) => memory.dream(input.accountId)),
  });
}
export function createMemoryService(
  services: DaemonServices,
  engine: AgentEngine,
) {
  return new MemoryService(services.store, engine);
}
