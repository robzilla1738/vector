import {createHash} from 'node:crypto';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
// Called after every final Agent branding/integration transform and before assembly.
// files are that completed stage's actual output inventory, including manifest.json.
export function reviseAgentManifest({manifestText,files,review}) {
 const manifest=JSON.parse(manifestText);
 if(manifest.version!=='1.26.1016.1852')throw Error('Expected pinned supplied manifest version');
 if(!manifest.background?.service_worker||!manifest.key)throw Error('Agent identity/worker missing');
 const paths=new Set();
 for(const f of files){
  if(paths.has(f.path)||typeof f.path!=='string'||!/^[a-f0-9]{64}$/.test(f.outputSha256))throw Error('Invalid final Agent inventory');
  paths.add(f.path);
 }
 const manifestEntry=files.find(f=>f.path==='manifest.json');
 if(manifestEntry?.outputSha256!==hash(manifestText))throw Error('Final manifest inventory mismatch');
 const canonical=files.map(f=>[f.path,f.outputSha256]).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0);
 const fingerprint=hash(JSON.stringify(canonical));
 if(!review||!Number.isInteger(review.revision)||review.revision<1||review.revision>63683||review.fingerprint!==fingerprint)throw Error(`Agent revision review mismatch: ${fingerprint}`);
 const version=`1.26.1016.${1852+review.revision}`;
 const oldVersion=JSON.stringify(manifest.version),newVersion=JSON.stringify(version);
 const find=`"version": ${oldVersion}`;
 if(manifestText.split(find).length!==2)throw Error('Expected exactly one formatted manifest version');
 // Keep source-visible version for existing diagnostics; all identity/state keys stay fixed.
 if(Object.hasOwn(manifest,'version_name'))throw Error('Unexpected supplied version_name');
 const replace=`"version": ${newVersion},\n  "version_name": "1.26.1016.1852"`;
 const text=manifestText.replace(find,replace);
 return {text,anchor:{kind:'integration',find,replace,count:1},sourceVersion:manifest.version,version,fingerprint,outputSha256:hash(text)};
}
