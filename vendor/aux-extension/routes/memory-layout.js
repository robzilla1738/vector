/* Aux-owned source: the Memory settings layout (assets/route-CJZWzPOz.js, after its imports; Ee
 * exported as component): a resizable list beside the page, listing memory files or memory history
 * entries by the current section, with loading rows and Open folder.
 * Names the rest of the chunk uses keep their chunk names: Ee the layout. */
var React = z(F(), 1),
  jsxRuntime = k(),
  LIST_SIZE = {DEFAULT: '240px', MAX: '480px'},
  MemoryLayout = ({children}) =>
    (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)(I, {
          id: 'left',
          className: 'overflow-hidden',
          minSize: LIST_SIZE.DEFAULT,
          defaultSize: LIST_SIZE.DEFAULT,
          maxSize: LIST_SIZE.MAX,
          collapsible: false,
          groupResizeBehavior: 'preserve-pixel-size',
          children: (0, jsxRuntime.jsx)('div', {
            className: 'size-full min-h-0 overflow-hidden',
            style: {minWidth: LIST_SIZE.DEFAULT},
            children,
          }),
        }),
        (0, jsxRuntime.jsx)(O, {}),
      ],
    }),
  MainPanel = s => (0, jsxRuntime.jsx)(I, {id: 'main', ...s}),
  memoryRoute = b(
    '/_web/(settings)/u/$userId/settings/memories',
  ) /** The memory files, the selected one highlighted. */,
  FileList = () => {
    const {userId} = memoryRoute.useParams(),
      r = S(),
      i = w(),
      d = Number.parseInt(userId, 10),
      x = j(),
      {data} = M(x.memory.listFiles.queryOptions({accountId: d}, {select: Z})),
      t = (0, React.useMemo)(() => ee(data.files), [data.files]),
      n = new URLSearchParams(i.searchStr).get('path') ?? void 0,
      p = i.pathname.endsWith('/memories/files') && n && data.fileByPath.has(n) ? n : void 0,
      f = u => {
        u.data &&
          r({
            to: '/u/$userId/settings/memories/files',
            params: {userId},
            search: {path: u.path},
            replace: true,
            resetScroll: false,
          });
      };
    return t.length === 0
      ? (0, jsxRuntime.jsx)('div', {
          className: 'text-muted-foreground flex size-full items-center justify-center px-4 text-center text-sm',
          children: 'No memory files yet',
        })
      : (0, jsxRuntime.jsx)($, {ariaLabel: 'Memory files', nodes: t, selectedPath: p, onSelect: f});
  },
  LOADING_ROWS = 3,
  LoadingRow = () =>
    (0, jsxRuntime.jsxs)('div', {
      className: 'flex w-full min-w-0 flex-col gap-1.5 rounded-md px-3 py-2',
      children: [
        (0, jsxRuntime.jsx)(l, {className: 'bg-muted h-4 w-3/4 animate-none'}),
        (0, jsxRuntime.jsx)(l, {className: 'bg-muted h-3 w-full animate-none'}),
        (0, jsxRuntime.jsx)(l, {className: 'bg-muted h-3 w-2/3 animate-none'}),
      ],
    }),
  LoadingRows = () =>
    (0, jsxRuntime.jsx)(jsxRuntime.Fragment, {
      children: Array.from({length: LOADING_ROWS}).map((s, r) => (0, jsxRuntime.jsx)(LoadingRow, {}, r)),
    }),
  historyRoute = b(
    '/_web/(settings)/u/$userId/settings/memories',
  ) /** Memory history entries, newest first, with more loaded on request. */,
  HistoryList = () => {
    const {userId} = historyRoute.useParams(),
      r = S(),
      i = w(),
      d = new URLSearchParams(i.searchStr).get('historyEntryId') ?? void 0,
      x = Number.parseInt(userId, 10),
      m = j(),
      t = _(
        m.memory.listHistory.infiniteQueryOptions({limit: 50, accountId: x}, {getNextPageParam: o => o.nextCursor}),
      ),
      n = (0, React.useMemo)(() => t.data?.pages.flatMap(o => o.entries) ?? [], [t.data]),
      p = (0, React.useMemo)(() => K(n), [n]),
      f = d ?? n[0]?.id,
      u = o => () => {
        r({
          to: '/u/$userId/settings/memories/histories',
          params: {userId},
          search: {historyEntryId: o},
          replace: true,
          resetScroll: false,
        });
      },
      T = () => {
        t.fetchNextPage();
      };
    return (0, jsxRuntime.jsx)(G, {
      className: 'size-full',
      children: (0, jsxRuntime.jsxs)('div', {
        className: 'p-2',
        children: [
          t.isPending && (0, jsxRuntime.jsx)(LoadingRows, {}),
          t.isError &&
            (0, jsxRuntime.jsx)('div', {
              className: 'text-destructive px-3 py-6 text-center text-sm',
              children: 'Could not load memory history.',
            }),
          !t.isPending &&
            !t.isError &&
            n.length === 0 &&
            (0, jsxRuntime.jsx)('div', {
              className: 'text-muted-foreground px-3 py-6 text-center text-sm',
              children: 'No memory history yet.',
            }),
          (0, jsxRuntime.jsx)('div', {
            className: 'space-y-3',
            children: p.map(([o, E]) =>
              (0, jsxRuntime.jsxs)(
                'section',
                {
                  children: [
                    (0, jsxRuntime.jsx)('h3', {
                      className: 'text-muted-foreground px-3 py-1.5 text-xs font-medium',
                      children: o,
                    }),
                    (0, jsxRuntime.jsx)('div', {
                      className: 'space-y-1',
                      children: E.map(a =>
                        (0, jsxRuntime.jsxs)(
                          'button',
                          {
                            className: `hover:bg-muted flex w-full min-w-0 flex-col gap-0.5 rounded-md px-3 py-2 text-left ${f === a.id ? 'bg-muted' : ''}`,
                            onClick: u(a.id),
                            type: 'button',
                            children: [
                              (0, jsxRuntime.jsxs)('div', {
                                className: 'flex min-w-0 items-center justify-between gap-2',
                                children: [
                                  (0, jsxRuntime.jsx)('span', {
                                    className: 'truncate text-sm font-medium',
                                    children: J(a),
                                  }),
                                  a.status === 'failed' &&
                                    (0, jsxRuntime.jsx)(A, {variant: 'destructive', children: 'Failed'}),
                                ],
                              }),
                              a.changes.length > 0
                                ? (0, jsxRuntime.jsxs)('div', {
                                    className: 'text-muted-foreground flex min-w-0 items-center gap-1.5 text-xs',
                                    children: [
                                      (0, jsxRuntime.jsx)('span', {children: Y(a.changes.length)}),
                                      (0, jsxRuntime.jsxs)('span', {
                                        className: 'text-green-500',
                                        children: ['+', v(a, 'addedLines')],
                                      }),
                                      (0, jsxRuntime.jsxs)('span', {
                                        className: 'text-rose-500',
                                        children: ['-', v(a, 'removedLines')],
                                      }),
                                    ],
                                  })
                                : (0, jsxRuntime.jsxs)('span', {
                                    className: 'text-muted-foreground truncate text-xs',
                                    children: [V(a.elapsedMs), ' · ', a.usage?.totalTokens ?? 0, ' tokens'],
                                  }),
                            ],
                          },
                          a.id,
                        ),
                      ),
                    }),
                  ],
                },
                o,
              ),
            ),
          }),
          t.hasNextPage &&
            (0, jsxRuntime.jsxs)(y, {
              className: 'mt-2 w-full',
              variant: 'secondary',
              disabled: t.isFetchingNextPage,
              onClick: T,
              children: [t.isFetchingNextPage && (0, jsxRuntime.jsx)(R, {}), 'Load more'],
            }),
        ],
      }),
    });
  }; /** The Memory settings layout: the list for the current section beside the page. */
function Ee() {
  const s = L(),
    r = !!s({to: '/u/$userId/settings/memories/files', fuzzy: true}),
    i = !!s({to: '/u/$userId/settings/memories/histories', fuzzy: true});
  return !r && !i
    ? (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
        children: [
          (0, jsxRuntime.jsx)(N, {segments: ['Settings', 'Memory']}),
          (0, jsxRuntime.jsx)(React.Suspense, {
            fallback: (0, jsxRuntime.jsx)(C, {}),
            children: (0, jsxRuntime.jsx)(g, {}),
          }),
        ],
      })
    : (0, jsxRuntime.jsx)('div', {
        className: 'flex size-full min-h-0 flex-col',
        children: (0, jsxRuntime.jsxs)(H, {
          className: 'min-h-0 flex-1 **:data-[slot=resizable-panel]:transition-none',
          children: [
            (0, jsxRuntime.jsx)(N, {segments: ['Settings', 'Memory']}),
            (0, jsxRuntime.jsx)(MemoryLayout, {
              children: r ? (0, jsxRuntime.jsx)(OpenFolderButton, {}) : (0, jsxRuntime.jsx)(HistoryList, {}),
            }),
            (0, jsxRuntime.jsx)(MainPanel, {
              className: 'flex min-w-0 flex-col overflow-hidden',
              children: (0, jsxRuntime.jsx)(React.Suspense, {
                fallback: (0, jsxRuntime.jsx)(OpenFolderItem, {}),
                children: (0, jsxRuntime.jsx)(g, {}),
              }),
            }),
          ],
        }),
      });
}
var OpenFolderButton = () =>
    (0, jsxRuntime.jsxs)('div', {
      className: 'flex size-full min-h-0 flex-col',
      children: [
        (0, jsxRuntime.jsx)('div', {
          className: 'flex h-12 shrink-0 items-center border-b px-1',
          children: (0, jsxRuntime.jsx)(React.Suspense, {
            fallback: (0, jsxRuntime.jsxs)(y, {
              className: 'text-muted-foreground justify-start',
              variant: 'ghost',
              size: 'sm',
              disabled: true,
              children: [
                (0, jsxRuntime.jsx)(P, {'data-icon': 'inline-start'}),
                (0, jsxRuntime.jsx)('span', {children: 'Open folder'}),
              ],
            }),
            children: (0, jsxRuntime.jsx)(OpenMemoryFolder, {}),
          }),
        }),
        (0, jsxRuntime.jsx)('div', {
          className: 'flex min-h-0 flex-1 flex-col py-2',
          children: (0, jsxRuntime.jsx)(React.Suspense, {
            fallback: (0, jsxRuntime.jsx)(B, {}),
            children: (0, jsxRuntime.jsx)(FileList, {}),
          }),
        }),
      ],
    }),
  OpenFolderItem = () =>
    (0, jsxRuntime.jsxs)('div', {
      className: 'flex size-full min-h-0 flex-col',
      children: [
        (0, jsxRuntime.jsx)('div', {
          className: 'flex h-12 shrink-0 items-center border-b px-3',
          children: (0, jsxRuntime.jsx)(l, {className: 'h-4 w-40'}),
        }),
        (0, jsxRuntime.jsxs)('div', {
          className: 'space-y-3 px-4 py-3',
          children: [
            (0, jsxRuntime.jsx)(l, {className: 'h-4 w-1/3'}),
            (0, jsxRuntime.jsx)(l, {className: 'h-4 w-full'}),
            (0, jsxRuntime.jsx)(l, {className: 'h-4 w-5/6'}),
            (0, jsxRuntime.jsx)(l, {className: 'h-4 w-2/3'}),
          ],
        }),
      ],
    }),
  OpenMemoryFolder = () => {
    const {userId} = X.useParams(),
      r = Number.parseInt(userId, 10),
      i = j(),
      d = D(i.meta.open.mutationOptions()),
      {data} = M(i.memory.getDirectory.queryOptions({accountId: r})),
      m = async () => {
        try {
          await d.mutateAsync({path: data, mode: 'open', accountId: r});
        } catch (t) {
          (U.error('There was an error opening the memory folder.'), console.error(t));
        }
      };
    return (0, jsxRuntime.jsxs)(W, {
      children: [
        (0, jsxRuntime.jsxs)(Q, {
          render: (0, jsxRuntime.jsx)(y, {
            className: 'w-full justify-start',
            variant: 'ghost',
            disabled: d.isPending,
            onClick: m,
          }),
          children: [
            (0, jsxRuntime.jsx)(P, {'data-icon': 'inline-start'}),
            (0, jsxRuntime.jsx)('span', {children: 'Open folder'}),
          ],
        }),
        (0, jsxRuntime.jsx)(q, {children: 'Open memory folder'}),
      ],
    });
  };
