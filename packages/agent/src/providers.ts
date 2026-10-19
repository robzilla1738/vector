import { createAnthropic } from '@ai-sdk/anthropic';
import { createGateway } from '@ai-sdk/gateway';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { generateText, LanguageModel } from 'ai';
import { z } from 'zod';
import type { Credentials } from './credentials.js';
import { CustomProviders } from './custom-providers.js';
import { createOAuthModel } from './oauth/model.js';
import { type AgentStorage, fail } from './storage.js';
export const selectionSchema = z.object({
  provider: z.string().min(1),
  modelId: z.string().min(1),
  thinkingLevel: z
    .enum(['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'])
    .default('medium'),
  fastMode: z.boolean().default(false),
});
export type Selection = z.infer<typeof selectionSchema>;
export const defaultModel: Selection = {
  provider: 'vercel-ai-gateway',
  modelId: 'meta/muse-spark-1.3-contributor',
  thinkingLevel: 'medium',
  fastMode: false,
};
export function customModelConfiguration(
  store: AgentStorage,
  accountId: number,
  selection: Selection,
) {
  if (!selection.provider.startsWith('custom-')) return undefined;
  const provider = new CustomProviders(store).resolve(
    accountId,
    selection.provider,
  );
  const model = provider.models.find((model) => model.id === selection.modelId);
  if (!model)
    fail(
      'PRECONDITION_FAILED',
      'This model is not in the custom provider configuration.',
    );
  if (!model.inputModalities.includes('text'))
    fail('PRECONDITION_FAILED', 'Agent models must accept text input.');
  return { provider, model };
}
export function modelCallSettings(
  store: AgentStorage,
  accountId: number,
  selection: Selection,
): Pick<
  Parameters<typeof generateText>[0],
  'reasoning' | 'providerOptions' | 'maxOutputTokens'
> {
  const custom = customModelConfiguration(store, accountId, selection);
  if (!custom)
    return {
      reasoning:
        selection.thinkingLevel === 'off'
          ? ('none' as const)
          : selection.thinkingLevel,
      providerOptions: selection.fastMode ? { gateway: { sort: 'ttft' } } : {},
    };
  const { provider, model } = custom;
  if (
    model.reasoning &&
    !model.thinkingLevels.includes(selection.thinkingLevel)
  )
    fail(
      'PRECONDITION_FAILED',
      'Choose a thinking level supported by this custom model.',
    );
  const effort =
    model.thinkingLevelMapping?.[selection.thinkingLevel] ??
    (selection.thinkingLevel === 'off' ? 'none' : selection.thinkingLevel);
  return {
    ...(model.outputLimit ? { maxOutputTokens: model.outputLimit } : {}),
    providerOptions:
      provider.apiStyle === 'openai-responses'
        ? {
            openai: {
              forceReasoning: model.reasoning,
              store: false,
              ...(model.reasoning ? { reasoningEffort: effort } : {}),
            },
          }
        : model.reasoning
          ? { openaiCompatible: { reasoningEffort: effort } }
          : {},
  };
}
export function resolveModel(
  store: AgentStorage,
  credentials: Credentials,
  accountId: number,
  model: Selection,
): LanguageModel {
  if (model.provider === 'openai-codex')
    return createOAuthModel(credentials.oauth, accountId, model.modelId);
  const custom = customModelConfiguration(store, accountId, model);
  if (custom) {
    const config = custom.provider;
    const options = {
      name: model.provider,
      baseURL: config.baseUrl,
      apiKey: config.apiKey ?? '',
      headers: config.headers,
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        for (const [name, value] of Object.entries(config.headers))
          headers.set(name, value);
        if (
          !config.apiKey &&
          !Object.keys(config.headers).some(
            (name) => name.toLowerCase() === 'authorization',
          )
        )
          headers.delete('authorization');
        return fetch(input, { ...init, headers });
      },
    };
    return config.apiStyle === 'openai-responses'
      ? createOpenAI(options).responses(model.modelId)
      : createOpenAICompatible(options)(model.modelId);
  }
  const apiKey = credentials.key(accountId, model.provider);
  switch (model.provider) {
    case 'vercel-ai-gateway':
      return createGateway({ apiKey })(model.modelId);
    case 'openai':
      return createOpenAI({ apiKey })(model.modelId);
    case 'anthropic':
      return createAnthropic({ apiKey })(model.modelId);
    case 'google':
      return createGoogleGenerativeAI({ apiKey })(model.modelId);
    case 'openrouter':
      return createOpenAICompatible({
        name: 'openrouter',
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey,
      })(model.modelId);
    default:
      fail('PRECONDITION_FAILED', 'Configure a supported model provider.');
  }
}
