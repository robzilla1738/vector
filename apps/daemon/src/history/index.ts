/** Profile-scoped browsing evidence: docs/spec/daemon/services.md Memory files and recall. */

import { scope } from '@aux/agent';
import { type BrowsingHistory, visitSchema } from '@aux/memory';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
export function createHistoryRouter(
  { t, procedure }: DaemonServices,
  history: BrowsingHistory,
) {
  const profile = scope.extend({ profileId: z.string().min(1) });
  return t.router({
    ingest: procedure
      .input(scope.extend({ visit: visitSchema }))
      .mutation(({ input }) => history.ingest(input.accountId, input.visit)),
    import: procedure
      .input(scope.extend({ visits: z.array(visitSchema).min(1).max(1000) }))
      .mutation(async ({ input }) => {
        const results = [];
        for (const visit of input.visits)
          results.push(await history.ingest(input.accountId, visit));
        return {
          imported: results.filter((result) => result.inserted).length,
          results,
        };
      }),
    list: procedure
      .input(
        profile.extend({
          from: z.number().nonnegative().optional(),
          to: z.number().nonnegative().optional(),
          limit: z.number().int().min(1).max(500).default(100),
        }),
      )
      .query(({ input }) =>
        history.list(input.accountId, input.profileId, {
          ...(input.from !== undefined ? { from: input.from } : {}),
          ...(input.to !== undefined ? { to: input.to } : {}),
          limit: input.limit,
        }),
      ),
    search: procedure
      .input(
        profile.extend({
          queries: z.array(z.string().trim().min(1)).min(1).max(3),
          maxResults: z.number().int().min(1).max(10).default(5),
          from: z.number().nonnegative().optional(),
          to: z.number().nonnegative().optional(),
        }),
      )
      .query(({ input }) =>
        history.search(
          input.accountId,
          input.profileId,
          input.queries,
          input.maxResults,
          {
            ...(input.from !== undefined ? { from: input.from } : {}),
            ...(input.to !== undefined ? { to: input.to } : {}),
          },
        ),
      ),
    read: procedure
      .input(profile.extend({ ids: z.array(z.string()).min(1).max(20) }))
      .query(({ input }) =>
        history.read(input.accountId, input.profileId, input.ids),
      ),
    remove: procedure
      .input(profile.extend({ ids: z.array(z.string()).min(1).max(1000) }))
      .mutation(({ input }) =>
        history.remove(input.accountId, input.profileId, input.ids),
      ),
  });
}
