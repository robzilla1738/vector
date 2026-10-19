/** Implements docs/spec/daemon/agent.md Model/provider contract. */

import { type AgentEngine, defaultModel, fail, scope } from '@aux/agent';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
import { createOAuthModelProcedures } from './oauth.js';

const providerScope = scope.extend({
  providerId: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),
});
export function createModelRouter(
  services: DaemonServices,
  engine: AgentEngine,
) {
  const { t, procedure, store } = services;
  function configured(accountId: number, provider: string) {
    return (
      (store.get(accountId, 'modelIds', provider) as string[] | null) ??
      (provider === 'vercel-ai-gateway' ? [defaultModel.modelId] : [])
    );
  }
  // Public Gateway model inventory, retrieved 2026-10-19 from /v1/models.
  function describe(provider: string, modelId: string) {
    const model = {
      id: `${provider}/${modelId}`,
      modelId,
      provider,
      name: modelId,
      inputModalities: ['text'],
      thinkingLevels: [] as string[],
      contextWindow: null as number | null,
      outputLimit: null as number | null,
    };
    if (provider === 'vercel-ai-gateway' && modelId === defaultModel.modelId)
      return {
        ...model,
        name: 'Muse Spark 1.3 Contributor',
        inputModalities: ['text', 'image', 'pdf'],
        thinkingLevels: ['minimal', 'low', 'medium', 'high', 'xhigh', 'max'],
        contextWindow: 1048576,
        outputLimit: 1048576,
      };
    return model;
  }
  function inventory(accountId: number) {
    return engine.credentials.list(accountId).flatMap((credential) =>
      credential.providerId === 'openai-codex'
        ? engine.credentials.oauth.cachedCatalog(accountId).map((model) => ({
            ...describe('openai-codex', model.slug),
            name: model.displayName,
          }))
        : configured(accountId, credential.providerId).map((modelId) =>
            describe(credential.providerId, modelId),
          ),
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
    ...createOAuthModelProcedures(services, engine),
    listSupported: procedure.input(scope).query(({ input }) => {
      store.requireAccount(input.accountId);
      return [
        describe(defaultModel.provider, defaultModel.modelId),
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
      .mutation(async ({ input }) => {
        if (input.providerId === 'openai-codex') {
          const current = engine.credentials.oauth.status(
            input.accountId,
          ).registrationId;
          if (!current) return { exists: false, type: null };
          return engine.credentials.oauth.signOut(input.accountId, current);
        }
        return engine.credentials.remove(input.accountId, input.providerId);
      }),
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
          available: true,
          configured: engine.credentials.oauth.status(input.accountId).exists,
          flow: 'loopback-pkce',
          appName: 'Aux',
          reason:
            'Register Aux through a user-initiated ChatGPT sign-in; plan eligibility and current model access are verified by the provider.',
        },
      ];
    }),
    getSubscriptionUsage: procedure.input(providerScope).query(({ input }) => ({
      usage: null,
      credential: engine.credentials.status(input.accountId, input.providerId),
    })),
  });
}
