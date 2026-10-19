/** Implements docs/spec/daemon/services.md Context awareness. */

import { defaultModel, fail, scope } from '@aux/agent';
import {
  type ActivityFilter,
  activitySchema,
  type ContextService,
} from '@aux/memory';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';

const filters = scope.extend({
  from: z.number().nonnegative().optional(),
  to: z.number().nonnegative().optional(),
  source: z.string().optional(),
  kind: z.string().optional(),
  bundleId: z.string().optional(),
  domain: z.string().optional(),
  limit: z.number().int().min(1).max(500).default(100),
  offset: z.number().int().nonnegative().default(0),
});
function filter(input: z.infer<typeof filters>): ActivityFilter {
  return {
    limit: input.limit,
    offset: input.offset,
    ...(input.from !== undefined ? { from: input.from } : {}),
    ...(input.to !== undefined ? { to: input.to } : {}),
    ...(input.source ? { source: input.source } : {}),
    ...(input.kind ? { kind: input.kind } : {}),
    ...(input.bundleId ? { bundleId: input.bundleId } : {}),
    ...(input.domain ? { domain: input.domain } : {}),
  };
}
export function createContextRouter(
  { t, procedure, store }: DaemonServices,
  context: ContextService,
) {
  return t.router({
    status: procedure
      .input(scope.extend({ url: z.url().optional() }))
      .query(({ input }) => context.status(input.accountId, input.url)),
    permissions: procedure
      .input(scope)
      .query(({ input }) => context.permissions(input.accountId)),
    requestPermissions: procedure
      .input(scope)
      .mutation(({ input }) => context.requestPermissions(input.accountId)),
    setExclusions: procedure
      .input(
        scope.extend({
          applications: z.array(z.string()),
          domains: z.array(z.string()),
        }),
      )
      .mutation(({ input }) => context.setExclusions(input.accountId, input)),
    ingest: procedure
      .input(scope.extend({ event: activitySchema }))
      .mutation(({ input }) => context.ingest(input.accountId, input.event)),
    events: procedure
      .input(filters)
      .query(({ input }) => context.events(input.accountId, filter(input))),
    historyList: procedure
      .input(filters)
      .query(({ input }) => context.events(input.accountId, filter(input))),
    historyStatus: procedure.input(scope).query(async ({ input }) => ({
      ...(await context.status(input.accountId)),
      eventCount: context.events(input.accountId, { limit: 100000 }).length,
      summaryCount: context.summaries(input.accountId, { limit: 100000 })
        .length,
    })),
    search: procedure
      .input(
        filters.extend({
          queries: z.array(z.string().trim().min(1)).min(1).max(3),
          limit: z.number().int().min(1).max(100).default(20),
        }),
      )
      .query(({ input }) =>
        context.search(input.accountId, input.queries, filter(input)),
      ),
    read: procedure
      .input(
        scope.extend({
          ids: z.array(z.string()).min(1).max(20),
          offset: z.number().int().nonnegative().optional(),
          match: z.string().min(1).max(200).optional(),
          contextLines: z.number().int().min(0).max(100).optional(),
        }),
      )
      .query(({ input }) =>
        context.read(input.accountId, input.ids, {
          ...(input.offset !== undefined ? { offset: input.offset } : {}),
          ...(input.match ? { match: input.match } : {}),
          ...(input.contextLines !== undefined
            ? { contextLines: input.contextLines }
            : {}),
        }),
      ),
    pause: procedure
      .input(
        scope.extend({
          until: z.number().nonnegative().optional(),
          durationMs: z.number().positive().optional(),
        }),
      )
      .mutation(({ input }) =>
        context.pause(input.accountId, {
          ...(input.until !== undefined ? { until: input.until } : {}),
          ...(input.durationMs !== undefined
            ? { durationMs: input.durationMs }
            : {}),
        }),
      ),
    resume: procedure
      .input(scope)
      .mutation(({ input }) => context.resume(input.accountId)),
    clear: procedure
      .input(
        scope.extend({
          target: z.discriminatedUnion('kind', [
            z.object({ kind: z.literal('all') }),
            z.object({ kind: z.literal('today') }),
            z.object({
              kind: z.literal('timeRange'),
              from: z.number().nonnegative(),
              to: z.number().nonnegative(),
            }),
            z.object({
              kind: z.literal('application'),
              bundleId: z.string().min(1),
            }),
            z.object({ kind: z.literal('domain'), domain: z.string().min(1) }),
            z.object({
              kind: z.literal('session'),
              sessionId: z.string().min(1),
            }),
          ]),
        }),
      )
      .mutation(({ input }) => context.clear(input.accountId, input.target)),
    listApplications: procedure.input(scope).query(({ input }) => [
      ...new Map(
        context
          .events(input.accountId, { limit: 100000 })
          .filter((event) => event.bundleId || event.appName)
          .map((event) => [
            event.bundleId || event.appName,
            {
              bundleId: event.bundleId,
              name: event.appName,
              source: 'observed',
            },
          ]),
      ).values(),
    ]),
    appIcons: procedure
      .input(scope.extend({ bundleIds: z.array(z.string()).max(80) }))
      .query(() =>
        fail(
          'PRECONDITION_FAILED',
          'Native application icons are unavailable in this build',
        ),
      ),
    summaries: procedure
      .input(
        filters.extend({
          limit: z.number().int().min(1).max(200).default(100),
        }),
      )
      .query(({ input }) =>
        context.summaries(input.accountId, {
          ...(input.from !== undefined ? { from: input.from } : {}),
          ...(input.to !== undefined ? { to: input.to } : {}),
          limit: input.limit,
        }),
      ),
    verifyStore: procedure
      .input(
        scope.extend({
          sample: z.number().int().min(1).max(2000).default(200),
          all: z.boolean().default(false),
        }),
      )
      .query(({ input }) =>
        context.verify(input.accountId, input.all ? 1000000 : input.sample),
      ),
    comprehend: procedure
      .input(
        scope.extend({
          closeOpenWindow: z.boolean().default(false),
          maxJobs: z.number().int().min(1).max(20).default(5),
        }),
      )
      .mutation(({ input }) => {
        if (input.closeOpenWindow)
          fail(
            'PRECONDITION_FAILED',
            'Native semantic window control is unavailable',
          );
        return context.comprehend(input.accountId, input.maxJobs);
      }),
    replay: procedure
      .input(
        scope.extend({
          at: z.number().nonnegative(),
          briefingOnly: z.boolean().default(false),
        }),
      )
      .query(({ input }) => {
        const event = context.events(input.accountId, {
          to: input.at,
          limit: 1,
        })[0];
        if (!event) fail('NOT_FOUND', 'No activity exists at this time');
        const summary = context
          .summaries(input.accountId, { to: input.at, limit: 100000 })
          .find((summary) => summary.eventIds.includes(event.id));
        if (input.briefingOnly && !summary)
          fail('PRECONDITION_FAILED', 'This activity has not been summarized');
        return {
          event: input.briefingOnly ? null : event,
          summary: summary ?? null,
        };
      }),
    resummarize: procedure
      .input(scope.extend({ at: z.number().nonnegative() }))
      .mutation(({ input }) => {
        const event = context.events(input.accountId, {
          to: input.at,
          limit: 1,
        })[0];
        if (!event) fail('NOT_FOUND', 'No activity exists at this time');
        return context.comprehend(input.accountId, 1, [event.id]);
      }),
    digest: procedure.input(scope).query(({ input }) => ({
      summaries: context.summaries(input.accountId, {
        from: Date.now() - 86400000,
        limit: 100,
      }),
      sourceCount: context.events(input.accountId, {
        from: Date.now() - 86400000,
        limit: 100000,
      }).length,
    })),
    reportTabSignal: procedure
      .input(
        scope.extend({
          targetId: z.string().min(1),
          url: z.url(),
          kind: z.enum(['activation', 'media', 'unobservable']),
          audible: z.boolean().optional(),
          dwelled: z.boolean().optional(),
          observedAt: z.number().nonnegative().optional(),
          sequence: z.number().nonnegative().optional(),
        }),
      )
      .mutation(({ input }) => context.reportTabSignal(input.accountId, input)),
    summaryModelDefault: procedure.input(scope).query(({ input }) => {
      store.requireAccount(input.accountId);
      return (
        store.get(input.accountId, 'settings', 'models.default') ?? defaultModel
      );
    }),
  });
}
