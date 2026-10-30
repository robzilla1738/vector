/** The `channels` tRPC namespace: chat-app connections (Slack and the like), who may pair with
 * them, and their policies. Sender names and avatars come from the platform when it knows them.
 * Connection storage, the channel manager and secrets stay the supplied ones. */
export function create({z, channels: c}) {
  const procedure = c.planProcedure(c.allowedPlans);
  const byConnection = z.object({connectionId: z.string().uuid()});
  /** The error tRPC clients expect for a failed channel action. */
  const translated = action => async options => {
    try {
      return await action(options);
    } catch (error) {
      c.rethrowAsTRPCError(error);
    }
  };
  const profiles = (accountId, connectionId, rows) => c.resolveSenderProfiles(accountId, connectionId, rows.map(row => row.senderId));
  return {
    connections: {
      create: procedure.input(c.createConnectionInputSchema).output(c.connectionPublicSchema).mutation(translated(({ctx, input}) => c.createChannelConnection(ctx.accountId, input))),
      list: procedure.output(z.array(c.connectionPublicSchema)).query(({ctx}) => c.listConnections(ctx.accountId).map(connection => c.toPublicConnection(ctx.accountId, connection))),
      update: procedure.input(c.updateConnectionInputSchema).output(c.connectionPublicSchema).mutation(translated(({ctx, input}) => c.updateChannelConnection(ctx.accountId, input))),
      remove: procedure.input(byConnection).mutation(async ({ctx, input}) => {
        const connection = c.getConnection(ctx.accountId, input.connectionId);
        if (!connection) return {success: true};
        await c.manager.stopConnection(ctx.accountId, input.connectionId);
        c.deleteConnection(ctx.accountId, input.connectionId);
        await c.clearChannelSecrets(ctx.accountId, input.connectionId, connection.platform);
        return {success: true};
      }),
      restart: procedure.input(byConnection).mutation(translated(async ({ctx, input}) => {
        await c.restartChannelConnection(ctx.accountId, input.connectionId);
        return {success: true};
      })),
    },
    pairing: {
      list: procedure.input(byConnection).query(async ({ctx, input}) => {
        const requests = c.listPairingRequests(ctx.accountId, input.connectionId), known = await profiles(ctx.accountId, input.connectionId, requests);
        return requests.map(request => ({id: request.id, connectionId: request.connectionId, senderId: request.senderId,
          senderName: known.get(request.senderId)?.displayName ?? request.senderName, avatarUrl: known.get(request.senderId)?.avatarUrl ?? null,
          createdAt: request.createdAt, lastSeenAt: request.lastSeenAt, expiresAt: request.expiresAt}));
      }),
      approve: procedure.input(c.approvePairingInputSchema).mutation(translated(async ({ctx, input}) => {
        const replayed = await c.approvePairingAndReplay(ctx.accountId, input.requestId);
        return replayed ? {approved: true, ...replayed} : {approved: false};
      })),
      reject: procedure.input(z.object({requestId: z.string().uuid()})).mutation(async ({ctx, input}) => {
        await c.rejectPairing(ctx.accountId, input.requestId);
        return {success: true};
      }),
    },
    principals: {
      list: procedure.input(byConnection).output(z.array(c.principalPublicSchema)).query(async ({ctx, input}) => {
        const principals = c.listPrincipals(ctx.accountId, input.connectionId), known = await profiles(ctx.accountId, input.connectionId, principals);
        return principals.map(principal => ({connectionId: principal.connectionId, senderId: principal.senderId,
          displayName: known.get(principal.senderId)?.displayName ?? principal.displayName, avatarUrl: known.get(principal.senderId)?.avatarUrl ?? null,
          canApprovePairing: principal.canApprovePairing, pairedAt: principal.pairedAt?.getTime() ?? null, lastSeenAt: principal.lastSeenAt?.getTime() ?? null}));
      }),
      remove: procedure.input(c.removePrincipalInputSchema).mutation(({ctx, input}) => {
        c.deletePrincipal(ctx.accountId, input.connectionId, input.senderId);
        return {success: true};
      }),
      update: procedure.input(c.updatePrincipalInputSchema).mutation(({ctx, input}) => {
        c.setPrincipalPairingApproval(ctx.accountId, input.connectionId, input.senderId, input.canApprovePairing);
        return {success: true};
      }),
    },
    policies: {
      get: procedure.input(byConnection).query(({ctx, input}) => c.getConnectionPolicy(ctx.accountId, input.connectionId)),
      update: procedure.input(c.updatePolicyInputSchema).mutation(({ctx, input}) => {
        c.setConnectionPolicy(ctx.accountId, input.connectionId, input.policy);
        return {success: true};
      }),
    },
  };
}
