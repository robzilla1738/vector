/** Explicit normal-profile routing for the supplied one-way cookie capture. */
export const cloudCookieProfileDaemonHelpers = String.raw`
function auxCloudCookieProfileBinding(accountId) {
  const account=AccountRegistry.getAccount(accountId),session=AccountRegistry.getSession(accountId),state=AccountRegistry.getAll();
  if(!account?.userId||account.mode!=='cloud'||!session)throw Error('Sign in before native cookie synchronization.');
  const matches=Object.values(state.profileBindings??{}).filter(binding=>binding.userId===account.userId&&AccountRegistry.getAccountIdForProfile(binding.profileId)===accountId);
  if(matches.length!==1)throw Error('Cookie synchronization requires one bound regular browser profile.');
  const binding=matches[0],generation=readAccessTokenSyncGeneration(session.accessToken);
  if(!Number.isSafeInteger(generation)||generation<0||typeof binding.profileId!=='string'||!binding.profileId)throw Error('Cookie profile binding is unavailable.');
  return {accountId,userId:account.userId,generation,profileId:binding.profileId,stamp:JSON.stringify([accountId,account.userId,account.createdAt,account.incarnationId,generation,binding.profileId,binding.updatedAt,state.profileAccountBindings?.[binding.profileId]?.updatedAt])};
}
function auxCloudAssertCookieProfile(binding) {
  if(auxCloudCookieProfileBinding(binding.accountId).stamp!==binding.stamp)throw Error('Cookie profile binding changed.');
}
async function auxCloudNativeCookieContext(binding) {
  auxCloudAssertCookieProfile(binding);
  const context=await sendCommandToExtension({method:'Aside.getCookieSyncContext',params:{accountId:binding.accountId,profileId:binding.profileId,userId:binding.userId}},{accountId:binding.accountId,profileId:binding.profileId,browserMode:'default',timeoutMs:20000});
  auxCloudAssertCookieProfile(binding);
  if(!context||context.profileId!==binding.profileId||context.boundAccountId!==binding.accountId||context.boundUserId!==binding.userId||context.isRegularProfile!==true||context.isOffTheRecord!==false||context.hasAccountSession!==true||context.accountAuthPaused!==false||typeof context.cookieRestoreEpoch!=='string'||!context.cookieRestoreEpoch||context.cookieRestorePending!==false||typeof context.cookieBindingEpoch!=='string'||!context.cookieBindingEpoch||typeof context.browserContextId!=='string'||!context.browserContextId)throw Error('Native cookie profile identity is unavailable.');
  return context;
}
function auxCloudCookieDomainExcluded(domain) {
  if(typeof domain!=='string'||!domain)return true;
  const host=domain.replace(/^\./,'').replace(/\.+$/,'').toLowerCase();
  // Keep the original exclusions, and isolate Aux/Clerk authentication from
  // ordinary website-session backup and restoration.
  return host==='::1'||host==='[::1]'||/^127(?:\.\d{1,3}){3}$/.test(host)||isExcludedDomain(host)||['getaux.co','clerk.com','clerk.accounts.dev'].some(root=>host===root||host.endsWith('.'+root));
}
function auxCloudCookieRestoreParam(cookie,now) {
  const domain=cookie.domain;
  if(typeof domain!=='string'||!domain)throw Error('Cookie restore requires a concrete domain.');
  if(auxCloudCookieDomainExcluded(domain))return null;
  const host=domain.replace(/^\./,'').toLowerCase();
  if(/[\s:/\\@?#%]/.test(host)||!host||new URL('https://'+host).hostname!==host)throw Error('Invalid cookie restore domain.');
  if(cookie.expires!==undefined&&!Number.isFinite(cookie.expires))throw Error('Invalid cookie restore expiry.');
  if(cookie.sourcePort!==undefined&&(!Number.isInteger(cookie.sourcePort)||cookie.sourcePort < -1||cookie.sourcePort===0||cookie.sourcePort>65535))throw Error('Invalid cookie restore source port.');
  if(cookie.partitionKey!==undefined) {
    const key=cookie.partitionKey;
    if(!key||typeof key!=='object'||Array.isArray(key)||Object.keys(key).sort().join(',')!=='hasCrossSiteAncestor,topLevelSite'||typeof key.topLevelSite!=='string'||typeof key.hasCrossSiteAncestor!=='boolean')throw Error('Invalid cookie restore partition.');
    const site=new URL(key.topLevelSite);
    if(!['https:','http:'].includes(site.protocol)||site.origin!==key.topLevelSite)throw Error('Opaque or noncanonical cookie restore partition.');
  }
  // CookieParam and Cookie share the fields consumed by this original helper.
  // Reuse its expiry/partition/exclusion conversion, preserving all CDP fields.
  return toCookieParam(cookie,now);
}
async function auxCloudPrepareCookieRestore(accountId,isCurrent) {
  if(typeof isCurrent!=='function')throw Error('Cookie restore requires its owning sync lifetime.');
  if(!isCurrent())return null;
  init_cookies();
  const binding=auxCloudCookieProfileBinding(accountId),before=await auxCloudNativeCookieContext(binding);
  if(!isCurrent())return null;
  const recovered=await auxCloudReadCookieSnapshot(accountId);
  try {
    auxCloudAssertCookieProfile(binding);
    if(!isCurrent()||!recovered)return null;
    if(recovered.userId!==binding.userId||recovered.generation!==binding.generation)throw Error('Cookie restore owner or generation changed.');
    const snapshot=auxCloudCookieSnapshot(recovered.snapshot);
    const after=await auxCloudNativeCookieContext(binding);
    if(before.cookieRestoreEpoch!==after.cookieRestoreEpoch||before.cookieBindingEpoch!==after.cookieBindingEpoch||before.browserContextId!==after.browserContextId)throw Error('Native cookie profile changed during recovery.');
    if(!isCurrent())return null;
    const now=Date.now()/1e3,cookies=snapshot.cookies.map(cookie=>auxCloudCookieRestoreParam(cookie,now)).filter(cookie=>cookie!==null);
    auxCloudAssertCookieProfile(binding);
    // Preconditions only: this is neither a native write capability nor an
    // automatic restore consumer. The native transaction must revalidate them.
    return {binding,nativeContext:after,metadata:recovered.metadata,cookies};
  } finally {
    if(recovered?.snapshot?.cookies){for(const cookie of recovered.snapshot.cookies)cookie.value='';recovered.snapshot.cookies.length=0;}
  }
}
const auxCloudCookieRestoreCache=new Map();
async function auxCloudRestoreCookiesOnce(accountId,isCurrent) {
  const current=()=>isCurrent()&&isSyncEnabled(accountId);
  if(!current())return false;
  const binding=auxCloudCookieProfileBinding(accountId),native=await auxCloudNativeCookieContext(binding);
  if(!current())return false;
  const scope=JSON.stringify([binding.stamp,native.cookieBindingEpoch,native.browserContextId]);
  const previous=auxCloudCookieRestoreCache.get(accountId);
  if(previous?.scope===scope)return await previous.promise;
  const entry={scope,promise:null};
  entry.promise=(async()=>{
    const plan=await auxCloudPrepareCookieRestore(accountId,current);
    try {
      auxCloudAssertCookieProfile(binding);
      if(!current())return false;
      if(!plan)return true;
      if(plan.binding.stamp!==binding.stamp||plan.nativeContext.cookieRestoreEpoch!==native.cookieRestoreEpoch||plan.nativeContext.cookieBindingEpoch!==native.cookieBindingEpoch||plan.nativeContext.browserContextId!==native.browserContextId)throw Error('Native cookie profile changed before recovery.');
      const result=await sendCommandToExtension({method:'Aside.restoreCookieSnapshot',params:{accountId,profileId:binding.profileId,userId:binding.userId,generation:binding.generation,browserContextId:native.browserContextId,cookieBindingEpoch:native.cookieBindingEpoch,revision:plan.metadata.revision,objectSha256:plan.metadata.objectSha256,cookies:plan.cookies}},{accountId,profileId:binding.profileId,browserMode:'default',timeoutMs:20000});
      auxCloudAssertCookieProfile(binding);
      if(!current())return false;
      const after=await auxCloudNativeCookieContext(binding);
      if(after.cookieBindingEpoch!==native.cookieBindingEpoch||after.browserContextId!==native.browserContextId)throw Error('Native cookie profile changed during recovery.');
      if(result?.complete!==true)throw Error('Native cookie restoration did not complete.');
      return true;
    } finally {if(plan?.cookies){for(const cookie of plan.cookies)cookie.value='';plan.cookies.length=0;}}
  })();
  auxCloudCookieRestoreCache.set(accountId,entry);
  try {
    const complete=await entry.promise;
    if(!complete&&auxCloudCookieRestoreCache.get(accountId)===entry)auxCloudCookieRestoreCache.delete(accountId);
    return complete;
  } catch(error) {
    if(auxCloudCookieRestoreCache.get(accountId)===entry)auxCloudCookieRestoreCache.delete(accountId);
    throw error;
  }
}
`;

export const cloudCookieProfileAgentHelpers = String.raw`
async function auxCloudGetCookieSyncContext(params) {
  if(chrome.extension?.inIncognitoContext||!chrome.auxAccount?.getProfileContext)throw Error('Regular native cookie profile context is unavailable.');
  const context=await chrome.auxAccount.getProfileContext();
  if(!context||context.profileId!==params.profileId||context.boundAccountId!==params.accountId||context.boundUserId!==params.userId||context.isRegularProfile!==true||context.isOffTheRecord!==false||context.hasAccountSession!==true||context.accountAuthPaused!==false||typeof context.cookieRestoreEpoch!=='string'||!context.cookieRestoreEpoch||context.cookieRestorePending!==false||typeof context.cookieBindingEpoch!=='string'||!context.cookieBindingEpoch||typeof context.browserContextId!=='string'||!context.browserContextId)throw Error('Native cookie profile identity does not match.');
  return {profileId:context.profileId,boundAccountId:context.boundAccountId,boundUserId:context.boundUserId,isRegularProfile:true,isOffTheRecord:false,hasAccountSession:true,accountAuthPaused:false,cookieRestoreEpoch:context.cookieRestoreEpoch,cookieRestorePending:false,cookieBindingEpoch:context.cookieBindingEpoch,browserContextId:context.browserContextId};
}
async function auxCloudRestoreCookieSnapshot(params) {
  const before=await auxCloudGetCookieSyncContext(params);
  if(before.cookieBindingEpoch!==params.cookieBindingEpoch||before.browserContextId!==params.browserContextId||!chrome.auxBrowserImport?.startImport)throw Error('Native cookie restore context is unavailable.');
  const result=await chrome.auxBrowserImport.startImport({...params,source:'aux-cloud-cookies'});
  const after=await auxCloudGetCookieSyncContext(params);
  if(before.cookieBindingEpoch!==after.cookieBindingEpoch||before.browserContextId!==after.browserContextId)throw Error('Native cookie profile changed during recovery.');
  if(result?.complete!==true)throw Error('Native cookie restoration did not complete.');
  return result;
}
`;

export function applyCloudCookieProfileAdapter({ component, path, text }) {
  const anchors=[];
  const edit=(find,replace,name)=>{
    if(text.split(find).length-1!==1)throw Error('Cookie profile anchor changed: '+name);
    text=text.replace(find,()=>replace);anchors.push({find,replace,count:1,kind:'integration',name});
  };
  if(component==='daemon') {
    if(path!=='entry.mjs')throw Error('Cookie profile integration requires the daemon entry');
    edit('function requireEtag(Cn){',cloudCookieProfileDaemonHelpers+'\nfunction requireEtag(Cn){','profile-scoped cookie capture helpers');
    const list='let Ri=[ti,ni,ri,xi,ii,oi,si,ci';
    edit(list,'let auxCookieSyncContext=Cn.cookieSyncContextRequestSchema=object({method:literal(`Aside.getCookieSyncContext`),params:object({accountId:number$2().int().nonnegative(),profileId:string$3().min(1),userId:string$3().min(1)})});let auxCookieRestore=Cn.cookieRestoreRequestSchema=object({method:literal(`Aside.restoreCookieSnapshot`),params:object({accountId:number$2().int().nonnegative(),profileId:string$3().min(1).max(256),userId:string$3().min(1).max(256),generation:number$2().int().nonnegative().max(2147483647),browserContextId:string$3().min(1).max(256),cookieBindingEpoch:string$3().min(1).max(256),revision:number$2().int().positive().max(Number.MAX_SAFE_INTEGER),objectSha256:string$3().regex(/^[a-f0-9]{64}$/),cookies:array(unknown$1()).max(20000)})});let Ri=[auxCookieSyncContext,auxCookieRestore,ti,ni,ri,xi,ii,oi,si,ci','daemon bridge cookie-context schema');
    edit('init_envelope(),init_exclusions(),init_cdp(),init_api_client(),','init_envelope(),init_exclusions(),init_cdp(),init_extension_bridge(),init_api_client(),','initialize original extension bridge for cookie capture');
    const capture='async function syncCookies(Cn,ei){if(!ei())return;await globalCdpClient.ensureConnected();let ti=Date.now()/1e3,{cookies:ni}=await globalCdpClient.send(`Storage.getCookies`);if(!ei())return;';
    const scoped='async function syncCookies(Cn,ei){const originalCurrent=ei;ei=()=>originalCurrent()&&isSyncEnabled(Cn);if(!ei())return;if(!await auxCloudRestoreCookiesOnce(Cn,ei)||!ei())return;const binding=auxCloudCookieProfileBinding(Cn),before=await auxCloudNativeCookieContext(binding);if(!ei())return;await globalCdpClient.ensureConnected();auxCloudAssertCookieProfile(binding);let{cookies:ni}=await globalCdpClient.send(`Storage.getCookies`,{browserContextId:before.browserContextId});if(!ei())return;const after=await auxCloudNativeCookieContext(binding);if(before.cookieRestoreEpoch!==after.cookieRestoreEpoch||before.cookieBindingEpoch!==after.cookieBindingEpoch||before.browserContextId!==after.browserContextId)throw Error("Native cookie profile changed during capture.");auxCloudAssertCookieProfile(binding);if(!ei())return;let ti=Date.now()/1e3;';
    edit(capture,scoped,'capture cookies only through verified native browser context');
    edit('let ri=ni.map(Cn=>toCookieParam(Cn,ti)).filter(Cn=>Cn!==null),ii=sha256Hex','let ri=ni.filter(cookie=>!auxCloudCookieDomainExcluded(cookie.domain)).map(Cn=>toCookieParam(Cn,ti)).filter(Cn=>Cn!==null),ii=sha256Hex','exclude Aux and identity-provider authentication cookies from cloud capture');
  } else if(component==='agent'&&path==='background.js') {
    edit('async function vy(e, t, r) {',cloudCookieProfileAgentHelpers+'\nasync function vy(e, t, r) {','original Agent cookie-context handler');
    edit('const oo = [\n    r,','const auxCookieSyncContext = e.cookieSyncContextRequestSchema = m({method:E("Aside.getCookieSyncContext"),params:m({accountId:T().int().nonnegative(),profileId:p().min(1),userId:p().min(1)})}); const auxCookieRestore = e.cookieRestoreRequestSchema = m({method:E("Aside.restoreCookieSnapshot"),params:m({accountId:T().int().nonnegative(),profileId:p().min(1).max(256),userId:p().min(1).max(256),generation:T().int().nonnegative().max(2147483647),browserContextId:p().min(1).max(256),cookieBindingEpoch:p().min(1).max(256),revision:T().int().positive().max(Number.MAX_SAFE_INTEGER),objectSha256:p().regex(/^[a-f0-9]{64}$/)}).passthrough().refine(params=>Array.isArray(params.cookies)&&params.cookies.length<=20000)});\n  const oo = [\n    auxCookieSyncContext,\n    auxCookieRestore,\n    r,','Agent bridge cookie-context schema');
    edit('switch (e.method) {\n    case "Aside.listTabs":','switch (e.method) {\n    case "Aside.getCookieSyncContext": return await auxCloudGetCookieSyncContext(e.params);\n    case "Aside.restoreCookieSnapshot": return await auxCloudRestoreCookieSnapshot(e.params);\n    case "Aside.listTabs":','dispatch native cookie-context through original bridge');
  }
  return {text,anchors};
}
