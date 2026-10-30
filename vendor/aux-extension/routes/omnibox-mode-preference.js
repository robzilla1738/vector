/* Aux-owned source: the New Tab omnibox mode preference (assets/omnibox-mode-preference-CWzOtieV.js):
 * whether the New Tab omnibox opens in Search or Ask, remembered in local storage (Search by default).
 * Names the rest of the chunk uses keep their chunk names (all exported): o parseMode, t readMode,
 * n writeMode, d resolveMode. */
var MODE_KEY = 'aux.new-tab.omnibox-mode.v2',
  DEFAULT_MODE = 'search' /** A stored mode, if it is one. */,
  o = e => (e === 'ask' || e === 'search' ? e : void 0) /** The remembered mode, or Search. */,
  t = () => {
    if (typeof window > 'u') return DEFAULT_MODE;
    try {
      return o(window.localStorage.getItem('aux.new-tab.omnibox-mode.v2')) ?? 'search';
    } catch {
      return DEFAULT_MODE;
    }
  } /** Remembers a mode. */,
  n = e => {
    if (!(typeof window > 'u'))
      try {
        window.localStorage.setItem(MODE_KEY, e);
      } catch {}
  } /** The given mode, or the remembered one. */,
  d = e => o(e) ?? t();
