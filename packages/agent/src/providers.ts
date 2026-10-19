import { createAnthropic } from '@ai-sdk/anthropic';
import { createGateway } from '@ai-sdk/gateway';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { LanguageModel } from 'ai';
import { z } from 'zod';
import type { Credentials } from './credentials.js';
import { createOAuthModel } from './oauth/model.js';
import type { AgentStorage } from './storage.js';
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
const customSchema = z.object({
  name: z.string().min(1),
  baseUrl: z.url(),
  headers: z.record(z.string(), z.string()).optional(),
});
export function resolveModel(
  store: AgentStorage,
  credentials: Credentials,
  accountId: number,
  model: Selection,
): LanguageModel {
  if (model.provider === 'openai-codex')
    return createOAuthModel(credentials.oauth, accountId, model.modelId);
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
    default: {
      const config = customSchema.parse(
        store.get(accountId, 'customProviders', model.provider),
      );
      return createOpenAICompatible({
        name: config.name,
        baseURL: config.baseUrl,
        apiKey,
        ...(config.headers ? { headers: config.headers } : {}),
      })(model.modelId);
    }
  }
}
