/** Profile-scoped browsing evidence: docs/spec/daemon/services.md Memory files and recall. */

import { fail, scope } from '@aux/agent';
import { type BrowsingHistory, visitSchema } from '@aux/memory';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
import type { HistoryCollector } from './collector.js';

export { historyTools } from '@aux/memory';
export { createHistoryCollector, HistoryCollector } from './collector.js';
export function createHistoryRouter(
  { t, procedure, store }: DaemonServices,
  history: BrowsingHistory,
  collector?: HistoryCollector,
) {
  const profile = scope.extend({ profileId: z.string().min(1) });
  const authorize = (input: { accountId: number; profileId: string }) => {
    store.requireAccount(input.accountId);
    if (
      !store
        .bindings()
        .some(
          (b) =>
            b.accountId === input.accountId && b.profileId === input.profileId,
        )
    )
      fail('FORBIDDEN', 'History Profile is not bound to this account');
    if (
      store.get(input.accountId, 'settings', 'browsingHistoryEnabled') !== true
    )
      fail('PRECONDITION_FAILED', 'Visited-page recall is disabled');
  };
  return t.router({
    collect: procedure
      .input(
        profile.extend({
          browserMode: z.literal('default'),
          from: z.number().nonnegative().optional(),
          to: z.number().nonnegative().optional(),
        }),
      )
      .mutation(({ input }) => {
        authorize(input);
        if (!collector)
          fail(
            'PRECONDITION_FAILED',
            'Native history collector is unavailable',
          );
        return collector.collect(input.accountId, input.profileId, {
          ...(input.from === undefined ? {} : { from: input.from }),
          ...(input.to === undefined ? {} : { to: input.to }),
        });
      }),
    collectionStatus: procedure.input(profile).query(({ input }) => {
      if (!collector)
        fail('PRECONDITION_FAILED', 'Native history collector is unavailable');
      return collector.status(input.accountId, input.profileId);
    }),
    ingest: procedure
      .input(scope.extend({ visit: visitSchema }))
      .mutation(() =>
        fail(
          'FORBIDDEN',
          'Caller-provided visits are not native history evidence; use bound bridge collection',
        ),
      ),
    import: procedure
      .input(scope.extend({ visits: z.array(visitSchema).min(1).max(1000) }))
      .mutation(() =>
        fail(
          'FORBIDDEN',
          'Caller-provided visit imports are not native history evidence; collect an explicit native time interval',
        ),
      ),
    list: procedure
      .input(
        profile.extend({
          from: z.number().nonnegative().optional(),
          to: z.number().nonnegative().optional(),
          limit: z.number().int().min(1).max(500).default(100),
        }),
      )
      .query(({ input }) => {
        authorize(input);
        return history.list(input.accountId, input.profileId, {
          ...(input.from !== undefined ? { from: input.from } : {}),
          ...(input.to !== undefined ? { to: input.to } : {}),
          limit: input.limit,
        });
      }),
    search: procedure
      .input(
        profile.extend({
          queries: z.array(z.string().trim().min(1)).min(1).max(3),
          maxResults: z.number().int().min(1).max(10).default(5),
          from: z.number().nonnegative().optional(),
          to: z.number().nonnegative().optional(),
        }),
      )
      .query(async ({ input }) => {
        authorize(input);
        const result = await history.search(
          input.accountId,
          input.profileId,
          input.queries,
          input.maxResults,
          {
            ...(input.from !== undefined ? { from: input.from } : {}),
            ...(input.to !== undefined ? { to: input.to } : {}),
          },
        );
        authorize(input);
        history.read(
          input.accountId,
          input.profileId,
          result.results.map((row) => String(row.historyEntryId)),
        );
        return result;
      }),
    read: procedure
      .input(profile.extend({ ids: z.array(z.string()).min(1).max(20) }))
      .query(({ input }) => {
        authorize(input);
        return history.read(input.accountId, input.profileId, input.ids);
      }),
    remove: procedure
      .input(profile.extend({ ids: z.array(z.string()).min(1).max(1000) }))
      .mutation(({ input }) =>
        history.remove(input.accountId, input.profileId, input.ids),
      ),
  });
}
