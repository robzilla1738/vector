import { randomUUID } from 'node:crypto';
import { type AgentEngine, sessionTools } from '@aux/agent';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
import { Sandbox } from './sandbox.js';

export function createReplService(
  services: DaemonServices,
  engine: AgentEngine,
) {
  const { store, bridge, t, procedure } = services;
  const sandboxes = new Map<
    string,
    {
      id: string;
      accountId: number;
      sessionId: string;
      sandbox: Sandbox;
      lastUsedAt: number;
    }
  >();
  const scope = z.object({ accountId: z.number().int().nonnegative() });
  const identity = scope.extend({ id: z.string().uuid() });
  const toolsByMethod: Record<string, string> = {
    tabs: 'browser_tabs',
    snapshot: 'page_view',
    navigate: 'browser_navigate',
    click: 'browser_click',
    type: 'browser_type',
    scroll: 'browser_scroll',
    readFile: 'read_file',
    writeFile: 'write_file',
    fetch: 'webfetch',
  };
  function record(accountId: number, id: string) {
    store.requireAccount(accountId);
    const value = sandboxes.get(id);
    if (!value || value.accountId !== accountId)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Browser sandbox is absent or expired.',
      });
    return value;
  }
  async function invoke(
    accountId: number,
    sessionId: string,
    method: string,
    params: unknown,
    signal: AbortSignal,
  ) {
    signal.throwIfAborted();
    const name = toolsByMethod[method];
    if (name) {
      const tool = sessionTools(engine, accountId, sessionId, signal)[name];
      if (!tool?.execute || !(tool.inputSchema instanceof z.ZodType))
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'This sandbox capability is unavailable.',
        });
      // The validated schema narrows the ToolSet union input at this boundary.
      const execute = tool.execute as unknown as (
        input: unknown,
        options: {
          toolCallId: string;
          messages: never[];
          abortSignal: AbortSignal;
        },
      ) => unknown;
      return execute(tool.inputSchema.parse(params), {
        toolCallId: randomUUID(),
        messages: [],
        abortSignal: signal,
      });
    }
    const session = engine.get(accountId, sessionId);
    const binding = session.browserBinding;
    if (!binding)
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message:
          'Choose a connected profile before using browser capabilities.',
      });
    const route = { accountId, ...binding };
    if (!bridge.status(route).connected)
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'The selected profile extension is disconnected.',
      });
    if (method === 'screenshot')
      return bridge.command(
        route,
        {
          method: 'page.screenshot',
          params: z.object({ targetId: z.string().min(1) }).parse(params),
        },
        { signal },
      );
    if (!['open', 'close'].includes(method))
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Unknown sandbox capability.',
      });
    if (session.permissionMode === 'read-only')
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'The sandbox is read only.',
      });
    const input =
      method === 'open'
        ? z
            .object({
              url: z
                .url()
                .refine((url) =>
                  ['http:', 'https:'].includes(new URL(url).protocol),
                ),
            })
            .parse(params)
        : z.object({ tabId: z.number().int().nonnegative() }).parse(params);
    const toolCallId = randomUUID();
    const decision = z.object({ verdict: z.enum(['allow', 'deny']) }).parse(
      await engine.suspend(
        accountId,
        sessionId,
        toolCallId,
        'approval',
        {
          title: method === 'open' ? 'Open browser tab' : 'Close browser tab',
          operation: input,
        },
        signal,
      ),
    );
    if (decision.verdict !== 'allow')
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Browser operation was denied.',
      });
    return bridge.command(
      route,
      {
        method: method === 'open' ? 'tabs.create' : 'tabs.remove',
        params: input,
      },
      { signal },
    );
  }
  async function close(accountId: number, id: string) {
    const value = sandboxes.get(id);
    if (!value) return { closed: true };
    record(accountId, id);
    engine.stop(accountId, value.sessionId, 'interrupted');
    await engine.wait(accountId, value.sessionId);
    value.sandbox.close();
    sandboxes.delete(id);
    return { closed: true };
  }
  const cleanup = setInterval(() => {
    for (const value of sandboxes.values()) {
      if (
        Date.now() - value.lastUsedAt > 30 * 60_000 &&
        engine.get(value.accountId, value.sessionId).status === 'idle'
      ) {
        void close(value.accountId, value.id).catch(() =>
          console.error('Idle browser sandbox cleanup failed.'),
        );
      }
    }
  }, 60_000);
  cleanup.unref();
  store.registerAccountDeletionHandler(async (accountId) => {
    for (const value of [...sandboxes.values()])
      if (value.accountId === accountId) await close(accountId, value.id);
  });
  return {
    router: t.router({
      replStart: procedure
        .input(scope.extend({ profileId: z.string().min(1).optional() }))
        .mutation(async ({ input }) => {
          store.requireAccount(input.accountId);
          const bindings = store
            .bindings()
            .filter(
              (binding) =>
                binding.accountId === input.accountId &&
                (!input.profileId || binding.profileId === input.profileId),
            );
          if (input.profileId && !bindings.length)
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Profile is not bound to this account.',
            });
          if (!input.profileId && bindings.length > 1)
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Select an explicit browser profile.',
            });
          if (sandboxes.size >= 16)
            throw new TRPCError({
              code: 'TOO_MANY_REQUESTS',
              message: 'Close an existing sandbox before creating another.',
            });
          const session = engine.create({
            accountId: input.accountId,
            title: 'CLI JavaScript',
            ephemeral: true,
            permissionMode: 'guard',
            runtimeConfig: { memoryExtractionDisabled: true },
            ...(bindings[0]
              ? {
                  browserBinding: {
                    profileId: bindings[0].profileId,
                    browserMode: 'default' as const,
                  },
                }
              : {}),
          });
          const sandbox = await Sandbox.create((method, params, signal) =>
            invoke(input.accountId, session.id, method, params, signal),
          );
          const id = randomUUID();
          sandboxes.set(id, {
            id,
            accountId: input.accountId,
            sessionId: session.id,
            sandbox,
            lastUsedAt: Date.now(),
          });
          return {
            id,
            sessionId: session.id,
            sessionDir: engine.directory(session),
          };
        }),
      replRun: procedure
        .input(
          identity.extend({
            code: z.string().min(1).max(1_048_576),
            timeoutMs: z.number().int().min(1).max(120_000).default(120_000),
          }),
        )
        .mutation(async ({ input }) => {
          const value = record(input.accountId, input.id);
          value.lastUsedAt = Date.now();
          try {
            return await engine.runExternal(
              input.accountId,
              value.sessionId,
              (signal) =>
                value.sandbox.run(input.code, signal, input.timeoutMs),
            );
          } catch (error) {
            value.sandbox.close();
            sandboxes.delete(value.id);
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Sandbox closed; bindings were lost. ${engine.credentials.redact(input.accountId, error instanceof Error ? error.message : 'Evaluation failed.')}`,
            });
          } finally {
            value.lastUsedAt = Date.now();
          }
        }),
      replState: procedure.input(identity).query(({ input }) => {
        const value = record(input.accountId, input.id);
        return {
          id: value.id,
          sessionId: value.sessionId,
          lastUsedAt: value.lastUsedAt,
          session: engine.public(engine.get(input.accountId, value.sessionId)),
        };
      }),
      replClose: procedure
        .input(identity)
        .mutation(({ input }) => close(input.accountId, input.id)),
      replDescription: procedure.input(scope).query(({ input }) => {
        store.requireAccount(input.accountId);
        return 'Persistent isolated JavaScript: browser.getTabs(), browser.attachTab(targetId), browser.openTab(url), browser.closeTab(tabId). A page supports snapshot/screenshot/navigate/click/type/scroll. Use snapshot refs and documentUrl from a fresh observation. No host imports, process or unrestricted filesystem/network access. Browser mutations require a human response in Aux. Idle sandboxes expire after 30 minutes.';
      }),
    }),
    async close() {
      clearInterval(cleanup);
      for (const value of [...sandboxes.values()])
        await close(value.accountId, value.id);
    },
  };
}
