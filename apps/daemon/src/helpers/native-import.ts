/** Reviewed export batches go straight to encrypted Vault writes; native/adblock-import.md. */
import { createHash } from 'node:crypto';
import { fail, scope } from '@aux/agent';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
import type {
  createPasswordImporterAdapter,
  ImportedPasswordItem,
} from './password-importer.js';

type Importer = ReturnType<typeof createPasswordImporterAdapter>;
interface ImportFields {
  vaultId: string;
  category: string;
  title: string;
  subtitle: string;
  urls: string[];
  tags: string[];
  favorite: boolean;
  state: 'active';
  reprompt: boolean;
  agentAccessPolicy: 'while-unlocked';
  notes: string;
  loginFields?: { username: string; password: string; totp?: string };
  sections: {
    title: string;
    fields: { name: string; value: string; secret: boolean }[];
  }[];
  importProvenance: { source: string; fingerprint: string };
}
export interface ImportVault {
  snapshot(accountId: number): { vaults: { id: string }[] };
  createItems(
    accountId: number,
    items: ImportFields[],
  ): { created: number; skipped: number; revision: number };
}
function fields(item: ImportedPasswordItem, vaultId: string): ImportFields {
  const data = {
    vaultId,
    category: item.category === 'note' ? 'secure-note' : 'login',
    title: item.title.trim() || 'Imported item',
    subtitle: item.category === 'login' ? item.username : '',
    urls: item.urls,
    tags: [],
    favorite: false,
    state: 'active' as const,
    reprompt: false,
    agentAccessPolicy: 'while-unlocked' as const,
    notes: item.notes,
    ...(item.category === 'login'
      ? {
          loginFields: {
            username: item.username,
            password: item.password,
            ...(item.totp ? { totp: item.totp } : {}),
          },
        }
      : {}),
    sections: [],
  };
  // Content-based dedup survives reordered/renamed exports; the digest stays encrypted.
  const fingerprint = createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
  return {
    ...data,
    importProvenance: { source: item.source.format, fingerprint },
  };
}
interface Job {
  accountId: number;
  vaultId: string;
  expires: number;
  busy: boolean;
}
export function createNativeImportRouter(
  { t, procedure, store }: DaemonServices,
  vault: ImportVault,
  importer: Importer,
) {
  const jobs = new Map<string, Job>();
  const destination = (accountId: number, vaultId: string) => {
    store.requireAccount(accountId);
    if (!vault.snapshot(accountId).vaults.some((entry) => entry.id === vaultId))
      fail('NOT_FOUND', 'Import destination Vault does not exist');
  };
  const owned = (accountId: number, jobId: string) => {
    store.requireAccount(accountId);
    const job = jobs.get(jobId);
    if (!job || job.accountId !== accountId)
      fail('NOT_FOUND', 'Import review job does not exist');
    if (job.expires < Date.now()) {
      jobs.delete(jobId);
      void importer.cancel(jobId).catch(() => {});
      fail(
        'PRECONDITION_FAILED',
        'Import review expired; choose the export again',
      );
    }
    if (job.busy) fail('CONFLICT', 'This import is already being committed');
    return job;
  };
  store.registerAccountDeletionHandler(async (accountId) => {
    for (const [id, job] of jobs)
      if (job.accountId === accountId) {
        jobs.delete(id);
        await importer.cancel(id).catch(() => {});
      }
  });
  const jobScope = scope.extend({ jobId: z.string().min(1).max(200) });
  return t.router({
    pickFile: procedure.input(scope).mutation(({ input }) => {
      store.requireAccount(input.accountId);
      return importer.pickFile();
    }),
    prepare: procedure
      .input(
        scope.extend({
          vaultId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/),
          path: z.string().min(1).max(8192),
          format: z.enum([
            'csv',
            'bitwarden-json',
            '1password-json',
            '1password-1pux',
            'chromium-fixture',
          ]),
          authorized: z.literal(true),
        }),
      )
      .mutation(async ({ input }) => {
        destination(input.accountId, input.vaultId);
        for (const [id, job] of jobs)
          if (job.expires < Date.now()) {
            jobs.delete(id);
            await importer.cancel(id).catch(() => {});
          }
        if (jobs.size >= 32)
          fail(
            'PRECONDITION_FAILED',
            'Finish or cancel an existing import first',
          );
        const preview = await importer.prepare(input);
        try {
          destination(input.accountId, input.vaultId);
        } catch {
          await importer.cancel(preview.jobId).catch(() => {});
          fail(
            'PRECONDITION_FAILED',
            'Import destination changed while preparing the review',
          );
        }
        jobs.set(preview.jobId, {
          accountId: input.accountId,
          vaultId: input.vaultId,
          expires: Date.now() + 9 * 60_000,
          busy: false,
        });
        return preview;
      }),
    review: procedure
      .input(
        jobScope.extend({ cursor: z.number().int().nonnegative().default(0) }),
      )
      .query(({ input }) => {
        owned(input.accountId, input.jobId);
        return importer.review(input.jobId, input.cursor);
      }),
    cancel: procedure.input(jobScope).mutation(async ({ input }) => {
      owned(input.accountId, input.jobId);
      jobs.delete(input.jobId);
      await importer.cancel(input.jobId);
      return { cancelled: true };
    }),
    commit: procedure
      .input(jobScope.extend({ accepted: z.literal(true) }))
      .mutation(async ({ input }) => {
        const job = owned(input.accountId, input.jobId);
        destination(input.accountId, job.vaultId);
        job.busy = true;
        let created = 0,
          skipped = 0,
          revision = 0;
        try {
          for await (const batch of importer.readAcceptedBatches(
            input.jobId,
            true,
          )) {
            if (jobs.get(input.jobId) !== job)
              fail('CONFLICT', 'Import review was invalidated');
            if (batch.jobId !== input.jobId)
              fail('CONFLICT', 'Importer returned a different review job');
            destination(input.accountId, job.vaultId);
            const result = vault.createItems(
              input.accountId,
              batch.items.map((item) => fields(item, job.vaultId)),
            );
            created += result.created;
            skipped += result.skipped;
            revision = result.revision;
            // No plaintext result or source errors are returned from the accepted private batch.
          }
          return { created, skipped, revision };
        } catch {
          fail(
            'PRECONDITION_FAILED',
            `Import stopped after ${created} encrypted writes; ${skipped} duplicates skipped. Review the export again to resume safely.`,
          );
        } finally {
          jobs.delete(input.jobId);
          await importer.cancel(input.jobId).catch(() => {});
        }
      }),
  });
}
