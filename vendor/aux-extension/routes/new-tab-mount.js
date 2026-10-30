/* Aux-owned source: how the New Tab page mounts (assets/newtab-CnOLQ0yu.js). This block starts
 * inside the chunk's `var` list after the omnibox (Rn). React waits for the omnibox editor that
 * newtab.html already painted, then wraps it in the page context, renders the omnibox controls and
 * the incognito notice into the page's slots, and lazy-loads the page body (the island).
 * A New Tab opened on another extension route (a #/path) is sent to that page instead.
 * Names kept for the chunk: Mn NewTabShell, Ke redirectOffNewTab.
 * Chunk names used: n React, f JSX runtime, kt cn, Kt react-dom/client, Ut NewTabProvider,
 * Ve useNewTab, Ft IncognitoNotice, Rn the omnibox, Be Portal, Y the omnibox handle, ge preload,
 * Rt the page setup, Lt extensionPageUrl. */
Mn = ({children, initialInput = ''}) => {
    const {browserMode} = Ve();
    const [input, setInput] = (0, n.useState)(initialInput);
    const incognito = browserMode === 'incognito';
    return (0, f.jsxs)(f.Fragment, {
      children: [
        (0, f.jsx)(Be, {root: '#new-tab-react-omnibox', children: (0, f.jsx)(Rn, {input, onInputChange: setInput})}),
        incognito && (0, f.jsx)(Be, {root: '#new-tab-header', children: (0, f.jsx)(Ft, {})}),
        (0, f.jsx)('div', {className: kt('contents', incognito && 'dark'), children}),
      ],
    });
  },
  NewTabIsland = (0, n.lazy)(() => ge(() => import('./island-C0ouZ54e.js').then(module => ({default: module.NewTabIsland})), __vite__mapDeps([176,1,25,26,11,12,13,14,23,24,27,4,28,7,29,30,18,17,31,32,33,34,35,36,37,38,15,39,40,41,42,43,44,45,46,47,48,49,50,19,51,54,55,56,57,58,177,88,135,178,179,117,96,130,162,79,180,181,16,175])));
Rt();
var mountNewTab = root => {
    (0, Kt.createRoot)(root).render((0, f.jsx)(WhenOmniboxReady, {}));
  },
  WhenOmniboxReady = () => {
    const [ready, setReady] = (0, n.useState)(() => !!Y());
    return (0, n.useEffect)(() => {
      const markReady = () => setReady(true);
      return window.addEventListener('aux-omnibox-input-ready', markReady), Y() && markReady(), () => window.removeEventListener('aux-omnibox-input-ready', markReady);
    }, []), ready ? (0, f.jsx)(NewTabRoot, {}) : null;
  },
  NewTabRoot = () => {
    const omnibox = Y();
    const mode = (0, n.useSyncExternalStore)(omnibox.subscribe, () => omnibox.mode);
    return (0, f.jsx)(Ut, {
      omniboxMode: mode,
      onOmniboxModeChange: omnibox.setMode,
      children: (0, f.jsx)(Mn, {
        initialInput: omnibox.getSnapshot().plainText,
        children: (0, f.jsx)(n.Suspense, {fallback: null, children: (0, f.jsx)(NewTabIsland, {})}),
      }),
    });
  };
if (!Ke()) {
  window.addEventListener('popstate', Ke, {capture: true}), window.addEventListener('hashchange', Ke, {capture: true});
  ge(() => import('./error-tracking-B1YG2RRM.js').then(module => module.a).then(module => module.installAgentManagerErrorTracking('newtab')), __vite__mapDeps([25, 1, 26, 11, 12, 13, 14]));
  const root = document.getElementById('root');
  root && mountNewTab(root);
}

/** Sends a New Tab opened on another extension route to that page; true when it did. */
function Ke(event) {
  const hash = window.location.hash.slice(1);
  const route = (hash.split(/[?#]/)[0] ?? '').replace(/\/$/, '');
  return route === '' || route === '/new-tab' ? false : (event?.stopImmediatePropagation(), window.location.replace(Lt(hash)), true);
}
