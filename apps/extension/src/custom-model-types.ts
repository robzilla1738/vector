export type ThinkingLevel =
  | 'off'
  | 'minimal'
  | 'low'
  | 'medium'
  | 'high'
  | 'xhigh'
  | 'max';
export const thinkingLevels: ThinkingLevel[] = [
  'off',
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
  'max',
];
export type ModelConfig = {
  id: string;
  name?: string;
  inputModalities: ('text' | 'image' | 'pdf')[];
  contextWindow?: number;
  outputLimit?: number;
  reasoning: boolean;
  thinkingLevels: ThinkingLevel[];
  thinkingLevelMapping?: Partial<Record<ThinkingLevel, string>>;
  costs?: { inputPerMillion?: number; outputPerMillion?: number };
};
export type CustomProvider = {
  providerId: string;
  name: string;
  baseUrl: string;
  apiStyle: 'openai-compatible' | 'openai-responses';
  modelIds: string[];
  models: ModelConfig[];
  hasApiKey: boolean;
  headerNames: string[];
};
