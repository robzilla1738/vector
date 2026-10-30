/** The `sessions.tabs` tRPC namespace: the browser tabs a task holds. A loaded agent removes its
 * own tab so its browser state stays current; otherwise the stored tab is removed. */
export function create({accountProcedure, z, tabs: t}) {
  return {
    list: accountProcedure.input(z.object({sessionId: z.string()})).query(({ctx, input}) => t.list(ctx.accountId, input.sessionId, {includeChildSessions: true})),
    resolveByTarget: accountProcedure.input(z.object({targetId: z.string()})).query(({ctx, input}) => t.resolveByTargetId(ctx.accountId, input.targetId)),
    remove: accountProcedure.input(z.object({sessionId: z.string(), sessionTabId: z.string()})).mutation(({ctx, input}) => {
      const tab = t.get(ctx.accountId, input.sessionTabId);
      if (!tab || tab.sessionId !== input.sessionId) return;
      const browser = t.GlobalAgentSessionServer.getLoadedAgent(ctx.accountId, input.sessionId)?.browser;
      if (browser) browser.removeTab(input.sessionTabId);
      else t.remove(ctx.accountId, input.sessionTabId);
    }),
  };
}
