/* Aux-owned source: the error page and error reporting (assets/error-tracking-B1YG2RRM.js, from the copy icon
 * on; before it the chunk bundles the TanStack Router and Query contexts, supplied as they are). The error
 * page, the account a URL belongs to, capturing exceptions once each and never in incognito, and the
 * Reconnecting page, which refetches what failed three times, waiting longer each time, before
 * showing the error.
 * Names the rest of the chunk uses keep their chunk names; every name below that is not listed under
 * renamed names is exported: T copy icon, Q loading icon, F Spinner, O useClipboard, D the error page,
 * j account from a URL, ce a path for another account, ie this chunk's lazy exports, G install, m capture,
 * R the route error, J the recovering route error, X the error boundary.
 * Chunk names used: o React, n JSX runtime, S cn, B useRouter, q the query reset boundary, y Button, _ export
 * helper, k read the account, v whether an error will pass, V the tRPC client, x the query client. */
/** Copy. */
  T = ({size = 24, ariaHidden = true, ...props}) =>
    (0, n.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, n.jsx)('path', {
        d: 'M14 11.25C14 10.5597 13.4403 10 12.75 10H5.25C4.55966 10 4 10.5597 4 11.25V18.75C4 19.4403 4.55966 20 5.25 20H12.75C13.4403 20 14 19.4403 14 18.75V11.25ZM16 14H18.75C19.4403 14 20 13.4403 20 12.75V5.25C20 4.55966 19.4403 4 18.75 4H11.25C10.5597 4 10 4.55966 10 5.25V8H12.75C14.5449 8 16 9.45512 16 11.25V14ZM22 12.75C22 14.5449 20.5449 16 18.75 16H16V18.75C16 20.5449 14.5449 22 12.75 22H5.25C3.45506 22 2 20.5449 2 18.75V11.25C2 9.45513 3.45506 8 5.25 8H8V5.25C8 3.45506 9.45513 2 11.25 2H18.75C20.5449 2 22 3.45506 22 5.25V12.75Z',
        fill: 'currentColor',
      }),
    }),
  /** A warning triangle. */
  WarningIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, n.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, n.jsx)('path', {
        d: 'M8.62795 3.91299C10.1774 1.36232 13.8226 1.36235 15.3721 3.91299L21.4033 13.8437V13.8446C23.0139 16.4974 21.1758 19.9999 18.0303 19.9999H5.96974C2.82419 19.9999 0.986202 16.4973 2.5967 13.8446V13.8437L8.62795 3.91299ZM13.6631 4.95108C12.8925 3.68266 11.1075 3.68268 10.3369 4.95108L4.30666 14.8827C3.46261 16.2729 4.46502 17.9999 5.96974 17.9999H18.0303C19.535 17.9999 20.5374 16.2729 19.6934 14.8827L13.6631 4.95108ZM12.1279 13.7567C12.7582 13.8208 13.25 14.3527 13.25 14.9999C13.25 15.6903 12.6904 16.2499 12 16.2499C11.3528 16.2499 10.8209 15.7581 10.7569 15.1278L10.75 14.9999L10.7569 14.872C10.8209 14.2417 11.3528 13.7499 12 13.7499L12.1279 13.7567ZM11 11.9188V8.88467C11 8.33239 11.4477 7.88467 12 7.88467C12.5523 7.88467 13 8.33239 13 8.88467V11.9188C13 12.4711 12.5523 12.9188 12 12.9188C11.4477 12.9188 11 12.4711 11 11.9188Z',
        fill: 'currentColor',
      }),
    }),
  /** A spinner's ring. */
  Q = ({size = 24, ariaHidden = true, ...props}) =>
    (0, n.jsxs)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: [
        (0, n.jsx)('path', {
          opacity: 0.3,
          d: 'M19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z',
          fill: 'currentColor',
        }),
        (0, n.jsx)('path', {
          d: 'M18.8916 13.2373C19.0368 12.4218 19.8153 11.8783 20.6308 12.0235C21.4464 12.1687 21.9898 12.9472 21.8447 13.7627C21.1127 17.8738 17.8738 21.1127 13.7627 21.8447C12.9472 21.9898 12.1686 21.4464 12.0234 20.6309C11.8783 19.8153 12.4217 19.0368 13.2373 18.8916C16.1102 18.38 18.38 16.1102 18.8916 13.2373Z',
          fill: 'currentColor',
        }),
      ],
    }),
  /** The Spinner. */
  F = ({className, ...props}) =>
    (0, n.jsx)(Q, {
      className: S('animate-spin text-inherit', className),
      ...props,
    }),
  /** Copies text, or an object of type and data. */
  O = () => ({
    copy: (0, o.useCallback)(async content => {
      if (!navigator?.clipboard) return (console.warn('Clipboard not supported'), false);
      try {
        if (
          (typeof content == 'string' && (await navigator.clipboard.writeText(content)), typeof content == 'object')
        ) {
          const item = new ClipboardItem(
            Object.fromEntries(Object.entries(content).map(([type, data]) => [type, new Blob([data], {type})])),
          );
          await navigator.clipboard.write([item]);
        }
        return true;
      } catch (error) {
        return (console.warn('Copy failed', error), false);
      }
    }, []),
  }),
  /** The error page. */
  D = ({error}) => {
    const {copy} = O(),
      reload = () => {
        window.location.reload();
      },
      copyMessage = () => {
        copy(error?.message ?? '');
      };
    return (0, n.jsxs)('main', {
      className: 'flex h-screen w-screen flex-col items-center justify-center px-6 py-16 text-center',
      children: [
        (0, n.jsx)(WarningIcon, {className: 'text-muted-foreground mb-2 size-10 [@media(height<640px)]:hidden'}),
        (0, n.jsxs)('div', {
          className: 'mb-8 flex flex-col items-center space-y-1',
          children: [
            (0, n.jsx)('h1', {
              className: 'font-display text-xl font-medium [@media(height<640px)]:text-lg',
              children: 'Something went wrong',
            }),
            (0, n.jsx)('p', {
              className: 'text-muted-foreground line-clamp-1 max-w-sm text-center text-sm',
              children: error?.message ?? 'There was an unexpected error in this page.',
            }),
          ],
        }),
        (0, n.jsxs)('div', {
          className: 'flex items-center gap-1',
          children: [
            (0, n.jsxs)(y, {
              variant: 'outline',
              onClick: copyMessage,
              children: [(0, n.jsx)(T, {className: 'size-4'}), (0, n.jsx)('span', {children: 'Copy message'})],
            }),
            (0, n.jsx)(y, {onClick: reload, children: 'Reload'}),
          ],
        }),
      ],
    });
  },
  /** A path's numeric account. */
  ACCOUNT_PATH = /^\/u\/(\d+)(?:\/|$)/,
  /** The account part of a path. */
  ACCOUNT_SEGMENT = /^\/u\/[^/?#]+(?=[/?#]|$)/;
/** The accountId in a query string. */
function accountFromSearch(search) {
  const value = new URLSearchParams(search ?? '').get('accountId');
  if (!value?.trim()) return null;
  const accountId = Number(value);
  return Number.isInteger(accountId) && accountId >= 0 ? accountId : null;
}
/** The account a URL is for. */
function j(pathname, search) {
  const accountId = Number(pathname?.match(ACCOUNT_PATH)?.[1]);
  return Number.isInteger(accountId) && accountId >= 0 ? accountId : accountFromSearch(search);
}
/** A path on another account. */
function ce(path, accountId) {
  return path.replace(ACCOUNT_SEGMENT, `/u/${accountId}`);
}
/** The account to use: the browser profile's if it has one. */
async function resolveAccountId(pathname, search) {
  const account = await k();
  return account.browserProfile ? account.accountId : (j(pathname, search) ?? account.accountId);
}
var /** The chunk's exports for lazy importers. */
  ie = _({
    AgentManagerErrorBoundary: () => X,
    AgentManagerRouteErrorComponent: () => R,
    RecoveringAgentManagerRouteErrorComponent: () => J,
    captureAgentManagerException: () => m,
    installAgentManagerErrorTracking: () => G,
  }),
  /** Errors already sent. */
  reportedErrors = new WeakSet(),
  /** One recovery per router and URL, across remounts. */
  recoveries = new WeakMap(),
  /** Whether the listeners are in. */
  installed = false,
  /** What reports say they came from. */
  surfaceName = 'agent-manager';
/** Reports window errors and unhandled rejections. */
function G(surface) {
  ((surfaceName = surface),
    !installed &&
      ((installed = true),
      window.addEventListener('error', event => {
        m(event.error ?? event.message, {source: 'window_error', handled: false});
      }),
      window.addEventListener('unhandledrejection', event => {
        m(event.reason, {source: 'unhandled_rejection', handled: false});
      })));
}
/** Sends an error, unless it was sent or this is an incognito window. */
async function m(error, context) {
  if (isIncognito() || alreadyReported(error)) return;
  const accountId = await accountForReport();
  if (accountId === null) return;
  const details = describeError(error);
  await V.analytics.captureException
    .mutate({
      accountId,
      name: details.name,
      message: details.message,
      stack: details.stack,
      properties: {
        source: context.source,
        handled: context.handled,
        route: context.route ?? currentRoute(),
        surface: context.surface ?? surfaceName,
        ...context.properties,
      },
    })
    .catch(failure => {
      console.warn('[Analytics] Failed to capture agent-manager exception.', {
        error: failure instanceof Error ? failure.message : String(failure),
      });
    });
}
/** The route error page; it reports the error. */
function R({error, reset}) {
  return (
    (0, o.useEffect)(() => {
      m(error, {source: 'router_boundary', handled: true, surface: surfaceName});
    }, [error]),
    (0, n.jsx)(D, {error: error instanceof Error ? error : void 0, reset})
  );
}
/** Keeps trying while an error may pass, then shows the error page. */
function J(props) {
  const mayPass = v(props.error),
    router = B(),
    resetBoundary = q(),
    [gaveUp, setGaveUp] = (0, o.useState)(false),
    failedQueries = (0, o.useMemo)(
      () =>
        x
          .getQueryCache()
          .getAll()
          .filter(query => query.state.error === props.error),
      [props.error],
    ),
    [recovery] = (0, o.useState)(() => {
      const existing = recoveries.get(router);
      if (existing?.href === router.state.location.href) return existing;
      existing?.unsubscribe?.();
      const fresh = {href: router.state.location.href, attempts: 0};
      return (recoveries.set(router, fresh), fresh);
    });
  return (
    (0, o.useEffect)(() => {
      if (!mayPass) return;
      const queriesSettled = () => failedQueries.every(query => x.getQueryState(query.queryKey)?.status === 'success'),
        finish = () => {
          (recovery.unsubscribe?.(), recoveries.get(router) === recovery && recoveries.delete(router));
        };
      recovery.unsubscribe ??= router.subscribe('onResolved', () => {
        router.state.location.href === recovery.href &&
          router.state.matches.every(match => match.status === 'success') &&
          queriesSettled() &&
          finish();
      });
      let stopped = false,
        timer = 0;
      const retry = async () => {
        if ((await recovery.pending, !stopped)) {
          if (recovery.attempts >= 3) {
            setGaveUp(true);
            return;
          }
          timer = window.setTimeout(
            async () => {
              if (recovery.pending) {
                retry();
                return;
              }
              const failedInRoute = router.state.matches.some(match => match.error === props.error);
              (failedQueries.length > 0 ? resetBoundary.clearReset() : resetBoundary.reset(),
                (recovery.pending = Promise.allSettled(
                  failedQueries.map(query => x.fetchQuery({...query.options, queryKey: query.queryKey, staleTime: 0})),
                )
                  .then(() => {
                    if (router.state.location.href === recovery.href)
                      return (failedQueries.length > 0 && resetBoundary.clearReset(), router.invalidate());
                  })
                  .catch(() => {})
                  .then(() => {
                    ((recovery.attempts += 1),
                      (recovery.pending = void 0),
                      (failedInRoute || failedQueries.length > 0) &&
                        !router.state.matches.some(match => v(match.error)) &&
                        queriesSettled() &&
                        finish());
                  })),
                await recovery.pending,
                stopped || retry());
            },
            5e3 * (recovery.attempts + 1),
          );
        }
      };
      return (
        retry(),
        () => {
          ((stopped = true), window.clearTimeout(timer));
        }
      );
    }, [mayPass, failedQueries, props.error, resetBoundary, recovery, router]),
    !mayPass || gaveUp
      ? (0, n.jsx)(R, {...props})
      : (0, n.jsxs)('main', {
          className: 'flex h-screen w-screen flex-col items-center justify-center gap-3 text-center',
          children: [
            (0, n.jsx)(F, {className: 'text-muted-foreground size-5'}),
            (0, n.jsx)('p', {className: 'text-muted-foreground text-sm', children: 'Reconnecting to Aux…'}),
          ],
        })
  );
}
var /** Reports what it catches and shows the fallback. */
  X = class extends o.Component {
    state = {hasError: false};
    static getDerivedStateFromError() {
      return {hasError: true};
    }
    componentDidCatch(error) {
      m(error, {source: 'react_boundary', handled: true, surface: this.props.surface});
    }
    render() {
      return this.state.hasError ? (this.props.fallback ?? null) : this.props.children;
    }
  };
/** Whether an error object was sent already; remembers it if not. */
function alreadyReported(error) {
  return typeof error != 'object' || error === null
    ? false
    : reportedErrors.has(error)
      ? true
      : (reportedErrors.add(error), false);
}
/** An error as name, message and stack. */
function describeError(error) {
  return error instanceof Error
    ? {name: error.name || error.constructor.name || 'Error', message: error.message, stack: error.stack}
    : {
        name: typeof error == 'string' ? 'Error' : 'UnhandledRejection',
        message: typeof error == 'string' ? error : String(error),
      };
}
/** The account from the URL, or else the signed-in one; none if neither. */
async function accountForReport() {
  const url = currentUrl(),
    accountId = j(url.pathname, url.search);
  if (accountId !== null) return accountId;
  try {
    return await resolveAccountId(url.pathname, url.search);
  } catch {
    return null;
  }
}
/** The current route. */
function currentRoute() {
  return currentUrl().pathname;
}
/** The URL, or the one in its hash. */
function currentUrl() {
  const hashPath = window.location.hash.startsWith('#/') ? window.location.hash.slice(1) : null;
  return hashPath ? new URL(hashPath, window.location.origin) : new URL(window.location.href);
}
/** Whether this is an incognito window. */
function isIncognito() {
  return typeof chrome < 'u' && chrome.extension?.inIncognitoContext === true;
}
