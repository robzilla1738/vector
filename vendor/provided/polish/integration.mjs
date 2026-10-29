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

/** Edits per extension chunk, relative to dist/. */
export const EDITS = Object.freeze({
  'assets/tabsearch-3k_2hgil.js': Object.freeze(COMMAND_BAR),
  'assets/general-3dgRbrRk.js': Object.freeze(SETTINGS),
  'assets/appearance-Ceuw3-j6.js': Object.freeze(APPEARANCE),
  'assets/use-shortcut-capture-DGr8Ws5Z.js': Object.freeze(SHORTCUTS),
});

export function integratePolish(chunk, text) {
  const edits = EDITS[chunk];
  if (!edits) throw Error(`Polish: no edits for ${chunk}`);
  return applyExactEdits(`polish ${chunk}`, edits, text);
}
