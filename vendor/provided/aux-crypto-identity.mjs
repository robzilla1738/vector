/**
 * Versioned Aux cryptography. No IO, native calls, credentials or implicit legacy
 * fallback. Callers own key lifetime and must never log plaintext or key material.
 */
import { createCipheriv, createDecipheriv, createECDH, createHash, hkdfSync, randomBytes, timingSafeEqual } from 'node:crypto';

export const AUX_CRYPTO_FORMAT = 'aux.dk.v2';
export const AUX_WRAP_FORMAT = 'aux.wrap.dk.v2';
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
function object(value) { if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Invalid crypto record'); }
function exact(value, keys) {
  object(value);
  if (Object.keys(value).length !== keys.length || keys.some(key => !own(value, key))) throw Error('Unexpected crypto record fields');
}
function bytes(value, length) {
  if (!(value instanceof Uint8Array) || (length !== undefined && value.byteLength !== length)) throw Error('Invalid crypto bytes');
  return Buffer.from(value);
}
function b64(value, length) {
  if (typeof value !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) throw Error('Invalid crypto encoding');
  const decoded = Buffer.from(value, 'base64');
  if ((length !== undefined && decoded.length !== length) || decoded.toString('base64') !== value) throw Error('Invalid crypto encoding');
  return decoded;
}
function purpose(value) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9._:-]{1,128}$/.test(value)) throw Error('Invalid crypto purpose');
  return value;
}
export function deriveAuxSubkey(rootKey, usage) {
  const key = bytes(rootKey, 32);
  try { return Buffer.from(hkdfSync('sha256', key, Buffer.alloc(0), `aux.dk.${purpose(usage)}.v2`, 32)); }
  finally { key.fill(0); }
}
function seal(key, plaintext, aad) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv('chacha20-poly1305', key, nonce, { authTagLength: 16 });
  cipher.setAAD(Buffer.from(aad));
  const data = bytes(plaintext);
  try { return { nonce: nonce.toString('base64'), ciphertext: Buffer.concat([cipher.update(data), cipher.final(), cipher.getAuthTag()]).toString('base64') }; }
  finally { data.fill(0); }
}
function open(key, envelope, aad) {
  const nonce = b64(envelope.nonce, 12);
  const encrypted = b64(envelope.ciphertext);
  if (encrypted.length < 16) throw Error('Invalid crypto ciphertext');
  const decipher = createDecipheriv('chacha20-poly1305', key, nonce, { authTagLength: 16 });
  decipher.setAAD(Buffer.from(aad));
  decipher.setAuthTag(encrypted.subarray(encrypted.length - 16));
  return Buffer.concat([decipher.update(encrypted.subarray(0, -16)), decipher.final()]);
}
export function encryptAuxBlob(rootKey, usage, plaintext) {
  const key = deriveAuxSubkey(rootKey, usage);
  try { return { format: AUX_CRYPTO_FORMAT, purpose: usage, ...seal(key, plaintext, `aux.dk.${usage}.v2`) }; }
  finally { key.fill(0); }
}
export function decryptAuxBlob(rootKey, expectedPurpose, envelope) {
  exact(envelope, ['format', 'purpose', 'nonce', 'ciphertext']);
  if (envelope.format !== AUX_CRYPTO_FORMAT || envelope.purpose !== purpose(expectedPurpose)) throw Error('Aux crypto format or purpose mismatch');
  const key = deriveAuxSubkey(rootKey, expectedPurpose);
  try { return open(key, envelope, `aux.dk.${expectedPurpose}.v2`); }
  finally { key.fill(0); }
}
export function wrapAuxDk(rootKey, installationPublicKey) {
  const dk = bytes(rootKey, 32), publicKey = bytes(installationPublicKey, 65);
  const ephemeral = createECDH('prime256v1');
  ephemeral.generateKeys();
  let secret, key;
  try {
    secret = ephemeral.computeSecret(publicKey);
    key = Buffer.from(hkdfSync('sha256', secret, Buffer.alloc(0), AUX_WRAP_FORMAT, 32));
    return { format: AUX_WRAP_FORMAT, scheme: 'p256_v2', purpose: 'dk', ephemeral_public_key: ephemeral.getPublicKey().toString('base64'), ...seal(key, dk, AUX_WRAP_FORMAT) };
  } finally { dk.fill(0); secret?.fill(0); key?.fill(0); }
}
/** Callback must use the same installation KEM authority; no key creation. */
export async function unwrapAuxDk(envelope, deriveInstallationSharedSecret) {
  exact(envelope, ['format', 'scheme', 'purpose', 'ephemeral_public_key', 'nonce', 'ciphertext']);
  if (envelope.format !== AUX_WRAP_FORMAT || envelope.scheme !== 'p256_v2' || envelope.purpose !== 'dk') throw Error('Aux DK format mismatch');
  const publicKey = b64(envelope.ephemeral_public_key, 65);
  if (publicKey[0] !== 4 || typeof deriveInstallationSharedSecret !== 'function') throw Error('Invalid installation authority');
  let secret, key, originalSecret;
  try {
    originalSecret = await deriveInstallationSharedSecret(publicKey);
    secret = bytes(originalSecret, 32);
    key = Buffer.from(hkdfSync('sha256', secret, Buffer.alloc(0), AUX_WRAP_FORMAT, 32));
    const dk = open(key, envelope, AUX_WRAP_FORMAT);
    if (dk.length !== 32) { dk.fill(0); throw Error('Invalid DK length'); }
    return dk;
  } finally { secret?.fill(0); key?.fill(0); if (originalSecret instanceof Uint8Array) originalSecret.fill(0); }
}

/** No secret/key/ciphertext in the receipt. Storage transaction is supplied. */
export async function migrateAuxBlob({ rootKey, purpose: usage, snapshot, readLegacy, compareExchange }) {
  if (!snapshot || !Number.isSafeInteger(snapshot.revision) || snapshot.revision < 0 || typeof compareExchange !== 'function') throw Error('Invalid migration transaction');
  if (snapshot.value?.format === AUX_CRYPTO_FORMAT) {
    const plaintext = decryptAuxBlob(rootKey, usage, snapshot.value);
    plaintext.fill(0);
    return { status: 'already-current', format: AUX_CRYPTO_FORMAT, revision: snapshot.revision };
  }
  // Unknown/explicit format never falls back to a legacy decryptor.
  object(snapshot.value);
  if (own(snapshot.value, 'format') || typeof readLegacy !== 'function') throw Error('Unsupported migration format');
  const expectedValue = structuredClone(snapshot.value);
  let plaintext, verified, originalPlaintext;
  try {
    originalPlaintext = await readLegacy(rootKey, usage, expectedValue);
    plaintext = bytes(originalPlaintext);
    const value = encryptAuxBlob(rootKey, usage, plaintext);
    verified = decryptAuxBlob(rootKey, usage, value);
    if (!timingSafeEqual(plaintext, verified)) throw Error('Migration verification failed');
    const result = await compareExchange({ expectedRevision: snapshot.revision, expectedValue, value });
    if (result !== true) throw Error('Migration conflict; original record must be preserved');
    return { status: 'migrated', format: AUX_CRYPTO_FORMAT, previousRevision: snapshot.revision };
  } finally { plaintext?.fill(0); verified?.fill(0); if (originalPlaintext instanceof Uint8Array) originalPlaintext.fill(0); }
}

/** Explicit migration-only exports. Runtime Aux reader never selects these. */
export const cryptoMigrationInternals = Object.freeze({ exact, b64, open });

/**
 * Prepare an additive installation record using the existing root and public KEM
 * authority. Caller must journal/commit it without deleting the old rows.
 * No native helper, init-keys or install-init call is made here.
 */
export async function prepareAuxInstallationMigration({ unwrapLegacyRoot, publicKeys, deriveInstallationSharedSecret }) {
  if (typeof unwrapLegacyRoot !== 'function' || !publicKeys || publicKeys.scheme !== 'p256_v1') throw Error('Unsupported installation migration');
  const kem = b64(publicKeys.kem, 65);
  const sig = b64(publicKeys.sig);
  if (kem[0] !== 4 || !sig.length) throw Error('Invalid installation public keys');
  let root, verified, original;
  try {
    original = await unwrapLegacyRoot();
    root = bytes(original, 32);
    const wrappedDk = wrapAuxDk(root, kem);
    verified = await unwrapAuxDk(wrappedDk, deriveInstallationSharedSecret);
    if (!timingSafeEqual(root, verified)) throw Error('Installation authority mismatch');
    return {
      metadata: { format: 'aux.installation.v2', scheme: 'p256_v2', publicKeySha256: createHash('sha256').update(kem).update(sig).digest('hex') },
      wrappedDk,
    };
  } finally {
    root?.fill(0); verified?.fill(0);
    if (original instanceof Uint8Array) original.fill(0);
  }
}
