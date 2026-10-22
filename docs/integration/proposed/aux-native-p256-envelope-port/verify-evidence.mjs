/** Static authorized-source check only; never loads the addon. */
import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';import{createHash}from'node:crypto';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const source=process.env.AUX_PINNED_NATIVE_ADDON;if(!source)throw Error('Provide explicit AUX_PINNED_NATIVE_ADDON static path');
const root=new URL('.',import.meta.url),evidence=JSON.parse(await readFile(new URL('source-evidence.json',root),'utf8')),binary=await readFile(source);assert.equal(sha(binary),evidence.binarySha256);
for(const range of evidence.ranges)assert.equal(sha(binary.subarray(range.start,range.endExclusive)),range.sha256,range.name);
assert.equal(sha(await readFile(new URL('../aux-native-crypto-boundary/static-artifacts.json',root))),evidence.priorBoundaryManifestSha256);
assert.equal(sha(await readFile(new URL('evidence/pq-coding-keys.asm',root))),evidence.pqCodingKeysArtifactSha256);
const files=['EnvelopeRecords.swift','RecoveredP256Authority.swift','AuxNativeEnvelopeV2.swift','LegacyNativeEnvelopeReader.swift'],code=(await Promise.all(files.map(name=>readFile(new URL('source/'+name,root),'utf8')))).join('\n');
assert.equal((code.match(/P256\.KeyAgreement\.PrivateKey\(\)/g)??[]).length,1); // Sole factory is per-envelope ephemeral.
assert.doesNotMatch(code,/\bSecItem\w*\s*\(|Data\(contentsOf|FileManager|Process\(|\.generate\(|install-init|install-destroy/);
assert.match(code,/guard metadata\.scheme == \.p256 else \{ throw EnvelopePortError\.pqNotRecovered \}/);
console.log('PASS: original binary + five native ranges + prior boundary + PQ coding artifact pins; source has no state/installation-key factory API.');
