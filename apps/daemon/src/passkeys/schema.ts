import { z } from 'zod';

export const encoded = z
  .string()
  .min(1)
  .max(131072)
  .regex(/^[A-Za-z0-9_-]+$/);
export const requestSchema = z
  .object({
    version: z.literal(1),
    id: z.string().uuid(),
    kind: z.enum(['create', 'get']),
    accountId: z.number().int().nonnegative(),
    profileId: z.string().min(1).max(256),
    profileSession: z.string().uuid(),
    browserMode: z.enum(['default', 'incognito']),
    origin: z.string().url().max(8192),
    frameId: z.string().regex(/^[0-9]+:[0-9]+$/),
    topOrigin: z.string().url().max(8192),
    rpId: z.string().min(1).max(253),
    clientDataJSON: encoded,
    options: z.record(z.string(), z.unknown()),
    expiresAt: z.number().finite(),
  })
  .strict();
export type PasskeyRequest = z.infer<typeof requestSchema>;
export const proofSchema = z
  .object({ payload: z.string().max(250000), signature: z.string().max(1024) })
  .strict();
export const freshVerificationSchema = z.union([
  z.object({ password: z.string().min(1).max(65536) }).strict(),
  z.object({ biometric: z.literal(true) }).strict(),
]);
export type FreshVerification = z.infer<typeof freshVerificationSchema>;
export const passkeyRecordSchema = z
  .object({
    id: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/),
    revision: z.number().int().positive(),
    credentialId: encoded,
    rpId: z.string().min(1).max(253),
    userId: encoded,
    userName: z.string().max(1024),
    displayName: z.string().max(1024),
    privateKey: z.string().max(4096),
    publicX: encoded,
    publicY: encoded,
    counter: z.number().int().min(0).max(4294967295),
    createdAt: z.number(),
    lastUsedAt: z.number().optional(),
    recentRequests: z
      .array(z.object({ id: z.string().uuid(), expiresAt: z.number() }))
      .max(128)
      .default([]),
  })
  .strict();
export type PasskeyRecord = z.infer<typeof passkeyRecordSchema>;
export type PasskeySummary = Pick<
  PasskeyRecord,
  'id' | 'rpId' | 'userName' | 'displayName' | 'createdAt' | 'lastUsedAt'
>;

// Dedicated encrypted collection only. Never implement these through item fields,
// ordinary snapshot/export/search or a general master-key accessor.
export interface PasskeyVaultAdapter {
  readPasskeys(accountId: number): unknown[];
  commitPasskeys(
    accountId: number,
    expectedGeneration: number,
    mutate: (records: unknown[]) => unknown[],
  ): void;
  generation(accountId: number): number;
  verifyFresh(
    accountId: number,
    verification: FreshVerification,
  ): Promise<number>;
}
export interface PasskeyScope {
  accountId: number;
  profileId: string;
  browserMode: 'default' | 'incognito';
}
