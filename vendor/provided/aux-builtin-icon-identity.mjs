/** Pinned metadata-only relocation; no request, account or UI layout change. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolveCloudServicePolicy} from './cloud-service-policy.mjs';
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-builtin-icon-hosting/source-inventory.json',import.meta.url),'utf8'));
export function applyAuxBuiltinIconIdentity({component,path,text,original},cloudOptions){
 if(typeof text!=='string')throw TypeError('Actual metadata text required');
 const row=component==='daemon'?pins.rows.find(r=>r.sourcePath===path||r.outputPath===path):undefined;
 if(!row){if(text.includes('https://static.asidehq.com/apps/builtin-skills/'))throw Error('Unpinned original builtin icon reference');return{text,anchors:[]};}
 if(createHash('sha256').update(original).digest('hex')!==row.sourceSha256)throw Error('Builtin skill source pin drift');
 const policy=resolveCloudServicePolicy(cloudOptions);
 if(policy.mode==='local')throw Error('Builtin icon relocation requires an explicit reviewed Aux asset profile');
 const find=row.iconFind;
 if(text.split(find).length!==2)throw Error('Mixed, repeated or missing builtin icon anchor');
 const replace='icon: '+JSON.stringify(policy.origins.api+'/builtin-skills/v1/'+row.targetFile);
 return{text:text.replace(find,replace),anchors:[{kind:'identity',name:'Aux-owned builtin icon origin',find,replace,count:1}],assetProfile:policy.mode};
}
