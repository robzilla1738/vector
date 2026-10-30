/* Aux-owned source: the app layout (assets/route-Dh145hWk.js, the module body): the session providers, the
 * lazy session list subscription, moving the URL to the signed-in account, and keeping the extension
 * bridge awake.
 * Names the rest of the chunk uses keep their chunk names: k the layout (exported).
 * Chunk names used: c/l React, u JSX runtime, m Outlet, f useNavigate, d rewrites a URL's account, p the preload
 * helper, __vite__mapDeps its dependency list, x useRouterState, h/v the providers, _ useLocation,
 * g useQuery, j/y the auth query and its fetch, I reports a failure. */
var React = c(l()),
  jsxRuntime = u(),
  /** Loaded late; the app runs without it. */
  SessionListSubscription = (0, React.lazy)(() =>
    p(
      () =>
        import('./session-list-subscription-handler-DsVvQBhS.js').then(module => ({
          default: module.SessionListSubscriptionHandler,
        })),
      __vite__mapDeps([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
      ]),
    ),
  );
/** The layout. */
function k() {
  return (0, jsxRuntime.jsxs)('main', {
    className: 'relative flex h-screen w-full flex-col overflow-x-hidden',
    children: [
      (0, jsxRuntime.jsx)(React.Suspense, {
        fallback: null,
        children: (0, jsxRuntime.jsxs)(h, {
          children: [
            (0, jsxRuntime.jsx)(v, {}),
            (0, jsxRuntime.jsx)(AccountRedirect, {}),
            (0, jsxRuntime.jsx)(m, {}),
            (0, jsxRuntime.jsx)(React.Suspense, {
              fallback: null,
              children: (0, jsxRuntime.jsx)(SessionListSubscription, {}),
            }),
          ],
        }),
      }),
      (0, jsxRuntime.jsx)(ExtensionBridgeKeepAlive, {}),
    ],
  });
}
var /** Keeps /u/<id> on the account that is signed in. */
  AccountRedirect = () => {
    const isLoading = x({select: state => state.isLoading}),
      location = _(),
      navigate = f(),
      auth = g({
        ...j.queryOptions,
        queryFn: y,
        refetchInterval: query => (query.state.data?.reconnecting ? 5e3 : false),
        retry: false,
      });
    return (
      (0, React.useEffect)(() => {
        if (isLoading) return;
        const accountId = auth.data?.accountId,
          urlAccount = location.pathname.match(/^\/u\/(\d+)(?:\/|$)/)?.[1];
        accountId === void 0 ||
          urlAccount === void 0 ||
          urlAccount === String(accountId) ||
          navigate({href: d(location.href, accountId), replace: true});
      }, [isLoading, location.href, location.pathname, navigate, auth.data?.accountId]),
      null
    );
  },
  /** Pings the background page so the bridge stays up. */
  ExtensionBridgeKeepAlive = () => {
    const ensureBridge = (0, React.useCallback)(() => {
      try {
        chrome.runtime.sendMessage({type: 'extension-bridge:ensure'}, () => {
          chrome.runtime.lastError;
        });
      } catch (error) {
        I(error);
      }
    }, []);
    return (
      (0, React.useEffect)(() => {
        if (typeof chrome > 'u' || !chrome.runtime?.id) return;
        ensureBridge();
        const timer = window.setInterval(ensureBridge, 5e3);
        return () => {
          window.clearInterval(timer);
        };
      }, []),
      null
    );
  };
