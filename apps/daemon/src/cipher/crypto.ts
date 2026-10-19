import sodium from 'libsodium-wrappers-sumo';
import { z } from 'zod';

export const cryptoReady = sodium.ready;
export const kdfParameters = {
  algorithm: 'argon2id13' as const,
  operations: 3 as const,
  memory: 67108864 as const,
};
const base64 = z
  .string()
  .max(32_000_000)
  .refine(
    (value) =>
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
        value,
      ),
    'Invalid encrypted encoding',
  );
export const sealedSchema = z
  .object({
    nonce: base64.refine((value) => Buffer.from(value, 'base64').length === 24),
    ciphertext: base64.refine(
      (value) => Buffer.from(value, 'base64').length >= 16,
    ),
  })
  .strict();
export type Sealed = z.infer<typeof sealedSchema>;
export const kdfSchema = z
  .object({
    algorithm: z.literal('argon2id13'),
    operations: z.literal(3),
    memory: z.literal(67108864),
    salt: base64.refine((value) => Buffer.from(value, 'base64').length === 16),
  })
  .strict();
export type Kdf = z.infer<typeof kdfSchema>;
export function randomKey() {
  return sodium.randombytes_buf(32);
}
export function wipe(value: Uint8Array) {
  sodium.memzero(value);
}
export function createKdf(): Kdf {
  return {
    ...kdfParameters,
    salt: Buffer.from(sodium.randombytes_buf(16)).toString('base64'),
  };
}
export function passwordKey(password: string, kdf: Kdf) {
  return sodium.crypto_pwhash(
    32,
    password,
    Buffer.from(kdf.salt, 'base64'),
    kdf.operations,
    kdf.memory,
    sodium.crypto_pwhash_ALG_ARGON2ID13,
  );
}
export function seal(
  value: Uint8Array,
  key: Uint8Array,
  associatedData: string,
): Sealed {
  const nonce = sodium.randombytes_buf(24);
  return {
    nonce: Buffer.from(nonce).toString('base64'),
    ciphertext: Buffer.from(
      sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        value,
        associatedData,
        null,
        nonce,
        key,
      ),
    ).toString('base64'),
  };
}
export function open(value: Sealed, key: Uint8Array, associatedData: string) {
  return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    Buffer.from(value.ciphertext, 'base64'),
    associatedData,
    Buffer.from(value.nonce, 'base64'),
    key,
  );
}
export function recoveryText(key: Uint8Array) {
  return `AUXR1-${Buffer.from(key).toString('base64url')}`;
}
export function parseRecovery(text: string) {
  if (!/^AUXR1-[A-Za-z0-9_-]{43}$/.test(text))
    throw new Error('Invalid recovery key');
  const key = new Uint8Array(Buffer.from(text.slice(6), 'base64url'));
  if (recoveryText(key) !== text) throw new Error('Invalid recovery key');
  return key;
}
export function domain(accountId: number, purpose: string) {
  return `Aux Vault v1\0${accountId}\0${purpose}`;
}
