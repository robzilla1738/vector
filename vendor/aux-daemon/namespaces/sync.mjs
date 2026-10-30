/** The `sync` tRPC namespace: cloud sync of the agent files and their conflicts. The sync engine
 * stays the supplied one. */
export function create({accountProcedure, z, sync: y}) {
  return {
    status: accountProcedure.query(({ctx}) => {
      const meta = y.loadAgentFileSyncMeta(ctx.accountId), conflicts = y.listAgentFileConflicts(ctx.accountId);
      return {enabled: y.isSyncEnabled(ctx.accountId), etag: meta.etag, conflictCount: conflicts.length, conflicts};
    }),
    resolveConflict: accountProcedure.input(z.object({path: z.string().min(1), choice: z.enum(['local', 'remote', 'edited']), content: z.string().optional()}))
      .mutation(async ({ctx, input}) => {
        await y.resolveAgentFileConflict(ctx.accountId, input.path, input.choice, input.content);
        return {ok: true};
      }),
  };
}
