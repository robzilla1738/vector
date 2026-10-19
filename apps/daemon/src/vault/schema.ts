import { z } from 'zod';
import { kdfSchema, sealedSchema } from '../cipher/crypto.js';
export const recordId = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
export const itemFields = z.object({
  vaultId: recordId,
  category: z.string().min(1).max(64),
  title: z.string().trim().min(1).max(1024),
  subtitle: z.string().max(4096).default(''),
  urls: z.array(z.string().url().max(8192)).max(100).default([]),
  tags: z.array(z.string().max(128)).max(100).default([]),
  favorite: z.boolean().default(false),
  state: z.enum(['active', 'archived', 'trashed']).default('active'),
  reprompt: z.boolean().default(false),
  agentAccessPolicy: z
    .enum(['always', 'while-unlocked', 'never'])
    .default('while-unlocked'),
  notes: z.string().max(2_000_000).default(''),
  loginFields: z
    .object({
      username: z.string().max(65536).default(''),
      password: z.string().max(65536).default(''),
      totp: z.string().max(4096).optional(),
    })
    .optional(),
  sections: z
    .array(
      z.object({
        title: z.string().max(1024),
        fields: z
          .array(
            z.object({
              name: z.string().max(1024),
              value: z.string().max(2_000_000),
              secret: z.boolean().default(true),
            }),
          )
          .max(500),
      }),
    )
    .max(100)
    .default([]),
  importProvenance: z
    .object({ source: z.string().max(128), fingerprint: z.string().max(128) })
    .optional(),
});
export const itemPatchSchema = z
  .object({
    vaultId: recordId.optional(),
    category: itemFields.shape.category.optional(),
    title: itemFields.shape.title.optional(),
    subtitle: itemFields.shape.subtitle.removeDefault().optional(),
    urls: itemFields.shape.urls.removeDefault().optional(),
    tags: itemFields.shape.tags.removeDefault().optional(),
    favorite: itemFields.shape.favorite.removeDefault().optional(),
    state: itemFields.shape.state.removeDefault().optional(),
    reprompt: itemFields.shape.reprompt.removeDefault().optional(),
    agentAccessPolicy: itemFields.shape.agentAccessPolicy
      .removeDefault()
      .optional(),
    notes: itemFields.shape.notes.removeDefault().optional(),
    loginFields: itemFields.shape.loginFields,
    sections: itemFields.shape.sections.removeDefault().optional(),
    importProvenance: itemFields.shape.importProvenance,
  })
  .strict();
export type ItemPatch = z.infer<typeof itemPatchSchema>;
export const itemSchema = itemFields.extend({
  id: recordId,
  revision: z.number().int().positive(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});
export type VaultItem = z.infer<typeof itemSchema>;
export const vaultFields = z.object({
  name: z.string().trim().min(1).max(1024),
  type: z.literal('personal').default('personal'),
  appearance: z.record(z.string(), z.string()).default({}),
});
export const vaultSchema = vaultFields.extend({
  id: recordId,
  revision: z.number().int().positive(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});
export type VaultRecord = z.infer<typeof vaultSchema>;
export const encryptedRecordSchema = z
  .object({
    id: recordId,
    revision: z.number().int().positive(),
    sealed: sealedSchema,
  })
  .strict();
export type EncryptedRecord = z.infer<typeof encryptedRecordSchema>;
export const envelopeSchema = z
  .object({
    format: z.literal('aux.vault'),
    version: z.literal(1),
    accountId: z.number().int().nonnegative(),
    revision: z.number().int().nonnegative(),
    kdf: kdfSchema,
    passwordWrap: sealedSchema,
    recoveryWrap: sealedSchema,
    vaults: z.record(recordId, encryptedRecordSchema),
    items: z.record(recordId, encryptedRecordSchema),
    history: z.record(recordId, z.array(encryptedRecordSchema).max(1000)),
    passkeys: z.record(recordId, encryptedRecordSchema).default({}),
  })
  .strict();
export type Envelope = z.infer<typeof envelopeSchema>;
export function validateRecordKeys(envelope: Envelope) {
  for (const [id, record] of [
    ...Object.entries(envelope.vaults),
    ...Object.entries(envelope.items),
    ...Object.entries(envelope.passkeys),
  ])
    if (id !== record.id) throw new Error('Vault record index does not match.');
  for (const [id, records] of Object.entries(envelope.history))
    if (records.some((record) => record.id !== id))
      throw new Error('Vault history index does not match.');
}
