// Derive only official transform deltas; never evaluate generated daemon code.
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {findMachOSeaSection,readSeaBlob} from '../../../../../vendor/aside/lib/sea.mjs';
import {adaptDaemonCodeWithMacUtilities} from '../../../../../vendor/provided/aux-macos-utility-stage.mjs';
import {transformProviderFundedLaunch} from '../../../../../vendor/provided/provider-funded-launch.mjs';
import {applyAuxCommandPathParsers} from '../../../../../vendor/provided/aux-command-path-parsers.mjs';
const root=new URL('../../../../../',import.meta.url);
const oldSource=execFileSync('git',['show','01dfbbb9d^:vendor/aside/patches/chatgpt.mjs'],{cwd:root,encoding:'utf8'}),newSource=readFileSync(new URL('vendor/aside/patches/chatgpt.mjs',root),'utf8');
const instrument=async text=>{const needle='patches.push({ name, count });';if(text.split(needle).length!==2)throw Error('Transform observation differs');return (await import('data:text/javascript;base64,'+Buffer.from(text.replace(needle,'patches.push({ name, count, before, after });')).toString('base64'))).applyOfficialChatGPT;};
const oldApply=await instrument(oldSource),newApply=await instrument(newSource);
const binary=readFileSync('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/MacOS/aside-daemon'),section=findMachOSeaSection(binary),blob=readSeaBlob(binary.subarray(section.offset,section.offset+section.size));
const base=adaptDaemonCodeWithMacUtilities(blob.code,{},'aux-v1',2);
const launch=transformProviderFundedLaunch({component:'daemon',path:'entry.mjs',text:base.code,stateIdentityVersion:2});
const parsed=applyAuxCommandPathParsers(launch.text).code;
const old=oldApply(parsed,{runtimeExpression:'PINNED_RUNTIME'}),next=newApply(parsed,{runtimeExpression:'PINNED_RUNTIME'}),anchors=[];
for(const row of next.patches){const previous=old.patches.find(value=>value.name===row.name);if(previous?.after===row.after)continue;anchors.push({name:row.name,before:previous?previous.after:row.before,after:row.after,count:1});}
writeFileSync(new URL('./source/daemon-anchors.json',import.meta.url),JSON.stringify(anchors,null,2)+'\n');console.log(JSON.stringify({anchors:anchors.map(({name})=>name),count:anchors.length}));
