/** Explicit normal-profile routing for the supplied one-way cookie capture. */
export const cloudCookieProfileDaemonHelpers = String.raw`
function auxCloudCookieProfileBinding(accountId) {
  const account=AccountRegistry.getAccount(accountId),session=AccountRegistry.getSession(accountId),state=AccountRegistry.getAll();
  if(!account?.userId||account.mode!=='cloud'||!session)throw Error('Sign in before native cookie synchronization.');
  const matches=Object.values(state.profileBindings??{}).filter(binding=>binding.userId===account.userId&&AccountRegistry.getAccountIdForProfile(binding.profileId)===accountId);
  if(matches.length!==1)throw Error('Cookie synchronization requires one bound regular browser profile.');
  const binding=matches[0],generation=readAccessTokenSyncGeneration(session.accessToken);
  if(!Number.isSafeInteger(generation)||generation<0||typeof binding.profileId!=='string'||!binding.profileId)throw Error('Cookie profile binding is unavailable.');
  return {accountId,userId:account.userId,profileId:binding.profileId,stamp:JSON.stringify([accountId,account.userId,account.createdAt,account.incarnationId,generation,binding.profileId,binding.updatedAt,state.profileAccountBindings?.[binding.profileId]?.updatedAt])};
}
function auxCloudAssertCookieProfile(binding) {
  if(auxCloudCookieProfileBinding(binding.accountId).stamp!==binding.stamp)throw Error('Cookie profile binding changed.');
}
async function auxCloudNativeCookieContext(binding) {
  auxCloudAssertCookieProfile(binding);
  const context=await sendCommandToExtension({method:'Aside.getCookieSyncContext',params:{accountId:binding.accountId,profileId:binding.profileId,userId:binding.userId}},{accountId:binding.accountId,profileId:binding.profileId,browserMode:'default',timeoutMs:20000});
  auxCloudAssertCookieProfile(binding);
  if(!context||context.profileId!==binding.profileId||context.boundAccountId!==binding.accountId||context.boundUserId!==binding.userId||context.isRegularProfile!==true||context.isOffTheRecord!==false||context.hasAccountSession!==true||context.accountAuthPaused!==false||typeof context.cookieBindingEpoch!=='string'||!context.cookieBindingEpoch||typeof context.browserContextId!=='string'||!context.browserContextId)throw Error('Native cookie profile identity is unavailable.');
  return context;
}
`;

export const cloudCookieProfileAgentHelpers = String.raw`
async function auxCloudGetCookieSyncContext(params) {
  if(chrome.extension?.inIncognitoContext||!chrome.auxAccount?.getProfileContext)throw Error('Regular native cookie profile context is unavailable.');
  const context=await chrome.auxAccount.getProfileContext();
  if(!context||context.profileId!==params.profileId||context.boundAccountId!==params.accountId||context.boundUserId!==params.userId||context.isRegularProfile!==true||context.isOffTheRecord!==false||context.hasAccountSession!==true||context.accountAuthPaused!==false||typeof context.cookieBindingEpoch!=='string'||!context.cookieBindingEpoch||typeof context.browserContextId!=='string'||!context.browserContextId)throw Error('Native cookie profile identity does not match.');
  return {profileId:context.profileId,boundAccountId:context.boundAccountId,boundUserId:context.boundUserId,isRegularProfile:true,isOffTheRecord:false,hasAccountSession:true,accountAuthPaused:false,cookieBindingEpoch:context.cookieBindingEpoch,browserContextId:context.browserContextId};
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
    edit(list,'let auxCookieSyncContext=Cn.cookieSyncContextRequestSchema=object({method:literal(`Aside.getCookieSyncContext`),params:object({accountId:number$2().int().nonnegative(),profileId:string$3().min(1),userId:string$3().min(1)})});let Ri=[auxCookieSyncContext,ti,ni,ri,xi,ii,oi,si,ci','daemon bridge cookie-context schema');
    edit('init_envelope(),init_exclusions(),init_cdp(),init_api_client(),','init_envelope(),init_exclusions(),init_cdp(),init_extension_bridge(),init_api_client(),','initialize original extension bridge for cookie capture');
    const capture='async function syncCookies(Cn,ei){if(!ei())return;await globalCdpClient.ensureConnected();let ti=Date.now()/1e3,{cookies:ni}=await globalCdpClient.send(`Storage.getCookies`);if(!ei())return;';
    const scoped='async function syncCookies(Cn,ei){if(!ei())return;const binding=auxCloudCookieProfileBinding(Cn),before=await auxCloudNativeCookieContext(binding);if(!ei())return;await globalCdpClient.ensureConnected();auxCloudAssertCookieProfile(binding);let{cookies:ni}=await globalCdpClient.send(`Storage.getCookies`,{browserContextId:before.browserContextId});if(!ei())return;const after=await auxCloudNativeCookieContext(binding);if(before.cookieBindingEpoch!==after.cookieBindingEpoch||before.browserContextId!==after.browserContextId)throw Error("Native cookie profile changed during capture.");auxCloudAssertCookieProfile(binding);if(!ei())return;let ti=Date.now()/1e3;';
    edit(capture,scoped,'capture cookies only through verified native browser context');
  } else if(component==='agent'&&path==='background.js') {
    edit('async function vy(e, t, r) {',cloudCookieProfileAgentHelpers+'\nasync function vy(e, t, r) {','original Agent cookie-context handler');
    edit('const oo = [\n    r,','const auxCookieSyncContext = e.cookieSyncContextRequestSchema = m({method:E("Aside.getCookieSyncContext"),params:m({accountId:T().int().nonnegative(),profileId:p().min(1),userId:p().min(1)})});\n  const oo = [\n    auxCookieSyncContext,\n    r,','Agent bridge cookie-context schema');
    edit('switch (e.method) {\n    case "Aside.listTabs":','switch (e.method) {\n    case "Aside.getCookieSyncContext": return await auxCloudGetCookieSyncContext(e.params);\n    case "Aside.listTabs":','dispatch native cookie-context through original bridge');
  }
  return {text,anchors};
}
