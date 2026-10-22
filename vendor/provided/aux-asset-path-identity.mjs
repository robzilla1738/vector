/** Reviewed filename relocation only. Asset bytes and rendered UI are unchanged. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const pins = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-asset-path-identity/inputs.json', import.meta.url), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const safe = path => typeof path === 'string' && path.length && !path.startsWith('/') && !/[\\\u0000-\u001f]/.test(path) && !path.split('/').some(p=>['','.','..'].includes(p));
export const auxAssetIdentityRelocations = Object.freeze(pins.assets.map(asset=>Object.freeze({...asset,references:Object.freeze(asset.references.map(ref=>Object.freeze({...ref})))})));
export const auxAssetIdentityImporters = Object.freeze(pins.importers.map(({path,sourceSha256})=>Object.freeze({path,sourceSha256})));

const canonicalSvgSha256='45ba4f1d823cab3085cad8902fd17420ff5a9a5ac3139b180bfc0902875f515c';
function effectiveAssets(reviewedReplacements=[]) {
  if(!Array.isArray(reviewedReplacements))throw Error('Explicit reviewed asset receipt array required');
  const assets=pins.assets.map(asset=>({...asset})),seen=new Set;
  for(const proof of reviewedReplacements){
    if(!proof||(!Buffer.isBuffer(proof.receiptBytes)&&!(proof.receiptBytes instanceof Uint8Array))||!/^[a-f0-9]{64}$/.test(proof.receiptSha256??'')||hash(proof.receiptBytes)!==proof.receiptSha256)throw Error('Reviewed asset receipt pin mismatch');
    let receipt;try{receipt=JSON.parse(Buffer.from(proof.receiptBytes).toString('utf8'));}catch{throw Error('Invalid reviewed asset receipt JSON');}
    const asset=assets.find(asset=>asset.from===receipt.path);
    if(receipt.version!==1||receipt.kind!=='aux-reviewed-asset-replacement'||!asset||seen.has(receipt.path)||receipt.originalSha256!==asset.sha256)throw Error('Invalid or colliding reviewed asset replacement');
    if(!/^[a-f0-9]{64}$/.test(receipt.output?.sha256??'')||!Number.isSafeInteger(receipt.output?.bytes)||receipt.output.bytes<1)throw Error('Invalid reviewed asset output pin');
    if((!Buffer.isBuffer(proof.sourceBytes)&&!(proof.sourceBytes instanceof Uint8Array))||hash(proof.sourceBytes)!==receipt.source?.sha256)throw Error('Reviewed asset source proof mismatch');
    if(receipt.source.kind==='canonical-aux-svg'){
      if(receipt.source.sha256!==canonicalSvgSha256)throw Error('Canonical Aux SVG identity mismatch');
    }else if(receipt.source.kind==='reviewed-output-source'){
      if(receipt.source.sha256!==receipt.output.sha256||proof.sourceBytes.byteLength!==receipt.output.bytes)throw Error('Reviewed output source does not match asset');
    }else throw Error('Unsupported reviewed asset source proof');
    asset.sha256=receipt.output.sha256;asset.bytes=receipt.output.bytes;
    asset.replacementProof={receiptSha256:proof.receiptSha256,sourceKind:receipt.source.kind,sourceSha256:receipt.source.sha256};
    seen.add(receipt.path);
  }
  return assets;
}
const summary=assets=>({explicitBrandingReplacements:assets.filter(asset=>asset.replacementProof&&asset.sha256!==pins.assets.find(pin=>pin.from===asset.from).sha256).length,unchangedRelocatedAssets:assets.filter(asset=>asset.sha256===pins.assets.find(pin=>pin.from===asset.from).sha256).length});

/** Stage this result under its returned path; the original Buffer is not changed. */
export function relocateAuxAssetPath({component,path,bytes,reviewedReplacements=[]}) {
  if(component!=='agent') return {path,bytes,anchors:[]};
  if(pins.assets.some(asset=>asset.to===path)) throw Error('Asset path identity already relocated or colliding');
  const asset=effectiveAssets(reviewedReplacements).find(asset=>asset.from===path);
  if(!asset) return {path,bytes,anchors:[]};
  if(!Buffer.isBuffer(bytes)&&!(bytes instanceof Uint8Array))throw Error('Exact asset bytes required');
  if(bytes.byteLength!==asset.bytes||hash(bytes)!==asset.sha256)throw Error(`Aux asset source pin mismatch: ${path}`);
  return {path:asset.to,bytes,anchors:[{kind:'identity',name:'Aux asset path only',find:asset.from,replace:asset.to,count:1,sha256:asset.sha256,bytes:asset.bytes,...asset.replacementProof?{replacementProof:asset.replacementProof}:{}}]};
}
/** Apply once after other reviewed text transforms. Original importers stay hash-pinned. */
export function applyAuxAssetReferenceIdentity({component,path,text,original}) {
  if(typeof text!=='string')throw Error('Actual asset reference text required');
  const pin=component==='agent'&&pins.importers.find(input=>input.path===path);
  if(!pin){
    if(pins.assets.some(asset=>text.includes(asset.from.split('/').at(-1))||text.includes(asset.to.split('/').at(-1))))throw Error('Unpinned Aux asset importer');
    return {text,anchors:[]};
  }
  if(typeof original!=='string'||hash(original)!==pin.sourceSha256)throw Error('Aux asset importer source pin mismatch');
  let output=text;const anchors=[];
  for(const rule of pin.rules){
    const oldCount=output.split(rule.find).length-1,newCount=output.split(rule.replace).length-1;
    if(rule.mayAlreadyBeRelocatedByExistingBranding&&oldCount===0&&newCount===rule.count)continue;
    if(newCount)throw Error('Mixed or repeated Aux asset references');
    if(output.split(rule.find).length-1!==rule.count)throw Error(`Aux asset reference drift: ${path}`);
    output=output.split(rule.find).join(rule.replace);
    anchors.push({kind:'identity',name:'Aux asset reference',...rule});
  }
  return {text:output,anchors};
}
function inventory(files) {
  if(!Array.isArray(files)||!files.length)throw Error('Complete visual inventory required');
  const entries=new Map;
  for(const file of files){
    if(!file||!safe(file.path)||entries.has(file.path)||!/^[a-f0-9]{64}$/.test(file.sha256)||!Number.isSafeInteger(file.bytes)||file.bytes<0)throw Error('Invalid or colliding visual inventory entry');
    entries.set(file.path,file);
  }
  return entries;
}
function pinnedAsset(file,asset){if(!file||file.sha256!==asset.sha256||file.bytes!==asset.bytes)throw Error(`Visual relocation asset changed or missing: ${asset.from}`);}
/** Explicit transparent mapping of all seven accepted original paths to delivery.
 * Keep the original baseline externally; use returned files for the delivery gate.
 */
export function relocateAuxVisualBaseline(files,{reviewedReplacements=[]}={}) {
  const entries=inventory(files),assets=effectiveAssets(reviewedReplacements);
  for(const asset of pins.assets){
    if(entries.has(asset.to))throw Error('Mixed or colliding visual baseline paths');
    pinnedAsset(entries.get(asset.from),asset);
  }
  const byPath=new Map(assets.map(asset=>[asset.from,asset]));
  const counts=summary(assets);
  return {files:files.map(file=>{const asset=byPath.get(file.path);return asset?{...file,path:asset.to,sha256:asset.sha256,bytes:asset.bytes}:{...file};}),relocations:assets.map(({from,to,sha256,bytes,replacementProof})=>({from,to,sha256,bytes,...replacementProof?{replacementProof}:{}})),assetByteChanges:counts.explicitBrandingReplacements>0,baselineVisualFiles:files.length,expectedUnchangedVisualFiles:files.length-counts.explicitBrandingReplacements,...counts};
}
/** Inverse mapping for comparing an actual delivered inventory to the original
 * accepted baseline. Reject old/mixed names and changed bytes before comparison.
 */
export function canonicalizeAuxVisualAssetInventory(files,{reviewedReplacements=[]}={}) {
  const entries=inventory(files),assets=effectiveAssets(reviewedReplacements);
  for(const asset of assets){
    if(entries.has(asset.from))throw Error('Unrelocated or mixed delivered visual paths');
    pinnedAsset(entries.get(asset.to),asset);
  }
  const mapping=new Map(pins.assets.map(asset=>[asset.to,asset.from]));
  return files.map(file=>({...file,path:mapping.get(file.path)??file.path}));
}
