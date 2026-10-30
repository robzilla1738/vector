/* Aux-owned source: the signed-in web layout (assets/route-BiU8pLwS.js, the module body): waiting for a
 * switched account to settle, the cloud chat store behind shared chats (one reconnecting client per
 * session, its messages kept in order and filtered down to what people see), and the sidebar layout,
 * collapsing to an overlay on narrow windows with its focus handed back.
 * Names the rest of the chunk uses keep their chunk names: xe the route (exported).
 * Chunk names used: P/_ React, A JSX runtime, x cn, w Outlet, k useRouter, p the account token, z/T the
 * session list and sidebar providers, B a host's base URL, v the cloud origin, M the Connect transport,
 * N a socket URL with its token, C useRouterState, y/D resizable panel and group, F the Connect client,
 * W/L the account snapshot and its subscription, q read the account, U the host, H useWindowFocused,
 * G the stream client, R the store factory, O useSidebarEnabled, V/$/Q/K sidebar handle, trigger, state and
 * content, Y extension page check, J the route, X the session list subscription. */
var React = P(_(), 1),
  /** Holds the page back until a switched account has settled, then reloads the route if it moved. */
  AccountSettled = ({accountId, children}) => {
    const router = k(),
      liveAccount = (0, React.useSyncExternalStore)(L, W),
      [settledAccount, setSettledAccount] = (0, React.useState)(liveAccount),
      isSwitching = liveAccount !== settledAccount;
    return (
      (0, React.useEffect)(() => {
        if (!isSwitching) return;
        let cancelled = false;
        return (
          q()
            .then(async account => {
              if (!cancelled) {
                if (!account.browserProfile || account.accountId === accountId) {
                  setSettledAccount(liveAccount);
                  return;
                }
                await router.invalidate();
              }
            })
            .catch(() => {
              cancelled || router.invalidate();
            }),
          () => {
            cancelled = true;
          }
        );
      }, [accountId, liveAccount, isSwitching, router, settledAccount]),
      isSwitching ? null : children
    );
  };
/** One store per account: a stream client per cloud session, and what each shows. */
function createCloudChatStore(options) {
  const store = R()(() => ({})),
    executionStore = R(() => ({})),
    connections = new Map(),
    publish = (sessionId, state) => {
      if (!connections.has(sessionId)) return;
      const streaming = connections.get(sessionId).client.getState().streamingMessage;
      executionStore.setState({[sessionId]: streaming ? [...state.messages, streaming] : state.messages});
      const previous = store.getState()[sessionId],
        visible = (streaming ? [...state.messages, streaming] : state.messages).filter(
          message =>
            (message.role === 'user' && !message.metadata?.contextRecall) ||
            message.role === 'user-message-metadata' ||
            message.role === 'published-message' ||
            (message.role === 'assistant' &&
              message.content.some(block => block.type === 'text' && block.text.length > 0)),
        );
      (previous?.status === state.status &&
        previous.error === state.error &&
        previous.messages.length === visible.length &&
        previous.messages.every((message, index) => message === visible[index])) ||
        store.setState({[sessionId]: {...state, messages: visible}});
    },
    refresh = async sessionId => {
      const connection = connections.get(sessionId);
      if (!connection) return;
      const revision = connection.revision,
        session = await options.readSession(sessionId);
      if (connections.get(sessionId) !== connection) return;
      const status =
        revision === connection.revision ? session.status : (store.getState()[sessionId]?.status ?? session.status);
      return (
        connection.client.hydrateMessages(session.messages),
        publish(sessionId, {...session, status, messages: connection.client.getState().messages}),
        session
      );
    };
  return {
    store,
    executionStore,
    connect: sessionId => {
      const existing = connections.get(sessionId);
      if (existing) return existing.ready.then(() => existing.client.reconnectToStream());
      const client = new G({
          sessionId,
          endpoint: options.endpoint,
          createSocket: options.createSocket,
          resync: async () => ({live: (await refresh(sessionId))?.status === 'running'}),
          onEvent: event => {
            const current = connections.get(sessionId);
            (current && current.revision++,
              (event.type === 'agent_start' || event.type === 'agent_end') &&
                publish(sessionId, {
                  messages: client.getState().messages,
                  status: event.type === 'agent_start' ? 'running' : 'idle',
                }),
              event.type === 'agent_end' && refresh(sessionId).catch(fail));
          },
        }),
        fail = error => {
          publish(sessionId, {messages: client.getState().messages, status: 'errored', error: error.message});
        },
        unsubscribe = client.getStore().subscribe((next, before) => {
          (next.messageOrder === before.messageOrder &&
            next.messagesByKey === before.messagesByKey &&
            next.streamingMessage === before.streamingMessage &&
            next.status === before.status &&
            next.error === before.error) ||
            publish(sessionId, {
              messages: client.getState().messages,
              status:
                next.status === before.status && store.getState()[sessionId]
                  ? store.getState()[sessionId].status
                  : next.status === 'streaming'
                    ? 'running'
                    : next.status === 'error'
                      ? 'errored'
                      : 'idle',
              error: next.error ?? void 0,
            });
        }),
        connection = {client, unsubscribe, ready: Promise.resolve(), revision: 0};
      return (
        connections.set(sessionId, connection),
        (connection.ready = client.reconnectToStream().then(async () => {
          await refresh(sessionId);
        })),
        connection.ready.catch(error => {
          connections.get(sessionId) === connection &&
            (fail(error), unsubscribe(), client.dispose(), connections.delete(sessionId));
        }),
        connection.ready
      );
    },
    refresh,
    dispose: () => {
      const open = [...connections.values()];
      connections.clear();
      for (const {client, unsubscribe} of open) (unsubscribe(), client.dispose());
    },
  };
}
var jsxRuntime = A(),
  /** The cloud chat store. */
  CloudChatContext = (0, React.createContext)(null);
/** Provides the store for an account, disposing it with the account. */
function CloudChatProvider({accountId, children}) {
  const store = (0, React.useMemo)(
    () =>
      createCloudChatStore({
        endpoint: sessionId =>
          `${B({kind: 'cloud', rootSessionId: sessionId}, v)}/agents/chat/${encodeURIComponent(sessionId)}`,
        createSocket: async sessionId => new WebSocket(N(U(sessionId), await p(accountId))),
        readSession: async sessionId => {
          const client = F({
              links: [
                M({
                  host: {kind: 'cloud', rootSessionId: sessionId},
                  apiBaseUrl: v,
                  fetchApi: async (input, init) =>
                    fetch(input, {...init, headers: {...init?.headers, authorization: `Bearer ${await p(accountId)}`}}),
                }),
              ],
            }),
            [messages, session] = await Promise.all([
              client.sessions.messages.query({accountId, sessionId}),
              client.sessions.get.query({accountId, sessionId}),
            ]);
          return {messages, status: session.status};
        },
      }),
    [accountId],
  );
  return (
    (0, React.useEffect)(() => () => store.dispose(), [store]),
    (0, jsxRuntime.jsx)(CloudChatContext, {value: store, children})
  );
}
var /** The sidebar's fixed width. */
  SIDEBAR_WIDTH = '280px',
  /** Below this the sidebar overlays the page. */
  NARROW_QUERY = '(max-width: 63.999rem)';
/** The signed-in layout. The Channels pages and extension pages go without the sidebar. */
function xe() {
  const {accountId} = J.useRouteContext(),
    isExtensionPage = Y(),
    isChannels = C({select: ({pathname}) => /^\/u\/[^/]+\/experimental\/v2(?:\/|$)/.test(pathname)});
  return (0, jsxRuntime.jsx)(AccountSettled, {
    accountId,
    children: (0, jsxRuntime.jsx)(z, {
      children: (0, jsxRuntime.jsxs)(
        CloudChatProvider,
        {
          accountId,
          children: [
            (0, jsxRuntime.jsx)(T, {}),
            (0, jsxRuntime.jsx)(X, {}),
            isExtensionPage || isChannels
              ? (0, jsxRuntime.jsx)('main', {
                  className: 'relative h-dvh w-full min-w-0 overflow-hidden',
                  children: (0, jsxRuntime.jsx)(w, {}),
                })
              : (0, jsxRuntime.jsx)(SidebarLayout, {}),
          ],
        },
        accountId,
      ),
    }),
  });
}
var /** The page beside the sidebar. */
  SidebarLayout = () => {
    const {pathname} = C(),
      sidebarEnabled = O(),
      {sidebarState, setSidebarState} = Q(),
      {setSidebarPanelRef} = useSidebarPanel(sidebarState),
      isClosed = sidebarState === 'closed',
      isFocused = H(),
      showAffordance = !isClosed || isFocused,
      isOverlay = useNarrowWindow() && !isClosed && sidebarEnabled,
      hidesTrigger = /^\/u\/[^/]+\/(?:tasks(?:\/[^/]+)?|projects\/[^/]+)/.test(pathname);
    return (
      useSidebarFocus(isOverlay),
      sidebarEnabled
        ? (0, jsxRuntime.jsxs)('div', {
            className: 'relative h-dvh w-full',
            children: [
              (0, jsxRuntime.jsxs)(D, {
                className: x(
                  'h-dvh w-full overflow-x-hidden',
                  'max-lg:[&>[data-testid=web-sidebar]]:absolute max-lg:[&>[data-testid=web-sidebar]]:inset-y-0 max-lg:[&>[data-testid=web-sidebar]]:left-0 max-lg:[&>[data-testid=web-sidebar]]:z-20',
                  isClosed
                    ? 'max-lg:[&>[data-testid=web-sidebar]]:w-0!'
                    : 'max-lg:[&>[data-testid=web-sidebar]]:w-[280px]!',
                ),
                children: [
                  (0, jsxRuntime.jsx)(y, {
                    panelRef: setSidebarPanelRef,
                    id: 'web-sidebar',
                    className: x(
                      'group/web-sidebar max-lg:bg-background relative z-20 h-dvh min-w-0 overflow-hidden!',
                      !isClosed && 'max-lg:shadow-2xl',
                    ),
                    defaultSize: SIDEBAR_WIDTH,
                    minSize: SIDEBAR_WIDTH,
                    maxSize: SIDEBAR_WIDTH,
                    collapsible: true,
                    groupResizeBehavior: 'preserve-pixel-size',
                    children: (0, jsxRuntime.jsx)('div', {
                      className: x(
                        'h-full w-[280px] overflow-hidden transition-opacity duration-150',
                        isClosed ? 'pointer-events-none opacity-0' : 'opacity-100',
                      ),
                      children: (0, jsxRuntime.jsx)(K, {}),
                    }),
                  }),
                  isOverlay &&
                    (0, jsxRuntime.jsx)('button', {
                      type: 'button',
                      'aria-label': 'Dismiss sidebar',
                      className: 'absolute inset-0 z-10 bg-black/20 lg:hidden',
                      onClick: () => setSidebarState('closed'),
                    }),
                  (0, jsxRuntime.jsx)(V, {}),
                  (0, jsxRuntime.jsxs)(y, {
                    id: 'web-content',
                    className: 'relative h-dvh min-w-0 overflow-hidden',
                    children: [
                      !hidesTrigger && (0, jsxRuntime.jsx)($, {className: 'max-lg:hidden'}),
                      (0, jsxRuntime.jsx)('div', {
                        className: 'size-full',
                        inert: isOverlay,
                        children: (0, jsxRuntime.jsx)(w, {}),
                      }),
                    ],
                  }),
                ],
              }),
              (0, jsxRuntime.jsx)(SidebarAffordance, {visible: showAffordance}),
            ],
          })
        : (0, jsxRuntime.jsxs)('main', {
            className: 'relative h-dvh w-full min-w-0 overflow-hidden',
            children: [(0, jsxRuntime.jsx)(w, {}), (0, jsxRuntime.jsx)(SidebarAffordance, {visible: isFocused})],
          })
    );
  },
  /** Nothing in this build; the slot stays for the supplied structure. */
  SidebarAffordance = () => null,
  /** Whether the window is narrow enough for the overlay. */
  useNarrowWindow = () =>
    (0, React.useSyncExternalStore)(
      onChange => {
        const query = window.matchMedia(NARROW_QUERY);
        return (query.addEventListener('change', onChange), () => query.removeEventListener('change', onChange));
      },
      () => window.matchMedia(NARROW_QUERY).matches,
      () => false,
    ),
  /** Moves focus into the open overlay, and back again when it closes. */
  useSidebarFocus = isOpen => {
    const previousFocus = (0, React.useRef)(null);
    (0, React.useEffect)(() => {
      if (!isOpen) return;
      previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const frame = window.requestAnimationFrame(() => {
        document.querySelector('[data-sidebar-close]')?.focus();
      });
      return () => {
        (window.cancelAnimationFrame(frame),
          previousFocus.current?.isConnected && previousFocus.current.focus(),
          (previousFocus.current = null));
      };
    }, [isOpen]);
  },
  /** Keeps the resizable panel in step with the sidebar state. */
  useSidebarPanel = sidebarState => {
    const panelRef = (0, React.useRef)(null),
      syncPanel = (0, React.useCallback)(
        panel => {
          if (panel) {
            if (sidebarState === 'closed') {
              panel.collapse();
              return;
            }
            (panel.isCollapsed() && panel.expand(), panel.resize(SIDEBAR_WIDTH));
          }
        },
        [sidebarState],
      ),
      setSidebarPanelRef = (0, React.useCallback)(
        panel => {
          ((panelRef.current = panel), window.requestAnimationFrame(() => syncPanel(panelRef.current)));
        },
        [syncPanel],
      );
    return (
      (0, React.useLayoutEffect)(() => {
        const frame = window.requestAnimationFrame(() => {
          syncPanel(panelRef.current);
        });
        return () => {
          window.cancelAnimationFrame(frame);
        };
      }, [syncPanel]),
      {setSidebarPanelRef}
    );
  };
