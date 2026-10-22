/** Static inspection only: never imports or executes the supplied daemon. */
import { createHash } from 'node:crypto';
export const PINNED_CRYPTO_SOURCE_SHA256 = '5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5';
export function inspectPinnedCryptoSource(source) {
  if (createHash('sha256').update(source).digest('hex') !== PINNED_CRYPTO_SOURCE_SHA256) throw Error('Pinned crypto source drift');
  const text = source.toString();
  const anchors = [
    ['installation subkey and wrapping domains', 'DK_SUBKEY_INFO_PREFIX=`aside.dk.`,DK_WRAP_INFO=`aside.wrap.dk.v1`', 1],
    ['unversioned encrypted blob schema', 'encryptedBlobSchema=object({purpose:string$3(),nonce:string$3(),ciphertext:string$3()})', 1],
    ['legacy p256 wrapper schema', 'wrappedDkP256Schema=object({scheme:literal(`p256_v1`),purpose:literal(`dk`),ephemeral_public_key:string$3(),nonce:string$3(),ciphertext:string$3()})', 1],
    ['account sync derivation and recovery', '`aside.dk.sync.v1`', 2],
    ['macOS installation unwrap native delegation', 'process.platform===`darwin`?fromBase64$1(runMacInstallHelper(`dk-unwrap`).dk):unwrapNativeDk()', 1],
    ['HKDF has empty salt', 'salt:/* @__PURE__ */ new Uint8Array,info:', 2],
  ].map(([name, find, expected]) => {
    const count = text.split(find).length - 1;
    if (count !== expected) throw Error(`Pinned crypto anchor drift: ${name}`);
    return { name, find, count };
  });
  return { sourceSha256: PINNED_CRYPTO_SOURCE_SHA256, anchors, execution: false, activated: false };
}
