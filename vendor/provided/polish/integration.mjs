/** Release-time polish of sealed extension chunks: the Cmd+T/K/L command bar and Settings
 * copy. Exact, count-checked edits applied by scripts/release/transforms.mjs; any drifted
 * anchor stops the release. */
import {applyExactEdits} from '../provider-cli/integration.mjs';

const edit = (name, find, replace, count = 1) => Object.freeze({name, find, replace, count});

/** A single word with a dot, colon or slash (or localhost) opens; anything else searches. */
const looksLikeUrl = "/^\\S+$/.test(text)&&/[.:/]|^localhost$/i.test(text)";

const COMMAND_BAR = [
  edit('plain words search the web instead of claiming to open them',
    "subtitle:context.mode === 'navigate' ? 'Open in current tab' : 'Open in new tab',\n      actionLabel:'Open',text,",
    `subtitle:${looksLikeUrl}?(context.mode === 'navigate' ? 'Open in current tab' : 'Open in new tab'):'Search the web',\n      actionLabel:${looksLikeUrl}?'Open':'Search',text,`),
  edit('the tab you are on is not offered as a result',
    'const logical=(organization.tabs??[]).filter(tab=>matches(`${tab.title} ${tab.url}`))',
    'const logical=(organization.tabs??[]).filter(tab=>!(Number.isInteger(tab.nativeTabId)&&tab.nativeTabId===context.activeTabId)&&matches(`${tab.title} ${tab.url}`))'),
  edit('every tab result reads Switch',
    "actionLabel:Number.isInteger(tab.nativeTabId)?'Switch':'Open here'",
    "actionLabel:'Switch'"),
  edit('a page closed several times is listed once',
    'd=r?e.recentlyClosed.filter(c=>U(c,t)):e.recentlyClosed;',
    'd=(r?e.recentlyClosed.filter(c=>U(c,t)):e.recentlyClosed).filter((c,i,all)=>all.findIndex(o=>o.url===c.url)===i);'),
  // Cmd+L fills the current address; it must arrive selected so typing replaces it, even when
  // the bubble takes focus after the fill. No spellcheck or autocorrect on addresses.
  edit('Cmd+L selects the address; no spellcheck in the field',
    'ref:T,value:e,className:"placeholder:text-muted-foreground h-full min-w-0 grow bg-transparent text-base tracking-tight outline-none",',
    'ref:T,value:e,spellCheck:false,autoCorrect:"off",autoCapitalize:"off",onFocus:n=>{if(auxNavContext?.mode==="navigate"&&n.currentTarget.value===(auxNavContext.activeUrl??""))n.currentTarget.select()},className:"placeholder:text-muted-foreground h-full min-w-0 grow bg-transparent text-base tracking-tight outline-none",'),
];

const SETTINGS = [
  edit('Link routing explains itself plainly',
    'Rules apply to new external links. Sign-in callbacks and links already navigating stay in their current profile. Higher priority wins, then the more specific path and host.',
    'Open links from other apps in the profile and Space you choose. Sign-ins stay where they started. When two rules match, the higher priority wins.'),
  edit('Tab cleanup explains itself plainly',
    'Cleanup is off by default. Pinned tabs stay available. Active work and protected tabs are kept.',
    'Archive tabs you haven’t opened for a while. Pinned tabs, playing media and unsaved work are never touched, and archived tabs stay one click away.'),
];

const APPEARANCE = [
  edit('Minimal UI says what it does',
    'Give the page more room while keeping the sidebar available.',
    'Hide the sidebar so the page fills the window. Hover the left edge to bring it back. Ctrl-Command-S.'),
];

// Each Aux command says what it does instead of one shared placeholder.
const COMMAND_DESCRIPTIONS = {
  'Toggle minimal UI': 'Hide the sidebar so the page fills the window.',
  'Toggle navigation in sidebar': 'Move the address and back/forward between the sidebar and the top.',
  'New Space': 'Create a Space for a new set of tabs.',
  'Next Space': 'Switch to the next Space.',
  'Previous Space': 'Switch to the previous Space.',
  'New folder': 'Add a folder to the tab list.',
  'Pin current tab': 'Pin this tab so it stays in every Space.',
  'Keep tab in Space': 'Keep this tab in its Space instead of pinning it everywhere.',
  'Archive current tab': 'Close this tab and keep it in Archived tabs.',
  'Unload current tab view': 'Free this tab’s memory; it stays in the list.',
  'Next pane': 'Move focus to the next pane of a split.',
  'Previous pane': 'Move focus to the previous pane of a split.',
  'Split horizontally': 'Show this tab and the next one side by side.',
  'Split vertically': 'Show this tab and the next one stacked.',
  'Remove split': 'Turn the split back into separate tabs.',
  'Quick window': 'Open a small window for a quick look.',
  'Take screenshot': 'Capture the page or a part of it.',
  'Picture in picture': 'Float the playing video above other windows.',
  'Toggle developer mode': 'Turn developer tools for extensions on or off.',
  'Edit theme': 'Open the theme editor.',
};
const SHORTCUTS = Object.entries(COMMAND_DESCRIPTIONS).map(([title, description]) => edit(`${title} has a description`,
  `"title":"${title}","key":"","description":"Assign a shortcut to this browser command."`,
  `"title":"${title}","key":"","description":"${description}"`));

const PRIVACY = [
  // The toggle that said it shared usage statistics changed nothing: analytics
  // are compiled out. It now records the real crash-report choice, the same one
  // Aux asks for once after a crash, and only shows in builds that can send them.
  edit('Help improve Aux is the real crash-report choice',
    'qs=()=>{const{accountId:t}=Ze(),r=ft(),{data:s={enabled:!0}}=j(r.settings.getAll.queryOptions({accountId:t},{select:l=>l.analytics})),a=Kt({accountId:t,syncGetAllCache:!0,onError:l=>{g.error(l instanceof Error?l.message:"Failed to update analytics settings.")}}),o=l=>{a.mutate({accountId:t,key:"analytics",value:{enabled:l}})};return(0,e.jsxs)(R,{children:[(0,e.jsx)(C,{title:"Help improve Aux",description:"Share crash reports, bug reports, and usage statistics."}),(0,e.jsx)(H,{children:(0,e.jsx)(Ae,{checked:s.enabled,disabled:a.isPending,onCheckedChange:o})})]})}',
    'qs=()=>{const t=A(),r=globalThis.chrome?.auxBrowserPreferences,k=["browserPreferences","crashReports"],{data:s}=j({queryKey:k,queryFn:()=>r.getCrashReports(),enabled:typeof r?.getCrashReports==="function"}),a=J({mutationFn:async l=>(await r.setCrashReports(l),l),onSuccess:()=>t.invalidateQueries({queryKey:k}),onError:l=>{g.error(l instanceof Error?l.message:"Couldn’t save your crash report choice.")}});if(!s?.available)return null;return(0,e.jsxs)(R,{children:[(0,e.jsx)(C,{title:"Send crash reports",description:"When Aux quits unexpectedly, send a technical report of the crash. Never your pages, passwords or files."}),(0,e.jsx)(H,{children:(0,e.jsx)(Ae,{checked:!!s.enabled,disabled:a.isPending,onCheckedChange:l=>a.mutate(l)})})]})}'),
];

const APPEARANCE_ROWS = [
  // One theme editor: Aux's own picker, which the sidebar uses too. The old
  // dialog (no gradients, grain or presets) no longer opens from Settings.
  edit('the theme row opens Aux’s own picker on the default theme',
    "function AuxThemeEditorSetting() {\n  const [open,setOpen] = A.useState(false);\n  const available = typeof globalThis.chrome?.auxBrowserPreferences?.getThemeState === 'function';\n  return (0,e.jsxs)(De,{open,onOpenChange:setOpen,children:[\n    (0,e.jsxs)(h,{children:[(0,e.jsx)(b,{title:'Theme editor',description:'Preview colors and glass, and save presets for this profile.'}),\n      (0,e.jsx)(p,{children:(0,e.jsx)(N,{variant:'outline',disabled:!available,onClick:()=>setOpen(true),children:'Customize'})})]}),\n    open&&(0,e.jsx)(AuxThemeEditorDialog,{onClose:()=>setOpen(false)})]});\n}",
    "function AuxThemeEditorSetting() {\n  const api = globalThis.chrome?.auxBrowserPreferences;\n  const available = typeof api?.openThemePicker === 'function';\n  return (0,e.jsxs)(h,{children:[(0,e.jsx)(b,{title:'Default theme',description:'The colors every Space uses unless it has its own theme. Right-click a Space to give it one.'}),\n    (0,e.jsx)(p,{children:(0,e.jsx)(N,{variant:'outline',disabled:!available,onClick:()=>api.openThemePicker().catch(error=>w.error(error instanceof Error?error.message:'Couldn\u2019t open the theme picker.')),children:'Edit theme\u2026'})})]});\n}"),
  edit('no Recent chats setting: the sidebar has no Chats list',
    '(0,e.jsx)(ta,{}),(0,e.jsx)(ja,{}),(0,e.jsx)(Ye,{})]',
    '(0,e.jsx)(ta,{}),(0,e.jsx)(ja,{})]'),
  edit('no Customize Tidy Tabs setting: AI Tidy was removed',
    '(0,e.jsx)(wa,{}),(0,e.jsx)($e,{}),(0,e.jsx)(Sa,{})',
    '(0,e.jsx)(wa,{}),(0,e.jsx)(Sa,{})'),
  edit('the sidebar setting is a Bookmarks switch, without Chats',
    "return(0,e.jsxs)(h,{children:[(0,e.jsx)(b,{title:\"Customize sidebar\",description:\"Choose which sections appear above your tabs.\"}),(0,e.jsx)(p,{children:(0,e.jsxs)(pe,{children:[(0,e.jsxs)(be,{render:(0,e.jsx)(N,{className:\"w-44 justify-between font-normal\",variant:\"outline\",disabled:r}),children:[(0,e.jsx)(\"span\",{children:i?\"Chats, Bookmarks\":\"Chats\"}),(0,e.jsx)(ke,{className:\"text-muted-foreground\",\"data-icon\":\"inline-end\"})]}),(0,e.jsxs)(he,{align:\"end\",className:\"w-44\",children:[(0,e.jsxs)(q,{children:[(0,e.jsx)(R,{render:(0,e.jsx)(\"div\",{}),children:(0,e.jsxs)(M,{checked:!0,disabled:!0,closeOnClick:!1,children:[(0,e.jsx)(fe,{className:\"text-muted-foreground\"}),(0,e.jsx)(\"span\",{className:\"grow\",children:\"Chats\"})]})}),(0,e.jsx)(D,{side:\"left\",sideOffset:8,children:\"Chats always stay in the sidebar.\"})]}),(0,e.jsxs)(M,{checked:i,closeOnClick:!1,disabled:r,onCheckedChange:l=>o.mutate(!!l),children:[(0,e.jsx)(Ce,{className:\"text-muted-foreground\"}),(0,e.jsx)(\"span\",{className:\"grow\",children:\"Bookmarks\"})]})]})]})})]})},",
    'return(0,e.jsxs)(h,{children:[(0,e.jsx)(b,{title:"Bookmarks in the sidebar",description:"Show your bookmarks above your tabs."}),(0,e.jsx)(p,{children:(0,e.jsx)(ze,{checked:i,disabled:r,onCheckedChange:l=>o.mutate(!!l)})})]})},'),
];

const DEVELOPERS = [
  // The CLI ships `aux open` today; the MCP server and exec/repl come back with
  // Aux's own CLI. Until then the page doesn't describe commands that aren't there.
  edit('no MCP section while the CLI has no mcp command',
    '(0,e.jsx)(L,{title:"Skill & MCP",children:(0,e.jsxs)(k,{children:[(0,e.jsx)(Le,{}),(0,e.jsx)(Se,{})]})})',
    '(0,e.jsx)(L,{title:"Skill",children:(0,e.jsx)(k,{children:(0,e.jsx)(Le,{})})})'),
  edit('no FAQ about exec, repl and mcp',
    ",(0,e.jsx)(L,{title:\"FAQs\",children:(0,e.jsx)(k,{children:(0,e.jsx)(je,{className:\"bg-surface-secondary\",multiple:!0,children:Ae.map(t=>(0,e.jsxs)(Ce,{value:t.id,children:[(0,e.jsx)(xe,{className:\"px-3.5\",children:t.question}),(0,e.jsx)(ge,{className:\"text-primary px-3.5 text-sm\",children:(0,e.jsx)(U,{children:t.answer})})]},t.question))})})})",
    ''),
];

const MODELS = [
  edit('no Open billing item: Aux has no billing',
    'n.id==="aux"&&(0,e.jsxs)(T,{render:(0,e.jsx)(Ce,{to:"/u/$userId/settings/billing",params:{userId:`${t}`}}),children:[(0,e.jsx)(ct,{}),(0,e.jsx)("span",{children:"Open billing"})]}),',
    ''),
];

const GENERAL_ROWS = [
  // The daemon reports the supplied build number, which isn't Aux's version.
  edit('the background service says how it is, not a borrowed version number',
    '?`${i}. Restart Aux to finish updating the background service.`:`${i}. Running normally.`',
    '?"Restart Aux to finish updating the background service.":"Running normally."'),
  edit('Run setup again, beside Import',
    '(0,A.jsx)(Pi,{title:"Import",children:(0,A.jsxs)(un,{children:[(0,A.jsx)(Am,{}),(0,A.jsx)(wm,{})]})})',
    '(0,A.jsx)(Pi,{title:"Import",children:(0,A.jsxs)(un,{children:[(0,A.jsx)(Am,{}),(0,A.jsx)(wm,{}),(0,A.jsxs)(Ac,{className:"cursor-pointer gap-1",render:({className:_,...y})=>(0,A.jsx)("button",{...y,type:"button",className:Ui("w-full cursor-pointer gap-1 text-left",_),onClick:()=>chrome.tabs.create({url:chrome.runtime.getURL("main.html#/onboarding/import-browser")})}),children:[(0,A.jsx)(qt,{title:"Run setup again",description:"Import from another browser, connect your password manager and models, and choose the finishing touches."}),(0,A.jsx)(Pl,{className:"text-muted-foreground size-4 shrink-0"})]})]})})'),
];


const LASSO = [
  edit('Lasso says how it works',
    'description:"Drag text click the blue dot."',
    'description:"Select text, then click the blue dot."'),
];

// The Settings shell: its menu, search index and feedback dialog.
const SETTINGS_SHELL = [
  // Feedback went to a hosted route that doesn't exist. It now opens a mail
  // to Aux with the message filled in, sent from the person's own mail app.
  edit('feedback opens a ready-to-send mail',
    "ee=async e=>{const s=new FormData,i=await J2();if(e.user.email&&s.append(\"email\",e.user.email),e.user.id&&s.append(\"userId\",e.user.id),e.user.name&&s.append(\"name\",e.user.name),i&&s.append(\"platform\",i),e.message&&s.append(\"message\",e.message),e.files)for(const o of e.files)s.append(\"images\",o);const a=await m1(Q1(\"/voc/feedback\"),{method:\"POST\",body:s});if(!a.ok){const o=await a.json().catch(()=>null);throw new Error(o?.error??\"Failed to send feedback.\")}}",
    "ee=async e=>{const i=await J2(),b=(e.message??\"\")+(i?`\\n\\n${i}`:\"\"),u=`mailto:hello@getaux.co?subject=${encodeURIComponent(\"Aux feedback\")}&body=${encodeURIComponent(b)}`;if(globalThis.chrome?.tabs?.create)await chrome.tabs.create({url:u});else window.open(u,\"_blank\")}"),
  edit('feedback says where it went',
    'w.success("Feedback sent. Thank you!")',
    'w.success("Your mail app has your feedback, ready to send. Thank you!")'),
  edit('search has no Sync rows (sync isn’t available)',
    'sections:["Sync","Profile","Danger zone","Devices"],fields:[{title:"Delete account",description:"Permanently delete your account and all associated data"},{title:"Browser data recovery"},',
    'sections:["Profile","Danger zone","Devices"],fields:[{title:"Delete account",description:"Permanently delete your account and all associated data"},'),
  edit('Context Awareness isn’t in the menu until it works',
    ',{label:"Context Awareness",icon:C2,activeIcon:u2,href:"/u/$userId/settings/memories/context-awareness",eapOnly:!0,badge:"New",promoteWhenCollapsed:!0}',
    ''),
  edit('search has no Ask Aux on tab switch (the panel keeps its conversation)',
    ',{title:"Ask Aux on tab switch",description:"When you switch tabs, start a new chat or keep the current chat."}',
    ''),
  edit('search has no Chats or Tidy rows, and finds the sidebar and frame rows',
    '{title:"Customize sidebar",description:"Choose which sections appear above your tabs."},{title:"Tab switcher order",description:"Choose how tabs are ordered when switching."},{title:"Advanced"},{title:"Recent chats in sidebar",description:"How many recent chats to show in the sidebar."},{title:"Customize Tidy Tabs"},',
    '{title:"Bookmarks in the sidebar",description:"Show your bookmarks above your tabs."},{title:"Tab switcher order",description:"Choose how tabs are ordered when switching."},{title:"Advanced"},{title:"Default theme",searchTerms:["theme","color","colour","edit theme"]},{title:"Always show full URL"},{title:"Navigation in sidebar"},{title:"Minimal browser UI"},{title:"Open links in Peek"},'),
  edit('search finds Send crash reports',
    '{title:"Help improve Aux",description:"Share crash reports, bug reports, and usage statistics."}',
    '{title:"Send crash reports",description:"When Aux quits unexpectedly, send a technical report of the crash."}'),
  edit('search has no Statistics page',
    ',{path:"/u/$userId/settings/statistics",title:"Statistics",sections:["Overview","Activity heatmap"],fields:[]}',
    ''),
  edit('search finds Link routing, Tab cleanup and the developer rows',
    '{title:"Import bookmarks"},{title:"Import from another browser"},{title:"Preferred languages"}]}',
    '{title:"Import bookmarks"},{title:"Import from another browser"},{title:"Preferred languages"},{title:"Link routing"},{title:"Tab cleanup",searchTerms:["archive","inactive tabs"]},{title:"Developer mode"},{title:"Extensions"},{title:"Run setup again",searchTerms:["onboarding","setup","welcome"]}]}'),
  edit('search shows Lasso’s real description',
    '{title:"Enable on text selection",description:"Drag text click the blue dot."}',
    '{title:"Enable on text selection",description:"Select text, then click the blue dot."}'),
];

const ACCOUNT = [
  // Sync and Browser data recovery need a service Aux doesn't run; the native
  // sync status reports unavailable. The rows come back when sync does.
  edit('no Sync section while sync is unavailable',
    '(0,e.jsx)(js,{accountId:s,ownerId:C.userId,needsSignIn:o.isError,status:h.data,statusError:h.isError,onRecover:x}),',
    ''),
];

// Onboarding for every new profile, local or signed in (docs/plans/2026-10-29-browser-excellence.md,
// Batch 6): Import → Password manager → Models → Done. The cloud sign-in splash and the
// marketing page are skipped; the password-manager step (bring your own) is back.
const ONBOARDING_IMPORT = [
  edit('Import skips to the password manager step',
    'to:"/onboarding/glance",replace:!0,onClick:()=>{l("onboarding.import-browser.skip")}',
    'to:"/onboarding/import-password",replace:!0,onClick:()=>{l("onboarding.import-browser.skip")}'),
];
const ONBOARDING_PROGRESS = [
  edit('a finished import goes on to the password manager step',
    'o({to:"/onboarding/glance",replace:!0})',
    'o({to:"/onboarding/import-password",replace:!0})'),
];
const ONBOARDING_PASSWORD = [
  edit('the password manager step goes back to Import',
    'render:(0,e.jsx)(X,{to:"/onboarding/glance",replace:!0}),children:[(0,e.jsx)(se,{"data-icon":"inline-start"}),(0,e.jsx)("span",{children:"Back"})]',
    'render:(0,e.jsx)(X,{to:"/onboarding/import-browser",replace:!0}),children:[(0,e.jsx)(se,{"data-icon":"inline-start"}),(0,e.jsx)("span",{children:"Back"})]'),
  edit('password managers live in Extensions',
    'You can set one up later in Settings > Password.',
    'You can add one later from Extensions.'),
];
const ONBOARDING_MODELS = [
  edit('Models goes back to the password manager step',
    'render:(0,e.jsx)(ne,{to:"/onboarding/glance",replace:!0}),children:[(0,e.jsx)(de,{"data-icon":"inline-start"}),(0,e.jsx)("span",{children:"Back"})]',
    'render:(0,e.jsx)(ne,{to:"/onboarding/import-password",replace:!0}),children:[(0,e.jsx)(de,{"data-icon":"inline-start"}),(0,e.jsx)("span",{children:"Back"})]'),
];
const ONBOARDING_STEPS = [
  edit('the step dots follow Import, Password manager and Models',
    'f=["/onboarding/import-browser","/onboarding/glance","/onboarding/ai"]',
    'f=["/onboarding/import-browser","/onboarding/import-password","/onboarding/ai"]'),
];
const ONBOARDING_DONE = [
  // Default browser yes; the Dock and crash reports are the person's call.
  edit('finishing touches ask, they don’t presume',
    'defaultValues:{defaultBrowser:!0,addToDock:!0,keepTasksRunning:!0,helpImproveAux:!0}',
    'defaultValues:{defaultBrowser:!0,addToDock:!1,keepTasksRunning:!0,helpImproveAux:!1}'),
  edit('the help toggle is the real crash-report choice',
    'm.mutateAsync({accountId:d,key:"analytics",value:{enabled:l.helpImproveAux}})',
    'globalThis.chrome?.auxBrowserPreferences?.setCrashReports?.(l.helpImproveAux).catch(()=>{})'),
  edit('the help toggle says what it sends',
    'id:"helpImproveAux",label:"Help improve Aux",description:"Share crash reports, bug reports, and usage statistics"',
    'id:"helpImproveAux",label:"Send crash reports",description:"When Aux quits unexpectedly, send a technical report. Never your pages, passwords or files."'),
  // Finishing is stored on this device; only a signed-in account also tells the service.
  edit('local profiles finish without the cloud',
    'await S.mutateAsync({accountId:d}),',
    'await(async()=>{try{localStorage.setItem("aux.onboarding.completed.v1","1")}catch{}if((await r.fetchQuery(n.accounts.get.queryOptions({accountId:d})))?.mode==="cloud")await S.mutateAsync({accountId:d})})(),'),
];
const ONBOARDING_ROUTES = [
  edit('the password manager step is back (bring your own, through its extension)',
    'wr=n("/_public/onboarding/import-password/")({beforeLoad:()=>{throw c({to:"/onboarding/ai",replace:!0})},component:a(Pr,"component")})',
    'wr=n("/_public/onboarding/import-password/")({component:a(Pr,"component")})'),
];
const BACKGROUND = [
  // A new profile starts with setup; updates and restarts don't.
  edit('a new profile opens onboarding',
    'onInstalled.addListener(() => Vt(!0))',
    'onInstalled.addListener((details) => { Vt(!0); if (details?.reason === "install") chrome.tabs.create({ url: chrome.runtime.getURL("main.html#/onboarding/import-browser") }); })'),
  // The agent panel listens for this and goes back to the home thread.
  edit('the agent button returns the panel to the home thread',
    'chrome.action.onClicked.addListener(async (e) => {\n  e.windowId && await chrome.sidePanel.open({ windowId: e.windowId });\n});',
    'chrome.action.onClicked.addListener(async (e) => {\n  e.windowId && await chrome.sidePanel.open({ windowId: e.windowId });\n  e.windowId && chrome.runtime.sendMessage({ type: "aux-agent-home", windowId: e.windowId }).catch(() => {});\n});'),
];

// Dictation posts to a hosted speech route that doesn't exist, so it always
// failed. The mic is hidden until on-device dictation replaces it.
const COMPOSER = [
  edit('no Dictate button while dictation has no working backend',
    'children:[n&&(0,a.jsxs)(Ae,{children:[(0,a.jsx)(Ie,{children:"Dictate"})',
    'children:[!1&&(0,a.jsxs)(Ae,{children:[(0,a.jsx)(Ie,{children:"Dictate"})'),
];
const CONVERSATION = [
  edit('no Voice input button while dictation has no working backend',
    "(0,t.jsx)(A,{type:\"button\",variant:\"ghost\",size:\"icon\",disabled:y,onClick:()=>{if(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||navigator.platform===\"MacIntel\"&&navigator.maxTouchPoints>1){R.current?.focus(),B.info(\"Use the microphone on your device keyboard for voice input.\");return}g.start()},\"aria-label\":\"Voice input\",className:\"rounded-full\",children:(0,t.jsx)(Mt,{className:\"size-5\"})}),",
    ''),
];

/** Edits per extension chunk, relative to dist/. */
// The command bar's Ask goes to the agent panel's home thread (aux-agent-ui.js picks it
// up from session storage) instead of opening a composer in a new tab.
const PALETTE_ASK = [
  edit("Ask is a send to your agent",
    "  return [...sections,{id:'aux-ask-query',title:'Ask',items:[{\n    id:'aux-ask-query',kind:'aux-ask-query',title:'Open Ask composer',\n    subtitle:query,text:query,actionLabel:'Review'}]}];\n",
    "  return [...sections,{id:'aux-ask-query',title:'Ask',items:[{\n    id:'aux-ask-query',kind:'aux-ask-query',title:'Ask your agent',\n    subtitle:query,text:query,actionLabel:'Send'}]}];\n"),
  edit("Ask hands the question to the agent panel",
    "  const result=await api.commitCommand({kind:'ask',generation:context.generation,text:item.text});\n  if(!result?.success)throw Error(result?.error??'Could not open the Ask composer.');\n",
    "  const result=await api.commitCommand({kind:'ask',generation:context.generation,text:item.text});\n  if(!result?.success||!Number.isInteger(result.windowId))throw Error(result?.error??'Could not open your agent.');\n  // The agent panel in that window takes the question from here (aux-agent-ui.js).\n  await chrome.storage.session.set({'aux.agent.pendingAsk.v1':{windowId:result.windowId,text:item.text,at:Date.now()}});\n"),
];

// Tab cleanup counts hours, so Arc's 12 and 24 hours sit beside 7 and 30 days.
const CLEANUP_HOURS = [
  edit("cleanup state is in hours",
    "      if(typeof next.ownerGeneration!=='string'||!next.ownerGeneration||typeof next.revision!=='string'||!next.revision||\n        typeof next.cleanup?.enabled!=='boolean'||!Number.isInteger(next.cleanup?.inactivityDays)||\n        next.cleanup.inactivityDays<1||next.cleanup.inactivityDays>3650||!validSpaces(next.spaces)||\n",
    "      if(typeof next.ownerGeneration!=='string'||!next.ownerGeneration||typeof next.revision!=='string'||!next.revision||\n        typeof next.cleanup?.enabled!=='boolean'||!Number.isInteger(next.cleanup?.inactivityHours)||\n        next.cleanup.inactivityHours<1||next.cleanup.inactivityHours>87600||!validSpaces(next.spaces)||\n"),
  edit("a cleanup save sends hours",
    "        if(cleanup){\n          if(Object.keys(patch).some(key=>!['enabled','inactivityDays','spaceIds'].includes(key))||\n            typeof patch.enabled!=='boolean'||!Number.isInteger(patch.inactivityDays)||\n            patch.inactivityDays<1||patch.inactivityDays>3650)throw Error('Choose a whole number of days from 1 to 3650.');\n",
    "        if(cleanup){\n          if(Object.keys(patch).some(key=>!['enabled','inactivityHours','spaceIds'].includes(key))||\n            typeof patch.enabled!=='boolean'||!Number.isInteger(patch.inactivityHours)||\n            patch.inactivityHours<1||patch.inactivityHours>87600)throw Error('Choose how long a tab may sit unused.');\n"),
  edit("the dialog starts at 30 days",
    "  const el=at.createElement,[state,setState]=at.useState(null),[enabled,setEnabled]=at.useState(false),\n    [days,setDays]=at.useState('30'),[spaceIds,setSpaceIds]=at.useState(null),[busy,setBusy]=at.useState(false),[error,setError]=at.useState(''),[saved,setSaved]=at.useState(false);\n",
    "  const el=at.createElement,[state,setState]=at.useState(null),[enabled,setEnabled]=at.useState(false),\n    [hours,setHours]=at.useState(720),[spaceIds,setSpaceIds]=at.useState(null),[busy,setBusy]=at.useState(false),[error,setError]=at.useState(''),[saved,setSaved]=at.useState(false);\n"),
  edit("the dialog reads saved hours",
    "    const client=createAuxFeatureSettingsSession(chrome.auxBrowserPreferences,'cleanup',value=>{\n      setState(value);if(!initialized.current){initialized.current=true;setEnabled(value.cleanup.enabled);setDays(String(value.cleanup.inactivityDays));setSpaceIds(value.cleanup.spaceIds??null);}\n",
    "    const client=createAuxFeatureSettingsSession(chrome.auxBrowserPreferences,'cleanup',value=>{\n      setState(value);if(!initialized.current){initialized.current=true;setEnabled(value.cleanup.enabled);setHours(value.cleanup.inactivityHours);setSpaceIds(value.cleanup.spaceIds??null);}\n"),
  edit("no free-form days check",
    "  },[]);\n  const number=Number(days),validDays=/^\\d+$/.test(days)&&Number.isInteger(number)&&number>=1&&number<=3650;\n",
    "  },[]);\n  // Arc's choices; a value saved before them stays selectable.\n  const choices=[[12,'12 hours'],[24,'24 hours'],[168,'7 days'],[720,'30 days']];\n  if(!choices.some(([value])=>value===hours))choices.push([hours,hours%24?`${hours} hours`:`${hours/24} days`]);\n"),
  edit("dirty compares hours",
    "  const canonicalScope=ids=>ids===null?'all':JSON.stringify([...ids].sort());\n  const dirty=state&&(enabled!==state.cleanup.enabled||number!==state.cleanup.inactivityDays||\n",
    "  const canonicalScope=ids=>ids===null?'all':JSON.stringify([...ids].sort());\n  const dirty=state&&(enabled!==state.cleanup.enabled||hours!==state.cleanup.inactivityHours||\n"),
  edit("save sends hours",
    "    setBusy(true);setError('');setSaved(false);\n    try{await session.current.save({enabled,inactivityDays:number,spaceIds});if(alive.current)setSaved(true)}catch{}\n",
    "    setBusy(true);setError('');setSaved(false);\n    try{await session.current.save({enabled,inactivityHours:hours,spaceIds});if(alive.current)setSaved(true)}catch{}\n"),
  edit("choices replace the days field",
    "            onCheckedChange:value=>{setEnabled(value);setSaved(false)}}))),\n          el('label',{className:'grid gap-1 text-sm'},'Days without activity',\n            el('input',{type:'number',min:1,max:3650,step:1,value:days,disabled:busy,\n",
    "            onCheckedChange:value=>{setEnabled(value);setSaved(false)}}))),\n          el('label',{className:'grid gap-1 text-sm'},'Archive tabs unused for',\n            el('select',{value:hours,disabled:busy||!enabled,\n"),
  edit("the field keeps its look",
    "              className:'bg-surface-primary border-border rounded-lg border px-3 py-2',\n              onChange:event=>{setDays(event.target.value);setSaved(false)}})),\n          !validDays&&el('p',{role:'alert',className:'text-sm text-red-500'},'Enter a whole number from 1 to 3650.'),\n",
    "              className:'bg-surface-primary border-border rounded-lg border px-3 py-2',\n              onChange:event=>{setHours(Number(event.target.value));setSaved(false)}},\n              choices.map(([value,label])=>el('option',{key:value,value},label)))),\n"),
  edit("Save no longer waits on a days check",
    "      el(po,null,el(yt,{variant:'secondary',disabled:busy,onClick:onClose},'Close'),\n        el(yt,{disabled:busy||!dirty||!validDays||!validScope,onClick:save},busy?'Saving\u2026':'Save'))));\n",
    "      el(po,null,el(yt,{variant:'secondary',disabled:busy,onClick:onClose},'Close'),\n        el(yt,{disabled:busy||!dirty||!validScope,onClick:save},busy?'Saving\u2026':'Save'))));\n"),
];

export const EDITS = Object.freeze({
  'assets/tabsearch-3k_2hgil.js': Object.freeze([...COMMAND_BAR, ...PALETTE_ASK]),
  'assets/general-3dgRbrRk.js': Object.freeze([...SETTINGS, ...GENERAL_ROWS, ...CLEANUP_HOURS]),
  'assets/appearance-Ceuw3-j6.js': Object.freeze([...APPEARANCE, ...APPEARANCE_ROWS]),
  'assets/privacy-BeEEt9Qu.js': Object.freeze(PRIVACY),
  'assets/developers-DTvaoVBC.js': Object.freeze(DEVELOPERS),
  'assets/model-BrFuJM2w.js': Object.freeze(MODELS),
  'assets/lasso-LoarCzmz.js': Object.freeze(LASSO),
  'assets/route-TQyeTEXE.js': Object.freeze(SETTINGS_SHELL),
  'assets/account-Dr_CA8LL.js': Object.freeze(ACCOUNT),
  'assets/import-browser-DwQpkFpc.js': Object.freeze(ONBOARDING_IMPORT),
  'assets/progress-CS-jrVXz.js': Object.freeze(ONBOARDING_PROGRESS),
  'assets/import-password-mvM-KsU6.js': Object.freeze(ONBOARDING_PASSWORD),
  'assets/ai-CzEX5E7S.js': Object.freeze(ONBOARDING_MODELS),
  'assets/route-CSKkWqf5.js': Object.freeze(ONBOARDING_STEPS),
  'assets/done-DPzI9pFd.js': Object.freeze(ONBOARDING_DONE),
  'assets/extension-main-Dz1-AsCT.js': Object.freeze(ONBOARDING_ROUTES),
  'background.js': Object.freeze(BACKGROUND),
  'assets/session-composer-Dc0LRfZA.js': Object.freeze(COMPOSER),
  'assets/conversation-D9Q3VEsl.js': Object.freeze(CONVERSATION),
  'assets/use-shortcut-capture-DGr8Ws5Z.js': Object.freeze(SHORTCUTS),
});

export function integratePolish(chunk, text) {
  const edits = EDITS[chunk];
  if (!edits) throw Error(`Polish: no edits for ${chunk}`);
  return applyExactEdits(`polish ${chunk}`, edits, text);
}
