// Applied to the supplied daemon after identity/cloud composition; never edits UI/CSS.
// Root owns sidecar placement and inserts the lazy-loader after the cold-entry guard.
export function applyOfficialChatGPT(source, { runtimeExpression } = {}) {
  if (!runtimeExpression) throw Error('ChatGPT integration requires an explicit runtime location');
  const patches = [];
  const replace = (name, before, after) => {
    const count = source.split(before).length - 1;
    if (count !== 1) throw Error(`ChatGPT patch ${name}: expected 1 anchor, found ${count}`);
    source = source.replace(before, after); patches.push({ name, count });
  };
  const local = 'auxChatGPT().daemonClient()', account = 'auxChatGPT().localAccount(this.accountId)';
  replace('credential read is local-only', 'get(Cn){return this.ensureLoaded(),this.data[Cn]??void 0}', `get(Cn){if(Cn===\`openai-codex\`)return ${local}.store.read(${account});return this.ensureLoaded(),this.data[Cn]??void 0}`);
  replace('new tokens never enter synced file', 'set(Cn,ei){this.ensureLoaded(),this.data[Cn]=ei,this.persistProviderChange(Cn,ei)}', 'set(Cn,ei){if(Cn===`openai-codex`)throw Error(`ChatGPT credentials require the verified local authorization flow`);this.ensureLoaded(),this.data[Cn]=ei,this.persistProviderChange(Cn,ei)}');
  replace('local disconnect retains registration', 'remove(Cn){this.ensureLoaded(),delete this.data[Cn],this.persistProviderChange(Cn,void 0)}', `remove(Cn){if(Cn===\`openai-codex\`)return ${local}.disconnectLocal(${account});this.ensureLoaded(),delete this.data[Cn],this.persistProviderChange(Cn,void 0)}`);
  replace('local state never enters synced file', 'setState(Cn,ei){let ti=this.get(Cn);', 'setState(Cn,ei){if(Cn===`openai-codex`)return;let ti=this.get(Cn);');
  replace('generic credential mutation refuses', 'async modifyCredentialForPi(Cn,ei){await this.pullBeforeRefresh();', 'async modifyCredentialForPi(Cn,ei){if(Cn===`openai-codex`)throw Error(`ChatGPT credentials require local rotation`);await this.pullBeforeRefresh();');
  replace('generic credential deletion stays local', 'async deleteCredentialForPi(Cn){await this.storage.withLockAsync', `async deleteCredentialForPi(Cn){if(Cn===\`openai-codex\`)return ${local}.signOut(${account});await this.storage.withLockAsync`);
  replace('model auth uses issued-client refresh', 'async getModelAuth(Cn){let ei=this.get(Cn);', `async getModelAuth(Cn){if(Cn===\`openai-codex\`)return ${local}.auth(${account});let ei=this.get(Cn);`);
  replace('rejected token uses local refresh', 'async refreshRejectedOAuthCredential(Cn,ei,ti){let ni=getOAuthProviderForCredential(Cn);', `async refreshRejectedOAuthCredential(Cn,ei,ti){if(Cn===\`openai-codex\`){let auth=await ${local}.auth(${account},ei);return auth?{outcome:\`refreshed\`,auth}:{outcome:\`unavailable\`}}let ni=getOAuthProviderForCredential(Cn);`);
  replace('provider list uses local token presence', 'has(Cn){return this.ensureLoaded(),Cn in this.data}', 'has(Cn){if(Cn===`openai-codex`)return!!this.get(Cn)?.access;return this.ensureLoaded(),Cn in this.data}');
  replace('credential list includes local registration', 'list(){return this.ensureLoaded(),Object.keys(this.data)}', 'list(){return Object.keys(this.getAll())}');
  replace('legacy synced ChatGPT tokens never selected', 'getAll(){return this.ensureLoaded(),{...this.data}}', 'getAll(){this.ensureLoaded();let data={...this.data};delete data[`openai-codex`];let local=this.get(`openai-codex`);if(local?.access)data[`openai-codex`]={type:`oauth`};return data}');
  replace('legacy generic login refuses', 'async login(Cn,ei){let ti=getOAuthProviderForCredential(Cn);', 'async login(Cn,ei){if(Cn===`openai-codex`)throw Error(`Use the Aux ChatGPT connection dialog`);let ti=getOAuthProviderForCredential(Cn);');
  replace('remote revocation on logout', 'logout(Cn){this.remove(Cn)}', `logout(Cn){if(Cn===\`openai-codex\`)return ${local}.signOut(${account});this.remove(Cn)}`);
  replace('official authorization with existing dialog', 'let ti=await this.ensureOpenAICodexCallbackServer(),ni=await createOpenAICodexAuthorization(ri,ei);', 'let ti=await this.ensureOpenAICodexCallbackServer(),ni=auxChatGPT().daemonClient().begin(ri,`http://127.0.0.1:1455/auth/callback`,auxChatGPT().localAccount(this.credentials.accountId));');
  replace('verified completion with no public tokens', 'let Cn=parseOpenAICodexCallback(ni);if(Cn.state&&Cn.state!==ti.openAICodex.state){let Cn=/* @__PURE__ */ Error(`State mismatch`);throw ti.error=Cn,ti.status=`failed`,Cn}if(!Cn.code)return{status:`code_required`,prompt:ti.prompt??createDefaultManualPrompt()};let ei=await exchangeOpenAICodexAuthorizationCode({code:Cn.code,redirectUri:ti.openAICodex.redirectUri,verifier:ti.openAICodex.verifier});return this.credentials.set(ti.providerId,{type:`oauth`,...ei}),ti.status=`completed`,{status:`completed`,providerId:ti.providerId}', 'if(ti.chatgptCompleting)throw Error(`ChatGPT callback already in progress`);ti.chatgptCompleting=!0;try{let result=await auxChatGPT().daemonClient().complete(ti.id,ni);if(ti.status===`cancelled`)throw Error(`OAuth flow cancelled`);ti.status=`completed`;return result}catch(error){ti.status=`failed`;ti.error=Error(`ChatGPT authorization did not complete`);throw ti.error}');
  replace('cancel clears private pending state', 'cancel(Cn){let ei=this.getFlow(Cn);return ei.status=', 'cancel(Cn){let ei=this.getFlow(Cn);if(ei.openAICodex)auxChatGPT().daemonClient().cancel(Cn);return ei.status=');
  replace('callback origin is exact IPv4 loopback', 'CALLBACK_ORIGIN=`http://localhost:${CALLBACK_PORT}`', 'CALLBACK_ORIGIN=`http://127.0.0.1:${CALLBACK_PORT}`');
  replace('unintegrated ChatGPT image capability suppressed', 'models:[CHATGPT_IMAGE_GENERATION_MODEL],api:openAICodexImagesApi()', 'models:[],api:{generateImages:async()=>{throw Error(`ChatGPT plan image generation is not available in Aux yet; use a supported BYOK image provider`)}}');
  replace('legacy ChatGPT image driver refuses before private transport', 'generateImages$1=async(Cn,ei,ti)=>{let ni=', 'generateImages$1=async(Cn,ei,ti)=>{throw Error(`ChatGPT plan image generation is not available in Aux yet; use a supported BYOK image provider`);let ni=');
  replace('actual model disconnect awaits remote revocation', 'removeCredential(Cn){if(this.credentials.remove(Cn),', 'async removeCredential(Cn){if(Cn===`openai-codex`){let result=await this.credentials.logout(Cn);this.modelsJson.removeProviderConfig(Cn);if(!result?.revoked)throw Error(`ChatGPT was disconnected locally, but remote revocation was not confirmed. Disconnect Aux in ChatGPT Settings.`);return}if(this.credentials.remove(Cn),');
  replace('actual disconnect RPC awaits completion', 'ti.removeCredential(ei.providerId),await ti.rewriteRoutingSelectionsToAvailableModels()', 'await ti.removeCredential(ei.providerId),await ti.rewriteRoutingSelectionsToAvailableModels()');
  replace('public Responses API reused', 'models:Object.values(OPENAI_CODEX_MODELS),api:openAICodexResponsesApi()', 'models:Object.values(OPENAI_CODEX_MODELS).map(m=>({...m,api:`openai-responses`,baseUrl:`https://api.openai.com/v1`})),api:auxChatGPT().planResponsesApi(openAIResponsesApi())');
  replace('public Responses implementation initialized', 'init_openai_codex_responses_lazy(),init_helpers$3()', 'init_openai_codex_responses_lazy(),init_openai_responses_lazy(),init_helpers$3()');
  replace('public provider origin', 'OPENAI_CODEX_BASE_URL=`https://chatgpt.com/backend-api`', 'OPENAI_CODEX_BASE_URL=`https://api.openai.com/v1`');
  const start = source.indexOf('async function fetchOpenAICodexModelIds(Cn){');
  const end = source.indexOf('var CACHE_TTL_MS$2,', start);
  if (start < 0 || end < 0) throw Error('ChatGPT model catalog anchors missing');
  replace('public account-scoped model catalog', source.slice(start, end), 'async function fetchOpenAICodexModelIds(Cn){return auxChatGPT().daemonClient().modelIds(Cn)}');
  const deriveStart = source.indexOf('function deriveOpenAICodexModels(Cn,ei,ti){');
  const deriveEnd = source.indexOf('async function fetchOpenAICodexModelIds', deriveStart);
  if (deriveStart < 0 || deriveEnd < 0) throw Error('ChatGPT model derivation anchors missing');
  replace('account model names and ordering populate supplied picker', source.slice(deriveStart, deriveEnd), 'function deriveOpenAICodexModels(Cn,ei,ti){if(!ti?.catalog)return[];let known=new Map([...Cn,...ei].map(m=>[m.id,m]));return ti.catalog.map(entry=>({...known.get(entry.slug)??{contextWindow:8192,maxTokens:4096,reasoning:!1,input:[`text`],cost:{input:0,output:0,cacheRead:0,cacheWrite:0}},id:entry.slug,name:entry.displayName,provider:`openai-codex`,api:`openai-responses`,baseUrl:`https://api.openai.com/v1`}))}');
  const catalogStart = source.indexOf('OpenAICodexModelCatalog=class{');
  const catalogEnd = source.indexOf('}));async function fetchXaiGrokUsage', catalogStart);
  if (catalogStart < 0 || catalogEnd < 0) throw Error('ChatGPT catalog class anchors missing');
  replace('catalog cache stays account-token bound and local', source.slice(catalogStart, catalogEnd), 'OpenAICodexModelCatalog=class{entry;inflight;constructor(Cn){}getCachedModelIds(){return void 0}async getModelIds(access){let fingerprint=createHash(`sha256`).update(access).digest(`hex`);if(this.entry?.fingerprint===fingerprint&&Date.now()<this.entry.until)return this.entry.modelIds;if(this.inflight?.fingerprint===fingerprint)return this.inflight.promise;let promise=fetchOpenAICodexModelIds(access).then(modelIds=>(this.entry={fingerprint,until:Date.now()+300000,modelIds},modelIds)).finally(()=>{if(this.inflight?.promise===promise)this.inflight=void 0});this.inflight={fingerprint,promise};return promise}}');
  const usageStart = source.indexOf('async function fetchOpenAICodexUsage(Cn){');
  const usageEnd = source.indexOf('function mapOpenAICodexUsagePayload', usageStart);
  if (usageStart < 0 || usageEnd < 0) throw Error('ChatGPT usage anchors missing');
  replace('no private ChatGPT usage requests', source.slice(usageStart, usageEnd), 'async function fetchOpenAICodexUsage(Cn){return null}');
  // No runtime load or storage initialization occurs while evaluating this prelude.
  const prelude = `\nimport {createRequire as auxChatGPTCreateRequire} from 'node:module';\nlet auxChatGPTModule;function auxChatGPT(){return auxChatGPTModule??=(auxChatGPTCreateRequire(import.meta.url))(${runtimeExpression});}\n`;
  return { source, prelude, patches };
}
export function applyOfficialChatGPTCallbackAsset(source) {
  const before = 'http://localhost:1455';
  const count = source.split(before).length - 1;
  if (count !== 1) throw Error(`ChatGPT callback asset expected 1 anchor, found ${count}`);
  return source.replace(before, 'http://127.0.0.1:1455');
}
