import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
import { importInput, parseLocalImport } from '../import/local.js';
import { generatePassword, generatorOptions } from '../passwords/generator.js';
import { oneTimeCode } from '../passwords/totp.js';
import {
  encryptedRecordSchema,
  itemFields,
  itemPatchSchema,
  recordId,
  vaultFields,
} from './schema.js';
import type { VaultService } from './service.js';
import { lockTimeoutMinutes, vaultSettings } from './settings.js';

export type { VaultBiometryAdapter } from './service.js';
export { VaultService } from './service.js';

const scope = z.object({ accountId: z.number().int().nonnegative() });
const itemScope = scope.extend({ itemId: recordId });
const vaultScope = scope.extend({ vaultId: recordId });
const unlockPassword = z.string().min(1).max(1024);
const newPassword = z.string().min(8).max(1024);
export function createVaultRouters(
  { t, procedure, store }: DaemonServices,
  vault: VaultService,
) {
  const auth = t.router({
    status: procedure
      .input(scope)
      .query(({ input }) => vault.status(input.accountId)),
    setup: procedure
      .input(scope.extend({ password: newPassword }))
      .mutation(({ input }) => vault.setup(input.accountId, input.password)),
    unlock: procedure
      .input(scope.extend({ password: unlockPassword }))
      .mutation(({ input }) => vault.unlock(input.accountId, input.password)),
    lock: procedure.input(scope).mutation(({ input }) => {
      store.requireAccount(input.accountId);
      return vault.lock(input.accountId);
    }),
    lockAll: procedure.mutation(() => {
      for (const account of store.accounts()) vault.lock(account.id);
      return { locked: true };
    }),
    unlockAll: procedure
      .input(scope.extend({ password: unlockPassword }))
      .mutation(async ({ input }) => {
        store.requireAccount(input.accountId);
        const accounts = [];
        for (const account of store.accounts()) {
          if (!vault.status(account.id).initialized) continue;
          try {
            await vault.unlock(account.id, input.password);
            accounts.push({ accountId: account.id, locked: false });
          } catch (error) {
            if (!(error instanceof TRPCError) || error.code !== 'UNAUTHORIZED')
              throw error;
            accounts.push({
              accountId: account.id,
              locked: true,
              error: 'The password did not unlock this Vault.',
            });
          }
        }
        return {
          accounts,
          unlockedCount: accounts.filter((account) => !account.locked).length,
        };
      }),
    biometricStatus: procedure
      .input(scope)
      .query(({ input }) => vault.biometricStatus(input.accountId)),
    biometricEnroll: procedure
      .input(scope.extend({ currentPassword: unlockPassword }))
      .mutation(({ input }) =>
        vault.enrollBiometry(input.accountId, input.currentPassword),
      ),
    biometricRemove: procedure
      .input(scope)
      .mutation(({ input }) => vault.removeBiometry(input.accountId)),
    biometricUnlock: procedure
      .input(scope)
      .mutation(({ input }) => vault.unlockBiometry(input.accountId)),
    biometricUnlockAll: procedure.input(scope).mutation(() => {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message:
          'Choose an account and unlock its Vault explicitly with Touch ID.',
      });
    }),
    verifyRecovery: procedure
      .input(scope.extend({ recoveryKey: z.string().max(256) }))
      .mutation(({ input }) =>
        vault.verifyRecovery(input.accountId, input.recoveryKey),
      ),
    recoverPassword: procedure
      .input(scope.extend({ recoveryKey: z.string().max(256), newPassword }))
      .mutation(({ input }) =>
        vault.recoverPassword(
          input.accountId,
          input.recoveryKey,
          input.newPassword,
        ),
      ),
    replaceRecoveryKey: procedure
      .input(scope.extend({ currentPassword: unlockPassword }))
      .mutation(({ input }) =>
        vault.replaceRecoveryKey(input.accountId, input.currentPassword),
      ),
    changePassword: procedure
      .input(scope.extend({ currentPassword: unlockPassword, newPassword }))
      .mutation(({ input }) =>
        vault.changePassword(
          input.accountId,
          input.currentPassword,
          input.newPassword,
        ),
      ),
  });
  return {
    passwordManager: t.router({
      auth,
      settings: t.router({
        get: procedure
          .input(scope)
          .query(({ input }) => vault.settings(input.accountId)),
        set: procedure
          .input(scope.extend({ settings: vaultSettings }))
          .mutation(({ input }) =>
            vault.setSettings(input.accountId, input.settings),
          ),
        update: procedure
          .input(
            scope.extend({
              patch: z
                .object({ lockTimeoutMinutes: lockTimeoutMinutes.optional() })
                .strict(),
            }),
          )
          .mutation(({ input }) =>
            vault.setSettings(input.accountId, {
              lockTimeoutMinutes:
                input.patch.lockTimeoutMinutes ??
                vault.settings(input.accountId).lockTimeoutMinutes,
            }),
          ),
        reset: procedure
          .input(scope)
          .mutation(({ input }) =>
            vault.setSettings(input.accountId, vaultSettings.parse({})),
          ),
      }),
      accounts: t.router({
        list: procedure.query(() =>
          store.accounts().map((account) => ({
            ...account,
            vault: vault.status(account.id),
          })),
        ),
        select: procedure.input(scope).mutation(({ input }) => ({
          accountId: store.setCurrent(input.accountId),
        })),
        connectCurrent: procedure.input(scope).mutation(({ input }) => {
          store.requireAccount(input.accountId);
          return { accountId: input.accountId, mode: 'local' };
        }),
        setSyncEnabled: procedure
          .input(scope.extend({ enabled: z.boolean() }))
          .mutation(({ input }) => {
            store.requireAccount(input.accountId);
            if (input.enabled)
              throw new TRPCError({
                code: 'NOT_IMPLEMENTED',
                message:
                  'This Vault stores data locally. Cloud synchronization is unavailable.',
              });
            return { enabled: false, localOnly: true };
          }),
        disconnect: procedure.input(scope).mutation(({ input }) => {
          store.requireAccount(input.accountId);
          return vault.lock(input.accountId);
        }),
      }),
      generatePassword: procedure
        .input(generatorOptions)
        .mutation(({ input }) => generatePassword(input)),
    }),
    vault: t.router({
      getAutofillCandidates: procedure
        .input(
          scope.extend({ documentUrl: z.string().url().max(16384) }).strict(),
        )
        .query(({ ctx, input }) => {
          if (ctx.clientKind !== 'password-manager-extension')
            throw new TRPCError({
              code: 'FORBIDDEN',
              message:
                'Only the Vault extension can list inline fill candidates.',
            });
          return vault.autofillCandidates(input.accountId, input.documentUrl);
        }),
      getSnapshot: procedure
        .input(scope)
        .query(({ input }) => vault.snapshot(input.accountId)),
      getSnapshotRevision: procedure.input(scope).query(({ input }) => {
        vault.snapshot(input.accountId);
        return vault.cipherSnapshot(input.accountId).revision;
      }),
      listVaults: procedure
        .input(scope)
        .query(({ input }) => vault.snapshot(input.accountId).vaults),
      getItem: procedure
        .input(itemScope)
        .query(({ input }) => vault.getItem(input.accountId, input.itemId)),
      getOneTimeCode: procedure.input(itemScope).query(({ input }) => {
        const item = vault.getItem(input.accountId, input.itemId);
        if (item.state !== 'active' || item.reprompt || !item.loginFields?.totp)
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'This saved item has no available one-time code.',
          });
        try {
          return oneTimeCode(item.loginFields.totp);
        } catch {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'This saved one-time code setup is invalid or unsupported.',
          });
        }
      }),
      getItemHistory: procedure
        .input(itemScope)
        .query(({ input }) => vault.itemHistory(input.accountId, input.itemId)),
      restoreItem: procedure
        .input(
          itemScope.extend({
            revision: z.number().int().positive(),
            baseRevision: z.number().int().positive(),
          }),
        )
        .mutation(({ input }) =>
          vault.restoreItem(
            input.accountId,
            input.itemId,
            input.revision,
            input.baseRevision,
          ),
        ),
      createItem: procedure
        .input(scope.extend({ item: itemFields }))
        .mutation(
          ({ input }) =>
            vault.createItems(input.accountId, [input.item]).items[0],
        ),
      createItems: procedure
        .input(scope.extend({ items: z.array(itemFields).min(1).max(20000) }))
        .mutation(({ input }) =>
          vault.createItems(input.accountId, input.items),
        ),
      updateItem: procedure
        .input(
          itemScope.extend({
            patch: itemPatchSchema,
            baseRevision: z.number().int().positive().optional(),
          }),
        )
        .mutation(({ input }) =>
          vault.updateItem(
            input.accountId,
            input.itemId,
            input.patch,
            input.baseRevision,
          ),
        ),
      deleteItem: procedure
        .input(itemScope)
        .mutation(({ input }) =>
          vault.deleteItem(input.accountId, input.itemId),
        ),
      createVault: procedure
        .input(scope.extend(vaultFields.shape))
        .mutation(({ input }) => vault.createVault(input.accountId, input)),
      updateVault: procedure
        .input(
          vaultScope.extend({
            name: z.string().trim().min(1).max(1024).optional(),
            appearance: z.record(z.string(), z.string()).optional(),
            baseRevision: z.number().int().positive().optional(),
          }),
        )
        .mutation(({ input }) =>
          vault.updateVault(
            input.accountId,
            input.vaultId,
            input,
            input.baseRevision,
          ),
        ),
      deleteVault: procedure
        .input(vaultScope)
        .mutation(({ input }) =>
          vault.deleteVault(input.accountId, input.vaultId),
        ),
      ensureInitialPersonalVault: procedure
        .input(scope)
        .mutation(({ input }) => {
          const existing = vault.snapshot(input.accountId).vaults[0];
          return (
            existing ??
            vault.createVault(input.accountId, {
              name: 'Personal',
              type: 'personal',
              appearance: {},
            })
          );
        }),
      clear: procedure
        .input(scope.extend({ confirmed: z.literal(true) }))
        .mutation(({ input }) => vault.clear(input.accountId)),
      getAgentAutofillPayload: procedure
        .input(
          itemScope.extend({
            targetUrl: z.string().url(),
            agentSessionId: recordId,
            toolCallId: recordId.optional(),
          }),
        )
        .mutation(({ ctx, input }) => {
          if (ctx.clientKind !== 'password-manager-extension')
            throw new TRPCError({
              code: 'FORBIDDEN',
              message:
                'Only the authorized Vault actuator can receive fill credentials.',
            });
          const sessionSchema = z
            .object({
              id: recordId,
              accountId: z.number(),
              browserBinding: z
                .object({
                  profileId: z.string(),
                  browserMode: z.enum(['default', 'incognito']),
                })
                .passthrough(),
              suspensions: z.array(
                z
                  .object({
                    toolCallId: recordId,
                    kind: z.string(),
                    request: z.unknown(),
                    response: z.unknown().optional(),
                    resolvedAt: z.number().optional(),
                  })
                  .passthrough(),
              ),
            })
            .passthrough();
          const session = sessionSchema.safeParse(
            store.get(input.accountId, 'sessions', input.agentSessionId),
          );
          if (
            !session.success ||
            session.data.accountId !== input.accountId ||
            session.data.id !== input.agentSessionId
          )
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'The owning browser-bound task does not exist.',
            });
          const target = new URL(input.targetUrl);
          if (!['http:', 'https:'].includes(target.protocol))
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Vault fill requires an HTTP or HTTPS page.',
            });
          const operationSchema = z.object({
            operation: z.object({
              kind: z.literal('vault-autofill'),
              itemId: recordId,
              targetUrl: z.string(),
              profileId: z.string(),
              browserMode: z.enum(['default', 'incognito']),
            }),
          });
          const approval = session.data.suspensions.find((suspension) => {
            if (
              suspension.kind !== 'approval' ||
              !suspension.resolvedAt ||
              (input.toolCallId && suspension.toolCallId !== input.toolCallId)
            )
              return false;
            const response = z
              .object({
                verdict: z.literal('allow'),
                consumedAt: z.number().optional(),
              })
              .safeParse(suspension.response);
            if (!response.success || response.data.consumedAt) return false;
            const request = operationSchema.safeParse(suspension.request);
            return (
              request.success &&
              request.data.operation.itemId === input.itemId &&
              request.data.operation.targetUrl === target.href &&
              request.data.operation.profileId ===
                session.data.browserBinding.profileId &&
              request.data.operation.browserMode ===
                session.data.browserBinding.browserMode
            );
          });
          if (!approval)
            throw new TRPCError({
              code: 'FORBIDDEN',
              message:
                'Approve this exact Vault item, page and browser context before filling.',
            });
          const item = vault.getItem(input.accountId, input.itemId);
          if (
            item.agentAccessPolicy === 'never' ||
            item.reprompt ||
            item.state !== 'active' ||
            !item.loginFields ||
            !item.urls.some((url) => new URL(url).origin === target.origin)
          )
            throw new TRPCError({
              code: 'FORBIDDEN',
              message:
                'This Vault item cannot be filled into the approved page.',
            });
          approval.response = {
            ...z.record(z.string(), z.unknown()).parse(approval.response),
            consumedAt: Date.now(),
          };
          store.set(
            input.accountId,
            'sessions',
            input.agentSessionId,
            session.data,
          );
          return {
            itemId: item.id,
            targetUrl: target.href,
            profileId: session.data.browserBinding.profileId,
            browserMode: session.data.browserBinding.browserMode,
            username: item.loginFields.username,
            password: item.loginFields.password,
          };
        }),
    }),
    cipher: t.router({
      getUnlockContext: procedure
        .input(scope)
        .query(({ input }) => vault.unlockContext(input.accountId)),
      getSnapshot: procedure
        .input(scope)
        .query(({ input }) => vault.cipherSnapshot(input.accountId)),
      getRevision: procedure
        .input(scope)
        .query(({ input }) => vault.cipherSnapshot(input.accountId).revision),
      putVault: procedure
        .input(
          scope.extend({
            record: encryptedRecordSchema,
            baseRevision: z.number().int().nonnegative().optional(),
          }),
        )
        .mutation(({ input }) =>
          vault.cipherPut(
            input.accountId,
            'vault',
            input.record,
            input.baseRevision,
          ),
        ),
      putItem: procedure
        .input(
          scope.extend({
            record: encryptedRecordSchema,
            baseRevision: z.number().int().nonnegative().optional(),
          }),
        )
        .mutation(({ input }) =>
          vault.cipherPut(
            input.accountId,
            'item',
            input.record,
            input.baseRevision,
          ),
        ),
      deleteItem: procedure
        .input(
          itemScope.extend({
            baseRevision: z.number().int().nonnegative().optional(),
          }),
        )
        .mutation(({ input }) =>
          vault.cipherDelete(
            input.accountId,
            'item',
            input.itemId,
            input.baseRevision,
          ),
        ),
      deleteVault: procedure
        .input(
          vaultScope.extend({
            baseRevision: z.number().int().nonnegative().optional(),
          }),
        )
        .mutation(({ input }) =>
          vault.cipherDelete(
            input.accountId,
            'vault',
            input.vaultId,
            input.baseRevision,
          ),
        ),
      listItemHistory: procedure
        .input(itemScope)
        .query(({ input }) =>
          vault.cipherHistory(input.accountId, input.itemId),
        ),
    }),
    passwordImport: t.router({
      preview: procedure
        .input(scope.extend(importInput.shape))
        .mutation(({ input }) => {
          vault.snapshot(input.accountId);
          const parsed = parseLocalImport(input);
          return {
            total: parsed.total,
            valid: parsed.items.length,
            errors: parsed.errors,
            items: parsed.items.map((item) => ({
              title: item.title,
              category: item.category,
            })),
          };
        }),
      commit: procedure
        .input(
          scope.extend(importInput.shape).extend({ accepted: z.literal(true) }),
        )
        .mutation(({ input }) => {
          const parsed = parseLocalImport(input);
          const result = vault.createItems(input.accountId, parsed.items);
          return {
            ...result,
            items: result.items.map((item) => ({
              id: item.id,
              title: item.title,
            })),
            errors: parsed.errors,
          };
        }),
    }),
  };
}
