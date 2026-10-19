/** OAuth RPC returns public flow/registration metadata only. */
import { type AgentEngine, fail, scope } from '@aux/agent';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';

const provider = z.literal('openai-codex');
const flow = scope.extend({ flowId: z.string().uuid() });
export function createOAuthModelProcedures(
  { procedure }: DaemonServices,
  engine: AgentEngine,
) {
  const oauth = engine.credentials.oauth;
  return {
    oauthAuthorize: procedure
      .input(
        scope
          .extend({
            providerId: provider,
            registrationId: z.string().uuid().optional(),
            retryFlowId: z.string().uuid().optional(),
          })
          .strict(),
      )
      .mutation(({ input }) =>
        oauth.start(input.accountId, input.registrationId, input.retryFlowId),
      ),
    oauthStatus: procedure
      .input(flow)
      .query(({ input }) => oauth.flow(input.accountId, input.flowId)),
    oauthCancel: procedure
      .input(flow)
      .mutation(({ input }) => oauth.cancel(input.accountId, input.flowId)),
    oauthCallback: procedure
      .input(flow)
      .mutation(() =>
        fail(
          'FORBIDDEN',
          'OAuth callbacks are accepted only by their one-use loopback listener; never paste authorization codes into RPC',
        ),
      ),
    oauthRegistrations: procedure
      .input(scope)
      .query(({ input }) => oauth.list(input.accountId)),
    oauthSelect: procedure
      .input(scope.extend({ registrationId: z.string().uuid() }))
      .mutation(({ input }) =>
        oauth.select(input.accountId, input.registrationId),
      ),
    oauthSignOut: procedure
      .input(scope.extend({ registrationId: z.string().uuid() }))
      .mutation(({ input }) =>
        oauth.signOut(input.accountId, input.registrationId),
      ),
    oauthDiscoverModels: procedure
      .input(scope)
      .mutation(({ input }) =>
        oauth.catalog(input.accountId, AbortSignal.timeout(15000)),
      ),
  };
}
