export type Model = {
  id: string;
  modelId: string;
  name: string;
  provider: string;
  thinkingLevels?: string[];
  reasoning?: boolean;
};
export type ModelSelection = {
  provider: string;
  modelId: string;
  thinkingLevel: string;
  fastMode: boolean;
};
export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  turnId: string;
  createdAt: number;
};
export type Session = {
  id: string;
  title: string;
  status: string;
  model: ModelSelection;
  permissionMode: string;
  transcriptRevision: number;
  queue: { id: string; timestamp: number; prompt: string; version: number }[];
  suspension?: {
    toolCallId: string;
    kind: string;
    request: Record<string, unknown>;
  } | null;
  updatedAt?: number;
  createdAt: number;
  pinned?: boolean;
  archived?: boolean;
};
