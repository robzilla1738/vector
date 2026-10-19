import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
import {
  freshVerificationSchema,
  type PasskeyVaultAdapter,
  proofSchema,
} from './schema.js';
import { PasskeyService } from './service.js';

export type { FreshVerification, PasskeyVaultAdapter } from './schema.js';
export { PasskeyService } from './service.js';

const scope = z
  .object({
    accountId: z.number().int().nonnegative(),
    profileId: z.string().min(1).max(256),
    browserMode: z.enum(['default', 'incognito']),
  })
  .strict();
export function createPasskeyRouter(
  { t, procedure, store }: DaemonServices,
  vault: PasskeyVaultAdapter,
) {
  const service = new PasskeyService(store, vault);
  store.registerAccountDeletionHandler((id) => service.clearEphemeral(id));
  const privateProcedure = procedure.use(({ ctx, next }) => {
    if (ctx.clientKind !== 'password-manager-extension')
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Passkeys require Aux Vault.',
      });
    return next();
  });
  return {
    service,
    router: t.router({
      retirePrivateSession: procedure
        .input(
          scope.extend({
            browserMode: z.literal('incognito'),
            profileSession: z.string().uuid(),
          }),
        )
        .mutation(({ ctx, input }) => {
          if (ctx.clientKind !== 'chromium')
            throw new TRPCError({ code: 'FORBIDDEN' });
          store.requireAccount(input.accountId);
          service.retirePrivateSession(
            input.accountId,
            input.profileId,
            input.profileSession,
          );
          return { retired: true };
        }),
      begin: privateProcedure
        .input(scope.extend({ proof: proofSchema }))
        .mutation(({ input }) => service.begin(input, input.proof)),
      confirm: privateProcedure
        .input(
          scope.extend({
            requestId: z.string().uuid(),
            verification: freshVerificationSchema,
            selectedId: z.string().max(128).optional(),
            userPresence: z.literal(true),
          }),
        )
        .mutation(({ input }) =>
          service.confirm(
            input,
            input.requestId,
            input.verification,
            input.selectedId,
          ),
        ),
      cancel: privateProcedure
        .input(scope.extend({ requestId: z.string().uuid() }))
        .mutation(({ input }) => service.cancel(input, input.requestId)),
      clearEphemeral: privateProcedure.input(scope).mutation(({ input }) => {
        store.requireAccount(input.accountId);
        if (
          input.browserMode !== 'incognito' ||
          !store
            .bindings()
            .some(
              (b) =>
                b.accountId === input.accountId &&
                b.profileId === input.profileId,
            )
        )
          throw new TRPCError({ code: 'FORBIDDEN' });
        service.clearEphemeral(input.accountId, input.profileId);
        return { cleared: true };
      }),
    }),
  };
}
