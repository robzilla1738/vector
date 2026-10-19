import { fail, scope } from '@aux/agent';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
import type { HelperClient } from './client.js';

export { createVaultBiometryAdapter, HelperClient } from './client.js';
export { computerUseTools } from './tools.js';
export function createHelperRouter(
  { t, procedure, store }: DaemonServices,
  client: HelperClient,
  notifications?: HelperClient,
) {
  return t.router({
    status: procedure.input(scope).query(async ({ input }) => {
      store.requireAccount(input.accountId);
      return client.call('capabilities');
    }),
    permissions: procedure
      .input(
        scope.extend({
          automationTargets: z.array(z.string()).max(20).default([]),
        }),
      )
      .query(async ({ input }) => {
        store.requireAccount(input.accountId);
        const permissions = z.record(z.string(), z.unknown()).parse(
          await client.call('permissions.status', {
            automationTargets: input.automationTargets,
          }),
        );
        return {
          ...permissions,
          notifications: notifications
            ? await notifications.call('notifications.status')
            : { state: 'unavailable' },
        };
      }),
    requestPermission: procedure
      .input(
        scope.extend({
          kind: z.enum([
            'accessibility',
            'screenRecording',
            'contacts',
            'automation',
            'fullDiskAccess',
            'notifications',
          ]),
          bundleId: z.string().optional(),
        }),
      )
      .mutation(({ input }) => {
        store.requireAccount(input.accountId);
        if (input.kind === 'notifications') {
          if (!notifications)
            fail(
              'PRECONDITION_FAILED',
              'The notification helper is unavailable.',
            );
          return notifications.call('permissions.request', {
            kind: input.kind,
          });
        }
        return client.call('permissions.request', {
          kind: input.kind,
          ...(input.bundleId ? { bundleId: input.bundleId } : {}),
        });
      }),
  });
}
export { createHelperCaptureAdapter } from './capture.js';
export { createNativeImportRouter, type ImportVault } from './native-import.js';
export type {
  ImportedPasswordItem,
  PasswordExportFormat,
} from './password-importer.js';
export { createPasswordImporterAdapter } from './password-importer.js';
