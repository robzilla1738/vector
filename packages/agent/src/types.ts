import type { ModelMessage } from 'ai';
import { z } from 'zod';
import { selectionSchema } from './providers.js';
export const scope = z.object({ accountId: z.number().int().nonnegative() });
export const sessionScope = scope.extend({
  sessionId: z.string().regex(/^[\w-]{1,128}$/),
});
export const bindingSchema = z.object({
  profileId: z.string().min(1),
  browserMode: z.enum(['default', 'incognito']).default('default'),
  windowId: z.number().int().optional(),
  anchorTargetId: z.string().optional(),
});
export const runtimeSchema = z.object({
  memoryExtractionDisabled: z.boolean().optional(),
  proactiveMode: z.boolean().optional(),
  strictModelSelection: z.boolean().optional(),
  finalConfirm: z.boolean().optional(),
  takeScreenshotOnEverySnapshot: z.boolean().optional(),
  workingDirs: z.array(z.string()).optional(),
});
export const createSchema = scope.extend({
  id: z
    .string()
    .regex(/^[\w-]{1,128}$/)
    .optional(),
  title: z.string().max(500).optional(),
  projectId: z.string().nullable().optional(),
  parentId: z.string().optional(),
  routineId: z.string().optional(),
  trigger: z.string().optional(),
  triggerIdempotencyKey: z.string().optional(),
  activeTabTargetId: z.string().optional(),
  model: selectionSchema.optional(),
  browserBinding: bindingSchema.optional(),
  ephemeral: z.boolean().optional(),
  incognito: z.boolean().optional(),
  permissionMode: z
    .enum(['read-only', 'guard', 'full-access'])
    .default('guard'),
  permissionOverrides: z
    .object({
      deny: z.array(z.string()).default([]),
      allow: z.array(z.string()).default([]),
      ask: z.array(z.string()).default([]),
    })
    .optional(),
  runtimeConfig: runtimeSchema.optional(),
});
export type CreateInput = z.infer<typeof createSchema>;
export type Status =
  | 'idle'
  | 'running'
  | 'suspended'
  | 'errored'
  | 'interrupted'
  | 'aborted';
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  turnId: string;
  createdAt: number;
}
export interface Event {
  id: string;
  cursor: number;
  type: string;
  createdAt: number;
  data: unknown;
}
export interface Run {
  id: string;
  status: Status;
  createdAt: number;
  finishedAt?: number;
  error?: string;
}
export interface ToolCall {
  id: string;
  name: string;
  input: unknown;
  status: 'running' | 'suspended' | 'completed' | 'errored';
  startedAt: number;
  finishedAt?: number;
  result?: unknown;
  error?: string;
}
export interface Suspension {
  toolCallId: string;
  kind: 'approval' | 'ask-user-question' | 'action-confirmation';
  request: unknown;
  response?: unknown;
  resolvedAt?: number;
}
export interface Queued {
  id: string;
  prompt: string;
  timestamp: number;
  version: number;
  kind: 'prompt' | 'steering';
}
export interface Session extends CreateInput {
  id: string;
  title: string;
  status: Status;
  createdAt: number;
  updatedAt: number;
  transcriptRevision: number;
  ephemeral: boolean;
  incognito: boolean;
  pinned: boolean;
  archived: boolean;
  readAt: string | null;
  messages: Message[];
  events: Event[];
  runs: Run[];
  toolCalls: ToolCall[];
  queue: Queued[];
  context: ModelMessage[];
  suspensions: Suspension[];
  idempotencyKeys: string[];
  compaction?: { summary: string; messageCount: number };
  error?: string;
}
export interface Bridge {
  command(
    route: {
      accountId: number;
      profileId: string;
      browserMode: 'default' | 'incognito';
    },
    command: { method: string; params?: Record<string, unknown> },
    options?: { signal?: AbortSignal; timeoutMs?: number },
  ): Promise<unknown>;
}
