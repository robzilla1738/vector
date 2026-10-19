import { scope } from '@aux/agent';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
import type { HelperClient } from './client.js';

export { createVaultBiometryAdapter, HelperClient } from './client.js';
export { computerUseTools } from './tools.js';
export function createHelperRouter(
  { t, procedure, store }: DaemonServices,
  client: HelperClient,
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
      .query(({ input }) => {
        store.requireAccount(input.accountId);
        return client.call('permissions.status', {
          automationTargets: input.automationTargets,
        });
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
          ]),
          bundleId: z.string().optional(),
        }),
      )
      .mutation(({ input }) => {
        store.requireAccount(input.accountId);
        return client.call('permissions.request', {
          kind: input.kind,
          ...(input.bundleId ? { bundleId: input.bundleId } : {}),
        });
      }),
  });
}
export type {
  ImportedPasswordItem,
  PasswordExportFormat,
} from './password-importer.js';
export { createPasswordImporterAdapter } from './password-importer.js';
