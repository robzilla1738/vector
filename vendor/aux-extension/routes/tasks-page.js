/* Aux-owned source: the Tasks page (assets/tasks-D7OPjR17.js, after its imports; _s exported as
 * component). The user's chats as cards or a virtual list, filtered by status and Project, searched,
 * newest or oldest first, loaded in pages, polled while any runs; and the composer above them.
 * Names the rest of the chunk uses keep their chunk names: _s the page.
 * Chunk names used: _ useTRPC, T navigate, E useApp, U useQueryClient, G useInfiniteQuery, L the route
 * API, A useParams, B link props, qe the task card, Oe debounce, R/V/D/j/Ze menus and toggles, the
 * composer parts. */
var jsxRuntime = F(),
  ListIcon = ({size = 24, ariaHidden = true, ...r}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...r,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M13 15.2422C13.0001 14.1815 13.4218 13.1641 14.1719 12.4141L18.4648 8.12109C18.8075 7.77821 19 7.31289 19 6.82812C18.9998 5.81853 18.1814 5.00015 17.1719 5H6.82812C5.81855 5.00016 5.00016 5.81855 5 6.82812C5 7.3129 5.19244 7.77822 5.53516 8.12109L9.82812 12.4141C10.5782 13.1641 10.9999 14.1815 11 15.2422V20.0566L13 19.3066V15.2422ZM21 6.82812C21 7.84336 20.5966 8.81722 19.8789 9.53516L15.5859 13.8281C15.211 14.2031 15.0001 14.712 15 15.2422V19.3066C15 20.088 14.5456 20.7928 13.8457 21.1191L13.7021 21.1797L11.7021 21.9297C10.3946 22.42 9 21.4529 9 20.0566V15.2422C8.99989 14.7119 8.78903 14.2031 8.41406 13.8281L4.12109 9.53516C3.40331 8.81721 3 7.84334 3 6.82812C3.00016 4.71398 4.71398 3.00016 6.82812 3H17.1719C19.286 3.00015 20.9998 4.71399 21 6.82812Z',
        fill: 'currentColor',
      }),
    }),
  CardIcon = ({size = 24, ariaHidden = true, ...r}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...r,
      children: (0, jsxRuntime.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M10 11.0001C10.5523 11.0001 11 11.4478 11 12.0001V20.0001C11 20.5524 10.5523 21.0001 10 21.0001H8.79983C7.9764 21.0001 7.29842 21.0011 6.74807 20.9561C6.18607 20.9102 5.66888 20.8118 5.18362 20.5645C4.43118 20.1811 3.81902 19.569 3.43557 18.8165C3.18836 18.3312 3.08989 17.8141 3.04397 17.252C2.99901 16.7017 3.00002 16.0237 3.00002 15.2003V12.0001C3.00007 11.4479 3.44783 11.0002 4.00002 11.0001H10ZM19.9424 15.0011C19.979 15.0025 20.0547 15.0083 20.1465 15.0294L20.1475 15.0284C20.556 15.1229 20.8753 15.4415 20.9707 15.8497C20.9926 15.9431 20.9976 16.0205 20.999 16.0577C21.0003 16.0899 21 16.1229 21 16.129C21 16.7885 21.0051 17.29 20.9326 17.7227L20.8965 17.9044C20.5731 19.2981 19.5325 20.4052 18.1787 20.8223L17.9043 20.8966C17.43 21.0067 16.8827 21.0001 16.1289 21.0001H14C13.4478 21 13 20.5523 13 20.0001V16.0001C13.0001 15.4479 13.4478 15.0002 14 15.0001H19.8711C19.8769 15.0001 19.91 14.9998 19.9424 15.0011ZM5.00002 15.2003C5.00002 16.0566 5.00038 16.6389 5.03713 17.089C5.07294 17.5272 5.13811 17.7518 5.2178 17.9083C5.4095 18.2845 5.7156 18.5906 6.09182 18.7823C6.24819 18.862 6.47284 18.9271 6.91116 18.963C7.36116 18.9997 7.94351 19.0001 8.79983 19.0001H9.00002V13.0001H5.00002V15.2003ZM15 19.0001H16.1289C16.9944 19.0001 17.2573 18.9936 17.4522 18.9483C18.1955 18.7759 18.7758 18.1955 18.9483 17.4522C18.9724 17.3481 18.9843 17.2244 18.9912 17.0001H15V19.0001ZM15.2002 3.00008C16.0237 3.00008 16.7016 2.99907 17.252 3.04403C17.814 3.08995 18.3312 3.18843 18.8164 3.43563C19.5689 3.81909 20.181 4.43123 20.5645 5.18368C20.8118 5.66896 20.9101 6.18611 20.9561 6.74813C21.001 7.29849 21 7.97644 21 8.79989V12.0001C21 12.5524 20.5523 13.0001 20 13.0001H14C13.4478 13 13 12.5523 13 12.0001V4.00008C13.0001 3.44789 13.4478 3.00016 14 3.00008H15.2002ZM15 11.0001H19V8.79989C19 7.94354 18.9997 7.36124 18.9629 6.91122C18.9271 6.47287 18.8619 6.24826 18.7822 6.09188C18.5905 5.71565 18.2844 5.40956 17.9082 5.21786C17.7518 5.13818 17.5271 5.073 17.0889 5.03719C16.6389 5.00045 16.0565 5.00008 15.2002 5.00008H15V11.0001ZM10 3.00008C10.5523 3.00008 10.9999 3.44788 11 4.00008V8.00008C11 8.55237 10.5523 9.00008 10 9.00008H4.00002C3.44781 8.99999 3.00002 8.55231 3.00002 8.00008C3.00002 7.13458 2.99187 6.50561 3.13674 5.96493C3.50663 4.58466 4.5846 3.50669 5.96487 3.1368C6.50555 2.99193 7.13452 3.00008 8.00002 3.00008H10ZM8.00002 5.00008C7.00582 5.00008 6.70471 5.00889 6.48244 5.06844C5.79236 5.25339 5.25333 5.79242 5.06838 6.48251C5.03656 6.60127 5.01995 6.74264 5.01076 7.00008H9.00002V5.00008H8.00002Z',
        fill: 'currentColor',
      }),
    }),
  FilterIcon = ({size = 24, ariaHidden = true, ...r}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...r,
      children: (0, jsxRuntime.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 12H19C19 8.13401 15.866 5 12 5V12Z',
        fill: 'currentColor',
      }),
    }),
  React = H(O(), 1),
  tasksRoute = L('/_web/(profile)/u/$userId/tasks/'),
  PAGE_SIZE = 30,
  TasksContext = (0, React.createContext)(null); /** Whether a session is running or waiting on the user. */
function isActive(s) {
  return s.status === 'running' || s.status === 'suspended';
}
var /** The chats for the page’s filters, search and order, in pages of 30, polled while any is active. */
  TasksProvider = ({children}) => {
    const a = _(),
      r = T(),
      t = tasksRoute.useSearch(),
      {accountId} = E(),
      u = U(),
      n = G(
        a.sessions.listPreviewItems.infiniteQueryOptions(
          {
            limit: PAGE_SIZE,
            order: t.order,
            q: t.q ?? void 0,
            statuses: statusesFor(t.filter),
            accountId,
            projectIds: Array.isArray(t.projectId) ? t.projectId : t.projectId ? [t.projectId] : void 0,
          },
          {
            getNextPageParam: (c, C) => (c.length === PAGE_SIZE ? C.length * PAGE_SIZE : void 0),
            refetchInterval: c => (u && c.state.data?.pages.some(C => C.some(isActive)) ? 5e3 : false),
            select: c => ({
              ...c,
              pages: c.pages.map(C =>
                C.map(w => ({...w, previewText: w.previewText ? Ae(te(w.previewText), 100) : void 0})),
              ),
            }),
          },
        ),
      ),
      l = (0, React.useMemo)(() => n.data?.pages.flat() ?? [], [n.data?.pages]),
      i = n.hasNextPage,
      f = n.isFetchingNextPage,
      m = n.isLoading,
      g = n.isError,
      h = (0, React.useCallback)(() => {
        n.isFetchingNextPage || !n.hasNextPage || n.fetchNextPage();
      }, [n]),
      p = (0, React.useCallback)(
        c => {
          r({to: '/u/$userId/tasks/$sessionId', params: {userId: String(accountId), sessionId: c}});
        },
        [accountId, r],
      ),
      x = (0, React.useMemo)(
        () => ({
          canFetchMoreSessionPreviews: i,
          fetchMoreSessionPreviews: h,
          handleOpenChat: p,
          isFetchingMoreSessionPreviews: f,
          isLoadingSessionPreviews: m,
          isSessionPreviewsError: g,
          items: l,
        }),
        [i, h, p, f, m, g, l],
      );
    return (0, jsxRuntime.jsx)(TasksContext.Provider, {value: x, children});
  },
  useTasks = () => {
    const s = (0, React.use)(TasksContext);
    if (!s) throw new Error('useTasksContext must be used within TasksContextProvider');
    return s;
  }; /** The session statuses a status filter stands for. */
function statusesFor(s) {
  switch (s) {
    case 'running':
      return ['running'];
    case 'failed':
      return ['errored'];
    case 'needs-review':
      return ['suspended'];
    case 'done':
      return ['idle', 'errored', 'interrupted', 'aborted'];
    case 'all':
      return;
  }
}
var /** Chats as cards, with more loaded at the end. */
  TaskCards = () => {
    const {userId} = A({from: '/_web/(profile)/u/$userId/tasks'}),
      {
        canFetchMoreSessionPreviews,
        fetchMoreSessionPreviews,
        isFetchingMoreSessionPreviews,
        isLoadingSessionPreviews,
        isSessionPreviewsError,
        items,
      } = useTasks();
    return (0, jsxRuntime.jsxs)('div', {
      className: '-mx-4 min-h-0 flex-1 overflow-y-auto px-4 pt-1 pb-1',
      children: [
        isLoadingSessionPreviews && !items.length
          ? (0, jsxRuntime.jsx)('div', {
              className: 'grid grid-cols-1 gap-4 px-3 sm:grid-cols-2 lg:grid-cols-4',
              children: Array.from({length: 8}, (l, i) =>
                (0, jsxRuntime.jsx)(Ge, {style: {opacity: 1 - i * 0.08}}, `task-card-skeleton-${i}`),
              ),
            })
          : items.length
            ? (0, jsxRuntime.jsx)('div', {
                className: 'grid grid-cols-1 gap-4 px-3 sm:grid-cols-2 lg:grid-cols-4',
                children: items.map(l =>
                  (0, jsxRuntime.jsx)(
                    'div',
                    {
                      className: 'focus-visible:ring-ring/50 w-full rounded-[14px] outline-none focus-visible:ring-2',
                      children: (0, jsxRuntime.jsx)(TaskCard, {session: l, userId}),
                    },
                    l.id,
                  ),
                ),
              })
            : (0, jsxRuntime.jsx)('p', {
                className: 'text-muted-foreground px-3 py-6 text-center text-sm',
                role: 'status',
                children: isSessionPreviewsError ? 'Could not load chats' : 'No chats found',
              }),
        (canFetchMoreSessionPreviews || isFetchingMoreSessionPreviews) &&
          (0, jsxRuntime.jsx)('div', {
            className: 'flex justify-center py-4',
            children: (0, jsxRuntime.jsx)(N, {
              variant: 'ghost',
              size: 'sm',
              disabled: isFetchingMoreSessionPreviews,
              onClick: fetchMoreSessionPreviews,
              children: isFetchingMoreSessionPreviews ? 'Loading…' : 'Load more',
            }),
          }),
      ],
    });
  },
  TaskCard = ({session, userId}) => {
    const r = T(),
      t = B({to: '/u/$userId/tasks/$sessionId', params: {userId, sessionId: session.id}});
    return (0, jsxRuntime.jsx)(qe, {
      session,
      taskLinkProps: t,
      onOpenRoutine: o => {
        r({to: '/u/$userId/settings/routines/$routineId', params: {userId, routineId: o}});
      },
    });
  },
  RowSpacer = ({style}) =>
    (0, jsxRuntime.jsxs)('div', {
      className: 'flex h-9 items-center gap-8 rounded-xl px-3',
      style,
      children: [
        (0, jsxRuntime.jsxs)('div', {
          className: 'flex min-w-0 grow items-center gap-5 overflow-hidden',
          children: [
            (0, jsxRuntime.jsx)(S, {className: 'h-2 w-30 shrink-0 rounded-sm'}),
            (0, jsxRuntime.jsx)(S, {className: 'h-2 w-full rounded-sm opacity-50'}),
          ],
        }),
        (0, jsxRuntime.jsx)(S, {className: 'h-1.5 w-16 shrink-0 rounded-sm'}),
      ],
    }) /** Chats as a virtual list, with more loaded at the end. */,
  TaskList = () => {
    const {userId} = A({from: '/_web/(profile)/u/$userId/tasks'}),
      {
        canFetchMoreSessionPreviews,
        fetchMoreSessionPreviews,
        isFetchingMoreSessionPreviews,
        isLoadingSessionPreviews,
        isSessionPreviewsError,
        items,
      } = useTasks(),
      l = (0, React.useRef)(null),
      i = canFetchMoreSessionPreviews || isFetchingMoreSessionPreviews,
      f = items.length + (i ? 1 : 0),
      m = ye({
        count: f,
        estimateSize: x => rowHeight(items[x]),
        getItemKey: x => items[x]?.id ?? x,
        getScrollElement: () => l.current,
        overscan: 10,
      }),
      g = m.getTotalSize() > (m.scrollRect?.height ?? 0),
      h = m.getVirtualItems(),
      p = h.at(-1)?.index;
    return (
      (0, React.useEffect)(() => {
        !canFetchMoreSessionPreviews ||
          isFetchingMoreSessionPreviews ||
          p === void 0 ||
          (p >= items.length - 1 && fetchMoreSessionPreviews());
      }, [canFetchMoreSessionPreviews, fetchMoreSessionPreviews, isFetchingMoreSessionPreviews, items.length, p]),
      (0, jsxRuntime.jsxs)('div', {
        ref: l,
        className: M('-mx-4 min-h-0 flex-1 overflow-y-auto px-4 pb-1', g && 'scroll-fade-effect-y'),
        children: [
          isLoadingSessionPreviews && !items.length
            ? (0, jsxRuntime.jsx)('div', {
                className: 'py-1',
                children: Array.from({length: 8}, (x, c) =>
                  (0, jsxRuntime.jsx)(RowSpacer, {style: {opacity: 1 - c * 0.08}}, `task-skeleton-${c}`),
                ),
              })
            : items.length
              ? null
              : (0, jsxRuntime.jsx)('p', {
                  className: 'text-muted-foreground px-3 py-6 text-center text-sm',
                  role: 'status',
                  children: isSessionPreviewsError ? 'Could not load chats' : 'No chats found',
                }),
          (0, jsxRuntime.jsx)('div', {
            className: 'relative',
            style: {height: `${m.getTotalSize()}px`},
            children: h.map(x => {
              const c = items[x.index];
              return c
                ? (0, jsxRuntime.jsxs)(
                    Ve,
                    {
                      ref: m.measureElement,
                      className: 'absolute inset-x-0 top-0',
                      'data-index': x.index,
                      session: c,
                      style: {transform: `translateY(${x.start}px)`},
                      render: (0, jsxRuntime.jsx)(Z, {
                        to: '/u/$userId/tasks/$sessionId',
                        params: {userId, sessionId: c.id},
                      }),
                      children: [
                        (0, jsxRuntime.jsxs)(Ee, {
                          children: [
                            (0, jsxRuntime.jsx)(Pe, {children: c.title}),
                            (0, jsxRuntime.jsx)(Le, {children: c.previewText}),
                          ],
                        }),
                        (0, jsxRuntime.jsxs)(Me, {
                          children: [
                            (0, jsxRuntime.jsx)(Te, {}),
                            (0, jsxRuntime.jsx)(Re, {}),
                            (0, jsxRuntime.jsx)(ke, {datetime: c.updatedAt}),
                          ],
                        }),
                      ],
                    },
                    x.key,
                  )
                : i
                  ? (0, jsxRuntime.jsx)(
                      'div',
                      {
                        ref: m.measureElement,
                        className: 'absolute inset-x-0 top-0',
                        'data-index': x.index,
                        style: {transform: `translateY(${x.start}px)`},
                        children: isFetchingMoreSessionPreviews ? (0, jsxRuntime.jsx)(RowSpacer, {}) : null,
                      },
                      x.key,
                    )
                  : null;
            }),
          }),
        ],
      })
    );
  } /** A list row’s height: taller with a preview or routine. */,
  rowHeight = s => (s ? (s.previewText || s.routine ? 68 : 56) : 40),
  tasksPage = L('/_web/(profile)/u/$userId/tasks/'),
  TasksToolbar = () =>
    (0, jsxRuntime.jsxs)('div', {
      className: 'flex flex-wrap justify-between gap-3 px-2',
      children: [
        (0, jsxRuntime.jsx)('div', {
          className: 'flex min-w-0 items-center gap-1',
          children: (0, jsxRuntime.jsx)(ViewToggle, {}),
        }),
        (0, jsxRuntime.jsxs)(j, {
          className: 'gap-0!',
          children: [
            (0, jsxRuntime.jsx)(TaskSearch, {}),
            (0, jsxRuntime.jsx)(j, {
              children: (0, jsxRuntime.jsxs)(ne, {
                children: [
                  (0, jsxRuntime.jsx)(J, {
                    render: (0, jsxRuntime.jsx)(N, {'aria-label': 'Filter chats', variant: 'ghost', size: 'icon-sm'}),
                    children: (0, jsxRuntime.jsx)(ListIcon, {className: 'size-4'}),
                  }),
                  (0, jsxRuntime.jsxs)(ae, {
                    align: 'end',
                    size: 'sm',
                    children: [(0, jsxRuntime.jsx)(StatusFilter, {}), (0, jsxRuntime.jsx)(ProjectFilter, {})],
                  }),
                ],
              }),
            }),
            (0, jsxRuntime.jsx)(OrderMenu, {}),
          ],
        }),
      ],
    }),
  STATUS_FILTERS = [
    {label: 'All statuses', value: 'all'},
    {label: 'Running', value: 'running'},
    {label: 'Failed', value: 'failed'},
    {label: 'Needs review', value: 'needs-review'},
    {label: 'Done', value: 'done'},
  ],
  StatusFilter = () => {
    const s = tasksPage.useNavigate(),
      {filter} = tasksPage.useSearch(),
      r = t => {
        s({to: '.', search: o => ({...o, filter: t}), replace: true});
      };
    return (0, jsxRuntime.jsxs)(R, {
      children: [
        (0, jsxRuntime.jsxs)(V, {children: [(0, jsxRuntime.jsx)(FilterIcon, {className: 'size-4'}), 'Status']}),
        (0, jsxRuntime.jsx)(D, {
          size: 'sm',
          children: (0, jsxRuntime.jsx)(W, {
            value: filter,
            onValueChange: r,
            children: STATUS_FILTERS.map(t => (0, jsxRuntime.jsx)(Q, {value: t.value, children: t.label}, t.value)),
          }),
        }),
      ],
    });
  },
  ProjectFilter = () => {
    const s = _(),
      {accountId} = E(),
      r = tasksPage.useNavigate(),
      {projectId} = tasksPage.useSearch(),
      {data = []} = X(s.projects.list.queryOptions({accountId})),
      u = Array.isArray(projectId) ? projectId : projectId ? [projectId] : [],
      n = () => {
        r({to: '.', search: i => ({...i, projectId: void 0}), replace: true});
      },
      l = i => f => {
        const m = f ? [...u, i] : u.filter(g => g !== i);
        r({to: '.', search: g => ({...g, projectId: m.length ? m : void 0}), replace: true});
      };
    return (0, jsxRuntime.jsxs)(R, {
      children: [
        (0, jsxRuntime.jsxs)(V, {children: [(0, jsxRuntime.jsx)(ze, {className: 'size-4'}), 'Projects']}),
        (0, jsxRuntime.jsx)(D, {
          size: 'sm',
          children: (0, jsxRuntime.jsxs)(K, {
            children: [
              (0, jsxRuntime.jsx)(k, {
                checked: u.length === 0,
                closeOnClick: false,
                onCheckedChange: n,
                children: 'All projects',
              }),
              (0, jsxRuntime.jsx)(q, {}),
              data
                .filter(i => !i.archivedAt)
                .map(i =>
                  (0, jsxRuntime.jsxs)(
                    k,
                    {
                      checked: u.includes(i.id),
                      closeOnClick: false,
                      onCheckedChange: l(i.id),
                      children: [(0, jsxRuntime.jsx)(re, {className: 'size-4', color: i.color, icon: i.icon}), i.name],
                    },
                    i.id,
                  ),
                ),
            ],
          }),
        }),
      ],
    });
  },
  VIEWS = new Map([
    ['list', {label: 'List', icon: _e}],
    ['card', {label: 'Card', icon: CardIcon}],
  ]),
  ViewToggle = () => {
    const s = tasksPage.useNavigate(),
      {view} = tasksPage.useSearch(),
      r = (0, React.useCallback)(
        t => {
          s({to: '.', search: o => ({...o, view: t}), replace: true});
        },
        [s],
      );
    return (0, jsxRuntime.jsx)(Ze, {
      className: 'inline-block',
      value: view,
      onValueChange: r,
      children: (0, jsxRuntime.jsx)(Be, {
        children: [...VIEWS.entries()].map(([t, o]) =>
          (0, jsxRuntime.jsxs)(
            Fe,
            {
              value: t,
              children: [
                (0, jsxRuntime.jsx)(o.icon, {className: 'text-muted-foreground size-4'}),
                (0, jsxRuntime.jsx)('span', {children: o.label}),
              ],
            },
            t,
          ),
        ),
      }),
    });
  } /** Search, applied after a pause. */,
  TaskSearch = () => {
    const s = tasksPage.useNavigate(),
      {q = ''} = tasksPage.useSearch(),
      [r, t] = (0, React.useState)(false),
      [o, u] = (0, React.useState)(q),
      n = (0, React.useRef)(null),
      l = (0, React.useMemo)(
        () =>
          Oe(h => {
            s({to: '.', search: p => ({...p, q: h.trim() || void 0}), replace: true});
          }, 300),
        [s],
      ),
      i = h => {
        const p = h.currentTarget.value;
        (u(p), (!(h.nativeEvent instanceof InputEvent) || !h.nativeEvent.isComposing) && l(p));
      },
      f = () => {
        t(true);
      },
      m = h => {
        l(h.currentTarget.value);
      },
      g = h => {
        (l.flush(), h.target.value.trim() || t(false));
      };
    return (
      (0, React.useEffect)(() => {
        (u(q), t(!!q.trim()));
      }, [q]),
      (0, React.useEffect)(() => l.cancel, [l]),
      (0, React.useEffect)(() => {
        r && n.current?.focus();
      }, [r]),
      (0, jsxRuntime.jsx)(j, {
        children: (0, jsxRuntime.jsxs)(Y, {
          className: 'focus-within:bg-input! h-9! border-none bg-transparent! ring-0! sm:h-7!',
          children: [
            (0, jsxRuntime.jsx)(ee, {
              'aria-label': 'Search tasks',
              variant: 'ghost',
              size: 'icon-sm',
              className: 'size-9! sm:size-7!',
              onClick: f,
              children: (0, jsxRuntime.jsx)($e, {}),
            }),
            (0, jsxRuntime.jsx)('div', {
              className: M('overflow-hidden transition-all', r ? 'w-40' : 'w-0'),
              children:
                r &&
                (0, jsxRuntime.jsx)(se, {
                  ref: n,
                  value: o,
                  'aria-label': 'Search tasks',
                  placeholder: 'Search…',
                  className: 'h-9 border-none bg-transparent! pl-0 shadow-none ring-0 sm:h-7',
                  onChange: i,
                  onCompositionStart: l.cancel,
                  onCompositionEnd: m,
                  onBlur: g,
                }),
            }),
          ],
        }),
      })
    );
  },
  OrderMenu = () => {
    const s = tasksPage.useNavigate(),
      {order} = tasksPage.useSearch(),
      r = (0, React.useCallback)(
        t => {
          t && s({to: '.', search: o => ({...o, order: t}), replace: true});
        },
        [s],
      );
    return (0, jsxRuntime.jsx)(j, {
      children: (0, jsxRuntime.jsxs)(Ne, {
        value: order,
        onValueChange: r,
        children: [
          (0, jsxRuntime.jsx)(be, {
            render: ({className, ...o}) =>
              (0, jsxRuntime.jsx)(N, {
                ...o,
                'aria-label': order === 'asc' ? 'Sort tasks oldest first' : 'Sort tasks newest first',
                className: 'size-9! sm:size-7!',
                variant: 'ghost',
                size: 'icon-sm',
                children: order === 'asc' ? (0, jsxRuntime.jsx)(je, {}) : (0, jsxRuntime.jsx)(Ce, {}),
              }),
          }),
          (0, jsxRuntime.jsx)(Ie, {
            alignItemWithTrigger: false,
            align: 'end',
            children: ORDERS.map(t => (0, jsxRuntime.jsx)(Se, {value: t.value, children: t.label}, t.value)),
          }),
        ],
      }),
    });
  },
  ORDERS = [
    {label: 'Newest first', value: 'desc'},
    {label: 'Oldest first', value: 'asc'},
  ] /** The composer above the chats, for a new chat in the selected Project. */,
  TasksComposer = ({projectId, projectIdLocked = false, onSessionChange, onProjectIdChange}) =>
    (0, jsxRuntime.jsx)(we, {
      projectId,
      onSessionChange,
      children: (0, jsxRuntime.jsx)(ue, {
        source: 'tasks-page',
        defaultDraftState: {draftProjectId: projectId ?? null},
        defaultDraftStateKey: projectId ? `project:${projectId}` : 'account',
        projectIdLocked,
        onProjectIdChange,
        onSessionChange,
        children: (0, jsxRuntime.jsx)('div', {
          className: 'w-full **:data-[agent-session-ui="chat"]:max-w-none',
          children: (0, jsxRuntime.jsxs)(he, {
            className: 'max-w-none p-0',
            children: [
              (0, jsxRuntime.jsxs)(me, {
                className: 'p-1',
                children: [
                  (0, jsxRuntime.jsx)(le, {placeholder: 'Ask AI a task, @ for context'}),
                  (0, jsxRuntime.jsxs)(ge, {
                    className: 'p-1',
                    children: [
                      (0, jsxRuntime.jsxs)(P, {
                        children: [
                          (0, jsxRuntime.jsx)(xe, {}),
                          (0, jsxRuntime.jsx)(pe, {}),
                          (0, jsxRuntime.jsx)(ce, {}),
                          (0, jsxRuntime.jsx)(de, {}),
                        ],
                      }),
                      (0, jsxRuntime.jsxs)(P, {
                        children: [
                          (0, jsxRuntime.jsx)(ie, {children: (0, jsxRuntime.jsx)(ve, {})}),
                          (0, jsxRuntime.jsx)(fe, {}),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, jsxRuntime.jsx)(oe, {}),
            ],
          }),
        }),
      }),
    }); /** The Tasks page. */
function _s() {
  const {userId} = I.useParams(),
    a = I.useNavigate(),
    r = I.useSearch(),
    t = Array.isArray(r.projectId) ? r.projectId : r.projectId ? [r.projectId] : [],
    o = De(),
    u = l => {
      l && a({to: '/u/$userId/tasks/$sessionId', params: {userId, sessionId: l}});
    },
    n = l => {
      a({to: '/u/$userId/tasks', params: {userId}, search: i => ({...i, projectId: l ?? void 0}), replace: true});
    };
  return (0, jsxRuntime.jsxs)('div', {
    className: 'flex h-full min-h-0 flex-col',
    children: [
      (0, jsxRuntime.jsx)(Qe, {}),
      o &&
        (0, jsxRuntime.jsx)('nav', {
          className: 'flex h-11 shrink-0 items-center px-1.5',
          children: (0, jsxRuntime.jsx)(He, {}),
        }),
      (0, jsxRuntime.jsxs)('div', {
        className: 'mx-auto flex min-h-0 w-full max-w-280 flex-1 flex-col gap-3 px-6 py-3',
        children: [
          (0, jsxRuntime.jsx)(TasksComposer, {
            projectId: t.length === 1 ? t[0] : void 0,
            onProjectIdChange: n,
            onSessionChange: u,
          }),
          (0, jsxRuntime.jsx)(TasksToolbar, {}),
          (0, jsxRuntime.jsxs)(TasksProvider, {
            children: [
              r.view === 'list' && (0, jsxRuntime.jsx)(TaskList, {}),
              r.view === 'card' && (0, jsxRuntime.jsx)(TaskCards, {}),
            ],
          }),
        ],
      }),
    ],
  });
}
