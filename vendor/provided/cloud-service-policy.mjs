/** Explicit build-time opt-in for reviewed Aux services. This module never
 * reads process.env, sends requests or enables releases/installers. Compose
 * after the existing pinned local-only adapters, before writing SEA/stage bytes. */
export const reviewedAuxCloudOrigins = Object.freeze({
  api: 'https://api.getaux.co',
  share: 'https://share.getaux.co',
});
export const reviewedAuxDevelopmentCloudOrigins = Object.freeze({
  api: 'https://dev-cloud.getaux.co',
  share: 'https://dev-cloud.getaux.co',
});
export const localUnavailableOrigins = Object.freeze({
  api: 'http://127.0.0.1:9/aux-unavailable/api',
  legacyApi: 'http://127.0.0.1:9/aux-unavailable/legacy-api',
  share: 'http://127.0.0.1:9/aux-unavailable/share',
});
const reviewedProfiles = Object.freeze({
  production: reviewedAuxCloudOrigins,
  development: reviewedAuxDevelopmentCloudOrigins,
});
function checkedOrigins(profile) {
  const origins=reviewedProfiles[profile];
  for (const [role,value] of Object.entries(origins)) {
    const url=new URL(value);
    const hostname=profile==='development'?'dev-cloud.getaux.co':`${role}.getaux.co`;
    if(url.protocol!=='https:'||url.origin!==value||url.username||url.password||url.port||url.pathname!=='/'||url.search||url.hash||url.hostname!==hostname)
      throw new Error('Reviewed Aux cloud origin is not an exact HTTPS Aux origin');
  }
  return origins;
}
/** Passing no options is byte-identical local behavior, regardless of the shell
 * environment. There is no arbitrary origin/profile object accepted here. */
export function resolveCloudServicePolicy(options={}) {
  if(!options||typeof options!=='object'||Array.isArray(options))throw new TypeError('Cloud build options must be an object');
  if(![Object.prototype,null].includes(Object.getPrototypeOf(options)))throw new TypeError('Cloud build options must be a plain record');
  for(const key of Object.keys(options))if(!['enableCloud','profile'].includes(key))throw new Error(`Unsupported cloud build option: ${key}`);
  if(options.enableCloud!==undefined&&typeof options.enableCloud!=='boolean')throw new TypeError('enableCloud must be an explicit boolean');
  if(!options.enableCloud){
    if(options.profile!==undefined)throw new Error('Cloud profile requires an explicit enableCloud:true');
    return Object.freeze({mode:'local',origins:localUnavailableOrigins});
  }
  if(typeof options.profile!=='string'||!Object.hasOwn(reviewedProfiles,options.profile))throw new Error('Cloud builds require a reviewed production or development profile');
  return Object.freeze({mode:options.profile,origins:checkedOrigins(options.profile)});
}
/** A CLI may call this once while building, then persist the resolved policy in
 * its stage receipt. Never invoke this helper from the shipped daemon/browser. */
export function cloudBuildOptionsFromEnvironment(environment) {
  if(!environment||typeof environment!=='object')throw new TypeError('A build environment record is required');
  const flag=environment.AUX_ENABLE_CLOUD;
  if(flag===undefined||flag==='0')return {};
  if(flag!=='1')throw new Error('AUX_ENABLE_CLOUD must be 0 or 1');
  for(const key of ['AUX_API_URL','AUX_SHARE_URL','ASIDE_API_URL'])if(environment[key]!==undefined)
    throw new Error(`Runtime cloud origin overrides are not accepted by cloud builds: ${key}`);
  const options={enableCloud:true,profile:environment.AUX_CLOUD_PROFILE};
  resolveCloudServicePolicy(options);
  return options;
}
function replace(text,find,to,count,name,anchors) {
  const actual=text.split(find).length-1;
  if(actual!==count)throw new Error(`Cloud policy anchor changed (${name}): expected ${count}, found ${actual}`);
  anchors.push({name,kind:'integration',find,replace:to,count});
  return text.split(find).join(to);
}
/** Input must be the count-checked output of adaptDaemonCode/adaptCliCode or
 * transformProvidedUiBoundary. Each successful anchor is fully replayable. */
export function transformReviewedCloudServicePolicy({component,path,text},options={}) {
  if(typeof text!=='string')throw new TypeError('Cloud policy expects source text');
  const policy=resolveCloudServicePolicy(options),anchors=[];
  if(policy.mode==='local')return {text,anchors,policy};
  const apply=(from,to,count,name)=>{text=replace(text,from,to,count,name,anchors);};
  if(component==='daemon'){
    if(path!=='entry.mjs')throw new Error('Daemon cloud policy requires the explicit entry.mjs role');
    apply(localUnavailableOrigins.api,policy.origins.api,8,'reviewed daemon Aux API origin');
    apply(localUnavailableOrigins.legacyApi,policy.origins.api,1,'reviewed daemon legacy API origin');
    apply(localUnavailableOrigins.share,policy.origins.share,1,'reviewed daemon Aux share origin');
    apply(`AUX_API_BASE_URL=process.env.AUX_API_URL?process.env.AUX_API_URL:\`${policy.origins.api}\``,
      `AUX_API_BASE_URL=\`${policy.origins.api}\``,1,'fixed reviewed daemon API configuration');
  }else if(component==='cli'){
    if(path!=='entry.mjs')throw new Error('CLI cloud policy requires the explicit entry.mjs role');
    apply(localUnavailableOrigins.api,policy.origins.api,1,'reviewed CLI Aux API origin');
    apply(`AUX_API_BASE_URL = process.env.AUX_API_URL ?? ${JSON.stringify(policy.origins.api)};`,
      `AUX_API_BASE_URL = ${JSON.stringify(policy.origins.api)};`,1,'fixed reviewed CLI API configuration');
  }else if(component==='agent'&&['background.js','assets/strip-markdown-DRcmtuJc.js'].includes(path)){
    apply(localUnavailableOrigins.api,policy.origins.api,1,'reviewed Agent Aux API origin');
  }else if(component==='vault'){
    throw new Error('Aux cloud builds exclude the Vault/password-manager product');
  }else if(component!=='agent'){
    throw new Error(`Unsupported cloud integration component: ${component}`);
  }
  // Docs, releases, installers, telemetry, original wire/crypto labels and
  // unrelated resources are deliberately untouched by this integration policy.
  return {text,anchors,policy};
}
