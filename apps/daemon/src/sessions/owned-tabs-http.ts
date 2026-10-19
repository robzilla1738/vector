/** Authenticated native bubble projection; native/surfaces.md agent-owned tab bubble.
 * Mount before /session/for-chrome/:sessionId/:action in installSessionHttp. */
import type { AgentEngine } from '@aux/agent';
import { TRPCError } from '@trpc/server';
import type { Context, Hono } from 'hono';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';

const routeSchema = z.object({
  accountId: z.coerce.number().int().nonnegative(),
  profileId: z.string().min(1),
  browserMode: z.enum(['normal', 'default', 'incognito']),
});
export function installOwnedTabsHttp(
  app: Hono,
  { store }: DaemonServices,
  engine: AgentEngine,
  security: {
    status(accountId: number): { initialized: boolean; locked: boolean };
  },
) {
  const authorize = (accountId: number) => {
    const account = store.requireAccount(accountId) as {
      onboardingCompletedAt?: number;
    };
    const state = security.status(accountId);
    if (!state.initialized || state.locked || !account.onboardingCompletedAt)
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message:
          'Set up and unlock the account and finish onboarding before managing agent tabs',
      });
  };
  const scope = (c: Context, body: Record<string, unknown> = {}) => {
    const query = c.req.query();
    for (const key of ['accountId', 'profileId', 'browserMode'])
      if (
        query[key] !== undefined &&
        body[key] !== undefined &&
        String(query[key]) !== String(body[key])
      )
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Agent tab request scopes disagree',
        });
    const parsed = routeSchema.parse({ ...query, ...body });
    const browserMode =
      parsed.browserMode === 'incognito'
        ? ('incognito' as const)
        : ('default' as const);
    authorize(parsed.accountId);
    if (
      !store
        .bindings()
        .some(
          (binding) =>
            binding.accountId === parsed.accountId &&
            binding.profileId === parsed.profileId,
        )
    )
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Browser profile is not bound to this account',
      });
    return { ...parsed, browserMode };
  };
  const session = (input: ReturnType<typeof scope>, id: string) => {
    const row = engine.get(input.accountId, id),
      binding = row.browserBinding;
    if (
      !binding ||
      binding.profileId !== input.profileId ||
      binding.browserMode !== input.browserMode
    )
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Task belongs to another browser profile or mode',
      });
    return row;
  };
  app.get('/session/for-chrome/agent-tabs', async (c) => {
    const input = scope(c),
      groups = [],
      unavailableSessionIds: string[] = [];
    for (const row of engine.list(input.accountId)) {
      if (
        row.browserBinding?.profileId !== input.profileId ||
        row.browserBinding.browserMode !== input.browserMode
      )
        continue;
      try {
        const tabs = await engine.tabs.list(input.accountId, row.id);
        if (tabs.length)
          groups.push({
            sessionId: row.id,
            title: row.title,
            autoClosePolicy: engine.tabs.policy(input.accountId, row.id),
            tabs,
          });
      } catch {
        unavailableSessionIds.push(row.id);
      }
    }
    authorize(input.accountId);
    return c.json({
      groups,
      available: unavailableSessionIds.length === 0 || groups.length > 0,
      unavailableSessionIds,
    });
  });
  app.post('/session/for-chrome/agent-tabs/close', async (c) => {
    const body = z
      .object({
        sessionId: z.string().min(1),
        targetId: z.string().min(1),
        tabId: z.number().int().nonnegative(),
      })
      .passthrough()
      .parse(await c.req.json());
    const input = scope(c, body);
    session(input, body.sessionId);
    const tab = (await engine.tabs.list(input.accountId, body.sessionId)).find(
      (row) => row.targetId === body.targetId && row.tabId === body.tabId,
    );
    if (!tab)
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'This exact target is no longer owned by this task',
      });
    return c.json(
      await engine.tabs.close(
        input.accountId,
        body.sessionId,
        tab.id,
        { targetId: body.targetId, tabId: body.tabId },
        undefined,
        () => authorize(input.accountId),
      ),
    );
  });
  app.post('/session/for-chrome/agent-tabs/cleanup', async (c) => {
    const body = z
        .object({ sessionId: z.string().min(1) })
        .passthrough()
        .parse(await c.req.json()),
      input = scope(c, body);
    session(input, body.sessionId);
    return c.json(
      await engine.tabs.cleanup(input.accountId, body.sessionId, false, () =>
        authorize(input.accountId),
      ),
    );
  });
  app.post('/session/for-chrome/agent-tabs/policy', async (c) => {
    const body = z
        .object({
          sessionId: z.string().min(1),
          autoClosePolicy: z.enum(['keep', 'on-completion']),
        })
        .passthrough()
        .parse(await c.req.json()),
      input = scope(c, body);
    session(input, body.sessionId);
    return c.json(
      engine.tabs.setPolicy(
        input.accountId,
        body.sessionId,
        body.autoClosePolicy,
      ),
    );
  });
}
