/** Explicit, read-only migration input. Exclude from an Aux-only final runtime
 * after every authorized record has been migrated. Never select on auth failure.
 */
import { hkdfSync } from 'node:crypto';
import { cryptoMigrationInternals } from './aux-crypto-identity.mjs';
const { exact, b64, open } = cryptoMigrationInternals;
export function readLegacyDkBlob(rootKey, expectedPurpose, envelope) {
  exact(envelope, ['purpose', 'nonce', 'ciphertext']);
  if (typeof expectedPurpose !== 'string' || envelope.purpose !== expectedPurpose || !(rootKey instanceof Uint8Array) || rootKey.length !== 32) throw Error('Legacy purpose or key mismatch');
  const label = `aside.dk.${expectedPurpose}.v1`;
  const key = Buffer.from(hkdfSync('sha256', rootKey, Buffer.alloc(0), label, 32));
  try { return open(key, envelope, label); }
  finally { key.fill(0); }
}
export async function readLegacyWrappedDk(envelope, deriveInstallationSharedSecret) {
  exact(envelope, ['scheme', 'purpose', 'ephemeral_public_key', 'nonce', 'ciphertext']);
  if (envelope.scheme !== 'p256_v1' || envelope.purpose !== 'dk') throw Error('Unsupported legacy DK format');
  const publicKey = b64(envelope.ephemeral_public_key, 65);
  if (publicKey[0] !== 4 || typeof deriveInstallationSharedSecret !== 'function') throw Error('Invalid legacy installation authority');
  let secret, key;
  try {
    secret = await deriveInstallationSharedSecret(publicKey);
    if (!(secret instanceof Uint8Array) || secret.length !== 32) throw Error('Invalid installation secret');
    key = Buffer.from(hkdfSync('sha256', secret, Buffer.alloc(0), 'aside.wrap.dk.v1', 32));
    const root = open(key, envelope, 'aside.wrap.dk.v1');
    if (root.length !== 32) { root.fill(0); throw Error('Invalid legacy DK length'); }
    return root;
  } finally { secret?.fill(0); key?.fill(0); }
}
