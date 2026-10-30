/** Release-time integration of the Agent extension's Aux-owned source (browser-excellence plan,
 * Batch 10 item 7). Each sealed block it replaces is pinned by its anchors, length and SHA-256 and
 * replaced in place, so the order around it holds and every other byte stays as supplied.
 * scripts/release/transforms.mjs applies it after every other edit to the same files; any drifted
 * block stops the release.
 *  - Step 1, styles/: the globals CSS design tokens, UI fonts and base element styles.
 *  - Step 2: the New Tab first-paint tokens and fonts (styles/newtab-first-paint.css), and the
 *    shared components (components/), each replacing its sealed definitions with the same exported
 *    names, props, classes and behavior, except the corner changes listed in CORNER_CHANGES. */
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
const ADDED_UTILITIES = ['.rounded-b-xl{'];

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
