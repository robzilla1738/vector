import assert from 'node:assert/strict';
import test from 'node:test';
import type { DaemonServices } from '../http/server.js';
import { procedure, t } from '../trpc/core.js';
import { createNativeImportRouter, type ImportVault } from './native-import.js';
import type { createPasswordImporterAdapter } from './password-importer.js';

test('native review is account scoped and accepted secrets only reach Vault writes', async () => {
  const cancelled: string[] = [];
  const saved: Parameters<ImportVault['createItems']>[1] = [];
  const seen = new Set<string>();
  let sequence = 0;
  const store = {
    requireAccount(id: number) {
      assert.ok(id === 1 || id === 2);
    },
    registerAccountDeletionHandler() {},
  };
  const vault: ImportVault = {
    snapshot: () => ({ vaults: [{ id: 'personal' }] }),
    createItems: (_account, items) => {
      let created = 0;
      for (const item of items) {
        if (!seen.has(item.importProvenance.fingerprint)) {
          seen.add(item.importProvenance.fingerprint);
          saved.push(item);
          created++;
        }
      }
      return { created, skipped: items.length - created, revision: seen.size };
    },
  };
  const importer: ReturnType<typeof createPasswordImporterAdapter> = {
    pickFile: async () => ({ cancelled: true, path: null }),
    prepare: async () => ({
      jobId: `job-${++sequence}`,
      format: 'csv',
      count: 1,
      errors: [],
      nextCursor: null,
      items: [],
    }),
    review: async () => {
      throw Error('unused');
    },
    async *readAcceptedBatches(jobId) {
      yield {
        jobId,
        count: 1,
        total: 1,
        nextCursor: null,
        errors: [],
        items: [
          {
            id: 'x',
            title: 'Private note',
            category: 'note',
            username: '',
            password: '',
            urls: [],
            notes: 'synthetic secret note',
            totp: '',
            source: {
              format: 'csv',
              fileName: 'fixture.csv',
              rowIndex: 1,
              externalId: 'x',
            },
          },
        ],
      };
    },
    cancel: async (id) => {
      cancelled.push(id);
    },
  };
  const router = createNativeImportRouter(
    { t, procedure, store } as unknown as DaemonServices,
    vault,
    importer,
  );
  const caller = router.createCaller({
    clientKind: 'password-manager-extension',
    store: store as never,
  });
  const prepare = () =>
    caller.prepare({
      accountId: 1,
      vaultId: 'personal',
      path: '/tmp/synthetic.csv',
      format: 'csv',
      authorized: true,
    });
  const review = await prepare();
  await assert.rejects(
    caller.commit({ accountId: 2, jobId: review.jobId, accepted: true }),
    /does not exist/,
  );
  const result = await caller.commit({
    accountId: 1,
    jobId: review.jobId,
    accepted: true,
  });
  assert.deepEqual(result, { created: 1, skipped: 0, revision: 1 });
  assert.ok(!JSON.stringify(result).includes('synthetic'));
  assert.equal(saved[0]?.category, 'secure-note');
  assert.equal(saved[0]?.notes, 'synthetic secret note');
  assert.equal(saved[0]?.agentAccessPolicy, 'while-unlocked');
  assert.equal(saved[0]?.loginFields, undefined);
  const duplicate = await prepare();
  assert.equal(
    (
      await caller.commit({
        accountId: 1,
        jobId: duplicate.jobId,
        accepted: true,
      })
    ).skipped,
    1,
  );
  await assert.rejects(
    caller.commit({ accountId: 1, jobId: duplicate.jobId, accepted: true }),
    /does not exist/,
  );
  assert.deepEqual(cancelled, [review.jobId, duplicate.jobId]);
});
