/* Aux-owned source: the side panel route (assets/route-DI45z3OR.js, the module body): the session in the URL,
 * a reload when the panel comes back after hiding, and a dark tree in incognito, which restores the
 * document's classes on leaving.
 * Names the rest of the chunk uses keep their chunk names: _ the route (exported).
 * Chunk names used: m/u React, h JSX runtime, r the route, g/S/v/p the session parts, f the browser mode. */
var React = m(u()),
  jsxRuntime = h();
/** The side panel. */
function _() {
  useReloadAfterHiding();
  const {userId} = r.useParams(),
    navigate = r.useNavigate(),
    sessionId = r.useSearch().sessionId,
    handleSessionChange = (0, React.useCallback)(
      next => {
        navigate({to: '/u/$userId/sidepanel', params: {userId}, search: next ? {sessionId: next} : {}, replace: true});
      },
      [navigate, userId],
    );
  return (0, jsxRuntime.jsxs)(g, {
    sessionId,
    onSessionChange: handleSessionChange,
    children: [
      (0, jsxRuntime.jsx)(S, {}),
      (0, jsxRuntime.jsx)(IncognitoTheme, {
        children: (0, jsxRuntime.jsx)(v, {
          currentSessionId: sessionId,
          onSessionChange: handleSessionChange,
          children: (0, jsxRuntime.jsx)(p, {}),
        }),
      }),
    ],
  });
}
/** Reloads the panel when it shows again after hiding. */
function useReloadAfterHiding() {
  (0, React.useEffect)(() => {
    let wasHidden = false;
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        wasHidden = true;
        return;
      }
      wasHidden && window.location.replace(`${window.location.pathname}${window.location.search}`);
    };
    return (
      document.addEventListener('visibilitychange', handleVisibility),
      () => document.removeEventListener('visibilitychange', handleVisibility)
    );
  }, []);
}
var /** Keeps the tree dark in incognito. */
  IncognitoTheme = ({children}) => {
    const {mode} = f(),
      isIncognito = mode === 'incognito';
    return (
      (0, React.useEffect)(() => {
        if (!isIncognito) return;
        const root = document.documentElement,
          colorScheme = root.style.colorScheme,
          hadDark = root.classList.contains('dark'),
          hadLight = root.classList.contains('light'),
          bodyHadDark = document.body.classList.contains('dark');
        return (
          root.classList.add('dark'),
          root.classList.remove('light'),
          (root.style.colorScheme = 'dark'),
          document.body.classList.add('dark'),
          () => {
            (hadDark || root.classList.remove('dark'),
              hadLight && root.classList.add('light'),
              (root.style.colorScheme = colorScheme),
              bodyHadDark || document.body.classList.remove('dark'));
          }
        );
      }, [isIncognito]),
      (0, jsxRuntime.jsx)('div', {
        className: isIncognito ? 'dark text-foreground contents' : 'contents',
        'data-chat-drop-zone': '',
        children,
      })
    );
  };
