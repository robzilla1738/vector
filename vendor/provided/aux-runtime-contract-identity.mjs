/** Source-pinned Aux runtime contracts. Pure text/state transforms; no I/O beyond reviewed pins. */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-runtime-contract-identity/inputs.json',import.meta.url),'utf8'));
const sha=text=>createHash('sha256').update(text).digest('hex');
const brand=(text,branding)=>branding==='aux'?text.replaceAll('ASIDE_','AUX_').replaceAll('Aside','Aux'):text;
const covered=/aside\.(?:verticalTabsTidy|inboxNotification|notificationPermissionChanged|oauth\.openai-codex\.callback|device\.approveConnection|sessions\.|routines\.)|aside:task|#aside-(?:task|file|routine)|aside:google-docs-|aside:web-sidebar-state|aside:billing-embedded-checkout/;
export const auxRuntimeContractInputs=Object.freeze(pins.files.map(({component,path,sourceSha256})=>Object.freeze({component,path,sourceSha256})));

export function applyAuxRuntimeContractIdentity({component,path,text,original,branding='aux'}) {
 if(!['supplied','aux'].includes(branding))throw Error('Unknown Aux runtime contract branding');
 const pin=pins.files.find(file=>file.component===component&&file.path===path);
 if(!pin){if(covered.test(text))throw Error('Unpinned runtime contract input');return{text,path,anchors:[]};}
 if(typeof original!=='string'||sha(original)!==pin.sourceSha256)throw Error('Aux runtime contract source pin mismatch');
 let output=text;const anchors=[];
 for(const rule of pin.rules){const find=brand(rule.find,branding),replace=brand(rule.replace,branding);if(output.split(find).length-1!==rule.count)throw Error(`Aux runtime contract drift: ${component}/${path}: ${find}`);output=output.split(find).join(replace);anchors.push({kind:'identity',name:'Aux runtime contract',find,replace,count:rule.count});}
 const outputPath=component==='skill'?path.replace(/^builtin\/aside\//,'builtin/aux/'):path;
 return{text:output,path:outputPath,anchors};
}

/** Explicit legacy-reference migration for known reference fields, not arbitrary
 * user prose or credential material. Caller owns transactional authorized state.
 */
export function migrateAuxRuntimeReference(value,{version=1}={}) {
 if(version!==1)throw Error('Unsupported Aux runtime reference version');
 if(typeof value!=='string')throw Error('Runtime reference must be a string');
 const replacements=[['aside:task/','aux:task/'],['#aside-task/','#aux-task/'],['#aside-task-file/','#aux-task-file/'],['#aside-file:','#aux-file:'],['#aside-routine:','#aux-routine:']];
 for(const[from,to]of replacements)if(value.startsWith(from))return to+value.slice(from.length);
 return value;
}
/** Versioned offline migration of the exact WebUI sidebar preference only. */
export function migrateAuxRuntimeStorage(input) {
 if(!input||![1,2].includes(input.version)||!input.entries||typeof input.entries!=='object'||Array.isArray(input.entries))throw Error('Unsupported Aux runtime storage');
 const output=structuredClone(input);if(input.version===2)return output;
 if(Object.hasOwn(output.entries,'aside:web-sidebar-state')){
  if(Object.hasOwn(output.entries,'aux:web-sidebar-state'))throw Error('Ambiguous Aux sidebar state migration');
  output.entries['aux:web-sidebar-state']=output.entries['aside:web-sidebar-state'];
  delete output.entries['aside:web-sidebar-state'];
 }
 output.version=2;return output;
}
/** Explicit metadata-only transition; never scans or writes installed skills. */
export function migrateAuxSkillMetadata(input,{version=1}={}) {
 if(version!==1||!input||typeof input!=='object'||Array.isArray(input))throw Error('Unsupported skill metadata migration');
 const output=structuredClone(input);
 if(output.agents!==undefined){
  if(!Array.isArray(output.agents)||output.agents.some(agent=>typeof agent!=='string'))throw Error('Malformed skill agent metadata; preserve original');
  output.agents=output.agents.map(agent=>agent==='aside'?'aux':agent==='aside-code'?'aux-code':agent);
 }
 return output;
}
