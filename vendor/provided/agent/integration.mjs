/** Release-time integration of the Agent (docs/plans/2026-10-28-agent-model.md). Exact,
 * count-checked edits on the composed daemon entry and the Agent extension, plus the files
 * they load. scripts/release/transforms.mjs applies them after the provider CLI integration;
 * any drifted anchor stops the release. */
import {applyExactEdits} from '../provider-cli/integration.mjs';
import {withoutRemovedPaths} from './removed-paths.mjs';

/** Copied beside aux-native-entry.mjs, under aux-agent/. */
export const DAEMON_FILES = Object.freeze(['aux-agent.mjs', 'ask-first.mjs']);

const edit = (name, find, replace, count = 1) => Object.freeze({name, find, replace, count});

const PROCEDURES = 'agentGet:accountProcedure.query(({ctx:Cn})=>auxAgentView(Cn.accountId)),'
  + 'agentUpdate:accountProcedure.input(object({name:string$3().max(200).optional(),setupCompleted:boolean$1().optional()})).mutation(async({ctx:Cn,input:ei})=>{let ti=auxAgent.read(Cn.accountId).name;auxAgent.update(Cn.accountId,ei);await auxAgentApply(Cn.accountId,ti);return auxAgentView(Cn.accountId)}),'
  + 'agentAvatar:accountProcedure.input(object({revision:string$3().max(64)})).query(({ctx:Cn})=>({dataUrl:auxAgent.avatarDataUrl(Cn.accountId)})),'
  + 'agentSetAvatar:accountProcedure.input(object({dataUrl:string$3().max(11e5)})).mutation(({ctx:Cn,input:ei})=>{try{auxAgent.setAvatar(Cn.accountId,ei.dataUrl)}catch(ti){throw new TRPCError({code:`BAD_REQUEST`,message:ti.message})}return auxAgentView(Cn.accountId)}),'
  + 'agentClearAvatar:accountProcedure.mutation(({ctx:Cn})=>(auxAgent.clearAvatar(Cn.accountId),auxAgentView(Cn.accountId))),'
  + 'agentSetHome:accountProcedure.input(object({sessionId:string$3().min(1)})).mutation(async({ctx:Cn,input:ei})=>{let ti=auxAgentView(Cn.accountId);if(ti.homeSessionId)return ti;let ni=SessionStore.get(Cn.accountId,ei.sessionId);if(!ni||ni.parentId||!auxAgentUsable(ni))throw new TRPCError({code:`BAD_REQUEST`,message:`This chat cannot be the agent home.`});auxAgent.setAskChat(Cn.accountId,ni.id);await auxAgentApply(Cn.accountId);return auxAgentView(Cn.accountId)}),';

/** Entry-scope helpers. Function declarations, so they are hoisted above their callers. */
const HELPERS = `
// Ask first in code (ask-first.mjs). Mirrors when the session offers request_action_confirmation.
function auxAskFirstOn(Cn,ei){let ti=SessionStore.get(Cn,ei);return!!ti&&ti.runtimeConfig?.finalConfirm===!0&&ti.permissionMode!==\`read-only\`&&!isHeadlessSessionTrigger(ti.trigger)}
async function auxAskFirstCard(Cn,ei){let ti=\`\${ei.toolCallId}_confirm_\${globalThis.crypto.randomUUID().replaceAll(\`-\`,\`\`)}\`,ni=\`artifacts/confirm-\${ti.slice(-12)}.png\`,ri=resolveSessionPath(Cn.sessionDir,ni),ii=await auxBrokerBoundary().awaited(async()=>{try{fs.mkdirSync(path.dirname(ri),{recursive:!0});fs.writeFileSync(ri,Buffer$1.from(ei.screenshot,\`base64\`))}catch(Cn){return Cn}});if(ii)throw ii;let{verdict:ai,instruction:oi}=await Cn.suspend(\`action-confirmation\`,ti,auxAskFirst.confirmationRequest(ei,ni));if(ai!==\`confirm\`)throw Error(oi?.trim()?\`The user did not confirm. Follow this instruction instead: \${oi.trim()}\`:\`The user did not confirm. Do not perform this action.\`)}
function auxAgentUsable(Cn){return!!Cn&&!Cn.archivedAt&&!Cn.ephemeral&&!Cn.incognito}
function auxAgentAskChat(Cn,ei){return auxAgentUsable(SessionStore.get(Cn,ei))?SessionStore.listPreviewItems(Cn,{sessionIds:[ei],parent:\`all\`})[0]:void 0}
function auxAgentView(Cn){let ei=auxAgent.read(Cn);return auxAgent.view(ei,!!(ei.homeSessionId&&auxAgentAskChat(Cn,ei.homeSessionId)))}
// One agent across Spaces: its instructions and personality are the same in every data
// group's local account, so an edit in one is written to all of them.
function auxAgentWriteContext(Cn,ei,ti){const ni=[\`AGENTS.md\`,\`SOUL.md\`].includes(ei)?AccountRegistry.getAll().accounts.filter(ei=>ei.mode===\`local\`||ei.id===Cn).map(ei=>ei.id):[Cn];for(const ri of new Set([Cn,...ni])){writeFileSync(path.join(getAccountTaskRoot(ri),ei),ti,\`utf-8\`);auxAgentApply(ri)}}
// Every open chat picks up a new name, personality or memory; the \`aux ask\` chat is titled after the agent.
async function auxAgentApply(Cn,ni){let ei=auxAgent.read(Cn),ti=ei.homeSessionId&&SessionStore.get(Cn,ei.homeSessionId);auxAgentUsable(ti)&&ti.title!==ei.name&&SessionStore.update(Cn,ti.id,{title:ei.name});for(let ri of SessionStore.listFull(Cn)){if(!auxAgentUsable(ri)||ri.parentId||!GlobalAgentSessionServer.getLoadedAgent(Cn,ri.id))continue;try{GlobalAgentSessionServer.isRunning(Cn,ri.id)||await GlobalAgentSessionServer.reloadLoadedAgentSession(Cn,ri.id);ni&&ni!==ei.name&&await GlobalAgentSessionServer.appendMessage(Cn,ri.id,auxAgent.renameNote(ei.name))}catch(ii){console.warn(\`[aux-agent] could not apply the agent profile: \${ii?.message??ii}\`)}}}
`;

export const DAEMON_EDITS = Object.freeze([
  // Browser-only mode has no aux.sessions and Aux has no vault.
  edit('the side chat directive names no removed REPL API',
    "- The snapshot is frozen at load. For the main task's CURRENT progress, read its live transcript with \\`await aux.sessions.messages('${Cn}')\\` in the repl.",
    '- The snapshot is frozen at load, so the main task may have moved on.'),
  edit('the proactive prompt names no vault',
    '   - password managers (ask a subagent to use vault.listItems() without text search; this is a proven golden source)\n', ''),
  // Notifications, completion sounds, history search and clearing the agent's tab group reach the
  // extension. The bound path allowed only tab commands, so these failed on every call. None is
  // tied to one window, and a cue or a cleanup often has none to name.
  edit('bound browser actions carry the windowless commands',
    "'Aux.ensureTabInAiTabsGroup','Aux.validateTabReferences','Aux.debuggerAttach'",
    "'Aux.ensureTabInAiTabsGroup','Aux.validateTabReferences','Aux.showNotification','Aux.playNotificationSound','Aux.searchHistory','Aux.clearAiTabsGroup','Aux.debuggerAttach'"),
  edit('windowless commands need no task window',
    "command.method!=='Aux.resolveBindingWindow'&&(!Number.isInteger(route.windowId)||route.windowId<0)",
    "!['Aux.resolveBindingWindow','Aux.showNotification','Aux.playNotificationSound','Aux.searchHistory','Aux.clearAiTabsGroup'].includes(command.method)&&(!Number.isInteger(route.windowId)||route.windowId<0)"),
  // A user's MCP tools run in their session's fixed scope like every other tool, so the dispatcher
  // admits them and permission modes reach them.
  edit('MCP tools are registered for the session that owns them',
    'ti=ei.initialize(Cn.inventories),ni=new Set(this.#k)',
    'ti=ei.initialize(Cn.inventories,this.ctx),ni=new Set(this.#k)'),
  // Subagent waits and MCP calls can outlast a quit; the scope close that ends a quit waits for them.
  edit('a quit aborts fixed tools still running: the set',
    'const auxSelectedReadFileTools=new WeakSet;',
    'const auxSelectedReadFileTools=new WeakSet;\nconst auxFixedToolControllers=new Set;'),
  edit('a quit aborts fixed tools still running: the stop',
    'function auxStopSelectedReadScopes(){return Promise.all(',
    "function auxStopSelectedReadScopes(){for(const controller of auxFixedToolControllers)controller.abort(Error('Aux is shutting down.'));return Promise.all("),
  edit('a quit aborts fixed tools still running: admission',
    'const signal = parent ? AbortSignal.any([parent, controller.signal]) : controller.signal;\n    controllers.add(controller);',
    'const signal = parent ? AbortSignal.any([parent, controller.signal]) : controller.signal;\n    controllers.add(controller);auxFixedToolControllers.add(controller);'),
  edit('a quit aborts fixed tools still running: release',
    'const finish = () => { pending.delete(operation); controllers.delete(controller); };',
    'const finish = () => { pending.delete(operation); controllers.delete(controller); auxFixedToolControllers.delete(controller); };'),
  // The agent button's Stop: interrupt every chat of this account that is working.
  edit('the agent button can stop the agent',
    'Cn.post(`/session/for-chrome/mark-all-read`,',
    'Cn.post(`/session/for-chrome/stop-all`,async Cn=>{let ei=Cn.get(`accountId`),ti=SessionStore.listFull(ei).filter(Cn=>Cn.status===`running`);for(let Cn of ti)await GlobalAgentSessionServer.interrupt(ei,Cn.id);return Cn.json({stopped:ti.length})}),Cn.post(`/session/for-chrome/mark-all-read`,'),
  edit('load the agent module beside the entry',
    'const __auxCryptoBaseURL=new URL("./aux-crypto/",import.meta.url);',
    'const auxAgent=(await import(new URL("./aux-agent/aux-agent.mjs",import.meta.url))).createAuxAgent({control:Cn=>auxControlAccountRoot(Cn),task:Cn=>getAccountTaskRoot(Cn),shared:()=>path.join(AUX_HOME_PATH,`agent-shared`)});\nconst auxAskFirst=await import(new URL("./aux-agent/ask-first.mjs",import.meta.url));\nconst __auxCryptoBaseURL=new URL("./aux-crypto/",import.meta.url);'),
  // Every page command of a task goes through the gate, so no way of acting can skip it.
  edit('Ask first holds in code: the page client',
    'this.#e=auxReferenceCdpClient(auxScopedBrowserCdpClient(Cn,ei,ti,()=>this.#L(),()=>this.state.tabs,target=>this.#H(target)),()=>this.state.tabs,()=>this.#L()),this.#S=',
    'this.#e=auxAskFirst.askFirstClient(auxReferenceCdpClient(auxScopedBrowserCdpClient(Cn,ei,ti,()=>this.#L(),()=>this.state.tabs,target=>this.#H(target)),()=>this.state.tabs,()=>this.#L()),{enabled:()=>auxAskFirstOn(ei,ti.id),call:()=>getCurrentReplToolCallId(),confirm:(Cn,ei)=>this.auxConfirmAction(Cn,ei)}),this.#S='),
  edit('Ask first holds in code: the browser asks',
    'async ensureAccess(Cn,ei,ti=getCurrentReplToolCallId()){',
    'async auxConfirmAction(Cn,ei){if(!this.#i||!ei)throw Error(`This action needs your confirmation, and no task is here to ask.`);let ti={...Cn,toolCallId:ei,action:`submit`};await this.#i.trigger(`browser.access`,ti,ti)}async ensureAccess(Cn,ei,ti=getCurrentReplToolCallId()){'),
  edit('Ask first holds in code: the card',
    '"browser.access":async ei=>{let ti=await checkPermission(',
    '"browser.access":async ei=>{if(ei.action===`submit`)return auxAskFirstCard(Cn,ei);let ti=await checkPermission('),
  edit('aux exec approves read-only tools only',
    'ei.kind===`permission-approval`&&await resolveSuspension({accountId:oi,sessionId:ri,toolCallId:ni,response:{verdict:ti===`approve`?`allow`:`deny`,always:!1}})',
    'ei.kind===`permission-approval`&&await resolveSuspension({accountId:oi,sessionId:ri,toolCallId:ni,response:{verdict:ti===`approve`&&(!si.ephemeral||!isCliSession(si)||auxAskFirst.readOnlyScope(si.suspension.request.scope))?`allow`:`deny`,always:!1}})'),
  edit('system prompts open with the agent identity',
    'return[Cn??SYSTEM_PROMPT$1,...ti?[ti]:[]].join(',
    'return[Cn??auxAgent.systemPrompt(SYSTEM_PROMPT$1,ei.scanContexts?.accountId),...ti?[ti]:[]].join('),
  edit('a frozen prompt older than the agent identity is rebuilt',
    'oi?.includes(`## Context Awareness`)&&(oi=``),',
    'oi?.includes(`## Context Awareness`)&&(oi=``),auxAgent.promptStale(ei,ti,oi)&&(oi=``),'),
  edit('a chat records its context only once a rebuilt prompt is stored',
    'SessionStore.get(ei,ti.id)?.projectId===ti.projectId&&SessionStore.update(ei,ti.id,{systemPrompt:oi}))',
    'SessionStore.get(ei,ti.id)?.projectId===ti.projectId&&(SessionStore.update(ei,ti.id,{systemPrompt:oi}),auxAgent.promptBuilt(ei,ti,oi)))'),
  edit('native Chats feed: agent state across every live session in',
    'return Cn.json({pinned:ei.map(toChromeSidebarPreview),recents:ti.map(toChromeSidebarPreview)})',
    'let ni=Cn.get(`accountId`);return Cn.json(auxAgent.chromeChats(ni,{pinned:ei,recents:ti},toChromeSidebarPreview,Cn=>auxAgentAskChat(ni,Cn),SessionStore.listPreviewItems(ni,{parent:`root`,archived:`exclude`,ephemeral:`include`,routines:`include`,statuses:[`running`,`suspended`]})))'),
  edit('native avatar route',
    'Cn.get(`/session/for-chrome/recents`,',
    'Cn.use(`/agent/*`,requestAccountMiddleware),Cn.get(`/agent/for-chrome/avatar`,Cn=>{let ei=auxAgent.avatar(Cn.get(`accountId`));return ei?Cn.body(ei,200,{"content-type":`image/png`,"cache-control":`no-store`}):Cn.json({error:{code:`NOT_FOUND`,message:`The agent has no custom avatar.`}},404)}),Cn.get(`/session/for-chrome/recents`,'),
  edit('agent procedures',
    'readContextFile:accountProcedure.input(',
    `${PROCEDURES}readContextFile:accountProcedure.input(`),
  edit('personality and instruction edits reach every open chat',
    '.mutation(({ctx:Cn,input:ei})=>(writeFileSync(path.join(getAccountTaskRoot(Cn.accountId),ei.fileName),ei.content,`utf-8`),{success:!0}))',
    '.mutation(({ctx:Cn,input:ei})=>(auxAgentWriteContext(Cn.accountId,ei.fileName,ei.content),{success:!0}))'),
]);

/** Drops the speech-to-text router: hosted AI is off in Aux and nothing mounts it. */
function withoutSttRouter(text) {
  const name = 'createSttHttpRouter', tail = 'throw ei}}),Cn}var init_http_routes$2=', start = text.indexOf(`function ${name}(){`), end = text.indexOf(tail, start);
  if (start < 0 || end < 0 || text.split(name).length !== 2) throw Error('Agent integration: the STT router drifted');
  return text.slice(0, start) + text.slice(end + 'throw ei}}),Cn}'.length);
}

export function integrateDaemon(text) {
  if (text.includes('function auxAgentView(')) throw Error('Agent integration: the daemon entry already has the agent helpers');
  return withoutRemovedPaths(withoutSttRouter(applyExactEdits('agent daemon', DAEMON_EDITS, text))) + HELPERS;
}

/** The UI module, copied to dist/assets/ and imported by the chunks below. */
export const UI_FILE = 'aux-agent-ui.js';
// The module's names all start with aux/Aux, which no supplied chunk uses (checked in the tests).
const ui = names => `import{${names.join(',')}}from"./${UI_FILE}";`;

/** dist/assets chunk → edits. Imports go first so a drifted chunk fails before any JSX edit. */
export const EXTENSION_EDITS = Object.freeze({
  // Once, after a first login form: Aux keeps no passwords, so say how to get them filled.
  'content/content.js': [
    edit('a page with a login form tells the extension, until the hint has been shown',
      '(function(){var Ia=Object.create,At=Object.defineProperty,',
      "(()=>{if(window!==top)return;const key='aux.loginHint.v1',seen=()=>{if(document.querySelector('input[type=\"password\"]'))chrome.runtime.sendMessage({type:'aux-login-form-seen'}).catch(()=>{})};chrome.storage.local.get(key).then(found=>{if(!found[key]){seen();setTimeout(seen,3000)}}).catch(()=>{})})();(function(){var Ia=Object.create,At=Object.defineProperty,"),
  ],
  'background.js': [
    edit('the first login form with no password manager gets the hint',
      "chrome.auxAccount?.onProfileContextChanged?.addListener(()=>{auxCloseBrowserTasks().catch(()=>{})});",
      "chrome.auxAccount?.onProfileContextChanged?.addListener(()=>{auxCloseBrowserTasks().catch(()=>{})});\nasync function auxLoginHint(){const key='aux.loginHint.v1';if((await chrome.storage.local.get(key))[key])return;await chrome.storage.local.set({[key]:true});if((await chrome.management.getAll()).some(item=>item.enabled&&/1password|bitwarden|dashlane|lastpass|proton pass|nordpass|keeper|enpass/i.test(item.name)))return;await oy({notificationId:crypto.randomUUID(),title:'Aux doesn’t save passwords',body:'Add a password manager like 1Password or Bitwarden, and it fills your logins here.'})}\nchrome.runtime.onMessage.addListener(message=>{if(message?.type==='aux-login-form-seen')auxLoginHint().catch(()=>{})});"),
    // Ask first watches what an agent command sends (ask-first.mjs). Native passes these through.
    edit('Ask first can pause requests: the commands',
      "'Emulation.setFocusEmulationEnabled','Input.dispatchKeyEvent'",
      "'Emulation.setFocusEmulationEnabled','Fetch.continueRequest','Fetch.disable','Fetch.enable','Fetch.failRequest','Input.dispatchKeyEvent'"),
    edit('Ask first can pause requests: the event',
      "if(!/^(Accessibility|DOM|Emulation|Input|Inspector|Network|Page|Runtime|Target)\\./.test(method))return;",
      "if(!/^(Accessibility|DOM|Emulation|Fetch|Input|Inspector|Network|Page|Runtime|Target)\\./.test(method))return;\n if(method==='Fetch.requestPaused'&&['GET','HEAD','OPTIONS'].includes(params?.request?.method)){auxWorkerPhysical('browser-fetch-continue',()=>chrome.debugger.sendCommand(source,'Fetch.continueRequest',{requestId:params.requestId,...root.reference?{__auxDocumentCapability:root.reference.documentCapability}:{}}),false).catch(()=>{});return}"),
    edit('bound browser actions carry the windowless commands: the allowlist',
      "'Aux.ensureTabInAiTabsGroup','Aux.validateTabReferences']);",
      "'Aux.ensureTabInAiTabsGroup','Aux.validateTabReferences','Aux.showNotification','Aux.playNotificationSound','Aux.searchHistory','Aux.clearAiTabsGroup']);"),
    edit('bound browser actions carry the windowless commands: the handlers',
      " if(task.route.windowId===undefined)throw Error('Choose the task browser window first.');\n",
      " if(['Aux.showNotification','Aux.playNotificationSound','Aux.searchHistory','Aux.clearAiTabsGroup'].includes(command.method)){const result=await vy(command,signal,task.route,task.events);await auxBrowserTaskCurrent(task,signal);return result}\n if(task.route.windowId===undefined)throw Error('Choose the task browser window first.');\n"),
  ],
  // Side panel header and its session controller.
  'assets/-components-4o0FSqQ9.js': [
    edit('agent UI import',
      'import{t as de}from"./session-title-B4i3BSFD.js";',
      `import{t as de}from"./session-title-B4i3BSFD.js";${ui(['AuxAgentTitle', 'AuxAgentPanelRoute', 'auxAgentChats', 'auxAgentChatsEmpty', 'auxAgentChatsQuery', 'AuxAgentChatFilters'])}`),
    edit('tab switches never leave the agent: no per-tab chats',
      'function fe(e){return e.mode==="new-session"?!0:e.isInitialObservation&&!e.hasCurrentSession}',
      'function fe(e){return!1}'),
    edit('tab switches keep the current conversation',
      'const v=g?.sidepanelSessionOnTabChange??"new-session";',
      'const v="keep-session";'),
    edit('the chat menu takes a trigger label',
      'var j=20,xe=()=>{',
      'var j=20,xe=({label:auxLabel})=>{'),
    edit('labelled chat menu trigger',
      '(0,s.jsx)(de,{trigger:e.trigger,title:V(e.title)?null:e.title,className:"min-w-0 flex-1"})',
      'auxLabel?(0,s.jsx)("span",{className:"text-muted-foreground min-w-0 flex-1 truncate text-left text-sm",children:auxLabel}):(0,s.jsx)(de,{trigger:e.trigger,title:V(e.title)?null:e.title,className:"min-w-0 flex-1"})'),
    // Side chats by default; routine, channel and New Tab chats each have a filter (plan 8.21).
    edit('the chat menu keeps its filter',
      '[o,m]=(0,a.useState)(!1),{data:u,fetchNextPage:p,',
      '[o,m]=(0,a.useState)(!1),[auxFilter,auxSetFilter]=(0,a.useState)("side"),{data:u,fetchNextPage:p,'),
    edit('the filter reaches the list',
      'i.sessions.listPreviewItems.infiniteQueryOptions({accountId:t,limit:j},{enabled:o,',
      'i.sessions.listPreviewItems.infiniteQueryOptions({accountId:t,limit:j,...auxAgentChatsQuery(auxFilter)},{enabled:o,'),
    edit('the chat menu lists the filter\'s chats',
      'r=(0,a.useMemo)(()=>u?.pages.flat()??[],[u?.pages])',
      'r=(0,a.useMemo)(()=>auxAgentChats(u?.pages.flat()??[],auxFilter),[u?.pages,auxFilter])'),
    edit('the chat menu opens with its filters',
      'className:"bg-popover max-h-80 w-72 overflow-y-auto",children:[w&&',
      'className:"bg-popover max-h-80 w-72 overflow-y-auto",children:[(0,s.jsx)(AuxAgentChatFilters,{value:auxFilter,onChange:auxSetFilter}),w&&'),
    edit('an empty chat menu names its filter',
      'children:"No chats yet"',
      'children:auxAgentChatsEmpty(auxFilter)'),
    edit('header title: the agent and the chat menu',
      'children:[e,(0,s.jsx)(xe,{})]',
      'children:[e,(0,s.jsx)(AuxAgentTitle,{sessionId:Ce().currentSessionId,menu:auxLabel=>(0,s.jsx)(xe,{label:auxLabel})})]'),
    edit('pop out to the full view',
      '(0,s.jsx)(N,{content:"Open in new tab",',
      '(0,s.jsx)(N,{content:"Open full view",'),
    edit('pop-out label',
      '"aria-label":"Open in tab"',
      '"aria-label":"Open full view"'),
    edit('the side panel offers setup and takes command bar questions',
      '(0,s.jsx)(ve,{currentSessionId:e,onSessionChange:n,children:t})',
      '(0,s.jsxs)(ve,{currentSessionId:e,onSessionChange:n,children:[(0,s.jsx)(AuxAgentPanelRoute,{}),t]})'),
  ],
  'assets/session-composer-Dc0LRfZA.js': [
    edit('agent UI import',
      'import{A as Ns,C as Y,E as qo,T as Wo,u as Rs,w as Go,x as Qo}from"./browser-color-scheme-Df5VSuPV.js";',
      `${ui(['useAuxAgentPlaceholder', 'AuxAgentEmptyState'])}import{A as Ns,C as Y,E as qo,T as Wo,u as Rs,w as Go,x as Qo}from"./browser-color-scheme-Df5VSuPV.js";`),
    edit('composer hint names the agent',
      'placeholder:u??c??"Ask AI a task, @ for context"',
      'placeholder:useAuxAgentPlaceholder(u??c)'),
    edit('composer footer groups keep a gap, so the effort chevron never touches the context ring',
      'className:"flex min-w-0 items-center first:shrink-0 first:grow"',
      'className:"flex min-w-0 items-center gap-1 first:shrink-0 first:grow"'),
    edit('an empty conversation is the agent greeting you',
      '(0,a.jsx)(Qd,{})',
      '(0,a.jsx)(AuxAgentEmptyState,{})'),
    edit('the side panel and full view composer hint names the agent',
      'placeholder:n??"Reply, @ for context"',
      'placeholder:useAuxAgentPlaceholder(n)'),
  ],
  'assets/minipopup-LkDLFvnq.js': [
    edit('agent UI import',
      'import{A as B,C as g,E as ee,T as se,w as ne}from"./browser-color-scheme-Df5VSuPV.js";',
      `${ui(['auxAgentAsk'])}import{A as B,C as g,E as ee,T as se,w as ne}from"./browser-color-scheme-Df5VSuPV.js";`),
    edit('quick popup hint names the agent',
      'placeholder:"Ask Aux"',
      'placeholder:auxAgentAsk()'),
  ],
  // One Aux mark per surface: the new tab page keeps its large logo, so the default-browser
  // nudge under it goes without its own small one.
  'assets/nudges-7TFAp4B-.js': [
    edit('default-browser nudge without a second Aux mark',
      '(0,e.jsx)(y,{className:"text-muted-foreground size-5 opacity-60"}),',
      ''),
  ],
  // The new tab stays light: it reads the name the agent store last saw, without the module.
  'assets/newtab-editor-u_GbForB.js': [
    edit('new tab hint names the agent',
      'R={ask:"Ask Aux a task, @ for context"',
      'R={get ask(){let n="Aux";try{n=localStorage.getItem("aux.agent.name.v1")||n}catch{}return`Message ${n}, @ for context`}'),
  ],
  // Settings › Agent: the agent first; the per-tab chat option no longer applies.
  'assets/agents-urkO3LLg.js': [
    edit('agent UI import',
      'import{n as Ge}from"./document-title-DXu4CzFj.js";',
      `import{n as Ge}from"./document-title-DXu4CzFj.js";${ui(['AuxAgentSettings'])}`),
    edit('Your agent section',
      'children:[(0,e.jsxs)(k,{title:"Chat",',
      'children:[(0,e.jsx)(AuxAgentSettings,{}),(0,e.jsxs)(k,{title:"Chat",'),
    edit('no per-tab chat option',
      '(0,e.jsx)(is,{}),(0,e.jsx)(ps,{})',
      '(0,e.jsx)(is,{})'),
    edit('the page is named for the one agent: breadcrumb',
      'segments:["Settings","Agents"]', 'segments:["Settings","Agent"]'),
    edit('the page is named for the one agent: heading',
      '"h1",{children:"Agents"}', '"h1",{children:"Agent"}'),
  ],
  // Settings › Models: the commands added with "Add a local agent…".
  'assets/model-BrFuJM2w.js': [
    edit('agent UI import',
      'import{_ as R}from"./queries-ldd77hNk.js";',
      `import{_ as R}from"./queries-ldd77hNk.js";${ui(['AuxLocalAgents'])}`),
  ],
  // Nothing queries billing any more.
  'assets/strip-markdown-DRcmtuJc.js': [
    edit('no billing queries to refresh',
      'he.invalidateQueries(pe.billing.getSummary.queryFilter({accountId:e})),he.invalidateQueries(pe.billing.getSubscription.queryFilter({accountId:e})),',
      ''),
  ],
  // The onboarding glow takes the person's theme accent; with none set it keeps the brand color.
  'assets/floating-background-DQ7OXsyL.js': [
    edit('the glow reads the theme',
      'var e=a(),o=({className:i})=>',
      'var e=a(),auxThemedGlow=n=>{n&&globalThis.chrome?.auxBrowserPreferences?.getThemeState?.().then(t=>{t?.tokens?.accent&&(n.style.backgroundColor=t.tokens.accent)}).catch(()=>{})},o=({className:i})=>'),
    edit('the glow takes it',
      '(0,e.jsx)(r.div,{className:"bg-brand/50 border-shape-initial!',
      '(0,e.jsx)(r.div,{ref:auxThemedGlow,className:"bg-brand/50 border-shape-initial!'),
  ],
  // Onboarding's Make it yours has the agent's name and look inline.
  'assets/glance-BfAlmExy.js': [
    edit('agent UI import',
      'import{t as y}from"./link-q1zvRKtc.js";',
      `import{t as y}from"./link-q1zvRKtc.js";${ui(['AuxAgentSetup'])}`),
  ],
  // Settings navigation and its search index: one agent, so "Agent".
  'assets/route-TQyeTEXE.js': [
    edit('Settings navigation item',
      '{label:"Agents",icon:$2,activeIcon:B2,', '{label:"Agent",icon:$2,activeIcon:B2,'),
    edit('Settings search title',
      'path:"/u/$userId/settings/agents",title:"Agents",', 'path:"/u/$userId/settings/agents",title:"Agent",'),
  ],
});

export function integrateExtensionChunk(relative, text) {
  const edits = EXTENSION_EDITS[relative];
  if (!edits) throw Error(`Agent integration: no edits for ${relative}`);
  if (text.includes(UI_FILE) || text.includes('aux.agent.name.v1') || text.includes('aux.loginHint.v1')) throw Error(`Agent integration: ${relative} is already integrated`);
  return applyExactEdits(`agent ${relative}`, edits, text);
}
