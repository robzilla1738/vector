/* Aux-owned source: the chats sidebar of extension pages (assets/sidebar-Cj9gldy1.js): New chat,
 * Projects, Settings, chat search and the chats list, plus the open/closed state every page shares.
 * Exports keep their chunk names: Ze the lazy-export namespace, Te ExtensionWebSidebar,
 * _ ExtensionWebSidebarButton, _e its floating variant, Le ExtensionWebSidebarToggle,
 * I useSidebarState, De the storage key.
 * Imports used here (the import statement above stays as supplied): browser-color-scheme G JSX
 * runtime, $ interop, A React, f cn, R lazy exports; link D useParams, v Link; strip-markdown Z
 * useInfiniteQuery, Q useWindowFocus, K InputGroup, F InputGroupAddon, U InputGroupInput, M Skeleton,
 * J strip markdown, X SidebarRail, Y/te/se/ae the new-chat, projects, settings and search icons;
 * queries ee useTRPC; utils oe useVirtualizer, le SessionRow, ce/W/ie row title and preview, de row
 * status, ne session context, re RelativeTime, P truncate, O/q chevrons; button S Button; debounce he;
 * tooltip pe/ue/xe/ge Tooltip, TooltipTrigger, TooltipContent, TooltipProvider; scroll-area me;
 * extension-page-url j. */
var jsxRuntime = G(),
  SidebarClosedIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M18 4C20.2092 4 22 5.79088 22 8V16C22 18.2092 20.2092 20 18 20H6C3.79088 20 2 18.2092 2 16V8C2 5.79087 3.79087 4 6 4H18ZM6 6C4.89543 6 4 6.89543 4 8V16C4 17.1046 4.89542 18 6 18H18C19.1046 18 20 17.1046 20 16V8C20 6.89542 19.1046 6 18 6H6ZM7 8C7.55228 8 8 8.44772 8 9V15C8 15.5523 7.55228 16 7 16C6.44772 16 6 15.5523 6 15V9C6 8.44772 6.44772 8 7 8Z',
        fill: 'currentColor',
      }),
    }),
  SidebarOpenIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M18 4C20.2092 4 22 5.79088 22 8V16C22 18.2092 20.2092 20 18 20H6C3.79088 20 2 18.2092 2 16V8C2 5.79087 3.79087 4 6 4H18ZM6 6C4.89543 6 4 6.89543 4 8V16C4 17.1046 4.89542 18 6 18H8V6H6ZM10 18H18C19.1046 18 20 17.1046 20 16V8C20 6.89542 19.1046 6 18 6H10V18Z',
        fill: 'currentColor',
      }),
    }); /** random(max) or random(min, max), as es-toolkit bundles it. */
function random(min, max) {
  if ((max == null && ((max = min), (min = 0)), min >= max))
    throw new Error('Invalid input: The maximum value must be greater than the minimum value.');
  return Math.random() * (max - min) + min;
}
var React = $(A(), 1),
  De = 'aux:web-sidebar-state',
  SIDEBAR_STATE_EVENT =
    'aux:web-sidebar-state-change' /** useSidebarState: open or closed per storage key, kept in localStorage and chrome.storage and shared across pages. */,
  I = (defaultState = 'closed', options) => {
    const storageKey = options?.storageKey ?? 'aux:web-sidebar-state',
      [state, setState] = (0, React.useState)(() => readLocalState(defaultState, storageKey)),
      setSidebarState = (0, React.useCallback)(
        next => {
          (setState(next), storeState(storageKey, next), announceState(storageKey, next));
        },
        [storageKey],
      );
    return (
      (0, React.useEffect)(() => {
        let cancelled = false;
        readStoredState(defaultState, storageKey).then(stored => {
          cancelled || setState(stored);
        });
        const onEvent = event => {
            const detail = event.detail;
            if (detail?.storageKey !== storageKey) return;
            const nextState = detail.state;
            setState(nextState === 'open' ? 'open' : 'closed');
          },
          onStorage = event => {
            event.key === storageKey && setState(readLocalState(defaultState, storageKey));
          },
          onChromeStorage = (changes, area) => {
            area !== 'local' ||
              !changes[storageKey] ||
              setState(validState(changes[storageKey].newValue, defaultState));
          };
        return (
          typeof chrome < 'u' && chrome.storage?.onChanged && chrome.storage.onChanged.addListener(onChromeStorage),
          window.addEventListener(SIDEBAR_STATE_EVENT, onEvent),
          window.addEventListener('storage', onStorage),
          () => {
            ((cancelled = true),
              typeof chrome < 'u' &&
                chrome.storage?.onChanged &&
                chrome.storage.onChanged.removeListener(onChromeStorage),
              window.removeEventListener(SIDEBAR_STATE_EVENT, onEvent),
              window.removeEventListener('storage', onStorage));
          }
        );
      }, [defaultState, storageKey]),
      {sidebarState: state, setSidebarState}
    );
  },
  readStoredState = async (defaultState, storageKey) => {
    const storage = extensionStorage();
    if (!storage) return readLocalState(defaultState, storageKey);
    try {
      const values = await storage.get(storageKey);
      return validState(values[storageKey], readLocalState(defaultState, storageKey));
    } catch {
      return readLocalState(defaultState, storageKey);
    }
  },
  storeState = async (storageKey, state) => {
    try {
      window.localStorage.setItem(storageKey, state);
    } catch {}
    try {
      await extensionStorage()?.set({[storageKey]: state});
    } catch {}
  },
  readLocalState = (defaultState, storageKey) => {
    try {
      return validState(window.localStorage.getItem(storageKey), defaultState);
    } catch {
      return defaultState;
    }
  },
  validState = (value, fallback) => (value === 'open' || value === 'closed' ? value : fallback),
  announceState = (storageKey, state) => {
    window.dispatchEvent(new CustomEvent(SIDEBAR_STATE_EVENT, {detail: {state, storageKey}}));
  },
  extensionStorage = () => (typeof chrome > 'u' ? void 0 : chrome.storage?.local),
  PAGE_SIZE = 30 /** The chats list: newest first, 30 a page, virtualised, refreshed every 5s while a task runs and the window has focus. */,
  ChatList = ({mainDocumentLinks = false, searchQuery, userId}) => {
    const trpc = ee(),
      windowFocused = Q(),
      viewport = (0, React.useRef)(null),
      {data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError} = Z(
        trpc.sessions.listPreviewItems.infiniteQueryOptions(
          {accountId: Number(userId), limit: PAGE_SIZE, order: 'desc', coders: 'exclude', q: searchQuery || void 0},
          {
            getNextPageParam: (lastPage, pages) => (lastPage.length === PAGE_SIZE ? pages.length * PAGE_SIZE : void 0),
            refetchInterval: query => {
              const live = query.state.data?.pages.some(page =>
                page.some(item => item.status === 'running' || item.status === 'suspended'),
              );
              return windowFocused && live ? 5e3 : false;
            },
            select: result => ({...result, pages: result.pages.map(page => page.map(withPlainPreview))}),
          },
        ),
      ),
      items = (0, React.useMemo)(() => data?.pages.flat() ?? [], [data?.pages]),
      rowCount = items.length + (hasNextPage ? 1 : 0),
      virtualizer = oe({
        count: rowCount,
        estimateSize: index => rowHeight(items[index]),
        getItemKey: index => items[index]?.id ?? index,
        getScrollElement: () => viewport.current,
        overscan: 10,
      }),
      rows = virtualizer.getVirtualItems(),
      lastIndex = rows.at(-1)?.index;
    return (
      (0, React.useEffect)(() => {
        !hasNextPage || isFetchingNextPage || lastIndex === void 0 || lastIndex < items.length - 1 || fetchNextPage();
      }, [fetchNextPage, hasNextPage, isFetchingNextPage, items.length, lastIndex]),
      (0, jsxRuntime.jsx)(ge, {
        delay: 100,
        children: (0, jsxRuntime.jsx)(me, {
          className: 'min-h-0 grow',
          viewportRef: viewport,
          children: (0, jsxRuntime.jsx)('div', {
            className: 'p-1.5',
            children:
              isLoading && !items.length
                ? (0, jsxRuntime.jsx)(ChatListSkeleton, {})
                : rowCount > 0
                  ? (0, jsxRuntime.jsx)('div', {
                      className: 'relative',
                      style: {height: `${virtualizer.getTotalSize()}px`},
                      children: rows.map(row => {
                        const item = items[row.index];
                        return (0, jsxRuntime.jsx)(
                          'div',
                          {
                            ref: virtualizer.measureElement,
                            className: 'absolute inset-x-0 top-0',
                            'data-index': row.index,
                            style: {transform: `translateY(${row.start}px)`},
                            children: item
                              ? (0, jsxRuntime.jsx)(ChatRow, {mainDocumentLinks, item, userId})
                              : isFetchingNextPage
                                ? (0, jsxRuntime.jsx)(S, {
                                    variant: 'ghost',
                                    className: 'justify-start',
                                    children: (0, jsxRuntime.jsx)(M, {className: 'h-1.5 w-3/4'}),
                                  })
                                : null,
                          },
                          row.key,
                        );
                      }),
                    })
                  : searchQuery
                    ? (0, jsxRuntime.jsx)('p', {
                        className: 'text-muted-foreground px-3 py-6 text-center text-sm',
                        role: 'status',
                        children: isError ? 'Could not search chats' : 'No chats found',
                      })
                    : null,
          }),
        }),
      })
    );
  } /** A chat row with its title, status, and a preview tooltip. */,
  ChatRow = ({mainDocumentLinks, item, userId}) => {
    const context = (0, React.useMemo)(() => ({session: item}), [item]);
    return (0, jsxRuntime.jsxs)(pe, {
      children: [
        (0, jsxRuntime.jsxs)(ue, {
          tabIndex: 0,
          render: (0, jsxRuntime.jsx)(le, {
            className: 'h-8',
            session: item,
            render: mainDocumentLinks
              ? (0, jsxRuntime.jsx)('a', {href: j(`/u/${userId}/tasks/${encodeURIComponent(item.id)}`)})
              : (0, jsxRuntime.jsx)(v, {to: '/u/$userId/tasks/$sessionId', params: {userId, sessionId: item.id}}),
          }),
          children: [
            (0, jsxRuntime.jsx)(ce, {
              children: (0, jsxRuntime.jsx)(W, {
                className: 'text-surface-primary-foreground min-w-0 shrink font-[450]',
                children: item.title,
              }),
            }),
            (0, jsxRuntime.jsx)(de, {className: '-mr-1', size: 'sm'}),
          ],
        }),
        (0, jsxRuntime.jsx)(xe, {
          side: 'right',
          className: 'w-60 max-w-60 overflow-hidden py-2',
          children: (0, jsxRuntime.jsx)(ne, {
            value: context,
            children: (0, jsxRuntime.jsxs)('div', {
              className: 'w-full min-w-0',
              children: [
                (0, jsxRuntime.jsx)(W, {className: 'text-sm text-pretty whitespace-normal', children: item.title}),
                item.previewText &&
                  (0, jsxRuntime.jsx)(ie, {
                    className: 'text-xs text-pretty whitespace-normal',
                    children: P(item.previewText, 50),
                  }),
                (0, jsxRuntime.jsx)('div', {
                  className: 'text-muted-foreground pt-2 text-xs',
                  children: (0, jsxRuntime.jsx)(re, {datetime: item.updatedAt}),
                }),
              ],
            }),
          }),
        }),
      ],
    });
  },
  ChatListSkeleton = () =>
    (0, jsxRuntime.jsx)('ul', {
      className: 'space-y-0',
      children: Array.from({length: 12}, (unused, index) =>
        (0, jsxRuntime.jsx)(
          'li',
          {
            children: (0, jsxRuntime.jsx)(S, {
              variant: 'ghost',
              className: 'pointer-events-none justify-start',
              nativeButton: false,
              render: (0, jsxRuntime.jsx)('div', {}),
              children: (0, jsxRuntime.jsx)(M, {
                className: 'h-1.5',
                style: {width: 160 - (index === 0 ? 0 : random(40)), opacity: 1 - index * 0.08},
              }),
            }),
          },
          `task-list-skeleton-${index}`,
        ),
      ),
    }),
  rowHeight = item => (item ? 32 : 40),
  withPlainPreview = item => ({...item, previewText: item.previewText ? P(J(item.previewText), 80) : void 0}),
  Ze = R({
    ExtensionWebSidebar: () => Te,
    ExtensionWebSidebarButton: () => _,
    ExtensionWebSidebarContent: () => SidebarContent,
    ExtensionWebSidebarFloatingButton: () => _e,
    ExtensionWebSidebarToggle: () => Le,
  }) /** ExtensionWebSidebar: the sidebar, with a close button on narrow pages while it is open. */,
  Te = ({mainDocumentLinks = false, userId: userIdProp}) => {
    const {userId: routeUserId} = D({strict: false}),
      {sidebarState} = I(),
      userId = userIdProp ?? routeUserId;
    return userId
      ? (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
          children: [
            (0, jsxRuntime.jsx)(SidebarContent, {mainDocumentLinks, userId}),
            sidebarState !== 'closed' &&
              (0, jsxRuntime.jsx)(_, {
                'aria-label': 'Close sidebar',
                'data-sidebar-close': true,
                className: 'absolute top-0 right-1.5 z-40 size-11 lg:hidden',
              }),
          ],
        })
      : null;
  } /** ExtensionWebSidebarContent: search, New chat, Projects, Settings, then the chats. */,
  SidebarContent = ({mainDocumentLinks = false, userId}) => {
    const [query, setQuery] = (0, React.useState)(''),
      setQueryLater = (0, React.useCallback)(
        he(value => setQuery(value.trim()), 250),
        [],
      );
    (0, React.useEffect)(() => setQueryLater.cancel, [setQueryLater]);
    const onChange = event => {
        setQueryLater(event.currentTarget.value);
      },
      onKeyDown = event => {
        event.nativeEvent.isComposing ||
          event.key !== 'Escape' ||
          (event.preventDefault(), setQueryLater.cancel(), (event.currentTarget.value = ''), setQuery(''));
      };
    return (0, jsxRuntime.jsxs)('aside', {
      className: 'border-r-hairline relative flex h-full w-full shrink-0 flex-col overflow-hidden',
      children: [
        (0, jsxRuntime.jsxs)(SidebarActions, {
          children: [
            (0, jsxRuntime.jsxs)(K, {
              className: 'bg-surface-primary mb-4 h-8 shadow-xs',
              children: [
                (0, jsxRuntime.jsx)(F, {
                  align: 'inline-start',
                  children: (0, jsxRuntime.jsx)(ae, {className: 'size-4'}),
                }),
                (0, jsxRuntime.jsx)(U, {'aria-label': 'Search chats', placeholder: 'Search…', onChange, onKeyDown}),
              ],
            }),
            (0, jsxRuntime.jsxs)(SidebarLink, {
              render: mainDocumentLinks
                ? (0, jsxRuntime.jsx)('a', {href: j(`/u/${userId}/tasks/new`)})
                : (0, jsxRuntime.jsx)(v, {to: '/u/$userId/tasks/new', params: {userId}}),
              children: [
                (0, jsxRuntime.jsx)(Y, {'data-icon': 'inline-start'}),
                (0, jsxRuntime.jsx)('span', {children: 'New chat'}),
              ],
            }),
            (0, jsxRuntime.jsxs)(SidebarLink, {
              render: mainDocumentLinks
                ? (0, jsxRuntime.jsx)('a', {href: j(`/u/${userId}/projects`)})
                : (0, jsxRuntime.jsx)(v, {
                    to: '/u/$userId/projects',
                    params: {userId},
                    activeOptions: {exact: false, includeSearch: false},
                  }),
              children: [
                (0, jsxRuntime.jsx)(te, {'data-icon': 'inline-start'}),
                (0, jsxRuntime.jsx)('span', {children: 'Projects'}),
              ],
            }),
            (0, jsxRuntime.jsxs)(SidebarLink, {
              render: mainDocumentLinks
                ? (0, jsxRuntime.jsx)('a', {href: j(`/u/${userId}/settings`)})
                : (0, jsxRuntime.jsx)(v, {
                    to: '/u/$userId/settings',
                    params: {userId},
                    activeOptions: {exact: false, includeSearch: false},
                  }),
              children: [
                (0, jsxRuntime.jsx)(se, {'data-icon': 'inline-start'}),
                (0, jsxRuntime.jsx)('span', {children: 'Settings'}),
              ],
            }),
          ],
        }),
        (0, jsxRuntime.jsx)('h4', {
          className: 'text-muted-foreground font-display px-4 pt-1 text-[13px] font-[450] select-none',
          children: 'Chats',
        }),
        (0, jsxRuntime.jsx)(ChatList, {mainDocumentLinks, searchQuery: query, userId}, query),
      ],
    });
  } /** ExtensionWebSidebarButton: toggles the sidebar. */,
  _ = ({defaultState = 'closed', storageKey, className, size = 'icon', variant = 'ghost', ...props}) => {
    const {sidebarState, setSidebarState} = I(defaultState, {storageKey}),
      closed = sidebarState === 'closed',
      toggle = () => {
        setSidebarState(closed ? 'open' : 'closed');
      };
    return (0, jsxRuntime.jsx)(S, {
      variant,
      size,
      className: f('text-muted-foreground', className),
      'aria-label': 'Toggle sidebar',
      'aria-pressed': !closed,
      onClick: toggle,
      ...props,
      children: closed ? (0, jsxRuntime.jsx)(SidebarClosedIcon, {}) : (0, jsxRuntime.jsx)(SidebarOpenIcon, {}),
    });
  },
  _e = props =>
    (0, jsxRuntime.jsx)(_, {
      ...props,
      className: f('click-depth-effect absolute top-1.5 left-1.5 z-40', props.className),
      size: props.size ?? 'icon',
    }) /** ExtensionWebSidebarToggle: the thin hover strip on the sidebar edge. */,
  Le = ({defaultState = 'closed', storageKey}) => {
    const {sidebarState, setSidebarState} = I(defaultState, {storageKey}),
      closed = sidebarState === 'closed',
      toggle = event => {
        (setSidebarState(closed ? 'open' : 'closed'), event.currentTarget.blur());
      };
    return (0, jsxRuntime.jsx)(X, {
      className: f(
        'group/sidebar-toggle',
        'relative z-30 w-0 shrink-0 cursor-pointer! overflow-visible border-none! bg-transparent ring-0! outline-none!',
        'max-lg:absolute max-lg:inset-y-0',
        closed ? 'max-lg:left-0' : 'max-lg:left-[280px]',
        'after:hidden',
      ),
      onClick: toggle,
      children: (0, jsxRuntime.jsx)('div', {
        className: f(
          'absolute inset-y-0 left-0 w-4 bg-linear-to-r from-transparent to-transparent transition-colors',
          'hover:from-brand/5 hover:to-brand/0 group-focus-visible/sidebar-toggle:from-brand/5 group-focus-visible/sidebar-toggle:to-brand/0',
        ),
        children: (0, jsxRuntime.jsx)('div', {
          className: f(
            'text-brand absolute top-1/2 right-0 -translate-y-1/2 opacity-0 transition-all delay-75 [&_svg]:size-4',
            'group-hover/sidebar-toggle:opacity-100 group-focus-visible/sidebar-toggle:opacity-100',
            'group-hover/sidebar-toggle:-mr-1 group-focus-visible/sidebar-toggle:-mr-1',
          ),
          children: closed ? (0, jsxRuntime.jsx)(O, {}) : (0, jsxRuntime.jsx)(q, {}),
        }),
      }),
    });
  },
  SidebarActions = ({children}) => (0, jsxRuntime.jsx)('div', {className: 'p-1.5', children}),
  SidebarLink = ({children, ...props}) =>
    (0, jsxRuntime.jsx)(S, {
      variant: 'ghost',
      className: '[&.active]:bg-muted! [&.active]:text-foreground text-muted-foreground flex w-full justify-start',
      nativeButton: false,
      ...props,
      children,
    });
