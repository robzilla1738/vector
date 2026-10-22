import test from 'node:test';
import assert from 'node:assert/strict';
import { createCipheriv, createECDH, hkdfSync, webcrypto } from 'node:crypto';
import { deriveAuxSubkey, encryptAuxBlob, decryptAuxBlob, wrapAuxDk, unwrapAuxDk, migrateAuxBlob, prepareAuxInstallationMigration } from './aux-crypto-identity.mjs';
import { readLegacyDkBlob, readLegacyWrappedDk } from './aux-crypto-identity-legacy.mjs';

const root = Buffer.alloc(32, 17), plaintext = Buffer.from('synthetic provider credential');
function legacySeal(key, label, data, extra) {
  const nonce = Buffer.alloc(12, 29);
  const cipher = createCipheriv('chacha20-poly1305', key, nonce, { authTagLength: 16 });
  cipher.setAAD(Buffer.from(label));
  return { ...extra, nonce: nonce.toString('base64'), ciphertext: Buffer.concat([cipher.update(data), cipher.final(), cipher.getAuthTag()]).toString('base64') };
}
function legacyBlob(usage = 'provider') {
  const label = `aside.dk.${usage}.v1`;
  return legacySeal(Buffer.from(hkdfSync('sha256', root, Buffer.alloc(0), label, 32)), label, plaintext, { purpose: usage });
}
function authority() {
  const ecdh = createECDH('prime256v1'); ecdh.generateKeys();
  return { publicKeys: { scheme: 'p256_v1', sig: Buffer.from('synthetic signature public key').toString('base64'), kem: ecdh.getPublicKey().toString('base64') }, derive: async publicKey => ecdh.computeSecret(publicKey) };
}
test('Aux v2 HKDF agrees with supplied WebCrypto derivation and differs from legacy', async () => {
  const imported = await webcrypto.subtle.importKey('raw', root, 'HKDF', false, ['deriveBits']);
  const expected = Buffer.from(await webcrypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(), info: Buffer.from('aux.dk.provider.v2') }, imported, 256));
  assert.deepEqual(deriveAuxSubkey(root, 'provider'), expected);
  assert.notDeepEqual(expected, Buffer.from(hkdfSync('sha256', root, Buffer.alloc(0), 'aside.dk.provider.v1', 32)));
});
test('Aux reader binds purpose/version/tag; legacy input never gets implicit fallback', () => {
  const envelope = encryptAuxBlob(root, 'provider', plaintext);
  assert.deepEqual(decryptAuxBlob(root, 'provider', envelope), plaintext);
  assert.throws(() => decryptAuxBlob(root, 'other', envelope));
  assert.throws(() => decryptAuxBlob(root, 'provider', { ...envelope, format: 'aux.dk.v3' }));
  const bad = Buffer.from(envelope.ciphertext, 'base64'); bad[0] ^= 1;
  assert.throws(() => decryptAuxBlob(root, 'provider', { ...envelope, ciphertext: bad.toString('base64') }));
  assert.throws(() => decryptAuxBlob(root, 'provider', legacyBlob()));
  assert.deepEqual(readLegacyDkBlob(root, 'provider', legacyBlob()), plaintext);
  assert.throws(() => readLegacyDkBlob(root, 'provider', { ...envelope, format: undefined }));
});
test('versioned blob migration verifies then CAS commits without mutating root or source', async () => {
  const legacy = legacyBlob(), original = structuredClone(legacy);
  let value = legacy, revision = 7, commits = 0;
  const compareExchange = async update => {
    assert.equal(update.expectedRevision, revision); assert.deepEqual(update.expectedValue, value);
    value = update.value; revision++; commits++; return true;
  };
  const receipt = await migrateAuxBlob({ rootKey: root, purpose: 'provider', snapshot: { revision, value }, readLegacy: readLegacyDkBlob, compareExchange });
  assert.equal(receipt.status, 'migrated'); assert.equal(commits, 1);
  assert.deepEqual(legacy, original); assert.deepEqual(root, Buffer.alloc(32, 17));
  assert.deepEqual(decryptAuxBlob(root, 'provider', value), plaintext);
  assert.equal((await migrateAuxBlob({ rootKey: root, purpose: 'provider', snapshot: { revision, value }, compareExchange })).status, 'already-current');
  assert.equal(commits, 1);
});
test('CAS conflict, corrupt input and unknown format preserve original and never report success', async () => {
  const legacy = legacyBlob(); let commits = 0;
  const args = { rootKey: root, purpose: 'provider', snapshot: { revision: 1, value: legacy }, readLegacy: readLegacyDkBlob, compareExchange: async () => { commits++; return false; } };
  await assert.rejects(migrateAuxBlob(args), /conflict/); assert.equal(commits, 1);
  const bad = { ...legacy, ciphertext: 'AAAA' };
  await assert.rejects(migrateAuxBlob({ ...args, snapshot: { revision: 1, value: bad } })); assert.equal(commits, 1);
  await assert.rejects(migrateAuxBlob({ ...args, snapshot: { revision: 1, value: { ...legacy, format: 'unknown' } } }), /Unsupported/); assert.equal(commits, 1);
});
test('new DK wrap requires original installation authority and authenticates format', async () => {
  const a = authority(), b = authority();
  const envelope = wrapAuxDk(root, Buffer.from(a.publicKeys.kem, 'base64'));
  assert.deepEqual(await unwrapAuxDk(envelope, a.derive), root);
  await assert.rejects(unwrapAuxDk(envelope, b.derive));
  await assert.rejects(unwrapAuxDk({ ...envelope, scheme: 'p256_v1' }, a.derive));
});
test('legacy p256 envelope migrates additively to same root and authority; owned temporary root erased', async () => {
  const a = authority(), ephemeral = createECDH('prime256v1'); ephemeral.generateKeys();
  const secret = ephemeral.computeSecret(Buffer.from(a.publicKeys.kem, 'base64'));
  const key = Buffer.from(hkdfSync('sha256', secret, Buffer.alloc(0), 'aside.wrap.dk.v1', 32));
  const old = legacySeal(key, 'aside.wrap.dk.v1', root, { scheme: 'p256_v1', purpose: 'dk', ephemeral_public_key: ephemeral.getPublicKey().toString('base64') });
  const unchanged = structuredClone(old); let owned;
  const result = await prepareAuxInstallationMigration({ publicKeys: a.publicKeys, unwrapLegacyRoot: async () => { owned = await readLegacyWrappedDk(old, a.derive); return owned; }, deriveInstallationSharedSecret: a.derive });
  assert.deepEqual(owned, Buffer.alloc(32)); assert.deepEqual(old, unchanged);
  assert.equal(result.metadata.format, 'aux.installation.v2');
  assert.deepEqual(await unwrapAuxDk(result.wrappedDk, a.derive), root);
  assert.deepEqual(await readLegacyWrappedDk(old, a.derive), root);
});
test('installation migration fails closed on different authority and never initializes/reset keys', async () => {
  const a = authority(), b = authority(); let owned;
  await assert.rejects(prepareAuxInstallationMigration({ publicKeys: a.publicKeys, unwrapLegacyRoot: async () => { owned = Buffer.from(root); return owned; }, deriveInstallationSharedSecret: b.derive }));
  assert.deepEqual(owned, Buffer.alloc(32));
  await assert.rejects(prepareAuxInstallationMigration({ publicKeys: { ...a.publicKeys, scheme: 'pq_v1' } }), /Unsupported/);
});
