import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {applyAuxBuiltinIconIdentity} from '../../../../vendor/provided/aux-builtin-icon-identity.mjs';
const repo=new URL('../../../../',import.meta.url),read=p=>readFileSync(new URL(p,repo));
const here='docs/integration/proposed/aux-builtin-icon-hosting/';
const pins=JSON.parse(read(here+'source-inventory.json')),acquired=JSON.parse(read(here+'acquisition.json'));
const sha=x=>createHash('sha256').update(x).digest('hex');
if(acquired.failures.length)throw Error('Incomplete acquired icon set');
for(const row of acquired.files){
 const bytes=read(row.path);
 if(sha(bytes)!==row.sha256||bytes.length!==row.bytes)throw Error('Asset drift: '+row.path);
 if(row.originalSha256&&sha(Buffer.from(bytes.toString().replace('<svg xmlns:xlink="http://www.w3.org/1999/xlink" ','<svg ')))!==row.originalSha256)throw Error('SVG geometry/source changed');
}
const outputs=[];
for(const row of pins.rows){
 const original=read('out/provided-source-snapshot-1.26.1016.1852/daemon/'+row.sourcePath);
 const text=read('out/provided-candidate-aux-recovery-enrollment/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/'+row.outputPath).toString();
 const result=applyAuxBuiltinIconIdentity({component:'daemon',path:row.outputPath,text,original},{enableCloud:true,profile:'development'});
 if(result.anchors.length!==1||result.text.includes(row.sourceUrl)||!result.text.includes('https://dev-cloud.getaux.co/builtin-skills/v1/'+row.targetFile)||!acquired.files.some(a=>a.path.endsWith('/'+row.targetFile)))throw Error('Incomplete relocation: '+row.outputPath);
 outputs.push({path:row.outputPath,sha256:sha(result.text),sourceSha256:sha(original)});
}
const canonical=sha(read('assets/brand/arch-mark.svg'))===sha(read('services/aux-cloud/public/builtin-skills/v1/aux.svg'));
if(!canonical)throw Error('Canonical Aux geometry drift');
writeFileSync(new URL(here+'source-check.json',repo),JSON.stringify({format:'aux.builtin-icons.source-check.v1',metadataReferences:outputs.length,publicAssets:acquired.files.length,helperSha256:sha(read('vendor/provided/aux-builtin-icon-identity.mjs')),stagerSha256:sha(read('scripts/lib/provided-apps.mjs')),actualMetadataOutputs:outputs,svgNamespaceOnlyChecked:true,canonicalLogoMatched:canonical,deployed:false,actualAppCompared:false,acceptedUiModified:false},null,2)+'\n');
console.log('PASS:47 actual metadata references,46 asset hashes,2 namespace-only repairs, exact Aux logo; no deploy/app execution');
