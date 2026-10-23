/** Two fixed dormant resources; never replaces the ordinary index/SEA entry. */
import {readFile, lstat, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {findMachOSeaSection, readSeaBlob} from '../../../../../vendor/aside/lib/sea.mjs';
import {projectOwnedNativeEntryWithFixedPty} from '../../aux-native-owned-entry-pty/source/project.mjs';
import {projectOwnedExecLifetime} from '../../aux-native-exec-lifetime/source/project.mjs';
const pins=JSON.parse(await readFile(new URL('../inputs.json',import.meta.url),'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const base='apps/daemon/Aux Daemon.app/Contents/Resources/';
export const defaultIndexPath=base+'node-development/index.mjs';
async function pinned(path,expected){
 const stat=await lstat(path);
 if(!stat.isFile()||stat.isSymbolicLink())throw Error('Regular fixed resource required');
 const bytes=await readFile(path);if(hash(bytes)!==expected)throw Error('Current native entry input hash mismatch');return bytes;
}
export function projectCurrentNativeEntry(originalDaemon,index){
 if(hash(originalDaemon)!==pins.originalDaemonSha256||hash(index)!==pins.inputIndexSha256||index.length!==pins.inputIndexBytes)throw Error('Exact current20748 source bytes required');
 const section=findMachOSeaSection(originalDaemon);
 const original=readSeaBlob(originalDaemon.subarray(section.offset,section.offset+section.size)).code;
 const text=projectOwnedExecLifetime(projectOwnedNativeEntryWithFixedPty(original,index.toString('utf8')));
 const bytes=Buffer.from(text);
 if(hash(bytes)!==pins.entrySha256)throw Error('Reviewed complete native entry projection differs');
 return bytes;
}
export async function currentNativeEntryResources({repositoryRoot,index}){
 for(const [path,expected]of Object.entries(pins.dependencies))await pinned(join(repositoryRoot,path),expected);
 const original=await pinned(join(repositoryRoot,pins.originalDaemon),pins.originalDaemonSha256);
 const entry=projectCurrentNativeEntry(original,index);
 const loader=await pinned(join(repositoryRoot,'docs/integration/proposed/aux-native-owned-entry-routing/source/aux-owned-native.cjs'),pins.loaderSha256);
 return [{path:base+'node-development/aux-native-entry.mjs',bytes:entry,sha256:pins.entrySha256,mode:0o644},
  {path:base+'native/aux-owned-native.cjs',bytes:loader,sha256:pins.loaderSha256,mode:0o644}];
}
/** Package-private transaction caller only. Inclusion is deliberately not activation. */
export async function addDormantCurrentNativeEntry({resources,assembled,repositoryRoot}){
 if(assembled.identityProfile!=='aux-v1'||assembled.stateIdentityVersion!==2||assembled.daemonRuntime!=='provided-node-development'||
    assembled.nativeMainReplacement?.mode!=='inactive-embedded-native-main'||assembled.nativeEntryProjection)throw Error('Inactive state2 native-main package required');
 const entries=assembled.files.filter(f=>f.path===defaultIndexPath);
 if(entries.length!==1||entries[0].type!=='file'||entries[0].sha256!==pins.inputIndexSha256)throw Error('Exact current default-entry inventory required');
 const index=await pinned(join(resources,defaultIndexPath),pins.inputIndexSha256);
 const generated=await currentNativeEntryResources({repositoryRoot,index});
 for(const file of generated){
  if(assembled.files.some(f=>f.path===file.path))throw Error('Mixed or duplicate native entry resource');
  const destination=join(resources,file.path);
  // Both existing parent directories come from checked assembly. No symlink traversal is introduced.
  const parent=destination.slice(0,destination.lastIndexOf('/'));const stat=await lstat(parent);
  if(!stat.isDirectory()||stat.isSymbolicLink())throw Error('Regular copied resource parent required');
  await writeFile(destination,file.bytes,{flag:'wx',mode:file.mode});
  await pinned(destination,file.sha256);
  if(((await lstat(destination)).mode&0o777)!==file.mode)throw Error('Generated resource mode mismatch');
  assembled.files.push({path:file.path,type:'file',sha256:file.sha256,mode:file.mode,source:'reviewed-native-entry-projection',changeKinds:['integration']});
 }
 await pinned(join(resources,defaultIndexPath),pins.inputIndexSha256);
 const report={format:'aux.dormant-native-entry.package.v1',dormant:true,sourceSha256:pins.inputIndexSha256,
  files:generated.map(({path,sha256,mode,bytes})=>({path,sha256,mode,bytes:bytes.length})),
  requiredReaderSha256:pins.reader.proposedSha256,readerPresentInBuild68715:false,
  defaultEntryUnchanged:true,coldHookEnabled:false,runtimeAuthorityGranted:false};
 assembled.nativeEntryProjection=report;
 await writeFile(join(resources,'bundle.json'),JSON.stringify(assembled,null,2)+'\n');
 return report;
}
