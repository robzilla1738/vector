/** Release-time integration of the Agent (docs/plans/2026-10-28-agent-model.md). Exact,
 * count-checked edits on the composed daemon entry and the Agent extension, plus the files
 * they load. scripts/release/transforms.mjs applies them after the provider CLI integration;
 * any drifted anchor stops the release. */
import {applyExactEdits} from '../provider-cli/integration.mjs';

/** Copied beside aux-native-entry.mjs, under aux-agent/. */
export const DAEMON_FILES = Object.freeze(['aux-agent.mjs']);

const edit = (name, find, replace, count = 1) => Object.freeze({name, find, replace, count});

const PROCEDURES = 'agentGet:accountProcedure.query(({ctx:Cn})=>auxAgentView(Cn.accountId)),'
  + 'agentUpdate:accountProcedure.input(object({name:string$3().max(200).optional(),setupCompleted:boolean$1().optional()})).mutation(async({ctx:Cn,input:ei})=>{let ti=auxAgent.read(Cn.accountId).name;auxAgent.update(Cn.accountId,ei);await auxAgentApply(Cn.accountId,ti);return auxAgentView(Cn.accountId)}),'
  + 'agentAvatar:accountProcedure.input(object({revision:string$3().max(64)})).query(({ctx:Cn})=>({dataUrl:auxAgent.avatarDataUrl(Cn.accountId)})),'
  + 'agentSetAvatar:accountProcedure.input(object({dataUrl:string$3().max(11e5)})).mutation(({ctx:Cn,input:ei})=>{try{auxAgent.setAvatar(Cn.accountId,ei.dataUrl)}catch(ti){throw new TRPCError({code:`BAD_REQUEST`,message:ti.message})}return auxAgentView(Cn.accountId)}),'
  + 'agentClearAvatar:accountProcedure.mutation(({ctx:Cn})=>(auxAgent.clearAvatar(Cn.accountId),auxAgentView(Cn.accountId))),'
  + 'agentSetHome:accountProcedure.input(object({sessionId:string$3().min(1)})).mutation(async({ctx:Cn,input:ei})=>{let ti=auxAgentView(Cn.accountId);if(ti.homeSessionId)return ti;let ni=SessionStore.get(Cn.accountId,ei.sessionId);if(!ni||ni.parentId||!auxAgentUsable(ni))throw new TRPCError({code:`BAD_REQUEST`,message:`This chat cannot be the agent home.`});auxAgent.setHome(Cn.accountId,ni.id);await auxAgentApply(Cn.accountId);return auxAgentView(Cn.accountId)}),';

/** Entry-scope helpers. Function declarations, so they are hoisted above their callers. */
const HELPERS = `
function auxAgentUsable(Cn){return!!Cn&&!Cn.archivedAt&&!Cn.ephemeral&&!Cn.incognito}
function auxAgentHome(Cn,ei){return auxAgentUsable(SessionStore.get(Cn,ei))?SessionStore.listPreviewItems(Cn,{sessionIds:[ei],parent:\`all\`})[0]:void 0}
function auxAgentView(Cn){let ei=auxAgent.read(Cn);return auxAgent.view(ei,!!(ei.homeSessionId&&auxAgentHome(Cn,ei.homeSessionId)))}
async function auxAgentApply(Cn,ni){try{let ei=auxAgent.read(Cn),ti=ei.homeSessionId&&SessionStore.get(Cn,ei.homeSessionId);if(!auxAgentUsable(ti))return;ti.title!==ei.name&&SessionStore.update(Cn,ti.id,{title:ei.name});GlobalAgentSessionServer.getLoadedAgent(Cn,ti.id)&&!GlobalAgentSessionServer.isRunning(Cn,ti.id)&&await GlobalAgentSessionServer.reloadLoadedAgentSession(Cn,ti.id);ni&&ni!==ei.name&&await GlobalAgentSessionServer.appendMessage(Cn,ti.id,auxAgent.renameNote(ei.name))}catch(ei){console.warn(\`[aux-agent] could not apply the agent profile: \${ei?.message??ei}\`)}}
`;

export const DAEMON_EDITS = Object.freeze([
  edit('load the agent module beside the entry',
    'const __auxCryptoBaseURL=new URL("./aux-crypto/",import.meta.url);',
    'const auxAgent=(await import(new URL("./aux-agent/aux-agent.mjs",import.meta.url))).createAuxAgent({control:Cn=>auxControlAccountRoot(Cn),task:Cn=>getAccountTaskRoot(Cn)});\nconst __auxCryptoBaseURL=new URL("./aux-crypto/",import.meta.url);'),
  edit('system prompts open with the agent identity',
    'return[Cn??SYSTEM_PROMPT$1,...ti?[ti]:[]].join(',
    'return[Cn??auxAgent.systemPrompt(SYSTEM_PROMPT$1,ei.scanContexts?.accountId),...ti?[ti]:[]].join('),
  edit('a frozen prompt older than the agent identity is rebuilt',
    'oi?.includes(`## Context Awareness`)&&(oi=``),',
    'oi?.includes(`## Context Awareness`)&&(oi=``),auxAgent.promptStale(ei,ti,oi)&&(oi=``),'),
  edit('the home thread records its context only once a rebuilt prompt is stored',
    'SessionStore.get(ei,ti.id)?.projectId===ti.projectId&&SessionStore.update(ei,ti.id,{systemPrompt:oi}))',
    'SessionStore.get(ei,ti.id)?.projectId===ti.projectId&&(SessionStore.update(ei,ti.id,{systemPrompt:oi}),auxAgent.promptBuilt(ei,ti,oi)))'),
  edit('native Chats feed: home thread out, agent state across every live session in',
    'return Cn.json({pinned:ei.map(toChromeSidebarPreview),recents:ti.map(toChromeSidebarPreview)})',
    'let ni=Cn.get(`accountId`);return Cn.json(auxAgent.chromeChats(ni,{pinned:ei,recents:ti},toChromeSidebarPreview,Cn=>auxAgentHome(ni,Cn),SessionStore.listPreviewItems(ni,{parent:`root`,archived:`exclude`,ephemeral:`include`,routines:`include`,statuses:[`running`,`suspended`]})))'),
  edit('native avatar route',
    'Cn.get(`/session/for-chrome/recents`,',
    'Cn.use(`/agent/*`,requestAccountMiddleware),Cn.get(`/agent/for-chrome/avatar`,Cn=>{let ei=auxAgent.avatar(Cn.get(`accountId`));return ei?Cn.body(ei,200,{"content-type":`image/png`,"cache-control":`no-store`}):Cn.json({error:{code:`NOT_FOUND`,message:`The agent has no custom avatar.`}},404)}),Cn.get(`/session/for-chrome/recents`,'),
  edit('agent procedures',
    'readContextFile:accountProcedure.input(',
    `${PROCEDURES}readContextFile:accountProcedure.input(`),
  edit('personality and instruction edits reach the home thread',
    '.mutation(({ctx:Cn,input:ei})=>(writeFileSync(path.join(getAccountTaskRoot(Cn.accountId),ei.fileName),ei.content,`utf-8`),{success:!0}))',
    '.mutation(({ctx:Cn,input:ei})=>(writeFileSync(path.join(getAccountTaskRoot(Cn.accountId),ei.fileName),ei.content,`utf-8`),auxAgentApply(Cn.accountId),{success:!0}))'),
]);

export function integrateDaemon(text) {
  if (text.includes('function auxAgentView(')) throw Error('Agent integration: the daemon entry already has the agent helpers');
  return applyExactEdits('agent daemon', DAEMON_EDITS, text) + HELPERS;
}

/** The UI module, copied to dist/assets/ and imported by the chunks below. */
export const UI_FILE = 'aux-agent-ui.js';
// The module's names all start with aux/Aux, which no supplied chunk uses (checked in the tests).
const ui = names => `import{${names.join(',')}}from"./${UI_FILE}";`;

/** dist/assets chunk → edits. Imports go first so a drifted chunk fails before any JSX edit. */
export const EXTENSION_EDITS = Object.freeze({
  // Side panel header and its session controller.
  'assets/-components-4o0FSqQ9.js': [
    edit('agent UI import',
      'import{t as de}from"./session-title-B4i3BSFD.js";',
      `import{t as de}from"./session-title-B4i3BSFD.js";${ui(['AuxAgentTitle', 'AuxAgentHomeRoute', 'auxAgentStartSideChat', 'auxAgentSideChats'])}`),
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
    edit('the chat menu lists side chats',
      'r=(0,a.useMemo)(()=>u?.pages.flat()??[],[u?.pages])',
      'r=(0,a.useMemo)(()=>auxAgentSideChats(u?.pages.flat()??[]),[u?.pages])'),
    edit('empty side chat menu',
      'children:"No chats yet"',
      'children:"No side chats yet"'),
    edit('header title: the agent, or the way back to it',
      'children:[e,(0,s.jsx)(xe,{})]',
      'children:[e,(0,s.jsx)(AuxAgentTitle,{sessionId:Ce().currentSessionId,navigate:R().navigate,menu:auxLabel=>(0,s.jsx)(xe,{label:auxLabel})})]'),
    edit('"+" opens a side chat',
      '(0,s.jsx)(N,{content:"New chat",children:(0,s.jsx)(C,{className:"text-muted-foreground shrink-0",variant:"ghost",size:"icon-sm",shape:"pill","aria-label":"New session",onClick:()=>e(null),',
      '(0,s.jsx)(N,{content:"New side chat",children:(0,s.jsx)(C,{className:"text-muted-foreground shrink-0",variant:"ghost",size:"icon-sm",shape:"pill","aria-label":"New side chat",onClick:()=>(auxAgentStartSideChat(),e(null)),'),
    edit('pop out to the full view',
      '(0,s.jsx)(N,{content:"Open in new tab",',
      '(0,s.jsx)(N,{content:"Open full view",'),
    edit('pop-out label',
      '"aria-label":"Open in tab"',
      '"aria-label":"Open full view"'),
    edit('the side panel opens and claims the home thread',
      '(0,s.jsx)(ve,{currentSessionId:e,onSessionChange:n,children:t})',
      '(0,s.jsxs)(ve,{currentSessionId:e,onSessionChange:n,children:[(0,s.jsx)(AuxAgentHomeRoute,{sessionId:e,onSessionChange:n}),t]})'),
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
  if (text.includes(UI_FILE) || text.includes('aux.agent.name.v1')) throw Error(`Agent integration: ${relative} is already integrated`);
  return applyExactEdits(`agent ${relative}`, edits, text);
}
