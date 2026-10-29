/** Release-time polish for the Cmd+T/K/L command bar (the supplied tab search with the Aux
 * navigation adaptations already sealed in). Exact, count-checked edits applied by
 * scripts/release/transforms.mjs; any drifted anchor stops the release. */
import {applyExactEdits} from '../provider-cli/integration.mjs';

export const CHUNK = 'assets/tabsearch-3k_2hgil.js';

const edit = (name, find, replace, count = 1) => Object.freeze({name, find, replace, count});

/** A single word with a dot, colon or slash (or localhost) opens; anything else searches. */
const looksLikeUrl = "/^\\S+$/.test(text)&&/[.:/]|^localhost$/i.test(text)";

export const EDITS = Object.freeze([
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
]);

export function integrateCommandBar(text) {
  if (text.includes('spellCheck:false,autoCorrect:"off"')) throw Error('Command bar polish: the palette is already integrated');
  return applyExactEdits('command bar', EDITS, text);
}
