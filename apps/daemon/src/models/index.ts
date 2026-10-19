/** Implements docs/spec/daemon/agent.md Model/provider contract. */

import { type AgentEngine, defaultModel, fail, scope } from '@aux/agent';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';

const providerScope = scope.extend({
  providerId: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),
});
export function createModelRouter(
  { t, procedure, store }: DaemonServices,
  engine: AgentEngine,
) {
  function configured(accountId: number, provider: string) {
    return (
      (store.get(accountId, 'modelIds', provider) as string[] | null) ??
      (provider === 'vercel-ai-gateway' ? [defaultModel.modelId] : [])
    );
  }
  function inventory(accountId: number) {
    return engine.credentials.list(accountId).flatMap((credential) =>
      configured(accountId, credential.providerId).map((modelId) => ({
        id: `${credential.providerId}/${modelId}`,
        modelId,
        provider: credential.providerId,
        name: modelId,
        inputModalities: ['text'],
      })),
    );
  }
  async function catalog(provider: string) {
    if (!['vercel-ai-gateway', 'openrouter'].includes(provider))
      fail(
        'BAD_REQUEST',
        'Catalog discovery is supported for Gateway and OpenRouter',
      );
    const response = await fetch(
      provider === 'vercel-ai-gateway'
        ? 'https://ai-gateway.vercel.sh/v1/models'
        : 'https://openrouter.ai/api/v1/models',
      { signal: AbortSignal.timeout(15000) },
    );
    if (!response.ok)
      fail(
        'PRECONDITION_FAILED',
        `Catalog request failed (${response.status})`,
      );
    return z
      .object({
        data: z.array(
          z
            .object({
              id: z.string(),
              name: z.string().optional(),
              context_length: z.number().optional(),
            })
            .passthrough(),
        ),
      })
      .parse(await response.json()).data;
  }
  const modelIds = providerScope.extend({
    modelIds: z.array(z.string().min(1)).min(1),
  });
  return t.router({
    listSupported: procedure.input(scope).query(({ input }) => {
      store.requireAccount(input.accountId);
      return [
        {
          id: `${defaultModel.provider}/${defaultModel.modelId}`,
          provider: defaultModel.provider,
          modelId: defaultModel.modelId,
          name: defaultModel.modelId,
          inputModalities: ['text'],
        },
        ...inventory(input.accountId).filter(
          (model) => model.modelId !== defaultModel.modelId,
        ),
      ];
    }),
    listAvailable: procedure
      .input(scope)
      .query(({ input }) => inventory(input.accountId)),
    listAvailableImages: procedure.input(scope).query(({ input }) => {
      store.requireAccount(input.accountId);
      return inventory(input.accountId).filter((model) =>
        model.inputModalities.includes('image'),
      );
    }),
    listSettingsInventory: procedure.input(scope).query(({ input }) => ({
      models: inventory(input.accountId),
      credentials: engine.credentials.list(input.accountId),
    })),
    getCredentialStatus: procedure
      .input(providerScope)
      .query(({ input }) =>
        engine.credentials.status(input.accountId, input.providerId),
      ),
    listCredentials: procedure
      .input(scope)
      .query(({ input }) => engine.credentials.list(input.accountId)),
    setCredential: procedure
      .input(
        providerScope.extend({
          credential: z.object({
            type: z.literal('api_key'),
            key: z.string().min(1),
          }),
        }),
      )
      .mutation(({ input }) =>
        engine.credentials.set(
          input.accountId,
          input.providerId,
          input.credential,
        ),
      ),
    removeCredential: procedure
      .input(providerScope)
      .mutation(({ input }) =>
        engine.credentials.remove(input.accountId, input.providerId),
      ),
    listAiGatewayModelIds: procedure
      .input(providerScope)
      .query(({ input }) => configured(input.accountId, input.providerId)),
    setAiGatewayModelIds: procedure.input(modelIds).mutation(({ input }) => {
      store.set(input.accountId, 'modelIds', input.providerId, input.modelIds);
      return input.modelIds;
    }),
    searchAiGatewayModels: procedure
      .input(providerScope.extend({ query: z.string().default('') }))
      .query(async ({ input }) => {
        store.requireAccount(input.accountId);
        return (await catalog(input.providerId)).filter((model) =>
          `${model.id} ${model.name ?? ''}`
            .toLowerCase()
            .includes(input.query.toLowerCase()),
        );
      }),
    listOpenRouterModelIds: procedure
      .input(scope)
      .query(({ input }) => configured(input.accountId, 'openrouter')),
    setOpenRouterModelIds: procedure
      .input(scope.extend({ modelIds: z.array(z.string().min(1)).min(1) }))
      .mutation(({ input }) => {
        store.set(input.accountId, 'modelIds', 'openrouter', input.modelIds);
        return input.modelIds;
      }),
    searchOpenRouterModels: procedure
      .input(scope.extend({ query: z.string().default('') }))
      .query(async ({ input }) => {
        store.requireAccount(input.accountId);
        return (await catalog('openrouter')).filter((model) =>
          `${model.id} ${model.name ?? ''}`
            .toLowerCase()
            .includes(input.query.toLowerCase()),
        );
      }),
    ensureRoutingSelectionsAvailable: procedure
      .input(scope)
      .mutation(({ input }) => {
        const available = inventory(input.accountId);
        const current = store.get(
          input.accountId,
          'settings',
          'models.default',
        ) as typeof defaultModel | null;
        const candidate =
          available.find(
            (model) =>
              model.modelId === current?.modelId &&
              model.provider === current?.provider,
          ) ?? available[0];
        const selection = candidate
          ? {
              ...defaultModel,
              provider: candidate.provider,
              modelId: candidate.modelId,
            }
          : null;
        store.set(input.accountId, 'settings', 'models.default', selection);
        return { selection, available: !!selection };
      }),
    getCustomProviderConfig: procedure
      .input(providerScope)
      .query(({ input }) =>
        store.get(input.accountId, 'customProviders', input.providerId),
      ),
    setCustomProvidersConfig: procedure
      .input(
        scope.extend({
          providers: z.record(
            z.string(),
            z.object({
              name: z.string().min(1),
              baseUrl: z.url(),
              apiKey: z.string().optional(),
              headers: z.record(z.string(), z.string()).optional(),
              modelIds: z.array(z.string()).default([]),
            }),
          ),
        }),
      )
      .mutation(({ input }) => {
        for (const [providerId, config] of Object.entries(input.providers)) {
          if (config.apiKey && config.apiKey !== '[redacted]')
            engine.credentials.set(input.accountId, providerId, {
              type: 'api_key',
              key: config.apiKey,
            });
          const { apiKey, headers, ...publicConfig } = config;
          if (
            headers &&
            Object.keys(headers).some((name) =>
              /authorization|key|token|secret/i.test(name),
            )
          )
            fail(
              'BAD_REQUEST',
              'Use the private API key field for authentication',
            );
          store.set(input.accountId, 'customProviders', providerId, {
            ...publicConfig,
            ...(headers ? { headers } : {}),
          });
          store.set(input.accountId, 'modelIds', providerId, config.modelIds);
        }
        return { providers: store.all(input.accountId, 'customProviders') };
      }),
    removeCustomProviderConfig: procedure
      .input(providerScope)
      .mutation(({ input }) => {
        store.set(input.accountId, 'customProviders', input.providerId, null);
        engine.credentials.remove(input.accountId, input.providerId);
        return { removed: true };
      }),
    listOAuthProviders: procedure.input(scope).query(({ input }) => {
      store.requireAccount(input.accountId);
      return [
        {
          id: 'openai-codex',
          available: false,
          reason: 'OAuth flow is not configured in this local build',
        },
      ];
    }),
    getSubscriptionUsage: procedure.input(providerScope).query(({ input }) => ({
      usage: null,
      credential: engine.credentials.status(input.accountId, input.providerId),
    })),
  });
}
