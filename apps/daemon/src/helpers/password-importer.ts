import { z } from 'zod';
import type { HelperClient } from './client.js';

const previewSchema = z.object({
  jobId: z.string(),
  format: z.string(),
  count: z.number().int().nonnegative(),
  errors: z.array(
    z.object({ row: z.number(), code: z.string(), message: z.string() }),
  ),
  nextCursor: z.number().nullable(),
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      category: z.string(),
      username: z.string(),
      urls: z.array(z.string()),
      passwordPresent: z.boolean(),
    }),
  ),
});
const itemSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum(['login', 'note']),
  username: z.string(),
  password: z.string(),
  urls: z.array(z.string()),
  notes: z.string(),
  totp: z.string(),
  createdAt: z.number().optional(),
  source: z.object({
    format: z.string(),
    fileName: z.string(),
    rowIndex: z.number(),
    externalId: z.string(),
  }),
});
const batchSchema = z.object({
  jobId: z.string(),
  items: z.array(itemSchema),
  errors: z.array(
    z.object({ row: z.number(), code: z.string(), message: z.string() }),
  ),
  count: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  nextCursor: z.number().nullable(),
});
export type ImportedPasswordItem = z.infer<typeof itemSchema>;
export type PasswordExportFormat =
  | 'csv'
  | 'bitwarden-json'
  | '1password-json'
  | '1password-1pux'
  | 'chromium-fixture';
export function createPasswordImporterAdapter(client: HelperClient) {
  return {
    pickFile: async () =>
      z
        .object({ cancelled: z.boolean(), path: z.string().nullable() })
        .parse(await client.call('import.pickFile')),
    prepare: async (input: {
      path: string;
      format: PasswordExportFormat;
      authorized: true;
    }) => previewSchema.parse(await client.call('import.prepare', input)),
    review: async (jobId: string, cursor = 0) =>
      previewSchema.parse(
        await client.call('import.review', { jobId, cursor, limit: 100 }),
      ),
    async *readAcceptedBatches(jobId: string, accepted: true) {
      let cursor: number | null = 0;
      while (cursor !== null) {
        const batch = batchSchema.parse(
          await client.call('import.commit', {
            jobId,
            accepted,
            cursor,
            limit: 100,
          }),
        );
        yield batch;
        cursor = batch.nextCursor;
      }
    },
    cancel: async (jobId: string) => client.call('import.cancel', { jobId }),
  };
}
