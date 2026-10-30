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
  'Toggle minimal UI': 'Turn Minimal UI on or off: the sidebar stays hidden until you hover the left edge.',
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
// Two pairs of commands split the same way. Settings lists the pair with Command defaults;
// the other pair takes the same names so errors and the command bar agree.
const COMMAND_TITLES = {'Split horizontally': 'Split side by side', 'Split vertically': 'Split stacked'};
const SHORTCUTS = [...Object.entries(COMMAND_DESCRIPTIONS).map(([title, description]) => edit(`${title} has a description`,
  `"title":"${title}","key":"","description":"Assign a shortcut to this browser command."`,
  `"title":"${COMMAND_TITLES[title] ?? title}","key":"","description":"${description}"`)),
  edit('one name for splitting side by side',
    'title:"Split tabs (side by side)",description:"View two tabs side by side."',
    'title:"Split side by side",description:"Show this tab and the next one side by side."'),
  edit('one name for splitting stacked',
    'title:"Split tabs (stacked)",description:"View two tabs one above the other."',
    'title:"Split stacked",description:"Show this tab and the next one stacked."'),
  edit('Toggle sidebar reads differently from Minimal UI',
    'title:"Toggle Sidebar",description:"Show or hide the sidebar."',
    'title:"Toggle sidebar",description:"Show or hide the sidebar in this window."'),
];

// Shortcuts get their own Settings page (Batch 7). The Appearance chunk keeps the shortcut
// table and exports it as a second page; the router and Settings menu gain the route.
const SHORTCUTS_PAGE = [
  edit('Appearance no longer holds the shortcut table',
    'children:(0,e.jsxs)("div",{className:"space-y-8",children:[(0,e.jsx)(z,{}),(0,e.jsx)(re,{})]})',
    'children:(0,e.jsx)("div",{className:"space-y-8",children:(0,e.jsx)(z,{})})'),
  edit('the Shortcuts page',
    'export{we as component};',
    'function auxShortcutsPage(){return(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)(J,{segments:["Settings","Shortcuts"]}),(0,e.jsx)(V,{children:(0,e.jsx)("h1",{children:"Shortcuts"})}),(0,e.jsx)(P.Suspense,{fallback:(0,e.jsx)(L,{}),children:(0,e.jsx)("div",{className:"space-y-8",children:(0,e.jsx)(re,{})})})]})}export{we as component,auxShortcutsPage as shortcuts};'),
  // The duplicate split commands (no default keys) stay bound but aren't listed twice.
  edit('each split command is listed once',
    'children:t.data.map(N)', 'children:t.data.filter(s=>s.commandId!==34132&&s.commandId!==34133).map(N)'),
  // The browser reports conflicts by command number; name the command or macOS instead.
  edit('shortcut errors name what owns the keys',
    'onError:s=>D.error("Couldn’t update shortcut",{description:s.message})',
    'onError:s=>D.error("Couldn’t update shortcut",{description:(m=>{const name=id=>{const c=Object.values(I).find(x=>String(x.commandId)===id);return c?`“${c.title}”`:"Another command"},pair=/^Shortcut conflict between commands (\\d+) and (\\d+)$/.exec(m);if(pair)return`${name(pair[1])} already uses these keys. Change it first, or choose other keys.`;const owner=/^Command (\\d+) conflicts with (a macOS|a browser menu) shortcut$/.exec(m);return owner?`${owner[2]==="a macOS"?"macOS":"A menu item"} already uses these keys. Choose other keys.`:m})(s.message)})'),
];
const SHORTCUTS_ROUTE = [
  edit('the Shortcuts route',
    'To=n("/_web/(settings)/u/$userId/settings/appearance/")({component:a(So,"component")}),',
    'To=n("/_web/(settings)/u/$userId/settings/appearance/")({component:a(So,"component")}),auxShortcutsRoute=n("/_web/(settings)/u/$userId/settings/shortcuts/")({component:a(So,"shortcuts")}),'),
  edit('the Shortcuts route sits under Settings',
    'ya=To.update({id:"/appearance/",path:"/appearance/",getParentRoute:()=>m}),',
    'ya=To.update({id:"/appearance/",path:"/appearance/",getParentRoute:()=>m}),auxShortcutsIndex=auxShortcutsRoute.update({id:"/shortcuts/",path:"/shortcuts/",getParentRoute:()=>m}),'),
  edit('the Shortcuts route is in the tree',
    'WebsettingsUUserIdSettingsAppearanceIndexRoute:ya,',
    'WebsettingsUUserIdSettingsAppearanceIndexRoute:ya,AuxSettingsShortcutsIndexRoute:auxShortcutsIndex,'),
];

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
    '(0,A.jsx)(Pi,{title:"Import",children:(0,A.jsxs)(un,{children:[(0,A.jsx)(Am,{}),(0,A.jsx)(wm,{}),(0,A.jsxs)(Ac,{className:"cursor-pointer gap-1",render:({className:_,...y})=>(0,A.jsx)("button",{...y,type:"button",className:Ui("w-full cursor-pointer gap-1 text-left",_),onClick:()=>chrome.tabs.create({url:chrome.runtime.getURL("main.html#/onboarding/glance")})}),children:[(0,A.jsx)(qt,{title:"Run setup again",description:"Import from another browser, connect your password manager and models, and choose the finishing touches."}),(0,A.jsx)(Pl,{className:"text-muted-foreground size-4 shrink-0"})]})]})})'),
  // Settings › Import: a job that skipped site sign-ins (cookies Aux couldn't read) says so.
  edit('a partial import says what it skipped',
    'i==="succeeded"?(0,A.jsx)("span",{children:"Import complete."})',
    'i==="succeeded"?n?.skippedDataKinds?.length?(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)("span",{className:"block",children:"Imported everything except site sign-ins."}),n.skippedMessage&&(0,A.jsx)("span",{className:"block",children:n.skippedMessage})]}):(0,A.jsx)("span",{children:"Import complete."})'),
];


const LASSO = [
  edit('Lasso says how it works',
    'description:"Drag text click the blue dot."',
    'description:"Select text, then click the blue dot."'),
];

// The Settings shell: its menu, search index and feedback dialog.
const SETTINGS_SHELL = [
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
  // Shortcuts have their own page (see SHORTCUTS_PAGE).
  edit('Settings menu has Shortcuts after Appearance',
    '{label:"Appearance",icon:B,activeIcon:B,href:"/u/$userId/settings/appearance"},',
    '{label:"Appearance",icon:B,activeIcon:B,href:"/u/$userId/settings/appearance"},{label:"Shortcuts",icon:F1,activeIcon:O1,href:"/u/$userId/settings/shortcuts"},'),
  edit('search finds shortcuts on their own page',
    '{title:"Transparency"},{title:"Extension shortcuts",description:"Manage shortcuts for Aux extensions"}]},',
    '{title:"Transparency"}]},{path:"/u/$userId/settings/shortcuts",title:"Shortcuts",sections:["Keyboard shortcuts"],fields:[{title:"Keyboard shortcuts",searchTerms:["shortcut","hotkey","keys","keyboard"]},{title:"Browser shortcut profiles",description:"Import, export or reset in-app shortcuts."},{title:"Extension shortcuts",description:"Manage shortcuts for Aux extensions"}]},'),
  edit('Appearance search has no shortcuts section',
    'title:"Appearance",sections:["Appearance","Tabs","Keyboard shortcuts"]',
    'title:"Appearance",sections:["Appearance","Tabs"]'),
  // Ads privacy is Chrome's Privacy Sandbox, which Aux turns off.
  edit('search has no Ads privacy row, and says ad blocker',
    'sections:["Browsing history","Privacy","Adblock"],fields:[{title:"Ads privacy",description:"Manage ad topics, site-suggested ads, and ad measurement"},',
    'sections:["Browsing history","Privacy","Ad blocker"],fields:['),
];

// Settings › Agent: the runtime ships inside Aux (its release URL is a placeholder, so update
// checks always failed), and tab cleanup isn't a Computer Use setting.
const AGENT_SETTINGS = [
  edit('the runtime says it ships with Aux',
    '(0,e.jsx)("p",{children:"The agent runtime is a package of tools Aux downloads to your computer, including Node.js, Python, and fast file search."}),(0,e.jsx)("p",{children:"Agents use it to run terminal commands and built-in skills locally, so tasks like editing documents and running scripts work without depending on what you already have installed."})',
    '(0,e.jsx)("p",{children:"The agent runtime ships with Aux: Node.js, Python, fast file search and other tools."}),(0,e.jsx)("p",{children:"Agents use it to run terminal commands and built-in skills on your Mac, so documents and scripts work whatever you have installed."})'),
  edit('no update line for the runtime',
    'Ze=(s,t,a)=>{const r=`Current version is ${s}.`;return t?a?`${r} A newer version is available.`:`${r} Agent runtime is up to date.`:`${r} Could not check for updates.`}',
    'Ze=s=>`Version ${s}, bundled with Aux.`'),
  edit('Clean up agent tabs has its own section',
    '(0,e.jsx)(k,{title:"Computer Use",children:(0,e.jsxs)(A,{children:[(0,e.jsx)(ss,{}),(0,e.jsx)(rs,{})]})})',
    '(0,e.jsx)(k,{title:"Agent tabs",children:(0,e.jsx)(A,{children:(0,e.jsx)(ss,{})})}),(0,e.jsx)(k,{title:"Computer Use",children:(0,e.jsx)(A,{children:(0,e.jsx)(rs,{})})})'),
  edit('Select… placeholder',
    'placeholder:"Select.."', 'placeholder:"Select…"', 2),
  // Install/Reinstall downloads from a placeholder URL and can't work; the version line stays.
  edit('no Install or Reinstall row for the runtime',
    ',(0,e.jsxs)(g,{children:[(0,e.jsx)(v,{title:i?"Reinstall agent runtime":"Install agent runtime",description:i?"Download and replace the installed agent runtime.":void 0}),(0,e.jsxs)(y,{children:[a.isError&&(0,e.jsxs)(j,{disabled:a.isFetching,onClick:w,variant:"secondary",children:[a.isFetching&&(0,e.jsx)(V,{}),"Retry"]}),(0,e.jsxs)(j,{className:"click-depth-effect",disabled:a.isPending||n.isPending||h,onClick:c,children:[n.isPending||h?(0,e.jsx)(V,{}):(0,e.jsx)(ke,{className:"size-4"}),(0,e.jsxs)("span",{children:[i?"Reinstall":"Install",u!==null?` (${u}%)`:""]})]})]})]})',
    ''),
];

// Command bar: one name for each split, and Settings pages and Import as commands.
// (New window, Find, Print, Zoom and the rest need native command entries.)
const COMMAND_BAR_COMMANDS = [
  edit('split commands read Split side by side and Split stacked',
    "const commands = (context.commands ?? []).filter(command => command.enabled &&",
    "const commands = (context.commands ?? []).map(command=>({...command,title:({34132:'Split side by side',34133:'Split stacked'})[command.commandId]??command.title})).filter(command => command.enabled &&"),
  edit('Settings pages are commands',
    'function developerSections(context,query,sections){',
    "function auxSettingsSections(context,query,sections){\n if(context?.mode!=='commands')return sections;\n const text=query.trim().toLowerCase();\n const pages=[['General','general','updates language link routing tab cleanup'],['Appearance','appearance','theme tabs sidebar'],['Shortcuts','shortcuts','keyboard keys hotkeys'],['Security & Privacy','privacy','ad blocker history site settings'],['Agent','agents','permissions sandbox runtime'],['Models','model','providers api keys local agents']];\n const items=[...pages.map(([title,path,terms])=>({id:`aux-settings:${path}`,kind:'aux-settings',title:`Settings: ${title}`,subtitle:'Opens in a new tab',terms,url:`main.html#/settings/${path}`,actionLabel:'Open'})),\n  {id:'aux-settings:import',kind:'aux-settings',title:'Import from another browser',subtitle:'Bookmarks and history',terms:'arc chrome safari',url:'main.html#/onboarding/import-browser',actionLabel:'Open'}]\n  .filter(item=>!text||`${item.title} ${item.subtitle} ${item.terms}`.toLowerCase().includes(text));\n return items.length?[...sections,{id:'aux-settings',title:'Settings',items}]:sections;\n}\nfunction developerSections(context,query,sections){"),
  edit('the Settings commands are listed',
    'developerSections(auxNavContext,r,mediaSections(auxNavContext,r,navigationSections(auxNavContext,r,Pe($,r))))),[r,$',
    'auxSettingsSections(auxNavContext,r,developerSections(auxNavContext,r,mediaSections(auxNavContext,r,navigationSections(auxNavContext,r,Pe($,r)))))),[r,$'),
  edit('a Settings command opens its page',
    'if(n.kind==="aux-pip"){',
    'if(n.kind==="aux-settings"){await chrome.tabs.create({url:chrome.runtime.getURL(n.url)});auxNavSuccess=true;return}if(n.kind==="aux-pip"){'),
];

// Security & Privacy: no Ads privacy row (Privacy Sandbox is off), one spelling of ad
// blocker, and an ellipsis while loading.
const PRIVACY_ROWS = [
  edit('no Ads privacy row',
    '(0,e.jsxs)(O,{render:(0,e.jsx)(P,{className:"group",to:"chrome://settings/adPrivacy"}),children:[(0,e.jsx)(C,{title:"Ads privacy",description:"Manage ad topics, site-suggested ads, and ad measurement"}),(0,e.jsx)(E,{className:"text-muted-foreground mx-1 size-4"})]}),',
    ''),
  edit('the section is Ad blocker',
    '(0,e.jsx)(Z,{title:"Adblock",', '(0,e.jsx)(Z,{title:"Ad blocker",'),
  edit('update errors say ad blocker',
    '"Couldn’t update Adblock"', '"Couldn’t update the ad blocker"', 2),
  edit('turning it off says ad blocker',
    'title:"Disable Adblock?"', 'title:"Turn off the ad blocker?"'),
  edit('an unavailable ad blocker says so plainly',
    '"Please update your browser to enable Adblocker."', '"The ad blocker needs a newer version of Aux."'),
  edit('Loading… placeholder',
    'placeholder:s?"Loading..":"-"', 'placeholder:s?"Loading…":"-"'),
  // Sites paused from the command bar (native auxAdblock.pauseSite), each with Resume.
  edit('paused sites are listed under the filters',
    'i?.enabled&&(0,e.jsx)(js,{api:t,canUpdate:!!o.data?.length,description:o.isPending||l.isPending?"Loading…":vs(u),disabled:!y||x})]})},js=',
    'i?.enabled&&(0,e.jsx)(js,{api:t,canUpdate:!!o.data?.length,description:o.isPending||l.isPending?"Loading…":vs(u),disabled:!y||x}),i?.enabled&&(0,e.jsx)(auxPausedSites,{api:t})]})},auxPausedSites=({api:t})=>{const r=j(N({queryKey:[...V,"pausedSites"],queryFn:()=>t.getPausedSites(),enabled:typeof t.getPausedSites==="function",retry:!1})),s=S(o=>t.resumeSite(o)),a=r.data??[];return a.length?(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)(R,{className:"gap-1",children:(0,e.jsx)(C,{title:"Paused sites",description:"Ads and trackers aren’t blocked on these sites. Pause one from the command bar while you’re on it."})}),a.map(o=>(0,e.jsxs)(R,{className:"gap-1",children:[(0,e.jsx)(C,{title:o}),(0,e.jsx)(H,{children:(0,e.jsx)(F,{variant:"outline",disabled:s.isPending,onClick:()=>s.mutate(o),children:"Resume"})})]},o))]}):null},js='),
];

const TASKS = [
  edit('Loading… while more tasks load',
    'children:t?"Loading...":"Load more"', 'children:t?"Loading…":"Load more"'),
];

const IMPORT_BROWSER = [
  edit('Others has no trailing space',
    'children:["Others ",(0,e.jsxs)("span",{className:"text-muted-foreground",children:["+",i.length]})]',
    'children:["Others",(0,e.jsxs)("span",{className:"text-muted-foreground ml-1",children:["+",i.length]})]'),
];

// Aux has no plans or credits. Billing prompts go; limits read as limits.
const BILLING_MODEL_SELECT = [
  edit('nothing exports the removed Ultrabrowse switch and label',
    'export{kr as a,ke as c,we as d,Mr as i,ne as l,br as n,Se as o,wr as r,je as s,vr as t,Ve as u}',
    'export{kr as a,ke as c,Mr as i,ne as l,br as n,Se as o,wr as r,je as s,vr as t}'),
];
const BILLING_CHANNELS = [
  edit('Channels has no Upgrade to Pro button',
    't&&(0,e.jsx)("div",{className:"mt-auto",children:(0,e.jsx)(k,{onClick:r,children:"Upgrade to Pro"})})',
    '!1'),
  edit('the unused assistant row has no Pro prompt',
    '"Upgrade to Pro to connect to personal assistants."', '"Not available yet."'),
];
const BILLING_ROUTINES = [
  edit('Routines has no Free plan banner',
    'children:[h&&(0,e.jsxs)("div",{className:"inner-curved-shape-top',
    'children:[!1&&(0,e.jsxs)("div",{className:"inner-curved-shape-top'),
];
const BILLING_TOOL_CARDS = [
  edit('a routine limit is a limit, not a plan',
    '"You\'ve reached the routine limit on the Free plan."', '"Routine limit reached."'),
  edit('the routine limit card offers no upgrade',
    '"You have reached the Free plan routine limit. Pause or remove an existing routine, or upgrade to run more routines."',
    '"You’ve reached the routine limit. Pause or remove a routine to run another."'),
];
const BILLING_REFERRAL = [
  edit('no free week of Aux Pro to share',
    '!!s?.trialDays&&!!s?.eligible&&(0,e.jsxs)(u,{className:"flex items-center gap-1",children:[(0,e.jsx)(c,{title:"Share a free week of Aux Pro with friends"',
    '!1&&(0,e.jsxs)(u,{className:"flex items-center gap-1",children:[(0,e.jsx)(c,{title:"Share Aux with friends"'),
];
const BILLING_ERRORS = [
  edit('no Aux plan limit error', 'jf(t)?n==="aux"?{kind:"credits-aux-v2",title:"You\'ve hit your usage limit.",...xp(o)}:{kind:"credits-other"', 'jf(t)?{kind:"credits-other"'),
  // Connection failures name themselves instead of reading as a provider bug (plan 8.25).
  edit('offline and network errors have their own kinds',
    'description:"Free up disk space, then try again."};if(n&&Of(t,r))',
    'description:"Free up disk space, then try again."};if(typeof navigator<"u"&&navigator.onLine===!1)return{kind:"offline",title:"You’re offline",description:"Check your connection, then try again."};if(/\b(?:ECONNREFUSED|ECONNRESET|ENOTFOUND|ETIMEDOUT|EAI_AGAIN)\b|fetch failed|network error|socket hang up|ERR_INTERNET_DISCONNECTED|ERR_NETWORK/i.test(t))return{kind:"network",title:"Couldn’t reach the model",description:"The connection dropped. Check your network, then try again."};if(n&&Of(t,r))'),
  // Out of credits is the model provider's balance, never an Aux plan.
  edit('out of credits points at the provider, with no plan or credit actions',
    '{if(!e)return{description:"Check your plan and credits to keep going.",actions:[]};const r=e==="free",o=r?"Upgrade your plan to keep going":"Add credits to keep going",s=r?["upgrade"]:e==="max"?["addCredits"]:["addCredits","upgrade"],a=t?ma(new Date(t),n):null;return a?{description:`${o}, or wait until your credits reset ${a}.`,actions:s}:{description:`${o}.`,actions:s}}',
    '{return{description:"Your model provider is out of credits. Add credits with them, or choose another model in Settings › Models.",actions:[]}}'),
];

const ACCOUNT = [
  // Sync and Browser data recovery need a service Aux doesn't run; the native
  // sync status reports unavailable. The rows come back when sync does.
  edit('no Sync section while sync is unavailable',
    '(0,e.jsx)(js,{accountId:s,ownerId:C.userId,needsSignIn:o.isError,status:h.data,statusError:h.isError,onRecover:x}),',
    ''),
];

// Onboarding for every new profile, local or signed in (docs/plans/2026-10-29-browser-excellence.md,
// Batch 6): Welcome → Import → Password manager → Make it yours → Models → Done. The cloud sign-in
// splash is skipped; the password-manager step (bring your own) is back.
const ONBOARDING_IMPORT = [
  edit('Import skips to the password manager step',
    'to:"/onboarding/glance",replace:!0,onClick:()=>{l("onboarding.import-browser.skip")}',
    'to:"/onboarding/import-password",replace:!0,onClick:()=>{l("onboarding.import-browser.skip")}'),
];
// Arc's pinned Spaces import as Aux Spaces (onboarding progress and Settings › Import).
const SPACES_KIND = edit('Arc Spaces have a label', '["paymentCards","payment cards"]]),', '["paymentCards","payment cards"],["spaces","Spaces and pins"]]),');
// An import that skipped site sign-ins (cookies Aux couldn't read) still succeeds; the
// screen says so and stays put, with Try again for just the sign-ins and Next to go on.
const ONBOARDING_PROGRESS = [
  edit('a finished import goes on to the password manager step',
    'o({to:"/onboarding/glance",replace:!0})',
    'o({to:"/onboarding/import-password",replace:!0})'),
  edit('a partial import stays on screen',
    '(u.current=!0,E(),a=window.setTimeout(()=>{o({to:"/onboarding/import-password",replace:!0})},800)))',
    '(E(),l.skippedDataKinds?.length||(u.current=!0,a=window.setTimeout(()=>{o({to:"/onboarding/import-password",replace:!0})},800))))'),
  edit('the progress screen can set the pending import',
    'import{D as R,E as T,L as C,M as E,N as w}from"./extension-main-Dz1-AsCT.js"',
    'import{D as R,E as T,I as auxSetPending,L as C,M as E,N as w}from"./extension-main-Dz1-AsCT.js"'),
  edit('the progress screen keeps the import it started',
    't=j(),[s,c]=', 't=j(),auxPending=(0,d.useRef)(w()),[s,c]='),
  edit('a partial import is known',
    'h=n?.state==="succeeded",D=', 'h=n?.state==="succeeded",auxSkipped=h&&!!n.skippedDataKinds?.length,D='),
  edit('Try again retries only the sign-ins',
    'c(p=>p+1)};return',
    'c(p=>p+1)},auxRetrySignIns=()=>{auxPending.current&&auxSetPending({...auxPending.current,dataKinds:["cookies"]}),D()};return'),
  edit('Back works after a partial import',
    'disabled:!f,onClick:', 'disabled:!f&&!auxSkipped,onClick:'),
  edit('a partial import offers Try again and Next',
    ']}),f?(0,e.jsx)(g,{type:"button",onClick:D,children:"Try again"})',
    ']}),auxSkipped?(0,e.jsxs)("div",{className:"flex gap-2",children:[(0,e.jsx)(A,{variant:"secondary",size:"lg",onClick:auxRetrySignIns,children:"Try again"}),(0,e.jsx)(g,{type:"button",onClick:()=>t({to:"/onboarding/import-password",replace:!0}),children:"Next"})]}):f?(0,e.jsx)(g,{type:"button",onClick:D,children:"Try again"})'),
  edit('a partial import says what it skipped',
    't?.state==="succeeded"?(0,e.jsx)("span",{children:"Import complete."})',
    't?.state==="succeeded"?t.skippedDataKinds?.length?(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)("span",{className:"block",children:"Imported everything except site sign-ins."}),t.skippedMessage&&(0,e.jsx)("span",{className:"text-muted-foreground block",children:t.skippedMessage})]}):(0,e.jsx)("span",{children:"Import complete."})'),
  SPACES_KIND,
];
const ONBOARDING_WELCOME = [
  edit('the glance chunk also has Make it yours', 'export{ae as component};', 'export{ae as component,auxMakeItYours as yours};'),
];
const ONBOARDING_GUARD = [
  // Stored on this device, so local users get the flow and nobody gets it twice.
  edit('onboarding follows the local record first',
    'function K(o){if(!o||o.mode!=="cloud"||o.authStatus==="paused")return null;if(o.onboardingCompletedAt!==void 0)return o.onboardingCompletedAt===null?"/onboarding/import-browser":null}',
    'function K(o){try{if(localStorage.getItem("aux.onboarding.completed.v1")==="1")return null}catch{}if(!o||o.authStatus==="paused")return null;if(o.mode!=="cloud")return"/onboarding/glance";if(o.onboardingCompletedAt!==void 0)return o.onboardingCompletedAt===null?"/onboarding/glance":null}'),
];
const ONBOARDING_PASSWORD = [
  edit('after the password manager comes Make it yours', 'f=()=>{l({to:"/onboarding/ai",replace:!0})}', 'f=()=>{l({to:"/onboarding/make-it-yours",replace:!0})}'),
  edit('the Skip tip says where password managers live',
    '"You can set it up later in ",(0,e.jsxs)("span",{className:"font-medium",children:["Settings ",">"," Password"]}),"."', '"You can add one later from Extensions."'),
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
    'render:(0,e.jsx)(ne,{to:"/onboarding/make-it-yours",replace:!0}),children:[(0,e.jsx)(de,{"data-icon":"inline-start"}),(0,e.jsx)("span",{children:"Back"})]'),
];
const ONBOARDING_STEPS = [
  edit('the step dots follow Import, Password manager and Models',
    'f=["/onboarding/import-browser","/onboarding/glance","/onboarding/ai"]',
    'f=["/onboarding/glance","/onboarding/import-browser","/onboarding/import-password","/onboarding/make-it-yours","/onboarding/ai"]'),
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
// Test and playground routes, and the Context Awareness route (no one can reach it, and it isn't real yet).
const REMOVED_ROUTES = [
  edit('no liquid glass playground route',
    'Xt=()=>s(()=>import("./liquid-glass-playground-DkwgfDqY.js"),__vite__mapDeps([117,2,86,50,10,11,1,3,4,5,6,7,118,119])),er=n("/liquid-glass-playground/")({beforeLoad:()=>{throw c({to:"/",replace:!0})},component:a(Xt,"component")}),', ''),
  edit('the playground route is out of the tree',
    'Bn=er.update({id:"/liquid-glass-playground/",path:"/liquid-glass-playground/",getParentRoute:()=>R}),', ''),
  edit('the playground route is out of the root',
    'LiquidGlassPlaygroundIndexRoute:Bn,', ''),
  edit('no Context Awareness route',
    'Rn=()=>s(()=>import("./context-awareness-BocPTg31.js"),__vite__mapDeps([323,2,1,3,4,5,6,7,13,11,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,51,324,138,94,139,213,222,223,91,92,93,95,82,54,112,136,142,226,145,305,196,146,126,149,148,80,150,86,50,10,187,188,314,123,124,125,127,128,129,130,151,52,65,147,69,158,159])),_n=n("/_web/(settings)/u/$userId/settings/memories/context-awareness/")({component:a(Rn,"component"),beforeLoad:async({context:{trpc:e,queryClient:t},params:{userId:r}})=>{const o=Number.parseInt(r,10);await t.query({...e.settings.getAll.queryOptions({accountId:o}),staleTime:"static"})}}),', ''),
  edit('nothing exports the Context Awareness route', ',_n as c,', ','),
  edit('the Context Awareness route is out of the tree',
    'Qa=_n.update({id:"/context-awareness/",path:"/context-awareness/",getParentRoute:()=>E}),', ''),
  edit('the Context Awareness route is out of Memory',
    'WebsettingsUUserIdSettingsMemoriesContextAwarenessIndexRoute:Qa,', ''),
];
const NEW_TAB = [
  // Aux has no Lens: dropping an image only attaches it, in Ask.
  edit('a drag only counts in Ask', '(t==="ask"||E.type.startsWith("image/"))', 't==="ask"'),
  edit('a drop only counts in Ask', 't==="search"&&!E.some(q=>q.type.startsWith("image/"))', 't==="search"'),
  edit('the drop hint names no Lens', 't==="ask"?"Drop to attach":"Drag an image to search with Google Lens"', '"Drop to attach"'),
];
const ONBOARDING_ROUTES = [
  edit('Make it yours has a route',
    'wr=n("/_public/onboarding/import-password/")({beforeLoad:()=>{throw c({to:"/onboarding/ai",replace:!0})},component:a(Pr,"component")})',
    'wr=n("/_public/onboarding/import-password/")({component:a(Pr,"component")}),auxYoursRoute=n("/_public/onboarding/make-it-yours/")({component:a(gr,"yours")})'),
  edit('Make it yours sits under onboarding',
    'ea=hr.update({id:"/glance/",path:"/glance/",getParentRoute:()=>y}),',
    'ea=hr.update({id:"/glance/",path:"/glance/",getParentRoute:()=>y}),auxYoursIndex=auxYoursRoute.update({id:"/make-it-yours/",path:"/make-it-yours/",getParentRoute:()=>y}),'),
  edit('Make it yours is in the tree',
    'PublicOnboardingGlanceIndexRoute:ea,', 'PublicOnboardingGlanceIndexRoute:ea,AuxOnboardingMakeItYoursIndexRoute:auxYoursIndex,'),
  // Local users reach setup through any page of the app, not only a first-install tab.
  edit('the app sends a first run to setup',
    'if(!t&&e.pathname.startsWith("/u/")&&ee(e.pathname)!==u)throw c({href:V(e.href,u),replace:!0});return{accountId:u}',
    'if(!t&&auxOnboardingDue())throw c({to:"/onboarding/glance",replace:!0});if(!t&&e.pathname.startsWith("/u/")&&ee(e.pathname)!==u)throw c({href:V(e.href,u),replace:!0});return{accountId:u}'),
  // Steps that need the daemon wait for it inline; Welcome and Make it yours don't need it.
  edit('onboarding opens before the daemon is ready',
    'Qt=n("/_public/onboarding")({beforeLoad:async({context:e,location:t})=>{if(await te(),Ht(t.pathname)||Y)return;',
    'Qt=n("/_public/onboarding")({pendingMs:0,pendingComponent:auxAgentReady,beforeLoad:async({context:e,location:t})=>{if(/\\/onboarding\\/(?:glance|make-it-yours)\\/?$/.test(t.pathname))return;if(await te(),Ht(t.pathname)||Y)return;'),
  edit('Import waits inline', 'n("/_public/onboarding/import-browser/")({component:a(fr,"component"),', 'n("/_public/onboarding/import-browser/")({pendingMs:0,pendingComponent:auxAgentReady,component:a(fr,"component"),'),
  edit('Models waits inline', 'n("/_public/onboarding/ai/")({validateSearch:', 'n("/_public/onboarding/ai/")({pendingMs:0,pendingComponent:auxAgentReady,validateSearch:'),
  edit('the local record of finishing setup',
    'function Ht(e){return e.replace(/\\/+$/,"")===Mt}',
    'function Ht(e){return e.replace(/\\/+$/,"")===Mt}function auxAgentReady(){return(0,i.jsx)("div",{className:"text-muted-foreground flex h-screen items-center justify-center text-sm",children:"Getting your agent ready…"})}function auxOnboardingDue(){try{return!chrome.extension?.inIncognitoContext&&localStorage.getItem("aux.onboarding.completed.v1")!=="1"}catch{return!1}}'),
];
const BACKGROUND = [
  // A new profile starts with setup; updates and restarts don't.
  edit('a new profile opens onboarding',
    'onInstalled.addListener(() => Vt(!0))',
    'onInstalled.addListener((details) => { Vt(!0); if (details?.reason === "install") chrome.tabs.create({ url: chrome.runtime.getURL("main.html#/onboarding/glance") }); })'),
  // The agent panel listens for this and goes back to the home thread.
  edit('the agent button returns the panel to the home thread',
    'chrome.action.onClicked.addListener(async (e) => {\n  e.windowId && await chrome.sidePanel.open({ windowId: e.windowId });\n});',
    'chrome.action.onClicked.addListener(async (e) => {\n  e.windowId && await chrome.sidePanel.open({ windowId: e.windowId });\n  e.windowId && chrome.runtime.sendMessage({ type: "aux-agent-home", windowId: e.windowId }).catch(() => {});\n});'),
];

// Dictation runs on this Mac through the browser (auxBrowserPreferences.startDictation and
// stopDictation, macOS Speech) instead of posting audio to a hosted /stt/transcribe route that
// doesn't exist. Same shape as the bundled hook, so the Dictate button and overlay are unchanged.
// The overlay's level meter wants a MediaStream; native capture has none, so `stream` is just
// `true` while listening (the meter stays flat, Convert is enabled). Without the native API
// (an older browser build) there is no Dictate button.
const auxDictationHook = 'auxDictation=insert=>{'
  + 'const api=typeof chrome<"u"?chrome.auxBrowserPreferences:void 0,'
  + '[status,setStatus]=(0,g.useState)("idle"),[listening,setListening]=(0,g.useState)(!1),'
  + '[error,setError]=(0,g.useState)(null),phase=(0,g.useRef)("idle"),inserter=(0,g.useRef)(insert);'
  + 'inserter.current=insert;'
  + 'const move=next=>{phase.current=next,setStatus(next),setListening(!1)},'
  + 'start=(0,g.useCallback)(async()=>{if(phase.current!=="idle")return;setError(null),move("recording");'
  + 'try{await api.startDictation(),phase.current==="recording"&&setListening(!0)}'
  + 'catch(e){phase.current==="recording"&&(move("idle"),setError(e?.message||"Dictation couldn\'t start."))}},[api]),'
  + 'finish=(0,g.useCallback)(async keep=>{if(phase.current!=="recording")return;move(keep?"transcribing":"idle");'
  + 'try{const text=(await api.stopDictation()).trim();keep&&(text?inserter.current(text):setError("Nothing was heard. Try again."))}'
  + 'catch(e){keep&&setError(e?.message||"Dictation failed.")}finally{keep&&move("idle")}},[api]);'
  + '(0,g.useEffect)(()=>()=>{phase.current==="recording"&&api.stopDictation().catch(()=>{})},[api]);'
  + 'return{supported:typeof api?.startDictation=="function",status,stream:listening||null,error,start,'
  + 'cancel:()=>finish(!1),confirm:()=>finish(!0),warmMic:()=>{}}},';
const COMPOSER = [
  edit('the composer imports no Ultrabrowse parts',
    'import{c as Gr,d as wl,i as Sl,l as Ta,n as Pl,o as kl,s as Ml,t as jl,u as Il}from"./model-select-BvZsM1Kl.js"',
    'import{c as Gr,i as Sl,l as Ta,n as Pl,o as kl,s as Ml,t as jl}from"./model-select-BvZsM1Kl.js"'),
  edit('the Dictate button uses on-device dictation',
    'xn=(0,g.createContext)(null),Su=({children:e})=>{',
    `xn=(0,g.createContext)(null),${auxDictationHook}Su=({children:e})=>{`),
  edit('the composer listens through the browser, not a hosted route',
    'const o=Mc(n);',
    'const o=auxDictation(n);'),
  edit('no Dictate button without the native dictation API',
    '(0,a.jsx)(xn,{value:{...o,hasLiveText:r},',
    '(0,a.jsx)(xn,{value:o.supported?{...o,hasLiveText:r}:null,'),
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

// Little Aux links get a Settings switch beside Peek (pref aux.little_aux_links_enabled,
// exposed natively as littleAuxLinks).
const LITTLE_AUX_KEYS = [
  edit('frame settings carry the Little Aux switch',
    "['sidebarNavigation','minimal','peekLinks']",
    "['sidebarNavigation','minimal','peekLinks','littleAuxLinks']", 2),
];
const LITTLE_AUX_ROW = [
  edit('Little Aux links have a row beside Peek',
    "['peekLinks','Open links in Peek','Preview ordinary links before moving them into a full tab.']]",
    "['peekLinks','Open links in Peek','Option-Shift-click a link to preview it before moving it into a full tab.'],\n      ['littleAuxLinks','Open links from other apps in Little Aux','Links from other apps open in a small window you can move into a Space.']]"),
];

export const EDITS = Object.freeze({
  'assets/tabsearch-3k_2hgil.js': Object.freeze([...COMMAND_BAR, ...PALETTE_ASK, ...COMMAND_BAR_COMMANDS]),
  'assets/general-3dgRbrRk.js': Object.freeze([...SETTINGS, ...GENERAL_ROWS, ...CLEANUP_HOURS, ...LITTLE_AUX_KEYS, SPACES_KIND]),
  'assets/appearance-Ceuw3-j6.js': Object.freeze([...APPEARANCE, ...APPEARANCE_ROWS, ...LITTLE_AUX_KEYS, ...LITTLE_AUX_ROW]),
  'assets/privacy-BeEEt9Qu.js': Object.freeze([...PRIVACY, ...PRIVACY_ROWS]),
  'assets/developers-DTvaoVBC.js': Object.freeze(DEVELOPERS),
  'assets/model-BrFuJM2w.js': Object.freeze(MODELS),
  'assets/lasso-LoarCzmz.js': Object.freeze(LASSO),
  'assets/route-TQyeTEXE.js': Object.freeze(SETTINGS_SHELL),
  'assets/account-Dr_CA8LL.js': Object.freeze(ACCOUNT),
  'assets/import-browser-DwQpkFpc.js': Object.freeze([...ONBOARDING_IMPORT, ...IMPORT_BROWSER]),
  'assets/progress-CS-jrVXz.js': Object.freeze(ONBOARDING_PROGRESS),
  'assets/import-password-mvM-KsU6.js': Object.freeze(ONBOARDING_PASSWORD),
  'assets/ai-CzEX5E7S.js': Object.freeze(ONBOARDING_MODELS),
  'assets/route-CSKkWqf5.js': Object.freeze(ONBOARDING_STEPS),
  'assets/glance-BfAlmExy.js': Object.freeze(ONBOARDING_WELCOME),
  'assets/-types-Wy38XkNB.js': Object.freeze(ONBOARDING_GUARD),
  'assets/done-DPzI9pFd.js': Object.freeze(ONBOARDING_DONE),
  'assets/extension-main-Dz1-AsCT.js': Object.freeze([...ONBOARDING_ROUTES, ...SHORTCUTS_ROUTE, ...REMOVED_ROUTES]),
  'assets/newtab-CnOLQ0yu.js': Object.freeze(NEW_TAB),
  'background.js': Object.freeze(BACKGROUND),
  'assets/session-composer-Dc0LRfZA.js': Object.freeze(COMPOSER),
  'assets/conversation-D9Q3VEsl.js': Object.freeze(CONVERSATION),
  'assets/use-shortcut-capture-DGr8Ws5Z.js': Object.freeze(SHORTCUTS),
  'assets/appearance-C03x8vQf.js': Object.freeze(SHORTCUTS_PAGE),
  'assets/agents-urkO3LLg.js': Object.freeze(AGENT_SETTINGS),
  'assets/tasks-D7OPjR17.js': Object.freeze(TASKS),
  'assets/model-select-BvZsM1Kl.js': Object.freeze(BILLING_MODEL_SELECT),
  'assets/channels-CJn5l9_T.js': Object.freeze(BILLING_CHANNELS),
  'assets/routines-BNdQOEUt.js': Object.freeze(BILLING_ROUTINES),
  'assets/tool-definition-registry-Cc6FCFb2.js': Object.freeze(BILLING_TOOL_CARDS),
  'assets/referral-link-field-BrKHOkVL.js': Object.freeze(BILLING_REFERRAL),
  'assets/strip-markdown-DRcmtuJc.js': Object.freeze(BILLING_ERRORS),
});

export function integratePolish(chunk, text) {
  const edits = EDITS[chunk];
  if (!edits) throw Error(`Polish: no edits for ${chunk}`);
  return applyExactEdits(`polish ${chunk}`, edits, text);
}
