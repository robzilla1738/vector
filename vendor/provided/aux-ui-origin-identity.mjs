/** Exact static service-origin/permission cohort; no deployment or network I/O. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolveCloudServicePolicy} from './cloud-service-policy.mjs';
const pin=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-ui-origin-identity/inputs.json',import.meta.url),'utf8'));
const sha=text=>createHash('sha256').update(text).digest('hex');
const callerPaths=['background.js','assets/strip-markdown-DRcmtuJc.js'];
function pinned(path,original) {
  const file=pin.files.find(file=>file.path===path);
  if(!file||typeof original!=='string'||sha(original)!==file.sourceSha256)throw Error('Aux UI origin original source pin mismatch');
}
function exposure(manifest,policy) {
  const source=JSON.parse(manifest).web_accessible_resources;
  const original=JSON.parse(pin.mainExposureBlock.slice(2));
  const matching=source.filter(item=>JSON.stringify(item)===JSON.stringify(original));
  if(matching.length!==1)throw Error('Aux main-page original exposure shape drift');
  return source.flatMap(item=>item===matching[0]?(policy.mode==='local'?[]:[{...item,matches:[policy.origins.api+'/*']}]):[item]);
}
export function applyAuxUiOriginIdentity({component,path,text,original},cloudOptions={}) {
  if(component!=='agent'||!['manifest.json',...pin.demoFiles].includes(path))return {text,anchors:[]};
  pinned(path,original);
  if(typeof text!=='string')throw Error('Actual composed Agent text required');
  const policy=resolveCloudServicePolicy(cloudOptions);let find,replace;
  if(path==='manifest.json') {
    // Compare the complete resource cohort before touching only this entry.
    const expected=exposure(original,policy),current=JSON.parse(text);
    if(JSON.stringify(current.web_accessible_resources)!==JSON.stringify(JSON.parse(original).web_accessible_resources))throw Error('Mixed or changed Agent resource permissions');
    find=policy.mode==='local'?pin.mainExposureBlock:pin.cloudOriginFind;
    replace=policy.mode==='local'?'':JSON.stringify(policy.origins.api+'/*');
    if(text.split(find).length-1!==1)throw Error('Aux UI origin permission anchor drift');
    const output=text.replace(find,replace);
    if(JSON.stringify(JSON.parse(output).web_accessible_resources)!==JSON.stringify(expected))throw Error('Aux UI origin permission output mismatch');
    return {text:output,anchors:[{kind:'identity',name:'Aux main-page exact service exposure',find,replace,count:1}]};
  }
  find='https://aside.com';replace=pin.homeOrigin;
  if(original.split(find).length-1!==1||text.split(find).length-1!==1||text.includes(replace))throw Error('Aux product demo origin drift or repeated generation');
  return {text:text.replace(find,replace),anchors:[{kind:'identity',name:'Aux product demo home href',find,replace,count:1}]};
}

/** Run on the actual completed manifest and both composed API producer modules.
 * This pairs declared origins; it does not assert hosted embedding/sign-in.
 */
export function assertAuxUiOriginPairing({manifestText,manifestOriginal,callers},cloudOptions={}) {
  pinned('manifest.json',manifestOriginal);
  const policy=resolveCloudServicePolicy(cloudOptions),manifest=JSON.parse(manifestText);
  if(JSON.stringify(manifest.web_accessible_resources)!==JSON.stringify(exposure(manifestOriginal,policy)))throw Error('Aux UI resource-origin generation mismatch');
  if(!Array.isArray(callers)||callers.length!==2||new Set(callers.map(caller=>caller.path)).size!==2)throw Error('Both exact Agent API producer modules required');
  for(const path of callerPaths) {
    const caller=callers.find(caller=>caller.path===path);
    if(!caller||typeof caller.text!=='string')throw Error('Missing paired Agent API producer');
    pinned(path,caller.original);
    if(caller.text.split(policy.origins.api).length-1!==1||/https:\/\/api\.(?:aside|asidehq)\.com/.test(caller.text))throw Error('Agent API producer origin generation mismatch');
    const forbidden=policy.mode==='local'?['https://dev-cloud.getaux.co','https://api.getaux.co']:['http://127.0.0.1:9/aux-unavailable/api',policy.mode==='development'?'https://api.getaux.co':'https://dev-cloud.getaux.co'];
    if(forbidden.some(origin=>caller.text.includes(origin)))throw Error('Mixed Agent API producer generations');
  }
  return {format:'aux.ui-origin-pairing.v1',mode:policy.mode,mainExposureOrigins:policy.mode==='local'?[]:[policy.origins.api],callerPaths:[...callerPaths],hostedEmbeddingVerified:false};
}
