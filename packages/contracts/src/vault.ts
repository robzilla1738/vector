import { z } from "zod";

const text = z.string().trim().min(1);
export const VAULT_CREDENTIAL_REF = /^cref_[a-z0-9]{24,64}$/;
export const VaultCredentialRefSchema = z.string().regex(VAULT_CREDENTIAL_REF, "Use an opaque vault reference");

export const VaultItemKindSchema = z.enum(["password", "secret"]);
export const VaultItemSchema = z.object({
  itemId: text,
  label: text.max(120),
  kind: VaultItemKindSchema,
  username: z.string().max(200).optional(),
  accountLabel: z.string().trim().min(1).max(120).optional(),
  origin: z.string().url(),
  createdAt: z.number(),
  updatedAt: z.number(),
  revokedAt: z.number().optional(),
  expiresAt: z.number().optional(),
});
export const VaultGrantSchema = z.object({
  grantId: text,
  itemId: text,
  credentialRef: VaultCredentialRefSchema,
  taskId: text.optional(),
  workspaceId: text.optional(),
  origin: z.string().url(),
  accountLabel: z.string().trim().min(1).max(120).optional(),
  createdAt: z.number(),
  expiresAt: z.number(),
  revokedAt: z.number().optional(),
  lastUsedAt: z.number().optional(),
  useCount: z.number().int().nonnegative(),
});
export const VaultAccessRecordSchema = z.object({
  seq: z.number().int().positive(),
  itemId: text.optional(),
  grantId: text.optional(),
  action: z.enum(["save", "lock", "unlock", "grant", "fill", "revoke", "expire", "delete", "denied"]),
  actor: z.enum(["desktop_user", "runtime"]),
  taskId: z.string().optional(),
  origin: z.string().optional(),
  detail: z.string().max(400).optional(),
  recordedAt: z.number(),
});
export const VaultStatusSchema = z.object({
  configured: z.boolean(),
  locked: z.boolean(),
  unlockedUntil: z.number().optional(),
  itemCount: z.number().int().nonnegative(),
  available: z.boolean(),
  error: z.string().optional(),
});
export const VaultSaveParams = z.object({
  label: text.max(120),
  kind: VaultItemKindSchema.default("password"),
  username: z.string().max(200).optional(),
  accountLabel: z.string().trim().min(1).max(120).optional(),
  origin: z.string().url(),
  secret: text.max(4096),
  expiresAt: z.number().int().positive().optional(),
}).strict();
export const VaultGrantParams = z.object({
  itemId: text,
  origin: z.string().url(),
  taskId: text.optional(),
  workspaceId: text.optional(),
  ttlMs: z.number().int().min(60_000).max(24 * 60 * 60_000).default(30 * 60_000),
}).strict();
export const VaultRenewGrantParams = z.object({
  grantId: text,
  ttlMs: z.number().int().min(60_000).max(24 * 60 * 60_000).default(30 * 60_000),
}).strict();
export const VaultLockParams = z.object({
  passphrase: z.string().min(8).max(200).optional(),
}).strict();
export const VaultUnlockParams = z.object({
  passphrase: z.string().min(1).max(200),
  ttlMs: z.number().int().min(60_000).max(12 * 60 * 60_000).default(15 * 60_000),
}).strict();
export const VaultGenerateParams = z.object({
  length: z.number().int().min(12).max(64).default(20),
}).strict();
export const VaultItemsForOriginParams = z.object({
  origin: z.string().url(),
}).strict();
export const VaultHumanFillParams = z.object({
  itemId: text,
  pageId: text,
  origin: z.string().url(),
}).strict();
export const VaultExportItemSchema = z.object({
  label: z.string().max(120),
  kind: VaultItemKindSchema,
  username: z.string().max(200).optional(),
  accountLabel: z.string().max(120).optional(),
  origin: z.string().url(),
  secret: z.string().max(4096),
  expiresAt: z.number().optional(),
});
export const VaultExportSchema = z.object({
  exportedAt: z.number(),
  items: z.array(VaultExportItemSchema).max(500),
});
/** A portable transfer package. The plaintext schema is internal to the vault service. */
export const VaultTransferPackageSchema = z.object({
  format: z.literal("aux-vault-transfer"),
  version: z.literal(1),
  kdf: z.literal("scrypt-n16384-r8-p1"),
  cipher: z.literal("aes-256-gcm"),
  salt: z.string().regex(/^[a-f0-9]{32}$/),
  nonce: z.string().regex(/^[a-f0-9]{24}$/),
  tag: z.string().regex(/^[a-f0-9]{32}$/),
  ciphertext: z.string().max(4_000_000).regex(/^[A-Za-z0-9+/]*={0,2}$/),
}).strict();
export const VaultTransferPassphraseSchema = z.string().min(12).max(200);
export const VaultEncryptedExportParams = z.object({ passphrase: VaultTransferPassphraseSchema }).strict();
export const VaultEncryptedImportParams = z.object({
  passphrase: VaultTransferPassphraseSchema,
  package: VaultTransferPackageSchema,
}).strict();
export const VaultImportParams = z.object({
  items: z.array(VaultExportItemSchema).max(500),
}).strict();
export const VaultUpdateParams = z.object({
  itemId: text,
  secret: text.max(4096),
}).strict();
export const VaultSecretMatchParams = z.object({
  itemId: text,
  secret: z.string().max(4096),
}).strict();

export type VaultItem = z.infer<typeof VaultItemSchema>;
export type VaultGrant = z.infer<typeof VaultGrantSchema>;
export type VaultAccessRecord = z.infer<typeof VaultAccessRecordSchema>;
export type VaultStatus = z.infer<typeof VaultStatusSchema>;

export function originOfAddress(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) return;
    return parsed.origin;
  } catch {
    return;
  }
}
