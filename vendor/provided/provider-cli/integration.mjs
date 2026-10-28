/** Release-time integration of the provider CLIs (design.md, "Integration"). Exact,
 * count-checked edits on the composed daemon entry and two Agent chunks, plus the runtime
 * files the daemon loads from node-development/provider-cli/. scripts/release/transforms.mjs
 * applies them after the package edits; any drifted anchor stops the release. */
import {AGENT_PATH, applyBorrowedIdentityRemoval} from './borrowed-identity-removal.mjs';

/** Files copied beside aux-native-entry.mjs, under provider-cli/. Tests and fixtures stay out. */
export const RUNTIME_FILES = Object.freeze(['aux-daemon.mjs', 'index.mjs', 'catalog.mjs', 'detect.mjs', 'drivers.mjs', 'process.mjs', 'stream.mjs']);
export const CONNECT_DIALOG_PATH = 'assets/connect-dialog-CacgpFap.js';

const edit = (name, find, replace, count = 1) => Object.freeze({name, find, replace, count});
const NEW_ROWS = ['cursor-cli', 'grok-cli', 'opencode-cli', 'copilot-cli'];

export const DAEMON_EDITS = Object.freeze([
  edit('load the provider CLI module beside the entry',
    'const __auxCryptoBaseURL=new URL("./aux-crypto/",import.meta.url);',
    'const auxProviderCli=(await import(new URL("./provider-cli/aux-daemon.mjs",import.meta.url))).createAuxProviderCli();\nconst __auxCryptoBaseURL=new URL("./aux-crypto/",import.meta.url);'),
  edit('route CLI-backed models through the CLI drivers',
    'modelRuntime=runtime}));',
    'modelRuntime=auxProviderCli.wrapRuntime(runtime,createAssistantMessageEventStream)}));'),
  edit('resolve CLI-backed models from detection',
    'async resolve(Cn,ei){let ti={},ni=Date.now();await this.refreshBuiltInModelCatalogs(ei)',
    'async resolve(Cn,ei){if(auxProviderCli.owns(ei))return await auxProviderCli.resolveModel(Cn,ei);let ti={},ni=Date.now();await this.refreshBuiltInModelCatalogs(ei)'),
  edit('CLI providers need no API key',
    'async getApiKeyForProvider(Cn){return(await this.getModelAuthForProvider(Cn))?.apiKey}',
    'async getApiKeyForProvider(Cn){return auxProviderCli.owns(Cn)?``:(await this.getModelAuthForProvider(Cn))?.apiKey}'),
  edit('available models come from the CLIs for CLI providers',
    'ai=settledValue(ri,[]),oi=settledValue(ii,[]);return[...ai,...oi]}async listSettingsInventory(){',
    'ai=settledValue(ri,[]),oi=settledValue(ii,[]);return auxProviderCli.decorateModels([...ai,...oi])}async listSettingsInventory(){'),
  edit('settings inventory follows CLI detection',
    'getSettingsInventoryInputs(){return JSON.stringify([this.credentials.list()',
    'getSettingsInventoryInputs(){return JSON.stringify([auxProviderCli.inventoryKey(),this.credentials.list()'),
  edit('settings inventory shows CLI rows',
    'return{subscriptionPlan:si,availableModels:[...fi,...pi],connectedProviders:hi,visibleModelIdsByProvider:{...this.listVisibleModelIdsByProvider(hi),..._i.length?{[AUX_PROVIDER_ID]:_i}:{}}}}listVisibleModelIdsByProvider(Cn){',
    'return auxProviderCli.decorateInventory({subscriptionPlan:si,availableModels:[...fi,...pi],connectedProviders:hi,visibleModelIdsByProvider:{...this.listVisibleModelIdsByProvider(hi),..._i.length?{[AUX_PROVIDER_ID]:_i}:{}}},this.accountId,()=>{this.accountId!==void 0&&EventBus.emit(`models:inventory-changed`,{accountId:this.accountId})})}listVisibleModelIdsByProvider(Cn){'),
  edit('keep a CLI default model while detection runs',
    'ti=/* @__PURE__ */ new Set([...this.credentials.list(),...this.modelsJson.listProviderAuthIds()])',
    'ti=/* @__PURE__ */ new Set([...this.credentials.list(),...this.modelsJson.listProviderAuthIds(),...auxProviderCli.providerIds()])'),
  edit('chat turns on a CLI provider run the CLI with the session browser tools',
    'Ci=new Agent$1({streamFn:async(Cn,ni,ri)=>{let ai=Cn.provider===`aux`?',
    'Ci=new Agent$1({streamFn:async(Cn,ni,ri)=>{if(auxProviderCli.owns(Cn.provider))return modelRuntime.streamSimple(Cn,ni,{...ri,auxProviderCli:{tools:()=>Ci.state.tools,context:()=>({systemPrompt:ti.systemPrompt,messages:Ci.state.messages,tools:Ci.state.tools}),prepareArguments:(Cn,ei)=>validateToolArguments(Cn,prepareToolCallArguments(Cn,ei)),beforeToolCall:(Cn,ei)=>Ci.beforeToolCall?.(Cn,ei),afterToolCall:(Cn,ei)=>Ci.afterToolCall?.(Cn,ei),execute:auxExecuteRegisteredBrowserTool}});let ai=Cn.provider===`aux`?'),
  edit('provider CLI status procedures',
    'getSubscriptionUsage:accountProcedure.input(object({providerId:_enum([`aux`,`claude-code`,`kimi-code`,`openai-codex`,`xai-grok-oauth`])})).query(',
    'providerCliStatus:accountProcedure.query(()=>auxProviderCli.status()),providerCliRefresh:accountProcedure.mutation(()=>auxProviderCli.status({refresh:!0})),getSubscriptionUsage:accountProcedure.input(object({providerId:_enum([`aux`,`claude-code`,`kimi-code`,`openai-codex`,`xai-grok-oauth`])})).query('),
  edit('per-turn MCP endpoint: loopback, no browser origin, turn token',
    'daemonAuthMiddleware=()=>async(Cn,ei)=>{let ti=new URL(Cn.req.url).pathname,',
    'daemonAuthMiddleware=()=>async(Cn,ei)=>{if(auxProviderCli.isMcpPath(new URL(Cn.req.url).pathname))return!isConnectedFromLocalhost(Cn)||!isLoopbackHost(Cn.req.header(`host`))||Cn.req.header(`origin`)||Cn.req.header(`sec-fetch-site`)?Cn.json({error:{code:`FORBIDDEN`,message:`Local provider CLI connections only.`}},403):await auxProviderCli.handleMcp(Cn.req.raw);let ti=new URL(Cn.req.url).pathname,'),
  edit('shutdown stops every provider CLI',
    "observed('exec',deps.terminateExec),observed('commands',deps.killCommands)];",
    "observed('exec',deps.terminateExec),observed('commands',deps.killCommands),observed('provider-cli',deps.stopProviderCli)];"),
  edit('shutdown dependency',
    'killCommands:killRunningCommands,stopTelemetry:shutdownPostHog,',
    'killCommands:killRunningCommands,stopProviderCli:()=>auxProviderCli.stop(),stopTelemetry:shutdownPostHog,'),
  edit('start: run folder, MCP origin, abrupt-exit cleanup',
    'async function main(){await auxProvisionBundledMemoryV2();',
    'async function main(){auxProviderCli.start({runRoot:()=>path.join(AUX_HOME_PATH,`agent-cli`),mcpOrigin:`http://127.0.0.1:${PORT}`});await auxProvisionBundledMemoryV2();'),
]);

/** Agent provider list: Cursor, Grok and OpenCode CLI rows, Copilot CLI (shown only when
 * installed), and copy that says which CLI each subscription row uses. */
export const AGENT_LIST_EDITS = Object.freeze([
  edit('CLI rows in the provider order',
    '"openai-codex","meta","openrouter"',
    '"openai-codex","cursor-cli","grok-cli","opencode-cli","meta","openrouter"'),
  edit('Claude row uses Claude Code',
    '"claude-code":{name:"Claude",type:"subscription",description:"Reuse your Claude Pro or Max subscription",',
    '"claude-code":{name:"Claude",type:"subscription",description:"Use your Claude plan through Claude Code",'),
  edit('ChatGPT row uses the Codex CLI; new CLI rows',
    '"openai-codex":{name:"ChatGPT",type:"subscription",description:"Reuse your ChatGPT Plus or Pro subscription",icon:"openai",oauthOnly:!0},',
    '"openai-codex":{name:"ChatGPT",type:"subscription",description:"Use your ChatGPT plan through the Codex CLI",icon:"openai",oauthOnly:!0},'
      + '"cursor-cli":{name:"Cursor",type:"subscription",description:"Use your Cursor plan through the Cursor CLI",icon:"unknown",oauthOnly:!0},'
      + '"grok-cli":{name:"Grok Build",type:"subscription",description:"Use your Grok plan through Grok Build",icon:"xai",oauthOnly:!0},'
      + '"opencode-cli":{name:"OpenCode CLI",type:"subscription",description:"Use the providers you signed in to in OpenCode",icon:"opencode",oauthOnly:!0},'
      + '"copilot-cli":{name:"GitHub Copilot CLI",type:"subscription",description:"Installed; Aux support is not verified yet",icon:"github-copilot",oauthOnly:!0},'),
]);

/** One status dialog for every CLI row, built from the supplied dialog parts: P (dialog), I
 * (header), A (description), w (footer), _ (close), re (button), v (external link), D (spinner),
 * S (toast), W (tRPC), st (query), z (mutation), b (provider context). */
const CLI_DIALOG = 'auxCliDialog=({provider:t})=>{'
  + 'const{accountId:n,currentProvider:s,completeConnection:o,refetch:r}=b(),a=W(),'
  + 'l=st({...a.models.providerCliStatus.queryOptions({accountId:n}),enabled:s===t,refetchOnWindowFocus:!0,retry:!1}),'
  + 'i=z(a.models.providerCliRefresh.mutationOptions()),u=l.data?.rows?.[t],'
  + 'h=async()=>{try{await i.mutateAsync({accountId:n}),await l.refetch(),await r()}catch(c){console.error(c),S.error("Could not check the CLI")}},'
  + 'c=x=>{navigator.clipboard.writeText(x).then(()=>S.success("Copied"),()=>S.error("Could not copy"))},'
  + 'x=u?.account?Object.values(u.account).flatMap(y=>Array.isArray(y)?[`${y.length} stored sign-in${y.length===1?"":"s"}`]:typeof y=="string"&&y?[y]:[]).join(" · "):"";'
  + 'return(0,e.jsxs)(P,{provider:t,children:['
  + '(0,e.jsx)(I,{title:u?.product,children:(0,e.jsx)(A,{children:u?u.message:"Checking this Mac for the CLI…"})}),'
  + '(0,e.jsxs)("div",{className:"space-y-3 text-sm",children:['
  + '!u&&(0,e.jsx)(D,{}),'
  + 'u?.version&&(0,e.jsxs)("p",{className:"text-muted-foreground",children:["Version ",u.version,x?` · ${x}`:""]}),'
  + '(u?.actions??[]).map((y,g)=>y.kind==="link"?(0,e.jsx)("p",{children:(0,e.jsx)(v,{to:y.url,children:y.label})},g)'
  + ':y.kind==="copy"?(0,e.jsxs)("div",{className:"flex items-center justify-between gap-2 rounded-lg border p-2",children:[(0,e.jsx)("code",{className:"font-mono text-xs break-all",children:y.command}),(0,e.jsx)(re,{type:"button",variant:"outline",onClick:()=>c(y.command),children:y.label})]},g)'
  + ':y.kind==="explain"?(0,e.jsx)("p",{className:"text-muted-foreground",children:y.text},g):null)]}),'
  + '(0,e.jsxs)(w,{children:[(0,e.jsx)(_,{children:"Close"}),'
  + 'u?.state==="ready"&&u.runnable?(0,e.jsx)(re,{type:"button",onClick:()=>o(t),children:"Done"})'
  + ':(0,e.jsxs)(re,{type:"button",disabled:i.isPending,onClick:h,children:[i.isPending&&(0,e.jsx)(D,{}),(0,e.jsx)("span",{children:"Check again"})]})]})]})},';

const oauthDialog = (name, provider, product, popup) => `${name}=()=>(0,e.jsx)(P,{provider:"${provider}",children:(0,e.jsxs)(ie,{children:[(0,e.jsx)(I,{children:(0,e.jsxs)(A,{children:["Aux will use your subscription to access ${product} supported models. ",(0,e.jsx)("br",{}),"Sign in with ${product} to connect your account."]})}),${provider === 'openai-codex' ? '(0,e.jsx)(En,{}),' : ''}(0,e.jsx)(le,{}),(0,e.jsxs)(w,{children:[(0,e.jsx)(ce,{}),(0,e.jsx)(de,{popup:{name:"${popup}",features:"popup=yes,width=540,height=720"}})]})]})}),`;

/** Connect dialogs: ChatGPT and Claude become CLI status rows, the new CLI rows get the same
 * dialog, and their ids are reserved from custom providers. */
export const CONNECT_DIALOG_EDITS = Object.freeze([
  edit('ChatGPT connects through the Codex CLI', oauthDialog('In', 'openai-codex', 'ChatGPT', 'aux-openai-codex-oauth'), 'In=()=>(0,e.jsx)(auxCliDialog,{provider:"openai-codex"}),'),
  edit('Claude connects through Claude Code', oauthDialog('Sn', 'claude-code', 'Claude', 'aux-claude-oauth'), 'Sn=()=>(0,e.jsx)(auxCliDialog,{provider:"claude-code"}),'),
  edit('CLI status dialog', 'he=t=>t==="claude-code"||t==="openai-codex",', `${CLI_DIALOG}he=t=>t==="claude-code"||t==="openai-codex",`),
  edit('dialogs for the new CLI rows', '(0,e.jsx)(Sn,{}),(0,e.jsx)(An,{})]})', `(0,e.jsx)(Sn,{}),(0,e.jsx)(An,{}),${NEW_ROWS.map(id => `(0,e.jsx)(auxCliDialog,{provider:"${id}"})`).join(',')}]})`),
  edit('reserve the CLI row ids', '"xiaomi-token-plan-sgp","custom-json"]),on=', `"xiaomi-token-plan-sgp","custom-json",${NEW_ROWS.map(id => `"${id}"`).join(',')}]),on=`),
]);

/** Strings that must not ship once the dialogs are re-pointed. */
export const FORBIDDEN_DIALOG = Object.freeze(['aux-openai-codex-oauth', 'aux-claude-oauth', 'Sign in with ChatGPT', 'Sign in with Claude']);

export function applyExactEdits(label, edits, text) {
  if (typeof text !== 'string') throw TypeError(`${label}: source text required`);
  let output = text;
  for (const rule of edits) {
    const actual = output.split(rule.find).length - 1;
    if (actual !== rule.count) throw Error(`Provider CLI integration drift: ${label}: ${rule.name}: expected ${rule.count}, got ${actual}`);
    output = output.split(rule.find).join(rule.replace);
  }
  return output;
}

/** The composed daemon entry: borrowed identities out, CLI hooks in. */
export const integrateDaemon = text =>
  applyExactEdits('daemon', DAEMON_EDITS, applyBorrowedIdentityRemoval({component: 'daemon', path: 'entry.mjs', text}).text);
/** The Agent provider list: OAuth-only rows out, CLI rows in. */
export const integrateAgentList = text =>
  applyExactEdits('agent list', AGENT_LIST_EDITS, applyBorrowedIdentityRemoval({component: 'agent', path: AGENT_PATH, text}).text);
export const integrateConnectDialog = text => applyExactEdits('connect dialog', CONNECT_DIALOG_EDITS, text);
export {AGENT_PATH};
