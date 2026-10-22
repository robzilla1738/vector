// Inactive external materializer. Returns bytes only; never edits an entry/app.
import {readFileSync,realpathSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
const root=fileURLToPath(new URL('../../../../../',import.meta.url));
const hash=x=>createHash('sha256').update(x).digest('hex');
export async function inspectDesktopBundle(){
 const require=createRequire(realpathSync(resolve(root,'services/aux-cloud/node_modules/tsx/package.json')));
 const {build,version}=require('esbuild');
 const zod=realpathSync(resolve(root,'services/aux-cloud/node_modules/zod'));
 const output=await build({absWorkingDir:root,entryPoints:['docs/integration/proposed/aux-sync-recovery-v2/source/desktop.ts'],bundle:true,platform:'node',format:'esm',target:'node24',write:false,metafile:true,minifyWhitespace:true,legalComments:'eof',logLevel:'silent'});
 if(output.outputFiles.length!==1)throw Error('Unexpected recovery asset count');
 const inventory=Object.keys(output.metafile.inputs).map(name=>{
  const file=realpathSync(resolve(root,name)),zrel=relative(zod,file);
  let id;
  if(!zrel.startsWith('..')&&!zrel.startsWith('/'))id='zod/'+zrel;
  else if(file===resolve(root,'docs/integration/proposed/aux-sync-recovery-v2/source/desktop.ts')||file===resolve(root,'services/aux-cloud/src/sync-recovery-crypto.ts'))id='workspace/'+relative(root,file);
  else throw Error('Unexpected desktop dependency');
  return {id,sha256:hash(readFileSync(file))};
 }).sort((a,b)=>a.id.localeCompare(b.id));
 const license=readFileSync(resolve(zod,'LICENSE'),'utf8');if(license.includes('*/'))throw Error('Unexpected Zod notice');
 inventory.push({id:'zod/LICENSE',sha256:hash(license)});inventory.sort((a,b)=>a.id.localeCompare(b.id));
 const bytes=Buffer.concat([Buffer.from(output.outputFiles[0].contents),Buffer.from('\n/* Bundled Zod notice\n'+license+'*/\n')]);
 return {version,inventory,bytes,sha256:hash(bytes)};
}
export async function materializeSyncRecoveryDesktop(){
 const pin=JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url))),actual=await inspectDesktopBundle();
 if(actual.version!==pin.bundle.esbuildVersion||actual.sha256!==pin.bundle.sha256||JSON.stringify(actual.inventory)!==JSON.stringify(pin.bundle.dependencies))throw Error('Recovery bundle/compiler/dependency drift');
 return {name:'aux-sync-recovery.mjs',bytes:actual.bytes,mode:0o644,sha256:actual.sha256,activation:false};
}
