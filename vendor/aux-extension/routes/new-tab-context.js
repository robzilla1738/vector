/* Aux-owned source: the New Tab page's context, incognito notice and Search/Ask tabs
 * (assets/newtab-CnOLQ0yu.js). This block is part of the chunk's `var` list; the omnibox engine
 * around it stays supplied. Names the rest of the chunk and its export use keep their chunk names:
 * Ut NewTabProvider, Ve useNewTab, Hn useNewTabAccountId, Ft IncognitoNotice, qn the onboarding
 * prompt event, Ce react-dom, zt ModeTabs.
 * Chunk names used: n React, f JSX runtime, rt interop, At react-dom; imports _t Tabs, Ot TabsList,
 * et TabsTrigger, Y the omnibox handle (the editor newtab.html painted).
 * Aux change: the Search/Ask track follows the Space tint (styles/newtab-page.css has the segment). */
NewTabContext = (0, n.createContext)(null),
  BROWSER_MODE = typeof chrome < 'u' && chrome.extension?.inIncognitoContext === true ? 'incognito' : 'default',
  Ut = ({children, omniboxMode, onOmniboxModeChange}) => {
    const [accountId, setAccountId] = (0, n.useState)(null);
    const value = (0, n.useMemo)(() => ({accountId, browserMode: BROWSER_MODE, omniboxMode, setAccountId, setOmniboxMode: onOmniboxModeChange}),
      [accountId, omniboxMode, onOmniboxModeChange]);
    return (0, f.jsx)(NewTabContext.Provider, {value, children});
  },
  Ve = () => {
    const context = (0, n.useContext)(NewTabContext);
    if (!context) throw new Error('useNewTab must be used within NewTabProvider');
    return context;
  },
  Hn = () => {
    const {accountId} = Ve();
    if (accountId === null) throw new Error('New tab account ID is not ready.');
    return accountId;
  },
  // Shown under the omnibox in incognito windows.
  Ft = () => (0, f.jsx)('div', {
    className: 'text-muted-foreground [&_strong]:text-primary mx-auto max-w-3xl space-y-4 px-4 py-3 text-xs leading-5 font-medium select-none md:px-8 xl:px-16 [&_strong]:font-medium',
    children: (0, f.jsx)('p', {
      children: 'Incognito mode is for temporary work or browsing in Aux. The agent runs without your saved memories or history tools, and the session stays out of your regular task list. It is not a way to hide from the websites you visit.',
    }),
  }),
  qn = '@browser-aux/new-tab/onboarding-prompt',
  Ce = rt(At(), 1),
  // The React Search/Ask tabs take over from the static first-frame ones in newtab.html (which hide
  // once data-react-ready is set), and switch the omnibox editor's mode.
  zt = ({mode}) => {
    const slot = document.getElementById('new-tab-react-mode-tabs');
    return (0, n.useLayoutEffect)(() => {
      const staticTabs = document.getElementById('new-tab-mode-tabs');
      if (!(!staticTabs || !slot)) return staticTabs.dataset.reactReady = 'true', () => {
        delete staticTabs.dataset.reactReady;
      };
    }, [slot]), slot
      ? (0, Ce.createPortal)((0, f.jsx)(_t, {
        value: mode,
        onValueChange: next => {
          if (next !== 'ask' && next !== 'search') return;
          const omnibox = Y();
          omnibox?.setMode(next), omnibox?.editor.view.focus();
        },
        children: (0, f.jsxs)(Ot, {
          className: '[&_button]:w-16 bg-accent dark:bg-background',
          children: [(0, f.jsx)(et, {value: 'search', children: 'Search'}), (0, f.jsx)(et, {value: 'ask', children: 'Ask'})],
        }),
      }), slot)
      : null;
  }