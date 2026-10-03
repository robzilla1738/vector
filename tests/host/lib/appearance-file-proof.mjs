import assert from 'node:assert/strict';
import { readPackagedRuntimePair, readPackagedRuntimePairBytes } from './packaged-runtime-pair-artifact.mjs';
import { decodeWarmWindowHelperIdentity } from './native-warm-helper-identity.mjs';
import { verifyAppearanceFileRecord } from './appearance-file-records.mjs';

export function verifyAppearanceFileProof(proof, { pair, candidate, targetPid, helperSourceSha256, helperSha256 }) {
  assert.ok(proof && pair, 'Signed LS capture requires separately admitted original artifacts');
  assert.deepEqual(Object.keys(proof).sort(), ['producer','version','header','originalHeaderBase64','sequence','raw','signedPayload','rawFrameBase64','packagedRuntimeArtifact','activeIdentity','kernel','process'].sort());
  assert.equal(proof.producer, 'aux-native-launchservices-appearance-proof'); assert.equal(proof.version, 1);
  const artifact = readPackagedRuntimePairBytes(pair), lease = readPackagedRuntimePair(pair);
  assert.deepEqual(proof.packagedRuntimeArtifact, artifact.artifact);
  assert.deepEqual(candidate.productIdentity, artifact.productIdentity); assert.equal(candidate.shellDigest, artifact.shellDigest);
  for (const key of ['buildId', 'sourceCommit', 'manifestHash']) {
    assert.equal(candidate.native[key], artifact.native[key]); assert.equal(proof.activeIdentity.native[key], artifact.native[key]);
  }
  assert.deepEqual(proof.activeIdentity.runtime, artifact.productIdentity);
  assert.deepEqual(proof.activeIdentity.native.nativeAppearanceFileChannel, proof.header, 'Signed key lacks original active native capability receipt');
  assert.deepEqual(Object.keys(proof.process).sort(), ['pid', 'launchServicesGeneration'].sort());
  assert.equal(proof.process.pid, targetPid); assert.ok(Number.isFinite(proof.process.launchServicesGeneration) && proof.process.launchServicesGeneration > 0);
  assert.equal(proof.header.pid, targetPid); assert.equal(proof.header.buildId, artifact.native.buildId); assert.equal(proof.header.sourceCommit, artifact.native.sourceCommit);
  decodeWarmWindowHelperIdentity(proof.kernel, { targetPid, helperPid: proof.kernel.helperPid, artifact: lease.compilerArtifact.artifact });
  assert.equal(proof.kernel.targetProcessUuid, artifact.image.imageUuid); assert.equal(proof.header.processUuid, proof.kernel.targetProcessUuid);
  assert.equal(proof.header.processStartMachTicks, proof.kernel.targetProcessStartMachTicks);
  assert.equal(helperSourceSha256, lease.compilerArtifact.artifact.sourceSha256); assert.equal(helperSha256, lease.compilerArtifact.artifact.binarySha256);
  const raw = verifyAppearanceFileRecord(proof); artifact.validate(); return raw;
}
