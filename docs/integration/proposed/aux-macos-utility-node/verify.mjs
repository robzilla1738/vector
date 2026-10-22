import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import path from 'node:path';import {fileURLToPath} from 'node:url';import assert from 'node:assert/strict';
import {adaptMacUtilityRouting} from './source/adapt.mjs';import {findMachOSeaSection,readSeaBlob} from '../../../../vendor/aside/lib/sea.mjs';
const here=fileURLToPath(new URL('.',import.meta.url)),repo=fileURLToPath(new URL('../../../../',import.meta.url)),artifactRoot=process.argv[2],pins=JSON.parse(await readFile(path.join(here,'source-pins.json'))),hash=b=>createHash('sha256').update(b).digest('hex');
for(const p of pins.dependencies)assert.equal(hash(await readFile(path.isAbsolute(p.path)?p.path:path.join(repo,p.path))),p.sha256,p.path);
for(const [file,sha] of Object.entries(pins.sources))assert.equal(hash(await readFile(path.join(here,file))),sha,file);
const node=await readFile(path.join(artifactRoot,pins.daemons.node.path),'utf8'),binary=await readFile(path.join(artifactRoot,pins.daemons.sea.path));assert.equal(hash(binary),pins.daemons.sea.binarySha256);
const section=findMachOSeaSection(binary),blob=readSeaBlob(binary.subarray(section.offset,section.offset+section.size));assert.equal(blob.flags,pins.daemons.sea.flags);assert.equal(blob.assets.length,pins.daemons.sea.assetCount);
for(const [kind,text] of [['node',node],['sea',blob.code]]){const result=adaptMacUtilityRouting(text,{kind});assert.equal(result.anchors.length,8);assert.equal(result.text.slice(0,4096),text.slice(0,4096));assert.equal((result.text.match(/nativePdf\./g)||[]).length,(text.match(/nativePdf\./g)||[]).length);}
const owner=await readFile(path.join(here,'source/AuxMacUtilityOwner.swift'),'utf8'),cc=await readFile(path.join(here,'source/AuxMacUtilityEnvironmentHost.cc'),'utf8'),module=await readFile(path.join(here,'source/utility-module.cc'),'utf8');
for(const text of [owner,cc,module])for(const no of ['AuxCreateSignedDevelopmentOwner','AuxOwnedCommandDispatcher','SecItem','getenv(','AUX_ENABLE'])assert(!text.includes(no),no);
assert(cc.includes('RTLD_NOLOAD|RTLD_LOCAL|RTLD_NOW'));assert(cc.includes('registry().retained'));assert(cc.indexOf('napi_add_env_cleanup_hook(env,Cleanup')<cc.indexOf('void* owner=AuxCreateMacUtilityOwner()'));
assert(module.includes('host->AttachCurrentEnvironment(env,exports)'));assert(module.includes('CleanupHost'));
console.log('PASS: exact source inputs, both guarded entry layouts/eight routing edits, five-only native graph and pending code-image ownership');
