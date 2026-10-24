/** Verified original catalog -> explicit Aux v2 immutable seed. No runtime execution. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root='/Users/rcourson/Documents/Vibe/web';
const here=path.join(root,'docs/integration/proposed/standard-profile-isolation/memory-runtime-v2-a1');
const source=path.join(root,'out/provided-source-snapshot-1.26.1016.1852/memory');
const output='/private/tmp/aux-memory-runtime-v2-20261024-a1';
const distribution=path.join(output,'distribution');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const originalPins=JSON.parse(await fs.readFile(path.join(root,'docs/source/provided-runtime-inputs.json'),'utf8')).components.memory;
const derivation=JSON.parse(await fs.readFile(path.join(root,'docs/integration/proposed/standard-profile-isolation/memory-runtime-identity-a1/derivation-a2.json'),'utf8'));
const binaryPath='/private/tmp/aux-memory-identity-20261024-a1/aux-memory';
const binary=await fs.readFile(binaryPath);
assert.equal(hash(binary),derivation.outputSha256);assert.equal(derivation.signed,false);assert.equal(derivation.executed,false);
const catalogBytes=await fs.readFile(path.join(source,'memory-catalog.json'));
assert.equal(hash(catalogBytes),'7aa00d742d40b5fcd013db3bdd39ab691f81ebaf3d6a70918d1a1c5736eb0ccb');
const originalSource=await fs.readFile('/private/tmp/aux-standard-daemon-projection-20261024-a5/index.mjs','utf8');
assert.equal(hash(originalSource),'d0632af5fb69929ed52a7dc5aa78cfb0d27853933763dfcf51d6c84823fe9515');
const marker='MEMORY_CATALOG_PUBLIC_KEY=`';assert.equal(originalSource.split(marker).length-1,1);
const start=originalSource.indexOf(marker)+marker.length;
const publicKey=originalSource.slice(start,originalSource.indexOf('`',start));
const envelope=JSON.parse(catalogBytes);
assert.equal(envelope.formatVersion,1);
assert(crypto.verify('sha256',Buffer.from('aside-memory-catalog-v1\n'+envelope.payload),publicKey,Buffer.from(envelope.signature,'base64')));
const original=JSON.parse(envelope.payload);
assert.equal(original.formatVersion,1);
await fs.mkdir(output,{mode:0o700});
const compressed=spawnSync('/opt/homebrew/bin/zstd',['-q','-19','--single-thread','-c',binaryPath],{encoding:null,maxBuffer:16*1024*1024});
assert.equal(compressed.status,0,compressed.stderr?.toString());
assert(zlib.zstdDecompressSync(compressed.stdout).equals(binary));
await fs.writeFile(path.join(output,'aux-memory.zst'),compressed.stdout,{flag:'wx',mode:0o600});
const runtime={formatVersion:2,id:'aux-memory-runtime-v2',target:'darwin-arm64',executable:'aux-memory',files:{'aux-memory':{
  bytes:binary.length,sha256:hash(binary),compressedBytes:compressed.stdout.length,compressedSha256:hash(compressed.stdout)}}};
const canonicalRuntime={...runtime,files:{'aux-memory':{bytes:binary.length,sha256:hash(binary)}}};
const runtimeMetadata=Buffer.from(JSON.stringify(canonicalRuntime));
const runtimeKey=hash(runtimeMetadata),hex=runtimeKey.slice(0,32).split('');hex[12]='5';hex[16]=((parseInt(hex[16],16)&3)|8).toString(16);
const runtimeGeneration=[hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].map(chars=>chars.join('')).join('-');
const catalog={format:'aux.bundled-memory-catalog.v1',formatVersion:2,sequence:original.sequence,runtimes:[runtime],models:original.models};
assert(!JSON.stringify(catalog).toLowerCase().includes('aside'));
await fs.mkdir(distribution,{mode:0o700});
for(const file of originalPins.files){
 const absolute=path.join(source,file.path),stat=await fs.lstat(absolute);
 assert(!stat.isSymbolicLink());assert.equal(stat.mode&0o777,file.mode);
 if(file.type==='file'){
  const bytes=await fs.readFile(absolute);assert.equal(bytes.length,file.size);assert.equal(hash(bytes),file.sourceSha256);
 }
 if(file.path==='memory-catalog.json'||file.path==='memory-runtimes'||file.path.startsWith('memory-runtimes/'))continue;
 const target=path.join(distribution,file.path);
 if(file.type==='directory')await fs.mkdir(target,{mode:file.mode});
 else {await fs.copyFile(absolute,target);await fs.chmod(target,file.mode);assert.equal(hash(await fs.readFile(target)),file.sourceSha256)}
}
const runtimeRelative=`memory-runtimes/${runtimeKey}/${runtimeGeneration}`;
await fs.mkdir(path.join(distribution,runtimeRelative),{recursive:true,mode:0o700});
await fs.writeFile(path.join(distribution,runtimeRelative,'aux-memory'),binary,{flag:'wx',mode:0o700});
await fs.writeFile(path.join(distribution,runtimeRelative,'runtime.json'),runtimeMetadata,{flag:'wx',mode:0o600});
await fs.writeFile(path.join(distribution,'memory-runtimes',runtimeKey,'CURRENT'),runtimeGeneration,{flag:'wx',mode:0o600});
const derivedCatalog=Buffer.from(JSON.stringify(catalog));
await fs.writeFile(path.join(distribution,'memory-catalog.json'),derivedCatalog,{flag:'wx',mode:0o600});
const entries=[];
async function walk(directory,relative=''){
 for(const name of (await fs.readdir(directory)).sort()){
  const absolute=path.join(directory,name),item=relative?relative+'/'+name:name,stat=await fs.lstat(absolute);
  assert(!stat.isSymbolicLink());
  if(stat.isDirectory()){entries.push({path:item,type:'directory',mode:stat.mode&0o777});await walk(absolute,item)}
  else {const bytes=await fs.readFile(absolute);entries.push({path:item,type:'file',mode:stat.mode&0o777,size:bytes.length,sha256:hash(bytes)})}
 }
}
await walk(distribution);
const groups=[];
for(const kind of ['models','memory-runtimes']){
 const keys=await fs.readdir(path.join(distribution,kind));assert.equal(keys.length,1);
 const key=keys[0],generation=await fs.readFile(path.join(distribution,kind,key,'CURRENT'),'utf8');
 assert(/^[a-f0-9]{64}$/.test(key)&&/^[a-f0-9-]{36}$/.test(generation));
 const prefix=`${kind}/${key}/${generation}`;
 const files=entries.filter(file=>file.path.startsWith(prefix+'/')).map(file=>({...file,path:file.path.slice(prefix.length+1)}));
 const descriptor=kind==='models'?'model.json':'runtime.json';
 const descriptorBytes=await fs.readFile(path.join(distribution,prefix,descriptor));assert.equal(hash(descriptorBytes),key);
 const parsed=JSON.parse(descriptorBytes),candidate=kind==='models'?catalog.models.find(model=>model.id===parsed.id):runtime;
 assert(candidate);
 const expected={...candidate,files:Object.fromEntries(Object.entries(candidate.files).map(([name,pin])=>[name,{bytes:pin.bytes,sha256:pin.sha256}]))};
 assert.deepEqual(parsed,expected);
 for(const [name,pin]of Object.entries(parsed.files)){
  const actual=files.find(file=>file.path===name);assert(actual&&actual.type==='file');assert.equal(actual.size,pin.bytes);assert.equal(actual.sha256,pin.sha256);
 }
 groups.push({kind,key,generation,sourcePrefix:prefix,descriptor,files});
}
const seed={format:'aux.bundled-memory-seed.v2',catalogSha256:hash(derivedCatalog),target:'darwin-arm64',groups,entries};
const seedBytes=Buffer.from(JSON.stringify(seed));
await fs.writeFile(path.join(output,'seed.json'),seedBytes,{flag:'wx',mode:0o600});
const result={format:'aux.memory-runtime-v2.distribution.actual.v1',passed:true,output,distribution,
 originalCatalogSha256:hash(catalogBytes),originalSignatureVerified:true,derivedCatalogSigned:false,
 derivedCatalogSha256:hash(derivedCatalog),seedManifestSha256:hash(seedBytes),runtimeManifestSha256:runtimeKey,
 runtimeSha256:hash(binary),compressedBytes:compressed.stdout.length,compressedSha256:hash(compressed.stdout),
 compressionRoundTripPassed:true,modelsPreserved:true,onlyDarwinArm64RuntimeClaimed:true,groups:groups.map(({kind,key,generation})=>({kind,key,generation})),
 originalSeedSourceSha256:hash(await fs.readFile(path.join(root,'vendor/provided/memory-seed.cjs'))),
 zstdToolSha256:hash(await fs.readFile('/opt/homebrew/bin/zstd')),
 productExecuted:false,ownerStateAccessed:false,sourceAndNativePairingPending:true,packaged:false};
await fs.writeFile(path.join(here,'actual-distribution-a1.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,groups:groups.length,entries:entries.length,originalSignatureVerified:true,productExecuted:false}));
