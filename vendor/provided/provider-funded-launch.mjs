/** Owner-selected public desktop launch policy. No process.env, credentials,
 * network, plan-state fabrication or deletion. Paid code remains recoverable.
 * Apply after all original identity adapters, before packaging/report hashes. */
import { readFileSync } from 'node:fs';
const ui = JSON.parse(readFileSync(new URL('./provider-funded-launch-ui.json', import.meta.url), 'utf8'));
export const providerFundedLaunchPolicy = Object.freeze({paymentsEnabled:false,hostedAiEnabled:false});
const policySource = `const AUX_LAUNCH_POLICY=Object.freeze(${JSON.stringify(providerFundedLaunchPolicy)});`;
const guard = 'function assertAuxLaunchRequest(e,o){if(!AUX_LAUNCH_POLICY.hostedAiEnabled&&/^\\/(?:ai|inference|speech|transcribe|stt)(?:\\/|$)/.test(e))throw Error("Aux-hosted AI is unavailable. Connect your own provider in Settings > Models.");if(!AUX_LAUNCH_POLICY.paymentsEnabled&&/^\\/billing(?:\\/|$)/.test(e)&&String(o?.method??"GET").toUpperCase()!=="GET")throw Error("Aux payments are not enabled.")}';
const daemon = [
  ['public provider-funded launch policy', 'import{createRequire}', policySource+guard+'import{createRequire}'],
  ['account-bound local features without paid tier','function accountHasAllowedPlan(Cn,ei){','function accountHasAllowedPlan(Cn,ei){if(!AUX_LAUNCH_POLICY.paymentsEnabled)return !!Cn;'],
  ['no local routine paid cap','function assertCapacity(Cn){','function assertCapacity(Cn){if(!AUX_LAUNCH_POLICY.paymentsEnabled)return;'],
  ['guard authenticated Aux API requests','async function fetchAsideAPIAuthenticated(Cn,ei,ti){','async function fetchAsideAPIAuthenticated(Cn,ei,ti){assertAuxLaunchRequest(ei,ti);'],
  ['guard authenticated Aux JSON requests','async function fetchAsideAPIAuthenticatedJson(Cn,ei,ti){','async function fetchAsideAPIAuthenticatedJson(Cn,ei,ti){assertAuxLaunchRequest(ei,ti);'],
  ['guard authenticated Aux multipart requests','async function fetchAsideAPIAuthenticatedMultipart(Cn,ei,ti){','async function fetchAsideAPIAuthenticatedMultipart(Cn,ei,ti){assertAuxLaunchRequest(ei,ti);'],
  ['exclude hosted inventory entry','ni.push({providerId:ASIDE_PROVIDER_ID,type:`oauth`,linked:ti,state:`active`});','AUX_LAUNCH_POLICY.hostedAiEnabled&&ni.push({providerId:ASIDE_PROVIDER_ID,type:`oauth`,linked:ti,state:`active`});'],
  ['hosted provider token request refuses before auth','getAccessToken:async Cn=>this.accountId===void 0?null:await getValidAccessToken(this.accountId,Cn)','getAccessToken:async Cn=>{if(!AUX_LAUNCH_POLICY.hostedAiEnabled)throw Error("Aux-hosted AI is unavailable. Connect your own provider in Settings > Models.");return this.accountId===void 0?null:await getValidAccessToken(this.accountId,Cn)}'],
  ['hosted linked state independent of cloud identity','isLinked:()=>this.accountId!==void 0&&!!AccountRegistry.getSession(this.accountId)','isLinked:()=>AUX_LAUNCH_POLICY.hostedAiEnabled&&this.accountId!==void 0&&!!AccountRegistry.getSession(this.accountId)'],
  ['reject retained hosted model runtime selection','async resolveProviderModelRuntimeConfig(Cn,ei,ti,ni={}){','async resolveProviderModelRuntimeConfig(Cn,ei,ti,ni={}){if(!AUX_LAUNCH_POLICY.hostedAiEnabled&&Cn===ASIDE_PROVIDER_ID)throw Error("Aux-hosted AI is unavailable. Connect your own provider in Settings > Models.");'],
].map(([name,find,replace])=>({name,find,replace,count:1}));
export function transformProviderFundedLaunch({component,path,text,stateIdentityVersion=1,branding='aux'}) {
  if(typeof text!=='string')throw TypeError('Provider-funded launch requires source text');
  if(!['supplied','aux'].includes(branding)||![1,2].includes(stateIdentityVersion))throw Error('Unknown provider-funded launch source composition');
  if(text.includes('const AUX_LAUNCH_POLICY='))throw Error('Provider-funded launch drift: already applied');
  const edits=component==='daemon'&&path==='entry.mjs'?daemon:component==='agent'?ui.files[path]?.edits:undefined;
  if(!edits)return {text,anchors:[]};
  const anchors=[];
  for(const sourceEdit of edits){
    const branded=value=>{let output=branding==='aux'?value.replaceAll('ASIDE_','AUX_').replaceAll('Aside','Aux'):value;return component==='agent'&&stateIdentityVersion===2?output.replaceAll('\"aside\"','\"aux\"'):output;};
    const edit={...sourceEdit,find:branded(sourceEdit.find),replace:branded(sourceEdit.replace)};
    const actual=text.split(edit.find).length-1;
    if(actual!==edit.count)throw Error(`Provider-funded launch drift: ${component}/${path}: ${edit.name}: expected ${edit.count}, got ${actual}`);
    text=text.split(edit.find).join(edit.replace);
    anchors.push({kind:'integration',...edit});
  }
  return {text,anchors};
}
export const providerFundedLaunchUiInputs = Object.freeze(Object.fromEntries(Object.entries(ui.files).map(([path,{originalSha256}])=>[path,originalSha256])));
