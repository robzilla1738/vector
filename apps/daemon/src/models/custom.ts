import {
  type AgentEngine,
  CustomProviders,
  customProviderBatch,
  customProviderId,
  fail,
  scope,
} from '@aux/agent';
import type { DaemonServices } from '../http/server.js';
export function createCustomModelProcedures(
  { procedure }: DaemonServices,
  engine: AgentEngine,
) {
  const providers = new CustomProviders(engine.store);
  const providerScope = scope.extend({ providerId: customProviderId });
  function mutable(accountId: number, providerIds: string[]) {
    if (
      engine
        .list(accountId)
        .some(
          (session) =>
            session.model !== undefined &&
            providerIds.includes(session.model.provider) &&
            ['running', 'suspended'].includes(session.status),
        )
    )
      fail(
        'CONFLICT',
        'Stop or finish active tasks using this provider before changing its configuration.',
      );
  }
  return {
    listCustomProviders: procedure
      .input(scope)
      .query(({ input }) => providers.list(input.accountId)),
    getCustomProviderConfig: procedure
      .input(providerScope)
      .query(({ input }) => providers.get(input.accountId, input.providerId)),
    setCustomProvidersConfig: procedure
      .input(scope.extend({ providers: customProviderBatch }))
      .mutation(({ input }) => {
        mutable(input.accountId, Object.keys(input.providers));
        return { providers: providers.set(input.accountId, input.providers) };
      }),
    removeCustomProviderConfig: procedure
      .input(providerScope)
      .mutation(({ input }) => {
        mutable(input.accountId, [input.providerId]);
        return providers.remove(input.accountId, input.providerId);
      }),
  };
}
