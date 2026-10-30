/** Release-time integration of the Agent extension's Aux-owned source (browser-excellence plan,
 * Batch 10 item 7). Each sealed block it replaces is pinned by its anchors, length and SHA-256 and
 * replaced in place, so the order around it holds and every other byte stays as supplied.
 * scripts/release/transforms.mjs applies it after every other edit to the same files; any drifted
 * block stops the release.
 *  - Step 1, styles/: the globals CSS design tokens, UI fonts and base element styles.
 *  - Step 2: the New Tab first-paint tokens and fonts (styles/newtab-first-paint.css), and the
 *    shared components (components/), each replacing its sealed definitions with the same exported
 *    names, props, classes and behavior, except the corner changes listed in CORNER_CHANGES.
 *  - Step 3, routes/: the routes people see most, the same way, after every earlier edit to their
 *    chunk (package edits, polish, agent), with the token changes listed in TOKEN_CHANGES. */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

/** The stylesheet every extension page loads (main, side panel, New Tab, popups). */
export const GLOBALS_CSS = 'assets/globals-B-8L9em-.css';
/** The supplied display face, Universal Sans Display renamed: commercial, not Aux's to ship. */
export const REMOVED_FILES = Object.freeze(['assets/AuxDisplay-Variable-LuohODSt.woff2']);
/** The Geist fonts are OFL 1.1, which travels with them. */
export const LICENSE = Object.freeze({source: 'fonts/Geist-OFL.txt', target: 'GEIST-LICENSE.txt'});

const block = (name, file, start, end, sha256, bytes) => Object.freeze({name, file, start, end, sha256, bytes});

/** In file order. `start` and `end` are the first and last bytes of the sealed block. */
export const BLOCKS = Object.freeze([
  block('UI fonts', 'fonts.css',
    '@font-face{font-family:Geist Variable;font-style:normal;font-display:swap;font-weight:100 900;src:url(/assets/geist-cyrillic-wght-normal-CHSlOQsW.woff2)',
    'src:url(/assets/geist-mono-CNic6Mot.ttf)format("woff2-variations")}',
    '19441849b99208b6f97d792ed33a73395f5344477d72298ea5349f39736c3231', 1256),
  block('theme tokens', 'theme.css', '@layer theme{', '--squircle-factor:1.4}}',
    '2badee93055ea507e835a451aaf70b4003df817eec61121a41f55302f972bdee', 6578),
  block('base element styles', 'base.css', '@layer base{', '[hidden]:where(:not([hidden=until-found])){display:none!important}}',
    '068dbeeb6d136fbec20fdb9e7443902429a1d70dc05eb865f5ec8be2e26643a1', 4259),
  block('color tokens', 'colors.css', ':root,.light{--background:var(--color-white);',
    'body[data-theme=translucent]{background-color:var(--web-content-background)!important}',
    '2af8e18c094fb2daa03830d4581e4c6c73c9544f13bf8545e229d12380a9c62c', 3284),
  block('document font', 'document.css', 'html,body{font-family:var(--font-sans)}:root{overscroll-behavior:none}',
    'html,body{font-family:var(--font-sans)}:root{overscroll-behavior:none}',
    'ef2208e3d333bb40bbfa5002701f8bf41287af3b4ba42c38d4c95d753b16099d', 70),
]);

/** A source file as shipped: comments and line breaks with their indentation dropped. */
export const shipped = source => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*/g, '');
export const readSource = file => readFileSync(new URL(`./styles/${file}`, import.meta.url), 'utf8');

/** Declarations as [rule context, property, value], in source order; the tests compare the
 * sealed blocks with the sources through it. */
export function declarations(css) {
  const out = [];
  const declare = (context, decl) => {
    const colon = decl.indexOf(':');
    if (decl.trim()) out.push([context.join(' > '), decl.slice(0, colon).trim(), decl.slice(colon + 1).trim()]);
  };
  const walk = (text, context) => {
    let depth = 0, from = 0, open = 0, quote = null;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quote) { if (c === '\\') i++; else if (c === quote) quote = null; continue; }
      if (c === '\\') { i++; continue; }
      if (c === '"' || c === "'") { quote = c; continue; }
      if (c === '{') { if (!depth++) open = i; continue; }
      if (c === '}' && !--depth) {
        walk(text.slice(open + 1, i), [...context, text.slice(from, open).replace(/\s+/g, ' ').replace(/ ?, ?/g, ',').trim()]);
        from = i + 1;
      } else if (c === ';' && !depth) {
        declare(context, text.slice(from, i));
        from = i + 1;
      }
    }
    declare(context, text.slice(from));
  };
  walk(css.replace(/\/\*[\s\S]*?\*\//g, ''), []);
  return out;
}

const sha256 = text => createHash('sha256').update(text).digest('hex');

/** Where each sealed block sits in `text`, checked against its pin; blocks are listed in file order. */
export function locateBlocks(text, blocks = BLOCKS, label = 'Agent styles') {
  let after = 0;
  return blocks.map(({name, start, end, sha256: pin, bytes}) => {
    const at = text.indexOf(start);
    if (at < 0 || text.indexOf(start, at + 1) >= 0)
      throw Error(`${label} drift: ${name}: expected one start anchor, got ${text.split(start).length - 1}`);
    const stop = text.indexOf(end, at) + end.length;
    if (at < after || stop < at + end.length || stop - at !== bytes || sha256(text.slice(at, stop)) !== pin)
      throw Error(`${label} drift: ${name}: the sealed block changed`);
    after = stop;
    return [at, stop];
  });
}

function replaceBlocks(text, blocks, label, replacement) {
  let output = '';
  let cursor = 0;
  locateBlocks(text, blocks, label).forEach(([at, stop], index) => {
    output += text.slice(cursor, at) + replacement(blocks[index]);
    cursor = stop;
  });
  return output + text.slice(cursor);
}

/** Utilities the components need that the sealed build lacks, appended inside the utilities layer. */
export const UTILITIES = 'utilities.css';
const ADDED_UTILITIES = ['.rounded-b-xl{', '.bg-card{', '.-mt-\\[var\\(--radius-xl\\)\\]{', '.\\[--_r\\:var\\(--radius-xl\\)\\]{',
  '.group-hover\\/routine\\:bg-muted:', ':is(.\\*\\:data-model-select-shortcuts\\:px-2 > *)',
  ':is(.\\*\\*\\:data-\\[agent-session-ui\\=\\"chat\\"\\]\\:px-2 *)'];

export function integrateStyles(text) {
  for (const selector of ADDED_UTILITIES)
    if (text.includes(selector)) throw Error(`Agent styles drift: the sealed CSS already has ${selector}`);
  return replaceBlocks(text, BLOCKS, 'Agent styles', ({file}) => shipped(readSource(file))) + shipped(readSource(UTILITIES));
}

/** The New Tab page and its first-paint block (the start of its inline <style>). */
export const NEWTAB_PAGE = 'newtab.html';
export const NEWTAB_BLOCKS = Object.freeze([
  block('New Tab first-paint tokens', 'newtab-first-paint.css', ':root{--background:#fff;--foreground:oklch(14.5% 0 0);',
    '-webkit-font-smoothing:antialiased;line-height:1.5}',
    '853802f2d96889c6509779b8f6d5984b71b42247fd61150fbf665a261cbd907d', 1262),
]);

/** The Geist text faces from fonts.css, so first paint and the loaded page use one font source. */
export const geistFaces = () => shipped(readSource('fonts.css')).split(/(?=@font-face)/)
  .filter(face => face.startsWith('@font-face {font-family: Geist Variable;')).join('');

export const integrateNewTab = text =>
  replaceBlocks(text, NEWTAB_BLOCKS, 'New Tab first paint', ({file}) => geistFaces() + shipped(readSource(file)));

/** Shared components, chunk → its blocks in file order. Each source in components/ replaces one
 * block verbatim; the exported bindings and the names the rest of the chunk uses keep their
 * minified names, everything inside is readable. */
export const COMPONENTS = Object.freeze({
  'assets/button-82u7k4S8.js': [block('Button', 'button.js', 'var m=g(v(),1),x=m.forwardRef(', 'className:t})),...n})}',
    '0233ae09558765bf04ffdcbd038c80995d348fc367611c8c5e9a8aea611377a5', 2801)],
  'assets/textarea-5TASg52t.js': [block('Textarea', 'textarea.js', 'var o=e(t(),1),d=n();', 'md:text-sm",r),...i})}',
    'c5a496a1039b6277d0707862fdec60cd9a62ee0191bd7984ba0c558641d75182', 662)],
  'assets/kbd-BDAwTCNn.js': [block('Kbd', 'kbd.js', 'var n=i(),o=s(', '"text-box-trim inline-flex items-center gap-1",t),...e})}',
    'e86d41fa8f1d32c20e6eb366ce0e2ce971dd80381302d80056525b9e41e69c4c', 600)],
  'assets/dialog-BAUCI3Qq.js': [block('Dialog', 'dialog.js', 'var b=m(function(t){return f("dialog",t)})', '*:[a]:underline-offset-3",a),...t})}',
    '3fa45589f96234f9f79abdfdc4446b89be9f7f9667cfe331662b88da58d12a32', 2189)],
  'assets/switch-BeLEn4vU.js': [block('Switch', 'switch.js', 'var I=T(G(),1),r=P();', 'transform:`translate(${-w}px, ${-v}px)`}})})]})}',
    'a050122c87475e6dbf6b01be681e9eaf0657ddbc0eaa2cb251e397d7f93278ee', 4942)],
  'assets/checkbox-5u7RNXxY.js': [block('Checkbox', 'checkbox.js', 'kt={duration:.18,ease:[.22,1,.36,1]},oe=.08;', 'pathLength:{...kt,delay:a.checked?oe:0}}})})})})})}',
    'be02e76287af92de6d328a2b04664d2a80f5fd127fd884c0120ba7ed7add66dd', 1559)],
  'assets/select-B-J-L73E.js': [block('Select', 'select.js', 'Sr=({className:e,...t})=>(0,f.jsx)(zo,', 'children:(0,f.jsx)(ln,{})})',
    '5643e160ba554b52e70b3786fec44b8c0916d58fbeaceebb30196d7d23c68a89', 4196)],
  'assets/tooltip-Q2cPCEgr.js': [block('Tooltip', 'tooltip.js', 'function Eo({delay:e=0,...t})', 'children:g}):g})})})}',
    '11c6ce884bece1b4952b9986ef5ac0f5ddd5e11f2a248dcf2020622758088052', 2260)],
  'assets/tabs-VLDOVMHF.js': [block('Tabs', 'tabs.js', 'function tn({className:e,orientation:n="horizontal",...a})', '"flex-1 text-sm outline-none",e),...n})}',
    '4a8a2674c88fe1deacc09d4d3297d2b416972811c8074e5db995a73c7df536c0', 2720)],
  'assets/scroll-area-DxAxP4Y6.js': [block('ScrollArea', 'scroll-area.js', 'function Ke({className:e,children:t,effect:n=!0,viewportRef:S,...M})', '"bg-border relative flex-1 rounded-full"})})}',
    'c325110c25696dcbdf58595e93a1379ab05b46c58a40ba9cd6faf54c1e416c8f', 1892)],
  'assets/strip-markdown-DRcmtuJc.js': [
    block('Input and InputGroup', 'input.js', 'function mi({className:e,type:t,...n})', 'dark:bg-transparent dark:disabled:bg-transparent",e),...t})}',
      'd5261356d072774df326a4f45ef73058029a16825fa00d05ba6fa8d42c3e0162', 3825),
    block('AlertDialog and ContextMenu', 'alert-dialog-context-menu.js', 'function ko({...e}){return(0,p.jsx)(bd,', '"bg-border h-hairline mx-px",e),...t})})}',
      '7cdd54c14ceca9dfb1c166c419f6e7bb9b4c17ce63ebb49c1383213560d8b1dc', 5881),
    block('DropdownMenu', 'dropdown-menu.js', 'Pt=f.createContext(null),Rr=f.createContext(null),kp=', 'className:$("bg-border h-hairline",e),...t})})}',
      '999834973121d4cc3b6f0b3b5317cf87c1d37cfce7e4bbbaa62b04a93c138ca7', 13946),
    block('Popover', 'popover.js', 'Dp=e=>(0,p.jsx)(ef,{"data-slot":"popover",...e})', '"bg-glass border-glass rounded-2xl shadow-xl",e),...u})})});',
      '268b3d6f97bbea2f9e13f54be8e253a71e62d577df38a96a91cf644b84884b3f', 936),
  ],
});

/** The only intended differences from the supplied components (Robert: uniform corners, so the
 * popover-sized surfaces take the frame's 12px popover corner): [component file, supplied class,
 * Aux class]. Menus (dropdown, context, sub-menus) were already rounded-xl. */
export const CORNER_CHANGES = Object.freeze([
  ['dialog.js', 'rounded-2xl', 'rounded-xl'],
  ['dialog.js', 'rounded-b-2xl', 'rounded-b-xl'],
  ['alert-dialog-context-menu.js', 'rounded-2xl', 'rounded-xl'],
  ['alert-dialog-context-menu.js', 'rounded-b-2xl', 'rounded-b-xl'],
  ['popover.js', 'rounded-2xl', 'rounded-xl'],
  ['select.js', 'rounded-2xl', 'rounded-xl'],
]);

export const readComponent = file => readFileSync(new URL(`./components/${file}`, import.meta.url), 'utf8');

export function integrateComponents(chunk, text) {
  const blocks = COMPONENTS[chunk];
  if (!blocks) throw Error(`Agent components: no blocks for ${chunk}`);
  return replaceBlocks(text, blocks, `Agent components ${chunk}`, ({file}) => readComponent(file));
}

/** Routes, chunk → its blocks in file order, pinned on the text the earlier release edits leave. */
export const ROUTES = Object.freeze({
  'assets/island-C0ouZ54e.js': [block('New Tab page body', 'new-tab-island.js', 'var e=E(),N=', '(0,e.jsx)(we,{})})]})};',
    'cec1fe977980ff05a4a31d4a7b68dd54c580727dde165d28d46e3f29773cdd6d', 10863)],
  'assets/newtab-CnOLQ0yu.js': [
    block('New Tab context and mode tabs', 'new-tab-context.js', 'st=(0,n.createContext)(null),Bt=', 't):null}',
      'c6659c4ea85c14ab689c4ae83827e8e0747e630dbea441dd103b371f7cca0cbd', 1668),
    block('New Tab mount', 'new-tab-mount.js', 'Mn=({children:e,initialInput:t=""})=>', 'window.location.replace(Lt(t)),!0)}',
      'db7fb77b65455fe8974c30d94fa5ec247e869a6e8be16a4d981d124de6ed2c4e', 1782),
  ],
  'assets/sidepanel-CI-CbXmY.js': [block('Agent panel', 'agent-panel.js', 'var a=F(E(),1),e=q(),$=', '(0,e.jsx)(g,{})]})]})]})})};',
    '6e5ea2bd545821ed1078577def24b5fa0f51ba66737e3c5ad9fec15b300e34db', 2942)],
  // Only the panel header; the panel's session and draft plumbing around it stays supplied.
  'assets/-components-4o0FSqQ9.js': [block('Agent panel header', 'agent-panel-header.js', 'qe=({leading:e})=>{const{os:n}=_(),{data',
    ':(0,s.jsx)(e==="windows"?ce:ee,{})})})};', '751383ec0b97c0872a530eaca39a6a1ded8687a940eb63b996ce6664918e2f82', 1567)],
  'assets/-layouts-CcApOQbE.js': [block('Settings page kit', 'settings-layout.js', 'var s=l(),p=', '"flex max-w-40 min-w-0 shrink justify-end",e.className)});',
    '6a3f086ae431b181c598eafa4eee750d0dc396e9b1260d9c42748ab8bf1c3978', 2299)],
  'assets/route-TQyeTEXE.js': [block('Settings shell', 'settings-shell.js', 'te=[{label:"Extensions",icon:T1,kind:"chrome",to:"chrome://extensions"}]',
    '(0,t.jsx)(t1,{})})]})]})}', 'c0e43460db70c7d079b14069c2d29c3c4d89797ba8f92b0d9afd00313c5dd93b', 9554)],
  'assets/conversation-D9Q3VEsl.js': [block('Channel chat view', 'conversation.js', 'var t=Ze(),kt=({size:e=24,aria',
    'dren:(0,t.jsx)(kt,{className:"size-4"})})]})}', '215f89a711a4eb699b3e3b686037a11c2c4246e47a14d97b0741d2e55a877684', 54873)],
  'assets/sidebar-Cj9gldy1.js': [block('Chats sidebar', 'sidebar.js', 'var e=G(),fe=({size:t=24,ariaH', 'tart",nativeButton:!1,...s,children:t});',
    'c9fc0c814635a6b6707f45a01ab3ee98724a38d60383523857e4b220d3950abc', 9651)],
  'assets/minipopup-LkDLFvnq.js': [block('Mini popup', 'minipopup.js', 'var e=ne(),Ge=({size:s=24,aria', 'emoveEventListener("keydown",n)},[])},Rs=us;',
    '0318a41af8396de9c9886edff0522d7c7f2b79abdd17dd29e85b491638b9728b', 19043)],
  'assets/tabsearch-3k_2hgil.js': [block('Command bar', 'tabsearch.js', 'var s=re(),ge=({size:e=24,aria', "ed?.error??''}`.trim());\n  return opened;\n}\n",
    '571b55ff58af2522c40e936620306a5b224e588b640b1a5b117d13cbdb942d2c', 42075)],
  'assets/appearance-Ceuw3-j6.js': [block('Appearance settings', 'appearance-settings.js', 'var e=se(),Le=({size:s=24,aria',
    "lassName:'text-sm text-red-500'},error));\n}\n", '8ae7d91888ce3513b630c9b8232250400d0048ceb78f81afd8edf9bffda45d14', 35297)],
  'assets/appearance-C03x8vQf.js': [block('Appearance route and Shortcuts page', 'appearance-route.js', 'var P=T(A(),1),e=_(),re=()=>{c',
    'space-y-8",children:(0,e.jsx)(re,{})})})]})}', 'f38ed06eb5f422fbd5debc82ebc9441a97c5ee7b09f545890a841310e175d6af', 11883)],
  'assets/privacy-BeEEt9Qu.js': [block('Security & Privacy settings', 'privacy-settings.js', 'var h=He(Ke(),1);function Gt(t,r){const ',
    'ock",children:"Block all"})]})]})})]})};', '7c26463bf54fe5fc997ef754d130f280e5cf7e3c4f8e555481a7cbae314b127e', 28867)],
  'assets/account-Dr_CA8LL.js': [block('Account settings', 'account-settings.js', 'var e=ue(),H=({size:s=24,ariaHidden:a=!0',
    't?.mode==="local"&&(0,e.jsx)(as,{})]})};', 'c0cfa3cbbb508d7796dba8869b49177a285b4022bdfbdc70c11f1677367f3cdc', 22060)],
  'assets/model-BrFuJM2w.js': [block('Models settings', 'model-settings.js', 'var i=Ue(Ve(),1),e=We(),Me="compaction-l',
    'x)(Ot,{})})]}),(0,e.jsx)(kt,{})]})})]})}', 'd0c57dbe9df98718e98f037b35936ff7072948a791b08ddf23e96d4a3215269e', 26211)],
  'assets/developers-DTvaoVBC.js': [block('Developers settings', 'developers-settings.js', 'var e=se(),ke=({size:t=24,ariaHidden:r=!',
    'd-sm px-1 py-px font-mono",children:t});', '290d4d268361706be4ccf21d138294eb58051450ba4a34f96dfd1125a8ba3bae', 16361)],
  'assets/agents-urkO3LLg.js': [block('Agent settings', 'agent-settings.js', 'var e=ge(),Qe=({size:s=24,ariaHidden:t=!',
    ',e.jsx)(ls,{}),(0,e.jsx)(Je,{})]})})]})}', '7593dbd434f203fabb7f7e96085498d069ee8a6a07f5aba45b4f559c75c734d9', 20528)],
  'assets/projects-D4kjkizu.js': [block('Projects settings', 'projects-settings.js', 'var p=S(f(),1),e=v(),O=({userId:t})=>{co',
    '),children:(0,e.jsx)(O,{userId:t})})]})}', 'ba6646afa1ec5c9ac17aee681d91c516d2c782e696b32e6eb736497994d4b696', 1114)],
  'assets/projects-D_csJvC9.js': [block('Projects page', 'projects-page.js', 'var q=P(N(),1),e=C(),M=({initiallyCreati',
    'itiallyCreating:t==="create",userId:s})}', 'be88bb4fd94f7e859742277df6ea7284b430f379b10b824b7c16fd060912d04b', 2230)],
  'assets/plugins-header-28yyYrQl.js': [block('Plugins & MCPs header', 'plugins-header.js', 'var s=l(),h=({actions:i})=>{const t=o({s',
    'Id:e}}),children:"MCPs"})]})}),i]})]})};', 'dc5b87f167e417eabb5745d91bc5c1b4cc564bed8e92fc84c4d48ebe8c3a1df8', 896)],
  'assets/routines-BNdQOEUt.js': [block('Routines settings', 'routines-settings.js', 'var O=o(["standalone","child","internal"',
    '(0,e.jsx)(x,{title:"Create"})]})]})]})};', 'eddb999ec82b2a0d07f19ba3990cc57c4d45f40ca2ed680507e761eff3cc8dd5', 3656)],
  'assets/routine-item-menu-DJrYR2RE.js': [block('Routine row and menu', 'routine-item-menu.js', 'var j=z(k(),1),e=E(),v=50,le=({routineId',
    'e,{className:"size-4"}),"Remove"]})]})};', '29dccba48587313e77461322ce94bdbac59307eab9cf8eca7031b3aa4ebad589', 6333)],
  'assets/tasks-CtF0WxoJ.js': [block('New Tab tasks', 'new-tab-tasks.js', 'var h=D(Q(),1),e=B(),P="rounded-full px-',
    '})]}),s?.({taskCount:o?.length??0})]})};', '5b1fb9b6e811dfa6e504e30bada75f1b3ba843d77d4c77fd2e4b33db20b175aa', 7913)],
  'assets/tasks-D7OPjR17.js': [block('Tasks page', 'tasks-page.js', 'var e=F(),Ke=({size:s=24,ariaHidden:a=!0',
    'iew==="card"&&(0,e.jsx)(ss,{})]})]})]})}', 'e7f1eebeab6c8377b75b01b92e354a2301da199dd5bf9ff6f8ee2e29b4c9abad', 15327)],
  'assets/onboarding-helper-BVYyPOep.js': [block('New Tab onboarding helper', 'onboarding-helper.js', 'var e=w(),_=({size:t=24,ariaHidden:o=!0,',
    '2 h-7 px-2 text-xs",...o,children:t})});', 'b0a41f0b7b496f3269bdd78d943fae94e657c6fb6246896fdd2ec14ef96e749e', 7884)],
  'assets/onboarding-layout-MxuCwWDr.js': [block('Onboarding layout parts', 'onboarding-layout.js', 'var t=x(),k=({children:e,className:r,...',
    'x]:not([tabindex="-1"])\'].join(",")):!1;', 'fd27736486dfb40973cdce6cc74c738d6b77cb3205445961724557ab4f5e0313', 2222)],
  'assets/onboarding-field-group-BpfduoJC.js': [block('Onboarding field group', 'onboarding-field-group.js', 'var e=s(),d="overflow-hidden rounded-2xl',
    ',{...a,className:o("block gap-0",d,r)});', '7300e4ecf74271bdacfb6bf2c7d7bacbd59f92f659dc01520973324a1fa9dfda', 373)],
  'assets/omnibox-mode-preference-CWzOtieV.js': [block('New Tab omnibox mode preference', 'omnibox-mode-preference.js', 'var a="aux.new-tab.omnibox-mode.v2",r="s',
    'ge.setItem(a,e)}catch{}},d=e=>o(e)??t();', '2ef7d94f41f3b594f1707c1d420807c829ed2fe8ebde0ea7c477a97de438d524', 313)],
  'assets/omnibox-scope-DGFEg60F.js': [block('Omnibox scopes', 'omnibox-scope.js', 'var r={bookmark:t,gemini:s,history:m,tab',
    'bs:a},p=o=>Object.hasOwn(r,o)?r[o]:null;', 'c3acd78313c1c58c9f43450bea8b0d27d5490d746ce3ff8e31a6a183b82c67f5', 79)],
  'assets/ask-omnibox-panel-DkxXbN8c.js': [block('New Tab Ask panel', 'ask-omnibox-panel.js', 'var c=k(w(),1),e=E(),J=u=>{const{account',
    '!1),children:(0,e.jsx)(J,{...u})})})})};', '757d017e1beac8bc03acebb134c66120723d0ac9d552cc3fe64fce808b87829f', 3660)],
  // Channels, in two passes; the bot images at its start belong to vendor/provided/aux-channel-bot-assets.mjs.
  'assets/channels-CJn5l9_T.js': [
    block('Channels: schemas and connecting a messenger', 'channels-setup.js', 'var S=ds(ps(),1),ts=L(["slack","telegram',
      'ending:a}},_e="channel-credentials-form"', '34152cdea24b9632b50a9f3080e4f5ef30786b7398858152b7ea7fb019fa4838', 12689),
    block('Channels: connection settings, remote messengers and the page', 'channels-connections.js', 'ut=({accountId:s,connection:t,projects:n',
      'an",{children:E[n].label})]},n)})})]})};', '3094f8351b365b10b91aacd9436c1717626511d47d77ead0309c10c0337d4688', 21781),
  ],
  'assets/route-CJZWzPOz.js': [block('Memory: layout', 'memory-layout.js', 'var c=z(F(),1),e=k(),h={DEFAULT:"240px",',
    '(q,{children:"Open memory folder"})]})};', 'bd74c3d7ff602cd3c14dc3f8e91929ebf38f0572ff9ba10647dad0f438ca3a40', 6257)],
  'assets/files-DqqxHH6i.js': [block('Memory: file', 'memory-file.js', 'var x=N(k(),1),e=F(),Y=({accountId:r,fil',
    'xt-sm",children:"No memory files yet"})}', '5f1cc8258c7b0c923771a1cdee50aa7c6ab2e623f979bc396427231394bcdfb9', 4404)],
  'assets/histories-CpU8qS5w.js': [block('Memory: history', 'memory-history.js', 'var p=B(U()),e=Y(),Ie=({messages:s,sessi',
    '!["DONE","NONE"].includes(k(s).trim()));', 'cf98ce336d27b693ffeb7bdbcd8cb6a4d6c1e56cdd6efaa4bcad087899ce6a2f', 9251)],
  'assets/settings-DguZi_c6.js': [block('Memory: settings', 'memory-settings.js', 'var e=j();function z(){const{userId:u}=k',
    'ldren:"90 days"})]})]})})]})]})})]})]})}', 'ba75e3dffb6ae3a73c240ed99f89699bfa362deac1263f53882e40aa6ff33755', 1731)],
  'assets/import-DX5BoL4B.js': [block('Memory: import', 'memory-import.js', 'var t=e();function m(){return(0,t.jsx)("',
    'ter text-sm",children:"Import memory"})}', '49852f9282ac7bb75a5b147483cc01f06946d0bced12bdd8b263bd2101e4524e', 175)],
  'assets/context-awareness-BocPTg31.js': [block('Memory: Context Awareness', 'context-awareness.js', 'var x=Se(ke(),1);function L(s){return s.',
    '!M,onClick:E,children:"Add"})]})]})]})};', '6fd6cfd4239350f4ae50cd0f4a819bfc945d71ed544a518dae5bd65ede768db5', 20543)],
  // General: the Aux-facing settings code in two passes; three.js and the injected Aux code stay with their owners.
  'assets/general-3dgRbrRk.js': [
    block('General: account, import, capture and languages', 'general-settings.js', 'function vm({className:e,outsideSpeed:t=',
      'jsx)(ag,{})}),(0,A.jsx)(og,{})]})]})]})}', '428eae8571f11b2e6e8e29fe23629d97e9d3b266da23ad1142716a7a192bf7e2', 21964),
    block('General: default browser, search, New Tab, PiP, screenshots, updates and service', 'general-browser.js',
      'var Xm=()=>(0,A.jsxs)(Pi,{children:[(0,A', 'children:"open source software"}),"."]})', '44a387aac735b8f4cf7079fcc17b3b7f4929ace0dfa542eded08e081d5275468', 9417),
  ],
  // The composer, one area per pass; the rest of the chunk stays supplied until its pass.
  'assets/session-composer-Dc0LRfZA.js': [
    block('Composer: icons, tool summaries, prompt history, the editor, the + menu, Send and dictation', 'composer-head.js',
      'var a=Go(),Da=({size:e=24,ariaHidden:t=!', 'children:t})})};', '393f6b8bcd9da1df987969368c59bf6b5b1738dad1c8c4595304c33eec0d3b26', 31079),
    block('Composer: attachments, input layout, file previews, context usage', 'composer-attachments.js', 'var Xn=({attachment:e,classNam',
      '5 hours",monthly:"Monthly",weekly:"Weekly"};', '810d4c63beaea8510613ea7917b742870e7f6f08c78ccba72960ab594ba82db2', 18914),
    block('Composer: chat commands, the message list, its scroll controller and its context', 'composer-message-list.js',
      'function Ga({sessionId:e}){const{account', 'Activity must be used within MessageListContextProvider");return e}',
      'ef34583532d8c3669e98c1a5b9335895742d2d8d7cbbfb01691f6e2d9b772dee', 31323),
    block('Composer: notices (provider, sign-in, usage limit, connection) and status pills', 'composer-notices.js', 'Nr=({selectedProvider:e})=>{co',
      'Er=e=>e.type==="file";', '33758bd60d24a5cdec6c07510bd9dca715e2a74125fc385b0d693da21f92b1c3', 12812),
    block('Composer: pasted files in a message and the queued items', 'composer-queue-items.js', 'function Oh(e){return(Array.isAr',
      't,deliveryMode:"steering"}))]}', 'fba0e78a6533ee7655ed6d611b3e6646928156412f063d446eecb0029a40ec29', 1241),
    block('Composer: sending, the queue and message editing', 'composer-send-queue-edit.js', 'var Vh=({sendMessage:e,stop:t,',
      ',children:p?(0,a.jsx)(kt,{}):"Send"})]})]})}', '3beec8b2e49addc82fd299f3982189bebcc78a09433c57a753c21a84b0857537', 7493),
    block('Composer: conversation rendering (messages, citations, tool steps, system rows, turn navigation)', 'composer-conversation.js',
      'var Wh=3,Gh=5,Qh=10,Yh=.1,Xh=5,', 'children:j.response})]})]},j.key)})})})}', '84c6140296f9ea5c0cf26b8cfbba183590de949916384fef04566b800a5b1a58', 48034),
    block('Composer: the transcript row model and the session transcript', 'composer-transcript-rows.js',
      'g0=new Set(["routine_trigger","memory_signal","agent_message"]);', 'children:(0,a.jsx)(AuxAgentEmptyState,{})})})]})}',
      'c59a5d6daaab7751d85c3540734d88c9b68a5f9a62dcd4ff131e54bd8ef934cc', 29362),
    block('Composer: the side panel, side chats and subagents', 'composer-side-panel.js', 'var Ro=rp,sp=({tab:e})=>{const',
      'SERVE_PX)}px`}', '1286bf2581df09410d2211a4fd1799e4b83bb3a58c3dafb87ff6f5b823a02686', 12328),
    block('Composer: opening a session file', 'composer-open-file.js', 'var Eo=()=>{const{currentSession', '"reveal":"open",kn=Ns(Wo(),1)',
      '0dea28e629d0a504a32261ac526ccd7d806d919a559890c58817ff8bb4fb7406', 596),
    block('Composer: comments on selected text, the new-session draft and the Projects menu', 'composer-comments-projects.js', 'Do=({range:e,children:t,classNam',
      'retryAt:il().finite()})]);', '437b4bb959073c4c2772c2fbce0fd75895af641b965a61777b31a74f06afc3df', 16807),
    block('Composer: toolbar, model menu, queued messages and composer shell', 'composer-toolbar-model.js', 'function Ep(e){const t=e.diagn',
      'p-1 first:shrink-0 first:grow",children:e});', '3bbd99658e6f6b7f84fdeaf0abbbaaab9ef12c3762b978c361674885579e04ad', 30866),
  ],
  'assets/_sessionId-ClN_BWh5.js': [block('Task session page', 'task-session.js', 'var e=Ue(),Gt=({size:s=24,ariaH',
    'navigateToSession:l})})}', 'f0c655307a23a4bb4be9c2f6e2c54fe373aaeb99ab8c8c39e2a2134881063627', 42641)],
  // The chat input and its prompts, in two passes around the supplied chat input (js), which carries
  // vendor/provided/aux-productivity-tab-context.mjs's tab checks and stays with it.
  'assets/permission-approval-D-GTf91U.js': [
    block('Chat input: icons, contexts, page selection, attachments and the message', 'chat-input-context.js', 'dn=({size:e=24,ariaHidden:t=!0,...r})=>(',
      'useChatInputText must be used within ChatInputProvider");return e}', '5b7598e0c1ac692e0a7d22031e239c7ba0e3cb7bf4531ac69f8e43cda70896f9', 7580),
    block('Chat input: action confirmation, questions and permission approval', 'chat-input-prompts.js', 'we=e=>JSON.stringify(e.doc),kn=(e,t)=>e=',
      '(0,n.jsx)(Ot,{className:"size-3!"})})]})', '08d5f7ddb3970f2f9035ddcb0485a497befb42c682a17524594867d10e473802', 25788),
  ],
  // Plugins › MCPs in two passes; the bundled MCP SDK and settings schemas between them stay supplied
  // (the experimental settings schema in them belongs to vendor/provided/aux-experimental-settings-v2.mjs).
  'assets/mcps-DmPp5oo9.js': [
    block('MCPs: icons and command-line and URL helpers', 'mcps-helpers.js', 'La=({size:e=24,ariaHidden:n=!0,...r})=>(',
      '"http:"&&Ua(n.hostname)}catch{return!1}}', 'c65711cb4ef8e197f96b4d0a73a34d44114ec33977a5101b895a8b9d5ec4fd12', 6423),
    block('MCPs: presets, servers, the server dialog and the page', 'mcps-page.js', 'function po(e){return e.transport==="std',
      '0,a.jsx)(go,{accountId:n,servers:i})]})}', '72f4d17987b5c18d4db52e6a962826c27f42cc78b24810056f54f8dd68e68895', 19833),
  ],
  // The connect provider dialog in three passes. vendor/provided/provider-cli/integration.mjs owns the
  // CLI rows (In, Sn, auxCliDialog), the reserved provider IDs (Ve) and the dialog list (Rn); the
  // OAuth sign-in flow its edits left unreachable stays supplied.
  'assets/connect-dialog-CacgpFap.js': [
    block('Connect dialog: the dialog parts and API key providers', 'connect-api-keys.js', 'Ae=(0,d.createContext)(null),P=({provider:',
      'udio",baseUrl:"http://localhost:1234/v1"}}', '0727f5c05cca2a7da2b7280ad17f93ec6f230f2194f2c6bf1af2e9f875a82d07', 13695),
    block('Connect dialog: custom JSON providers, Ollama and LM Studio', 'connect-local-custom.js', 'on=j().min(1).refine(t=>!Ve.has(t),{messag',
      '.providerName}`)}},isPending:l.isPending}}', 'babf837e322035d86253cca1c7d3a56e9b73e5341b18b83ea896dbdca578ff5b', 11618),
    block('Connect dialog: every provider dialog', 'connect-dialogs.js', 'var cs=()=>(0,e.jsxs)(e.Fragment,{children:[',
      'n,{}),(0,e.jsx)(Rn,{}),(0,e.jsx)(hn,{})]})', '9ce8cb95f423a97737a5a12f3949ab59965f73351bac8ae299ed40354dcdb24f', 488),
  ],
  // Model select in three passes; the launch policy at the top of the chunk belongs to
  // vendor/provided/provider-funded-launch.mjs (the provider reads it).
  'assets/model-select-BvZsM1Kl.js': [
    block('Model select: the Ultrabrowse switch and label', 'model-select-ultrabrowse.js', 'Ve=({checked:r,disabled:o,onCheckedChange:',
      'Me=(0,d.createContext)(null),se=new WeakMap', '1b0c38aae840534eb8bed3d311911a3627692060e0b6e9f4d07b9bbd3fad24d5', 3420),
    block('Model select: the provider', 'model-select-provider.js', 'vr=({value:r,fallbackValue:o,modelCatalog:',
      'kingOpenChange:B,onChange:k},children:N})}', 'd67a5b1ae77b50a6a8b3487a0e94577355e1cb147f1212bf136dbe74b1489bdb', 2885),
    block('Model select: shortcuts, the model menu and the thinking menu', 'model-select-menus.js', 'br=({thinking:r=!0})=>{const o=(0,d.useRef)',
      'Levels),fastMode:r.supportsFastMode?o:!1})', 'd9ba8bcc2f124143063f7c32cbb35936b7fdabba0df75939218e7d8c7a8d50f8', 9585),
  ],
  'assets/skills-CfSQ7MCw.js': [block('Plugins › Skills', 'skills-page.js', 'Pe=({size:s=24,ariaHidden:i=!0,...a})=>(0,',
    't.isPending,children:"Create"})]})]})})})}', 'd55787adc117d697628f88f900e2e2e0cc9a6eff3d5e9a15b4a1e0450df18a3a', 9748)],
  'assets/_skillId-CAwCRjA8.js': [block('A skill\'s page', 'skill-page.js', 'nt=({size:t=24,ariaHidden:i=!0,...s})=>(0,',
    '-0",children:(0,e.jsx)(pt,{})})})]})})]})}', '0e9e90ae637b2064952e5435291191f9198a22c819949d34d107d9e1f693254a', 14792)],
  'assets/skill-activation-fields-wmmVsYeN.js': [block('Skill activation fields and helpers', 'skill-activation.js',
    'var I=/^---\\r?\\n([\\s\\S]*?)\\r?\\n---\\r?\\n?/,T=new S', ',t.length>0?t.join(" · "):"Manual only"}',
    'd068debd65677704927c4f155f8021db62f5b3fb860984f641593dd97829cdd7', 4137)],
  // The app shell: only its UI. The router and route table, whose guards and redirects belong to
  // vendor/provided/native-ui-compat.mjs and scripts/lib/provided-password-manager-scope.mjs, stay supplied.
  'assets/extension-main-Dz1-AsCT.js': [
    block('App root providers', 'app-root.js', 'function Ct(){return(0,i.jsxs)(Ne,{attri', '(0,i.jsx)(Tt,{}),(0,i.jsx)(Ut,{})]})]})}',
      '1df23e1d4867f4016288fe4d6e140faba0e29cdb5fd554d2a17ef27c90714063', 486),
    block('Settings page placeholder', 'settings-pending.js', 'function $o(){const e=it();return(0,i.js', 'ssName:"h-3 w-4/5"})]},r))})]})]})})]})}',
      '5e06bfdab3f15d50fdfda1819ada8379ac88813a1a34631b31d80f76d5fab0f9', 1190),
    block('Memory index status', 'memory-index-status.js', 'ui=()=>{const e=tt(),t=Xe(),{userId:r}=m', 'dedBytes,max:e.totalDownloadBytes}:null}',
      '87620a4bd2ea5187690fb23582eb81669f7bd1325c0ff151bf2ac356aa65e2e2', 2942),
  ],
  // Assistant steps and the turn fold, around the bundled Radix controllable-state hooks.
  'assets/turn-fold-B4gN_g5e.js': [
    block('Assistant steps and subagent rows', 'turn-steps.js', 're=({size:e=24,ariaHidden:n=!0,...r})=>(0,',
      'te pt-0.5 text-[13px]",children:o})]})]})}', '7e1672fce77ad3e7c59d59a6fe7ec035701ce45da545c891c0d40b658f6bbd85', 4794),
    block('The turn fold', 'turn-fold.js', 'le=({children:e,open:n,defaultOpen:r=!1,on', 'st be rendered inside TurnFold");return e}',
      'e3ca5e08f3c4f43693e99baf2e7499e81c23871e7dbefd7d75a6dd5c4421d7da', 1450),
  ],
  'assets/update-banner-C_z-hMCt.js': [block('New Tab update banner', 'update-banner.js', 'var g=j(I(),1),N=f({version:s(),minVersion',
    'm:-24,right:-12,transition:{duration:.1}}}', '3cd433acf30e361610d61ac4ec48c3a4c6791df8c772689d457367296fdc29c7', 4684)],
  'assets/copy-button-C-CFkoWv.js': [block('Copy button', 'copy-button.js', 'k=({size:t=24,ariaHidden:n=!0,...r})=>(0,e',
    '??(0,e.jsx)(j,{})},r?"copied":"copy")})})}', 'b97098a9e0b08dcbc2232061f607062e034ba325a63700cb3cf2d6d03e8a1d33', 1792)],
  // The onboarding splash: its icons and the hero. The bundled motion inView hooks, the Aux wordmark
  // (scripts/lib/provided-ui.mjs brands it), the email code step and the sign-in pane stay supplied.
  'assets/splash-D666ivBP.js': [
    block('Splash icons', 'splash-icons.js', 'ze=({size:s=24,ariaHidden:a=!0,...t})=>(0,', '11.4477 3 12 3Z",fill:"currentColor"})})',
      '9ecbdb057cdc29c18d3c680074aeeffabf32bb4bf68e2f4f50581a23fbd9c987', 9644),
    block('Splash hero', 'splash-hero.js', 'qe="/assets/background-BriNwY3v.webm",R1=y', '",children:(0,e.jsx)(g2,{})})})]})})})]})}',
      '2aa3930d5449787cbca39fe3f13fc75ccbad705ddd707b95658ca98e6896ea55', 51642),
  ],
  // Tool definitions, by family: the step icons, the summaries, the step rows and the cards. The bundled
  // strip-ansi, syntax highlighter and diff renderer stay supplied; the embedded Aux mark (Sp, Lp, wp)
  // between the last two passes belongs to scripts/lib/provided-ui.mjs.
  'assets/tool-definition-registry-Cc6FCFb2.js': [
    block('Tool step icons', 'tool-icons.js', 'ro=({size:e=24,ariaHidden:t=!0,...n})=>(0,',
    '5 9.43262 2.25Z",fill:"currentColor"})})', 'a9aad28e077a3f05212c83a6b4fe9cc7cdf191006234ecb8694d3af6cd3d48bc', 20894),
    block('Tool states, terminal and memory search cards, schedules and step summaries', 'tool-summaries.js', 'var Ha=e=>e==="loading",Ne=e=>e==="error',
      '])*`|\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*/g," ");', 'c471a763a282729351553ec0a857fc09e31094b9ee49d6f1fe0e3667c76a5497', 24096),
    block('Browse classification, routine fields, the tool runtime, step titles and icons', 'tool-steps.js', 'function Cg(e){const t=vi(e),n=po(e.code',
      'nded-[3px] object-contain",onError:r})};', 'd1caaf1b7beb6bea3f1ccccbf4a91e14df2163f5a449c799251e35068d5b01ba', 6586),
    block('Diff, history, MCP, memory, notification, REPL and routine cards', 'tool-cards.js', 'var Ms={theme:{dark:"pierre-dark",light:',
      'pandMode:"none",footer:Ep,standalone:!0}', 'cc46ce364e24178a35759a217bd1811708122429e98f9eb119e14c0a7dbe6127', 10359),
    block('Aux Code handoff, web fetch, web search and to-do cards, and the registry', 'tool-registry.js', 'kp=({title:e,prompt:t,status:n,onOpen:i}',
      '=(e,t)=>e?(0,j.createElement)(e,t):null;', '932af1b3be4351a5c4543d211d4f68cb3a20152dcfa4e03d5fe46b32419de587', 6250)],
  // vendor/provided/agent/integration.mjs drops the default-browser nudge's small Aux mark first.
  'assets/nudges-7TFAp4B-.js': [block('New Tab nudges', 'new-tab-nudges.js', 'var c=A(S(),1),e=j(),o="new-tab",L=()=>{',
    '(i)}),n==="hidden"&&(0,e.jsx)(L,{})]})};', 'ef340de832ed2fb142c094068d251e02fba985c9f871242b15405f6a62367f7a', 1642)],
  'assets/error-alert-Bu3EEewB.js': [block('Chat error alert', 'error-alert.js', 'var t=h(),I=({size:r=24,ariaHidden:e=!0,',
    'eric"&&e.reportable&&(0,t.jsx)(T,{})]})}', '26ed1281abeeb6fee31e9ebfb32f0c448c498eb79afd341a311c0ede41d54a5b', 4841)],
  'assets/file-tree-YTG8I4Hr.js': [block('File tree', 'file-tree.js', 'var r=H(),E=({size:s=24,ariaHidden:t=!0,',
    '));return e},F=s=>s.endsWith(".md")?M:E;', '3af3c357f280965efd55825651707da97b6063ace756da0e9d1611ceb9eb935d', 4353)],
  'assets/voice-dictation-overlay-CtbBZWfm.js': [block('Voice dictation', 'voice-dictation-overlay.js', 'var l=D(),F=({size:o=24,ariaHidden:n=!0,',
    '(0,l.jsx)(F,{className:"size-4"})})]})};', '9a1733b60a1d06fe14ab5c7678a6f35a8ea794192e499f9e773e31ead4bc6eeb', 5101)],
  'assets/capture-toolbar-HNeL44hk.js': [block('Capture toolbar', 'capture-toolbar.js', 'var t=E(),L=({size:e=24,ariaHidden:s=!0,',
    'n e)?!1:e.type==="CAPTURE_TOOLBAR_SYNC"}', '55271c6196ef4813ad17def3775ddff80d57c7c2167ec3588daceaddf1db41e2', 5928)],
  'assets/full-disk-access-BmnWkbG2.js': [block('Messages access', 'full-disk-access.js', 'var D=C(h()),s=g(),N=e=>(0,s.jsxs)("svg"',
    ' continue."}),size:"default"})]}):null};', '5e43b59a75248771a13fa4b32b0b2e5e58b4f73cef3943f23af3db836feeed31', 4595)],
  'assets/inbox-BIWs6dWb.js': [block('Notification Use settings', 'inbox.js', 'var e=N(),f=new Set([K,typeof chrome<"u"',
    'on:"&&f.has(r.hostname)}catch{return!1}}', '3974896101dc61255a13f04e1213b58ffd7db76120bf099c60afd85c2bf8e194', 4142)],
  'assets/statistics-CsvIURox.js': [block('Statistics settings', 'statistics.js', 'var y=w(C()),e=O(),g=11,q=2,M=13,Y=7;fun',
    ')("span",{children:"More"})]})]})})]})};', '9211fd90ccf86ad35cac79ab8c140a6205f73817729a30a8e8e0c2197ca163d8', 4253)],
  'assets/archived-chats-BgWKiXTB.js': [block('Archived chats settings', 'archived-chats.js', 'var b=D(E()),e=T(),v=20;function ye(){co',
    'ewText?W(G(s.previewText),100):void 0});', '75f04590fa9c404f4c6c769c9a947ca0831c07e6ba6c5119022d850275b2a376', 3752)],
  'assets/search-view-gCFKEZ8L.js': [block('New Tab search suggestions', 'search-view.js', 'var p=W(G(),1),oe=new RegExp("\\\\p{M}+","',
    'ew Promise(e=>{window.setTimeout(e,0)});', '944c1cb7667b1bb3e59c4c6ac898557693fd71fc72106f8f6f65ba71eb6880ce', 8984)],
  // The preview between these two blocks stays supplied: its Copy and Download are
  // vendor/provided/aux-productivity-capture.mjs's error toasts and native save dialog.
  'assets/capture-result-nUfmrYC9.js': [
    block('Capture result: file name, data URL, route and frame', 'capture-result-frame.js', 'function $(e=new Date){const t=s=>String',
      'sible p-4 pr-5 pb-7",ref:s,children:e})}', '651c277aa4699634c9ca463ffc0ad442e89db5489ab145a03ebc543950ed7ac5', 1044),
    block('Capture result: the preview button and its message check', 'capture-result-button.js', 'p=({"aria-label":e,label:t,onClick:s,chi',
      'SYNC"||e.type==="CAPTURE_RESULT_LANDED"}', 'c12d62040f3361b68df45d21acf27727935684c2bc277d3aaef2c73e0ad80bca', 392),
  ],
  'assets/use-browser-importer-GNOc7eYC.js': [block('Browser importer', 'use-browser-importer.js', 'var f=B(K(),1),L="/assets/grant-permissi',
    '"file",accept:".zip",onChange:o})]})})};', 'b7744aa82b2e0f9cebf8aba20511179d3ba0e0e3453487e79609a70623f208d3', 6521)],
  'assets/import-browser-DwQpkFpc.js': [block('Onboarding browser import', 'import-browser.js', 'var h=A(z(),1),e=O(),V=({browsers:a,init',
    'd:a,onClick:n,children:"Next"})})]})})};', '114e794433fe432a83a1f8eac15e1215679ad36352b9f281ff4214ce980deed1', 7602)],
  'assets/chat-preview-card-J0uel3r2.js': [block('Chat preview card', 'chat-preview-card.js', 'var k=F(L(),1),Ae="/assets/page-curl-top',
    '&(e.kind==="document"||e.kind==="html")}', '89d4cdb12d797f1e81b5e966bbbf009fada2fc0f91dfabdb74e68e0574ad6a0f', 12213)],
  'assets/lasso-Chg_FuP-.js': [block('Selection popup', 'selection-popup.js', 'var l=X(J(),1);function Ee(e,s){const r=',
    '(0,t.jsx)("span",{children:"Apply"})})};', 'ad1c029216d284002eea81763eb5d2be96aaef0e429c42607a01889a803dc12c', 11004)],
  'assets/lasso-LoarCzmz.js': [block('Lasso settings', 'lasso-settings.js', 'var t=ke(),me=({size:e=24,ariaHidden:n=!',
    ')(ct,{}),children:(0,t.jsx)($t,{})})]})}', '862273d293fb03e9153bfa70aba79291bea343cb20c1da9eb4be8f8006e29742', 19204)],
  'assets/provider-Cw0zhujt.js': [
    block('Session icons', 'session-icons.js', 'xa=({size:e=24,ariaHidden:t=!0,...n})=>(',
      '13.5 9.5H10.5Z",fill:"currentColor"})});', 'a26a3532b8a0ad98da2fe2171181d71a675a853db1cafb44c8c8840b5a8d4f1e', 7318),
    block('Session side panel', 'session-sidepanel.js', 'var Fi={open:"480px"},et=e=>`side-chat-$',
      'rovider");return e},Ct=()=>(0,c.use)(wt)', '2b25989418825bb0348475c98d8ad4c7f78c48d2ca293f8cdc1f81514ee5a7f5', 4377),
    block('Composer permission menu', 'permission-menu.js', 'Bi=({render:e,variant:t="default",mode:n',
      'pan",{children:"Password access"})]})]})', 'b7e38c8fce3b29121dafedaa23a4786e2b660e828e1b88344893e3f5c8d26dcc', 4327),
    block('Routine dialog: advanced settings', 'routine-advanced.js', 'Ki=({environment:e,deviceName:t,isCurren',
      'assName:"size-4"})]},b.id))]})]})]})]})}', '95b19881a21c41d69099a431d1b2805cf6b55eba8d9b70fbdac22d12bb7bb037', 6054),
    block('Composer model and thinking controls', 'model-select-controls.js', 'Yi=({children:e,className:t})=>{const n=',
      '{children:Lt("Meta+Shift+.")})]})]})]})}', '5d2b245399c782b3b4838454a850c73e9e46ddab597750bcdcd2c390323571c2', 4019),
    block('RichInput compound parts', 'rich-input.js', 'zn=(0,c.createContext)(null),Ee=()=>{con',
      'wId===n&&(e.promise=void 0)}),e.promise}', '24f67e292581093cff7795d8445883edab40acd73ac9670aa1944a12457adb98', 3474),
    block('Mention menu', 'mention-menu.js', 'fo=async({commandCandidates:e,query:t,ru',
      'right"),children:s.description??""})]})}', '9d3dd5b7a534e4880b2237ba3015f4e3e1d85e4c05274d8ef0e7b137031a34c1', 4689),
    block('RichInput editor and suggestion popup', 'rich-input-editor.js', 'bo=(e,t,n,s)=>{const a=new ua;return{all',
      'ne runs. Use $ to mention skills."})]})}', '187596a076680147b3f62ae8489675d93b4c1a8ff3656186b600aaf490bcce8b', 3601),
    block('Routine schedule', 'routine-schedule.js', 'jo=Array.from({length:96},(e,t)=>t*15),M',
      'Routine:s,deleteRoutine:a,runRoutine:i}}', '50dcba63d1501fa84f76e7195ae9e749e57a9fb6756cb939aaa04117cdb882e8', 12232),
    block('Routine dialog', 'routine-dialog.js', 'Wo=M({environment:N("device"),projectId:',
      'nId:i},replace:l?.replace})},[n,t,e,a])}', 'c9bd9103134fbf5dd6c72e437baf9cf3224151d2beff0a86c92a26f98204897c', 8037),
    block('Subagent and coder status', 'subagent-status.js', 'var It=({preview:e})=>e!==void 0&&(e.sta',
      'k:l.openAuxCode}):void 0,children:o})})}', '5fec755b792366b5a363cb059c8299f988f29b5cefe464e7a7dd3a2ef2f90120', 5679),
    block('Tool card runtime', 'tool-card-runtime.js', 'll=({children:e,path:t,tooltip:n=!0})=>{',
      'port==="streamable-http"?l.url:m?.url})}', '29bf876cc13cbe9f11eadef85ce0cdbf17b2b4a12ba47c772e54581e67f2b6d9', 3420),
  ],
  'assets/project-list-BmtBNv8P.js': [
    block('Project list', 'project-list.js', 'U=({accountId:s,projects:t,userId:i})=>(',
      ';return t.isValid()?t.format("LL"):"—"};', '35a78ed2d11dd46c976a5476a00a288f841152926e367f32743c74a246087947', 2668),
  ],
  'assets/session-feedback-dialog-BjDg0W8m.js': [
    block('Session feedback dialog', 'session-feedback-dialog.js', 'var Y=g(v(),1),e=S();function G(){const ',
      'n",{children:"Submit"})]})]})]})})})})};', '7738b42b511ba64a201614870de4593ceff3cba57d40d0b3417cdc6e04387980', 2261),
  ],
  'assets/coding-agent-nudge-Cy9BtLdb.js': [
    block('Coding agent nudge', 'coding-agent-nudge.js', 's=k(),I=({children:e,className:n,dismiss',
      'rget:u,handleConnect:C,handleDismiss:w}}', '59553210ecd019381efdf30cc931e6c051d16ae829beb0ba381e4d2b739c6cfb', 5320),
  ],
  'assets/avatar-iEt_J7Lk.js': [
    block('Avatar', 'avatar.js', 'p=t.createContext(void 0);function k({cl',
      'em,44cqi,2rem)] leading-none",r),...e})}', '97db20fe91c9035f44e49e95882e743672866c34bfb2cdef44547a632aa72eb1', 1290),
  ],
  'assets/route-DMfKuXmY.js': [
    block('Settings scroll layout', 'settings-scroll-layout.js', 'var i=_(N(),1),t=R(),B=1,O=.2,P=({viewpo',
      'x)(P,{viewportRef:s,contentRef:d})]})})}', '861998f23282d243dcee739bbe295dbc6d915aca0eaa043b3693883580e7171d', 3048),
  ],
  'assets/route-DI45z3OR.js': [
    block('Side panel route', 'sidepanel-route.js', 'var i=m(u()),n=h();function _(){L();cons',
      ',"data-chat-drop-zone":"",children:t})};', '7a74ac8657acb38865da18e65e0e306736c00aea7b7d1e392834e192d416dca7', 1342),
  ],
  'assets/done-DPzI9pFd.js': [
    block('Onboarding: done', 'onboarding-done.js', 'var e=J(),Ze=({size:t=24,ariaHidden:a=!0',
      '},transition:{duration:.2},children:t});', '7f41f568618c8557024ae8a92cbca7cede9e1988333b8fd7a0d7d5e4059fa2fb', 14590),
  ],
  'assets/_projectId-DW8jDyV7.js': [
    block('Project page', 'project-page.js', 'var p=ne(oe(),1),e=ie(),Ns=b("/_web/(pro',
      '"size-4 shrink-0",!r&&"invisible")})]});', 'b452a4fd6cd4dca4c1264f56e8eae490e0d00351cb11c038a4d0a2e9745fa926', 18947),
  ],
  'assets/new-DS2pRmiw.js': [
    block('New task page', 'new-task-page.js', 'var i=u(d(),1),e=m(),E=({projectId:s,onP',
      'onProjectIdChange:n,onSessionChange:r})}', '1d80f88edb20b38bb8e9fd396e7f1880de19069c04f6f7b9f451e47847b6a8e6', 1628),
  ],
  'assets/mini-popup-BBLwe-a8.js': [
    block('Mini popup settings', 'mini-popup-settings.js', 'var k="/assets/aux-mini-popup-DpI8c-u_.w',
      'nding,onCheckedChange:j})]})]}),v()]})};', '84cca5ef1a1d9ae98c38aa220e4f4870fc5dc90899baa60a0ae16b4e9c304317', 2215),
  ],
  'assets/detect-tools-Bq1QGFUu.js': [
    block('Detect tools', 'detect-tools.js', 'var e=o();function N(){const t=c(),{data',
      ' text-xs leading-tight",children:t})]});', '046ff2c39bdef399d130cf989bf3e2885adf7f1e0d405d9e162af6c6cc49167a', 1218),
  ],
  'assets/mini-popup-shortcut-field-zmtLA1sg.js': [
    block('Mini popup shortcut field', 'mini-popup-shortcut-field.js', 'var t=d(),D=({value:e,isMacOS:o,disabled',
      'children:"Reset to default"})]})]})]})};', 'da7de287fc1e8f455bb18f4b9aee7fb594f8aa872dd2f50a50d3f2bbf90ecbb9', 841),
  ],
  'assets/action-confirmation-artifact-BOdmqe64.js': [
    block('Action confirmation artifact', 'action-confirmation-artifact.js', 'var s=g(),S=({artifact:e,className:r,com',
      'xisting"} / ${r}`:"Creates a new skill"}', '8ef31d63a748efd969249bed20dca958e48f7e52907af1d89f05f1b0cd4b3295', 2921),
  ],
});

/** Supplied name → Aux name for the module bindings a route renamed (the parity tests compare them
 * in pairs); routes/names/<route file>.json. */
export const renamedBindings = chunk => (ROUTES[chunk] ?? []).reduce((all, {file}) => {
  try {
    return {...all, ...JSON.parse(readFileSync(new URL(`./routes/names/${file.replace(/\.js$/, '.json')}`, import.meta.url), 'utf8'))};
  } catch (error) {
    if (error.code === 'ENOENT') return all;
    throw error;
  }
}, {});

/** Theme consistency changes in the routes: [route file, supplied class, Aux class]. A hovered
 * Settings row used a fixed neutral-100 in light mode; --muted follows the Space tint. */
export const TOKEN_CHANGES = Object.freeze([
  ['settings-layout.js', 'hover:bg-neutral-100', 'hover:bg-muted'],
  // The channel chat's unread line was a fixed blue; the unread dots beside it already use the brand token.
  ['conversation.js', 'text-blue-500 select-none dark:text-blue-400', 'text-brand-content select-none'],
  // The mini popup's session composer card used a fixed 16px corner; rounded-xl is the scale's 12px
  // step (16.8px with the squircle, so it looks the same and now follows the scale).
  ['minipopup.js', 'rounded-[16px]', 'rounded-xl'],
  ['appearance-settings.js', 'text-sm text-red-500', 'text-destructive text-sm'],
  // The file preview's Open with buttons were fixed white with neutral hovers and no dark mode.
  ['composer-attachments.js', 'border-neutral-200 bg-white hover:bg-neutral-100', 'border-border bg-background hover:bg-muted'],
  ['composer-attachments.js', 'aria-expanded:bg-neutral-100', 'aria-expanded:bg-muted'],
  // The composer card and its queue, question and drop surfaces: the 12px step, like the mini popup composer.
  ['composer-toolbar-model.js', 'rounded-2xl', 'rounded-xl'],
  // The usage warning takes the same step; the notice drawn under the composer card tucked under and
  // curved around the card's old 16px corner, so it follows the card to 12px.
  ['composer-notices.js', 'rounded-2xl', 'rounded-xl'],
  ['composer-notices.js', '-mt-[var(--radius-2xl)]', '-mt-[var(--radius-xl)]'],
  ['composer-notices.js', 'inner-curved-shape-bottom', 'inner-curved-shape-bottom [--_r:var(--radius-xl)]'],
  // The conversation's error row: the 12px step too.
  ['composer-conversation.js', 'rounded-2xl', 'rounded-xl'],
  // The remote-control status box on the Developers page used a fixed neutral-100 in light mode.
  ['developers-settings.js', 'bg-neutral-100', 'bg-muted'],
  // A hovered routine row used a fixed neutral-100 in light mode, unlike every other settings row.
  ['routines-settings.js', 'group-hover/routine:bg-neutral-100', 'group-hover/routine:bg-muted'],
  // The New Tab confirmation card took the 16px step; the task cards beside it use the 12px one.
  ['new-tab-tasks.js', 'rounded-2xl', 'rounded-xl'],
  // The channel settings dialog overrode the dialog corner with the 16px step; the required mark was a fixed orange.
  ['channels-connections.js', 'rounded-2xl', 'rounded-xl'],
  ['channels-setup.js', 'text-orange-500', 'text-destructive'],
  // General's import summary card: the 12px card corner.
  ['general-settings.js', 'rounded-2xl', 'rounded-xl'],
  // The Share dialog's options were fixed white with a neutral hover in light mode.
  ['task-session.js', 'hover:bg-neutral-100', 'hover:bg-muted'],
  ['task-session.js', 'rounded-none bg-white', 'rounded-none bg-background'],
  // The artifact in an action confirmation used a 14px corner off the scale.
  ['chat-input-prompts.js', 'rounded-[14px]', 'rounded-xl'],
  // The connect dialog's required marks were a fixed orange, like the channel setup ones were.
  ['connect-local-custom.js', 'text-orange-500', 'text-destructive'],
  // A hovered skill row used a fixed neutral-100 in light mode, unlike the settings rows around it.
  ['skills-page.js', 'hover:bg-neutral-100', 'hover:bg-muted'],
  // The update banner card: the 12px card corner.
  ['update-banner.js', 'rounded-2xl', 'rounded-xl'],
  // The notification card and the image generation placeholder: the 12px card corner. The notification's
  // app tile was fixed white with a black mark in both modes; it takes the page surface and text.
  ['tool-cards.js', 'rounded-2xl', 'rounded-xl'],
  ['tool-cards.js', 'bg-white', 'bg-background'],
  ['tool-cards.js', 'text-black', 'text-foreground'],
  // A chat error card: the 12px card corner (its compact form already used it).
  ['error-alert.js', 'rounded-2xl', 'rounded-xl'],
  // The Agent panel mirrors the sidebar (Arc-style): the native window leaves a 6px gutter on both
  // sides of the panel, as it does around the sidebar's rows. The composer card fills the panel's
  // width (its 12px side padding goes), so it sits on that gutter like a sidebar row; the header
  // title, the conversation text and the composer's footer controls sit 8px in, in line with the
  // composer's text, like the sidebar's labels inside their rows. The mini popup and New Tab
  // composers keep theirs.
  ['agent-panel.js', 'pb-1', 'px-0 pb-1 *:data-model-select-shortcuts:px-2'],
  ['agent-panel.js', '**:data-[agent-session-ui="chat"]:px-4', '**:data-[agent-session-ui="chat"]:px-2'],
  ['agent-panel-header.js', 'pt-0.5 pr-2 pl-2', 'px-0 pt-0.5'],
  // The selection popup: the 12px popover corner, and its field's fill follows --muted in light mode.
  ['selection-popup.js', 'rounded-3xl', 'rounded-xl'],
  ['selection-popup.js', 'bg-neutral-100', 'bg-muted'],
  // The task card's images, tab preview and placeholder used fixed 12px and 14px corners; the card uses rounded-xl.
  ['chat-preview-card.js', 'rounded-[12px]', 'rounded-xl'],
  ['chat-preview-card.js', 'rounded-[14px]', 'rounded-xl'],
  // The onboarding browser tiles and their placeholders: the 12px card corner.
  ['import-browser.js', 'rounded-2xl', 'rounded-xl'],
  // The New Tab search suggestions popup took the 16px step; popovers use the 12px one.
  ['search-view.js', 'rounded-2xl', 'rounded-xl'],
  // The dictation overlay's pill was a fixed neutral-100 in light mode; dark mode already took --secondary.
  ['voice-dictation-overlay.js', 'rounded-full bg-neutral-100', 'rounded-full bg-muted'],
  // The composer's mention menu dropped to 8px at its small size; it is a popover, so it keeps the 12px step.
  ['mention-menu.js', 'rounded-xl p-1.5 shadow-lg data-[size=sm]:rounded-lg', 'rounded-xl p-1.5 shadow-lg'],
  // A Project's Instruction and Files cards took the 16px step; cards use the 12px one.
  ['project-page.js', 'border-border rounded-2xl border', 'border-border rounded-xl border'],
  // The Detect tools site tiles: the 12px card corner.
  ['detect-tools.js', 'size-16 rounded-2xl', 'size-16 rounded-xl'],
  // The artifact in an action confirmation takes the 12px card corner, like the frame around it.
  ['action-confirmation-artifact.js', 'bg-surface-primary w-full overflow-hidden rounded-lg', 'bg-surface-primary w-full overflow-hidden rounded-xl'],
]);

export const readRoute = file => readFileSync(new URL(`./routes/${file}`, import.meta.url), 'utf8');

export function integrateRoutes(chunk, text) {
  const blocks = ROUTES[chunk];
  if (!blocks) throw Error(`Agent routes: no blocks for ${chunk}`);
  return replaceBlocks(text, blocks, `Agent routes ${chunk}`, ({file}) => readRoute(file));
}
