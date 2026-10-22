import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SourceTextModule } from 'node:vm';
import test from 'node:test';
import { applyAuxProviderIdentity } from './aux-provider-identity.mjs';
import { applyAuxRuntimeContractIdentity } from './aux-runtime-contract-identity.mjs';
import { auxAssetIdentityRelocations,auxAssetIdentityImporters,relocateAuxAssetPath,applyAuxAssetReferenceIdentity,relocateAuxVisualBaseline,canonicalizeAuxVisualAssetInventory } from './aux-asset-path-identity.mjs';
const root='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/agent';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const brand=text=>text.replaceAll('ASIDE_','AUX_').replaceAll('Aside','Aux');

test('all seven actual supplied assets relocate without changing any bytes, including the retained manager asset',()=>{
 assert.equal(auxAssetIdentityRelocations.length,7);
 for(const asset of auxAssetIdentityRelocations){
  const bytes=readFileSync(root+'/'+asset.from),before=Buffer.from(bytes);
  const result=relocateAuxAssetPath({component:'agent',path:asset.from,bytes});
  assert.equal(result.path,asset.to);assert.equal(result.bytes,bytes);assert.deepEqual(bytes,before);assert.equal(hash(result.bytes),asset.sha256);assert.equal(result.anchors.length,1);
  assert.throws(()=>relocateAuxAssetPath({component:'agent',path:asset.to,bytes}),/colliding/);
  assert.throws(()=>relocateAuxAssetPath({component:'agent',path:asset.from,bytes:Buffer.concat([bytes,Buffer.from([0])])}),/pin mismatch/);
 }
 const unused=auxAssetIdentityRelocations.find(asset=>asset.from.includes('password-manager'));
 assert.equal(unused.references[0].path,'assets/password-LjdLcSRV.js');assert.ok(unused.to.includes('aux-password-manager'));
});

test('six importer rewrites and the existing manager reference remain valid after composed branding',()=>{
 assert.equal(auxAssetIdentityImporters.length,7);
 for(const pin of auxAssetIdentityImporters){
  const original=readFileSync(root+'/'+pin.path,'utf8');
  const provider=applyAuxProviderIdentity({component:'agent',path:pin.path,text:brand(original),original}).text;
  const runtime=applyAuxRuntimeContractIdentity({component:'agent',path:pin.path,text:provider,original}).text;
  const composed=pin.path==='assets/password-LjdLcSRV.js'?runtime.replaceAll('aside-password-manager-CZ9IYl_W.webp','aux-password-manager-CZ9IYl_W.webp'):runtime;
  const result=applyAuxAssetReferenceIdentity({component:'agent',path:pin.path,text:composed,original});
  new SourceTextModule(result.text);assert.equal(result.anchors.length,pin.path==='assets/password-LjdLcSRV.js'?0:1);
  for(const asset of auxAssetIdentityRelocations.filter(asset=>asset.references.some(ref=>ref.path===pin.path))){assert.equal(result.text.includes(asset.from.split('/').at(-1)),false);assert.equal(result.text.split(asset.to.split('/').at(-1)).length-1,1);}
  if(pin.path!=='assets/password-LjdLcSRV.js')assert.throws(()=>applyAuxAssetReferenceIdentity({component:'agent',path:pin.path,text:result.text,original}),/Mixed/);
  assert.throws(()=>applyAuxAssetReferenceIdentity({component:'agent',path:pin.path,text:runtime,original:original+' '}),/pin mismatch/);
 }
 const pin=auxAssetIdentityImporters[0],original=readFileSync(root+'/'+pin.path,'utf8');
 assert.throws(()=>applyAuxAssetReferenceIdentity({component:'agent',path:'unreviewed.js',text:original,original}),/Unpinned/);
});

test('transparent visual mapping preserves the complete accepted baseline and rejects mixed paths, missing assets and collisions',()=>{
 const baseline=JSON.parse(readFileSync(new URL('../../docs/acceptance/aux-identity-ui-baseline.json',import.meta.url)));
 const before=structuredClone(baseline.files),mapped=relocateAuxVisualBaseline(baseline.files);
 assert.equal(mapped.relocations.length,7);assert.equal(mapped.files.length,baseline.files.length);assert.equal(mapped.assetByteChanges,false);
 assert.deepEqual(canonicalizeAuxVisualAssetInventory(mapped.files),baseline.files);assert.deepEqual(baseline.files,before);
 const first=auxAssetIdentityRelocations[0],source=baseline.files.find(file=>file.path===first.from);
 assert.throws(()=>relocateAuxVisualBaseline([...baseline.files,{...source,path:first.to}]),/Mixed|colliding/);
 assert.throws(()=>canonicalizeAuxVisualAssetInventory([...mapped.files,source]),/mixed/);
 assert.throws(()=>canonicalizeAuxVisualAssetInventory(mapped.files.filter(file=>file.path!==first.to)),/missing/);
 assert.throws(()=>canonicalizeAuxVisualAssetInventory([...mapped.files,mapped.files[0]]),/colliding/);
 assert.throws(()=>relocateAuxVisualBaseline([{path:'../escape.png',sha256:'0'.repeat(64),bytes:0}]),/Invalid/);
 const changed=mapped.files.map(file=>file.path===first.to?{...file,sha256:'0'.repeat(64)}:file);
 assert.throws(()=>canonicalizeAuxVisualAssetInventory(changed),/changed/);
});

test('pixel hash overrides require explicit externally pinned source receipts and report changed branding separately',()=>{
 const baseline=JSON.parse(readFileSync(new URL('../../docs/acceptance/aux-identity-ui-baseline.json',import.meta.url)));
 const asset=auxAssetIdentityRelocations.find(asset=>asset.from==='assets/aside-CeBDTZrg.webp');
 // Synthetic output exercises pinning arithmetic only; it is not visual/derivation acceptance.
 const bytes=Buffer.from('synthetic reviewed replacement fixture');
 const sourceBytes=readFileSync(new URL('../../assets/brand/arch-mark.svg',import.meta.url));
 const receipt={version:1,kind:'aux-reviewed-asset-replacement',path:asset.from,originalSha256:asset.sha256,output:{sha256:hash(bytes),bytes:bytes.length},source:{kind:'canonical-aux-svg',sha256:hash(sourceBytes)}};
 const receiptBytes=Buffer.from(JSON.stringify(receipt));
 const proof={receiptBytes,receiptSha256:hash(receiptBytes),sourceBytes},reviewedReplacements=[proof];
 const result=relocateAuxAssetPath({component:'agent',path:asset.from,bytes,reviewedReplacements});
 assert.equal(result.path,asset.to);assert.equal(result.bytes,bytes);assert.equal(result.anchors[0].replacementProof.receiptSha256,proof.receiptSha256);
 const mapped=relocateAuxVisualBaseline(baseline.files,{reviewedReplacements});
 assert.equal(mapped.explicitBrandingReplacements,1);assert.equal(mapped.unchangedRelocatedAssets,6);assert.equal(mapped.assetByteChanges,true);
 const entry=mapped.files.find(file=>file.path===asset.to);assert.equal(entry.sha256,hash(bytes));
 const canonical=canonicalizeAuxVisualAssetInventory(mapped.files,{reviewedReplacements});
 assert.equal(canonical.find(file=>file.path===asset.from).sha256,hash(bytes)); // Never pretend the changed raster matches old pixels.
 assert.throws(()=>relocateAuxAssetPath({component:'agent',path:asset.from,bytes}),/pin mismatch/);
 assert.throws(()=>relocateAuxVisualBaseline(baseline.files,{reviewedReplacements:[{...proof,receiptBytes:Buffer.concat([receiptBytes,Buffer.from(' ')])}]}),/receipt pin/);
 assert.throws(()=>relocateAuxVisualBaseline(baseline.files,{reviewedReplacements:[{...proof,sourceBytes:Buffer.from('wrong canonical source')}]}),/source proof/);
 assert.throws(()=>relocateAuxVisualBaseline(baseline.files,{reviewedReplacements:[proof,proof]}),/colliding/);
 const rasterReceipt={...receipt,source:{kind:'reviewed-output-source',sha256:hash(bytes)}};
 const rasterReceiptBytes=Buffer.from(JSON.stringify(rasterReceipt));
 assert.equal(relocateAuxVisualBaseline(baseline.files,{reviewedReplacements:[{receiptBytes:rasterReceiptBytes,receiptSha256:hash(rasterReceiptBytes),sourceBytes:bytes}]}).explicitBrandingReplacements,1);
});
