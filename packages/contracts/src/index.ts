/** Independent Aux contracts: docs/spec/daemon/core.md and agent.md. */
import { z } from 'zod';
export const VERSION = '0.2.0';
export const AUTH_SCHEME = 'AuxDaemonSessionToken';
export const AUTH_DOMAIN = 'Aux Daemon Auth v1\0';
export const AUTH_PROTOCOL = 'aux.daemon.auth.';
export const clientKindSchema = z.enum([
  'chromium',
  'agent-manager-extension',
  'password-manager-extension',
  'internal-web',
  'cli',
]);
export const accountIdSchema = z.number().int().nonnegative();
export const accountScopeSchema = z.object({ accountId: accountIdSchema });
export const sessionIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
export const sessionScopeSchema = accountScopeSchema.extend({
  sessionId: sessionIdSchema,
});
export const browserModeSchema = z.enum(['default', 'incognito']);
export const bridgeRouteSchema = accountScopeSchema.extend({
  profileId: z.string().min(1),
  browserMode: browserModeSchema.default('default'),
});
export const profileContextSchema = z.object({
  profileId: z.string().min(1),
  profilePath: z.string().optional(),
  profileIndex: accountIdSchema.optional(),
  accountId: accountIdSchema.optional(),
});
export const accountSchema = z.object({
  id: accountIdSchema,
  name: z.string(),
  provider: z.string(),
  mode: z.literal('local'),
  authStatus: z.string(),
  createdAt: z.number(),
  profileImageUrl: z.string().optional(),
  onboardingCompletedAt: z.number().optional(),
});
export const modelSelectionSchema = z.object({
  provider: z.string().min(1),
  modelId: z.string().min(1),
  thinkingLevel: z
    .enum(['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'])
    .default('medium'),
  fastMode: z.boolean().default(false),
});
export const sessionStatusSchema = z.enum([
  'idle',
  'running',
  'suspended',
  'errored',
  'interrupted',
  'aborted',
]);
export const browserBindingSchema = bridgeRouteSchema
  .omit({ accountId: true })
  .extend({
    windowId: z.number().int().optional(),
    anchorTargetId: z.string().optional(),
  });
export const runtimeConfigSchema = z.object({
  memoryExtractionDisabled: z.boolean().optional(),
  proactiveMode: z.boolean().optional(),
  strictModelSelection: z.boolean().optional(),
  finalConfirm: z.boolean().optional(),
  takeScreenshotOnEverySnapshot: z.boolean().optional(),
  workingDirs: z.array(z.string()).optional(),
});
export const permissionModeSchema = z.enum([
  'read-only',
  'guard',
  'full-access',
]);
export const createSessionSchema = accountScopeSchema.extend({
  id: sessionIdSchema.optional(),
  projectId: z.string().nullable().optional(),
  parentId: sessionIdSchema.optional(),
  title: z.string().optional(),
  trigger: z.string().optional(),
  triggerIdempotencyKey: z.string().optional(),
  routineId: z.string().optional(),
  activeTabTargetId: z.string().optional(),
  browserBinding: browserBindingSchema.optional(),
  incognito: z.boolean().optional(),
  ephemeral: z.boolean().optional(),
  runtimeConfig: runtimeConfigSchema.optional(),
  model: modelSelectionSchema.optional(),
  permissionMode: permissionModeSchema.optional(),
  permissionOverrides: z.record(z.string(), z.unknown()).optional(),
});
export const bridgeRegistrationSchema = z.object({
  method: z.literal('register'),
  connectionId: z.string().min(1),
  route: bridgeRouteSchema,
});
export const bridgeCommandSchema = z.object({
  method: z.string().min(1),
  params: z.record(z.string(), z.unknown()).optional(),
});
export type Account = z.infer<typeof accountSchema>;
export type ProfileContext = z.infer<typeof profileContextSchema>;
export type BridgeRoute = z.infer<typeof bridgeRouteSchema>;
export type BridgeCommand = z.infer<typeof bridgeCommandSchema>;
export type ModelSelection = z.infer<typeof modelSelectionSchema>;
export type SessionStatus = z.infer<typeof sessionStatusSchema>;
export type BrowserBinding = z.infer<typeof browserBindingSchema>;
export type RuntimeConfig = z.infer<typeof runtimeConfigSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export interface ProfileBinding extends ProfileContext {
  accountId: number;
  localUserId?: string;
}
export interface AccountRegistry {
  version: 1;
  currentAccountId: number;
  accounts: Account[];
  localBootstrap: { initialized: boolean };
  profileBindings: ProfileBinding[];
}
export interface Session {
  id: string;
  accountId: number;
  title: string;
  status: SessionStatus;
  createdAt: number;
  updatedAt: number;
  transcriptRevision: number;
  model?: ModelSelection;
  browserBinding?: BrowserBinding;
  ephemeral: boolean;
  incognito: boolean;
  pinned: boolean;
  archived: boolean;
  projectId?: string | null;
  parentId?: string;
  [key: string]: unknown;
}
export interface TranscriptEvent {
  id: string;
  accountId: number;
  sessionId: string;
  cursor: number;
  type: string;
  createdAt: number;
  data: unknown;
}
export interface Health {
  service: 'aux-daemon';
  version: string;
  pid: number;
  host: string;
  port: number;
  ready: boolean;
  status: 'idle' | 'running';
  startedAt: string;
  runningSessionCount: number;
  semaphore: { active: number; limit: number };
}
