import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { auxDeliveryManifestRoles, createAuxDeliveryProvenance } from './aux-delivery-provenance.mjs';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function inputs() {
  return auxDeliveryManifestRoles.map(role => {
    const bytes = Buffer.from(JSON.stringify({ version: 1, identityProfile: 'aux-v1', sourcePath: '/old/Aside/source', anchors: [{find:'Aside.secretcode',replace:'Aux.secretcode'}], secretFixture: 'never-emit-this' }));
    return { role, bytes, sha256:hash(bytes) };
  });
}
test('delivered provenance is deterministic hash-only traceability without copying source content', () => {
  const manifests = inputs(), result = createAuxDeliveryProvenance({identityProfile:'aux-v1',manifests});
  const reordered = createAuxDeliveryProvenance({identityProfile:'aux-v1',manifests:[...manifests].reverse()});
  assert.equal(result.text,reordered.text); assert.equal(result.sha256,hash(result.text));
  assert.equal(result.manifest.inputCount,5); assert.equal(result.manifest.inputBytesTotal,manifests.reduce((sum,m)=>sum+m.bytes.length,0));
  assert.deepEqual(result.manifest.manifestReferences.map(m=>m.role),auxDeliveryManifestRoles);
  for(const value of ['Aside','sourcePath','secretcode','never-emit-this','find','replace','/old/']) assert.equal(result.text.includes(value),false);
  assert.equal(Object.isFrozen(result.manifest.manifestReferences[0]),true);
  assert.equal(manifests[0].bytes.includes('Aside'),true); // Original external audit remains truthful and untouched.
});
test('changed bytes, malformed roles, profiles and unsupported inputs fail closed', () => {
  const changed=inputs(); changed[0].bytes=Buffer.from('{}');
  assert.throws(()=>createAuxDeliveryProvenance({identityProfile:'aux-v1',manifests:changed}),/hash mismatch/);
  for(const role of ['source-path','../../Aside','stage']) {
    const malformed=inputs(); malformed[1].role=role;
    assert.throws(()=>createAuxDeliveryProvenance({identityProfile:'aux-v1',manifests:malformed}),/role/);
  }
  assert.throws(()=>createAuxDeliveryProvenance({identityProfile:'compatibility',manifests:inputs()}),/explicit aux-v1/);
  assert.throws(()=>createAuxDeliveryProvenance({identityProfile:'aux-v1',manifests:inputs().slice(1)}),/five-role/);
  const old=inputs();old[0].bytes=Buffer.from('{"version":1,"identityProfile":"compatibility"}');old[0].sha256=hash(old[0].bytes);
  assert.throws(()=>createAuxDeliveryProvenance({identityProfile:'aux-v1',manifests:old}),/identity mismatch/);
});
