import { z } from 'zod';

export const lockTimeoutMinutes = z.union([
  z.literal(-1),
  z.literal(15),
  z.literal(60),
  z.literal(240),
  z.literal(480),
  z.literal(1440),
  z.literal(10080),
]);
export const vaultSettings = z
  .object({ lockTimeoutMinutes: lockTimeoutMinutes.default(10080) })
  .strict();
export type VaultSettings = z.infer<typeof vaultSettings>;
