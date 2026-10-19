import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { accountScopeSchema, profileContextSchema } from '@aux/contracts';
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Store } from '../storage/store.js';
export interface RpcContext {
  clientKind: string | null;
  store: Store;
}
export const t = initTRPC.context<RpcContext>().create({
  isDev: false,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      message:
        error.code === 'INTERNAL_SERVER_ERROR'
          ? 'Operation failed'
          : shape.message,
      data: { ...shape.data, stack: undefined },
    };
  },
});
export const procedure = t.procedure
  .use(({ ctx, next }) => {
    if (!ctx.clientKind)
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    return next();
  })
  .use(async ({ next }) => {
    try {
      return await next();
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND')
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Account not found',
        });
      throw error;
    }
  });
const profile = profileContextSchema.extend({
  localUserId: z.string().optional(),
});
const key = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z][A-Za-z0-9._-]*$/);
// Explicit Aux setting inventory; unlisted setting names fail rather than accepting executable or mistyped data.
export const settingTypes: Record<string, z.ZodType> = {
  theme: z.enum(['light', 'dark', 'system']),
  contextAwarenessEnabled: z.boolean(),
  sidebarRecentLimit: z.number().int().min(1).max(200),
  completionSoundEnabled: z.boolean(),
  defaultModel: z
    .object({ provider: z.string(), modelId: z.string() })
    .passthrough(),
  permissionMode: z.enum(['read-only', 'guard', 'full-access']),
  followActiveTab: z.boolean(),
};
export const settingDefaults = {
  theme: 'system',
  contextAwarenessEnabled: false,
  sidebarRecentLimit: 20,
  completionSoundEnabled: true,
  permissionMode: 'guard',
  followActiveTab: false,
};
export function createCoreRouter(
  store: Store,
  onInvalidation: (event: unknown) => void = () => {},
) {
  const scope = accountScopeSchema;
  const ensure = (id: number) => store.requireAccount(id);
  return t.router({
    accounts: t.router({
      list: procedure.query(() => store.registry()),
      summary: procedure.query(() => ({
        ...store.registry(),
        hasSessions: Object.fromEntries(
          store
            .accounts()
            .map((account) => [
              account.id,
              Object.keys(store.all(account.id, 'sessions')).length > 0,
            ]),
        ),
      })),
      get: procedure
        .input(scope)
        .query(({ input }) => store.account(input.accountId) ?? null),
      current: procedure.query(() => store.current()),
      add: procedure
        .input(
          z.object({
            name: z.string().min(1),
            provider: z.string().default('local'),
            mode: z.literal('local').default('local'),
          }),
        )
        .mutation(({ input }) => store.add(input.name, input.provider)),
      update: procedure
        .input(
          scope.extend({
            name: z.string().min(1).optional(),
            profileImageUrl: z.string().url().optional(),
          }),
        )
        .mutation(({ input }) => {
          const { accountId, ...patch } = input;
          return store.update(accountId, patch);
        }),
      setCurrent: procedure
        .input(scope)
        .mutation(({ input }) => store.setCurrent(input.accountId)),
      ensureProfileAccount: procedure
        .input(profile)
        .mutation(({ input }) => store.bind(input)),
      resolveProfileAccount: procedure
        .input(profile)
        .mutation(({ input }) => store.bind(input)),
      resolveProfileAccountByProfile: procedure
        .input(profile)
        .mutation(({ input }) => store.bind(input)),
      bindProfile: procedure
        .input(profile)
        .mutation(({ input }) => store.bind(input)),
      removeProfileBinding: procedure
        .input(
          z
            .object({
              profileId: z.string().optional(),
              profilePath: z.string().optional(),
            })
            .refine((v) => v.profileId || v.profilePath),
        )
        .mutation(({ input }) => store.removeBinding(input)),
      completeOnboarding: procedure
        .input(scope)
        .mutation(({ input }) =>
          store.update(input.accountId, { onboardingCompletedAt: Date.now() }),
        ),
      deleteAccount: procedure
        .input(scope)
        .mutation(async ({ input }) => store.deleteAccount(input.accountId)),
    }),
    settings: t.router({
      get: procedure.input(scope.extend({ key })).query(({ input }) => {
        ensure(input.accountId);
        return (
          store.get(input.accountId, 'settings', input.key) ??
          settingDefaults[input.key as keyof typeof settingDefaults] ??
          null
        );
      }),
      getAll: procedure.input(scope).query(({ input }) => ({
        ...settingDefaults,
        ...store.all(input.accountId, 'settings'),
      })),
      set: procedure
        .input(scope.extend({ key, value: z.unknown() }))
        .mutation(({ input }) => {
          const schema = settingTypes[input.key];
          if (!schema)
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Unknown setting',
            });
          const value = schema.parse(input.value);
          store.set(input.accountId, 'settings', input.key, value);
          onInvalidation({
            accountId: input.accountId,
            domain: 'settings',
            key: input.key,
          });
          return value;
        }),
      getCompletionSound: procedure.input(scope).query(({ input }) => ({
        enabled:
          store.get(input.accountId, 'settings', 'completionSoundEnabled') ??
          true,
        custom:
          store.get(input.accountId, 'settings', 'completionSound') ?? null,
      })),
      setCompletionSound: procedure
        .input(
          scope.extend({
            filename: z
              .string()
              .min(1)
              .max(255)
              .refine((name) => !name.includes('/') && !name.includes('\\')),
            mimeType: z.enum([
              'audio/mpeg',
              'audio/wav',
              'audio/ogg',
              'audio/mp4',
              'audio/webm',
            ]),
            audio: z.string().min(1).max(14_000_000),
          }),
        )
        .mutation(({ input }) => {
          const bytes = Buffer.from(input.audio, 'base64');
          if (
            !bytes.length ||
            bytes.length > 10 * 1024 * 1024 ||
            bytes.toString('base64') !== input.audio
          )
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid audio data',
            });
          writeFileSync(
            store.safeFile(input.accountId, 'completion-sound'),
            bytes,
            { mode: 0o600 },
          );
          const value = { filename: input.filename, mimeType: input.mimeType };
          store.set(input.accountId, 'settings', 'completionSound', value);
          return value;
        }),
      resetCompletionSound: procedure.input(scope).mutation(({ input }) => {
        rmSync(store.safeFile(input.accountId, 'completion-sound'), {
          force: true,
        });
        store.set(input.accountId, 'settings', 'completionSound', null);
        return { success: true };
      }),
      readContextFile: procedure
        .input(
          scope.extend({
            filename: z.enum(['instructions.md', 'context.md', 'profile.md']),
          }),
        )
        .query(({ input }) => {
          const path = store.safeFile(input.accountId, input.filename);
          return {
            content: existsSync(path) ? readFileSync(path, 'utf8') : '',
          };
        }),
      writeContextFile: procedure
        .input(
          scope.extend({
            filename: z.enum(['instructions.md', 'context.md', 'profile.md']),
            content: z.string().max(1048576),
          }),
        )
        .mutation(({ input }) => {
          writeFileSync(
            store.safeFile(input.accountId, input.filename),
            input.content,
            { mode: 0o600 },
          );
          return { success: true };
        }),
    }),
  });
}
