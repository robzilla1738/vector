import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root='/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src';
const daemonPath='out/provided-source-audit/daemon-original.mjs',managerPath=root+'/chrome/browser/devtools/devtools_browser_context_manager.cc',profilePath=root+'/chrome/browser/extensions/api/aux_account/aux_account_api.cc';
const sha=value=>createHash('sha256').update(value).digest('hex');
const daemon=await readFile(daemonPath,'utf8'),manager=await readFile(managerPath,'utf8'),profile=await readFile(profilePath,'utf8');
if(sha(daemon)!=='5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5')throw Error('Pinned supplied daemon changed.');
function section(text,start,end){if(text.split(start).length!==2||text.split(end).length!==2)throw Error('Source section anchors changed.');return text.slice(text.indexOf(start),text.indexOf(end,text.indexOf(start)));}
const snippets={
 suppliedCookieUpload:section(daemon,'async function syncCookies(Cn,ei){','async function clearRemoteCookies(Cn){'),
 explicitNativeContextLookup:section(manager,'Profile* DevToolsBrowserContextManager::GetProfileById(','content::BrowserContext* DevToolsBrowserContextManager::CreateBrowserContext()'),
 defaultNativeContext:section(manager,'content::BrowserContext*\nDevToolsBrowserContextManager::GetDefaultBrowserContext()','void DevToolsBrowserContextManager::DisposeBrowserContext('),
 extensionProfileContext:section(profile,'  if (method == "auxAccount.getProfileContext") {','  auto profiles = ProfileSnapshot(profile());')
};
if(!snippets.suppliedCookieUpload.includes('send(`Storage.getCookies`)')||!snippets.defaultNativeContext.includes('GetLastUsedProfileIfLoaded()')||!snippets.explicitNativeContextLookup.includes('otr_profiles_.find(context_id)')||!snippets.extensionProfileContext.includes('context.Set("boundUserId", user)'))throw Error('Examined profile/cookie contract changed.');
const planPath='out/cloud-development-signing-review/signing-plan.json',planSha=sha(await readFile(planPath));
if(planSha!=='43415d770be82878ab4a5ef0ded4ac525b0f0c8f667246ed652464c42af5d5a9')throw Error('Pending signing plan changed.');
const evidence={kind:'bounded-static-cookie-profile-contract',checkedAt:new Date().toISOString(),files:[{path:daemonPath,sha256:sha(daemon)},{path:managerPath,sha256:sha(manager)},{path:profilePath,sha256:sha(profile)}],snippets,findings:['supplied upload reads Storage.getCookies with no explicit browserContextId','examined native default context follows last-used loaded original profile','examined explicit context lookup resolves last-used original profile or a registered off-the-record context','extension profile context exposes persisted profile and bound account/user identifiers; these differ from a proven writable CDP browser context'],completeNativeCommandInventory:false,nativeRuntimeObserved:false,cookiesReadOrWritten:false,ownerStateRead:false,signingPlanSha256:planSha,signingPerformed:false,implementationStatus:'backend retrieval and account-scoped adapter decryption verified separately; native importer/profile routing still unimplemented'};
await writeFile('docs/integration/proposed/cloud-cookie-restore/source-evidence.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({staticAnchorsVerified:Object.keys(snippets).length,ownerStateRead:false,nativeRuntimeObserved:false,signingPlanUnchanged:true}));
