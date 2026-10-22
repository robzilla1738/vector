/** Compact delivered references. Full original audits belong in external receipts.
 * No source-derived strings, paths, code or reversible source encoding are emitted.
 */
import { createHash } from 'node:crypto';

export const auxDeliveryManifestRoles = Object.freeze(['stage', 'ui', 'apps', 'distribution', 'computer-use']);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

/** Pure and read-only. Each sha256 must be pinned by the caller's input receipt.
 * Returns immutable text/hash for the single delivered provenance file; retain the
 * original input files and their exact hashes outside the app in assembly receipts.
 * This is static traceability, not a runtime or complete UI acceptance assertion.
 */
export function createAuxDeliveryProvenance({ identityProfile, manifests }) {
  if (identityProfile !== 'aux-v1') throw Error('Compact delivery provenance requires explicit aux-v1 identity');
  if (!Array.isArray(manifests) || manifests.length !== auxDeliveryManifestRoles.length) throw Error('Complete five-role manifest input required');
  const references = new Map();
  for (const input of manifests) {
    if (!input || !auxDeliveryManifestRoles.includes(input.role) || references.has(input.role)) throw Error('Invalid or duplicate delivery manifest role');
    if (!Buffer.isBuffer(input.bytes) && !(input.bytes instanceof Uint8Array)) throw Error('Exact manifest input bytes required');
    if (!/^[a-f0-9]{64}$/.test(input.sha256)) throw Error('Pinned manifest SHA-256 required');
    const bytes = Buffer.from(input.bytes);
    if (hash(bytes) !== input.sha256) throw Error(`Delivery manifest hash mismatch: ${input.role}`);
    let parsed;
    try { parsed = JSON.parse(bytes.toString('utf8')); }
    catch { throw Error(`Invalid manifest JSON: ${input.role}`); }
    if (!parsed || Array.isArray(parsed) || parsed.version !== 1) throw Error(`Unsupported delivery manifest: ${input.role}`);
    if (['stage', 'ui', 'apps'].includes(input.role) && parsed.identityProfile !== identityProfile) throw Error(`Delivery manifest identity mismatch: ${input.role}`);
    references.set(input.role, Object.freeze({ role: input.role, manifestSha256: input.sha256, bytes: bytes.length }));
  }
  const manifestReferences = Object.freeze(auxDeliveryManifestRoles.map(role => references.get(role)));
  const manifest = Object.freeze({ version: 1, kind: 'aux-delivery-provenance', identityProfile, inputCount: manifestReferences.length, inputBytesTotal: manifestReferences.reduce((sum, entry) => sum + entry.bytes, 0), manifestReferences });
  const text = `${JSON.stringify(manifest, null, 2)}\n`;
  return Object.freeze({ manifest, text, sha256: hash(text) });
}
