import {
  type AgentEngine,
  type AgentStorage,
  approveOperation,
  fail,
  type Session,
} from '@aux/agent';
import { type ToolSet, tool } from 'ai';
import { z } from 'zod';
import type { BrowsingHistory } from './browser-history.js';
import type { ContextService } from './context.js';

const query = z.array(z.string().trim().min(1).max(2000)).min(1).max(3);
export function historyTools(
  store: AgentStorage & {
    bindings(): { accountId: number; profileId: string }[];
  },
  engine: AgentEngine,
  history: BrowsingHistory,
  context: ContextService,
  session: Session,
  signal: AbortSignal,
): ToolSet {
  const current = (kind: 'browser' | 'activity') => {
    signal.throwIfAborted();
    const latest = engine.get(session.accountId, session.id),
      binding = latest.browserBinding;
    if (latest.incognito || binding?.browserMode === 'incognito')
      fail(
        'FORBIDDEN',
        'Private sessions cannot recall durable browsing or activity history',
      );
    if (
      binding?.browserMode !== 'default' ||
      !store
        .bindings()
        .some(
          (b) =>
            b.accountId === session.accountId &&
            b.profileId === binding.profileId,
        )
    )
      fail(
        'PRECONDITION_FAILED',
        'History recall requires a bound ordinary browser Profile',
      );
    if (
      store.get(
        session.accountId,
        'settings',
        kind === 'browser'
          ? 'browsingHistoryEnabled'
          : 'contextAwarenessEnabled',
      ) !== true
    )
      fail(
        'PRECONDITION_FAILED',
        kind === 'browser'
          ? 'Visited-page recall is disabled'
          : 'Activity recall is disabled',
      );
    return binding;
  };
  const approve = async (name: string, input: unknown, id: string) => {
    await approveOperation(
      engine,
      session.accountId,
      session.id,
      id,
      name,
      'Recall permitted local evidence',
      input,
      signal,
      { mutation: false, defaultAsk: false },
    );
  };
  return {
    browsing_history_search: tool({
      description:
        'Search visited-page evidence in this session’s actual bound ordinary Profile. Returns semantic ranking with original visit times and source IDs. Requires explicit visited-page recall opt-in; unavailable in private mode.',
      inputSchema: z.object({
        queries: query,
        maxResults: z.number().int().min(1).max(10).default(5),
        from: z.number().nonnegative().optional(),
        to: z.number().nonnegative().optional(),
      }),
      execute: async (input, { toolCallId }) => {
        const binding = current('browser');
        await approve('browsing_history_search', input, toolCallId);
        current('browser');
        const result = await history.search(
          session.accountId,
          binding.profileId,
          input.queries,
          input.maxResults,
          {
            ...(input.from === undefined ? {} : { from: input.from }),
            ...(input.to === undefined ? {} : { to: input.to }),
          },
        );
        const after = current('browser');
        if (after.profileId !== binding.profileId)
          fail('CONFLICT', 'Session browser Profile changed during recall');
        history.read(
          session.accountId,
          binding.profileId,
          result.results.map((row) => String(row.historyEntryId)),
        );
        return result;
      },
    }),
    history_search: tool({
      description:
        'Search permitted local app and site activity with evidence IDs. Excluded, deleted, private and other-Profile sources are not returned. Requires context opt-in.',
      inputSchema: z.object({
        queries: query,
        from: z.number().nonnegative().optional(),
        to: z.number().nonnegative().optional(),
        app: z.string().max(256).optional(),
        domain: z.string().max(253).optional(),
        maxResults: z.number().int().min(1).max(10).default(5),
      }),
      execute: async (input, { toolCallId }) => {
        const binding = current('activity');
        await approve('history_search', input, toolCallId);
        current('activity');
        const filter = {
          profileId: binding.profileId,
          limit: input.maxResults,
          ...(input.from === undefined ? {} : { from: input.from }),
          ...(input.to === undefined ? {} : { to: input.to }),
          ...(input.app ? { bundleId: input.app } : {}),
          ...(input.domain ? { domain: input.domain } : {}),
        };
        const result = await context.search(
            session.accountId,
            input.queries,
            filter,
          ),
          after = current('activity');
        if (after.profileId !== binding.profileId)
          fail('CONFLICT', 'Session browser Profile changed during recall');
        context.read(
          session.accountId,
          result.results.map((row) => String(row.evidenceId)),
          { profileId: binding.profileId },
        );
        return result;
      },
    }),
    history_read: tool({
      description:
        'Read bounded permitted activity evidence returned by history_search, with optional text matching. Current exclusion and session Profile rules are rechecked.',
      inputSchema: z.object({
        ids: z.array(z.string().min(1)).min(1).max(20),
        offset: z.number().int().nonnegative().optional(),
        match: z.string().min(1).max(200).optional(),
        contextLines: z.number().int().min(0).max(100).optional(),
      }),
      execute: async (input, { toolCallId }) => {
        const binding = current('activity');
        await approve('history_read', input, toolCallId);
        const after = current('activity');
        if (after.profileId !== binding.profileId)
          fail('CONFLICT', 'Session browser Profile changed during recall');
        return context.read(session.accountId, input.ids, {
          profileId: binding.profileId,
          ...(input.offset === undefined ? {} : { offset: input.offset }),
          ...(input.match ? { match: input.match } : {}),
          ...(input.contextLines === undefined
            ? {}
            : { contextLines: input.contextLines }),
        });
      },
    }),
  };
}
