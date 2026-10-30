/* Aux-owned source, Settings › Archived chats (assets/archived-chats-BgWKiXTB.js, the module body,
 * exported as component): archived chats 20 to a page, each opening its session and with Unarchive
 * and Delete, with loading, error and empty states and the page controls.
 * Names the rest of the chunk uses keep their chunk names: ye the page; b React stays as named, the JSX runtime is jsxRuntime
 * stay as named.
 * Chunk names used: D/E/T React and JSX runtime, S Link, g/R/H/Q/O the dropdown item, group,
 * content, trigger and root, _/z chevrons, k useConfirm, L the archive icon, f useMutation,
 * q Skeleton, F useQuery, U useQueryClient, G strip markdown, N useTRPC, $ trash, B undo, J more,
 * V/Y/Z/K/W/X/ee the chat list item parts and truncate, h Button, C toast, m the route, u/se/te the
 * settings row, rows and header, ae/I/ie/y/w/P the empty state parts, ne DocumentTitle. */
var b = D(E()),
  jsxRuntime = T(),
  /** Chats on a page; one more is fetched to know whether a next page exists. */
  PAGE_SIZE = 20;
/** The Archived chats page; an empty page past the first goes back to the first. */
function ye() {
  const {userId} = m.useParams(),
    {page} = m.useSearch(),
    navigate = m.useNavigate(),
    trpc = N(),
    {
      data: items = [],
      error,
      isLoading,
      refetch,
    } = F(
      trpc.sessions.listPreviewItems.queryOptions({
        accountId: Number(userId),
        archived: 'only',
        cursor: (page - 1) * PAGE_SIZE,
        limit: 21,
      }),
    ),
    chats = items.slice(0, PAGE_SIZE).map(toListItem),
    hasNextPage = items.length > PAGE_SIZE,
    previousPage = () => {
      navigate({search: {page: page - 1}});
    },
    nextPage = () => {
      navigate({search: {page: page + 1}});
    },
    retry = () => {
      refetch();
    };
  return (
    (0, b.useEffect)(() => {
      !isLoading && !error && !chats.length && page > 1 && navigate({search: {page: 1}, replace: true});
    }, [error, isLoading, chats.length, navigate, page]),
    (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)(ne, {segments: ['Settings', 'Archived chats']}),
        (0, jsxRuntime.jsxs)(te, {
          children: [
            (0, jsxRuntime.jsx)('h1', {children: 'Archived chats'}),
            (0, jsxRuntime.jsx)('p', {
              className: 'text-muted-foreground mt-2 text-sm',
              children: 'Chats you archived are kept here until you delete them.',
            }),
          ],
        }),
        (0, jsxRuntime.jsx)(se, {
          children: isLoading
            ? Array.from({length: 8}, (_, index) =>
                (0, jsxRuntime.jsx)(u, {children: (0, jsxRuntime.jsx)(q, {className: 'h-8 w-full rounded-lg'})}, index),
              )
            : error
              ? (0, jsxRuntime.jsx)(u, {
                  className: 'min-h-48',
                  children: (0, jsxRuntime.jsxs)(P, {
                    className: 'p-0',
                    children: [
                      (0, jsxRuntime.jsxs)(I, {
                        children: [
                          (0, jsxRuntime.jsx)(y, {children: 'Couldn’t load archived chats'}),
                          (0, jsxRuntime.jsx)(w, {children: 'Please try again.'}),
                        ],
                      }),
                      (0, jsxRuntime.jsx)(ie, {
                        children: (0, jsxRuntime.jsx)(h, {
                          variant: 'outline',
                          size: 'sm',
                          onClick: retry,
                          children: 'Retry',
                        }),
                      }),
                    ],
                  }),
                })
              : chats.length
                ? chats.map(chat => (0, jsxRuntime.jsx)(ArchivedChat, {item: chat}, chat.id))
                : (0, jsxRuntime.jsx)(u, {
                    className: 'min-h-48',
                    children: (0, jsxRuntime.jsx)(P, {
                      className: 'p-0',
                      children: (0, jsxRuntime.jsxs)(I, {
                        children: [
                          (0, jsxRuntime.jsx)(ae, {variant: 'icon', children: (0, jsxRuntime.jsx)(L, {})}),
                          (0, jsxRuntime.jsx)(y, {children: 'No archived chats'}),
                          (0, jsxRuntime.jsx)(w, {children: 'Chats you archive will appear here.'}),
                        ],
                      }),
                    }),
                  }),
        }),
        (page > 1 || hasNextPage) &&
          (0, jsxRuntime.jsxs)('nav', {
            className: 'mt-4 flex items-center justify-center gap-2',
            'aria-label': 'Archived chats pagination',
            children: [
              (0, jsxRuntime.jsx)(h, {
                variant: 'ghost',
                size: 'icon',
                'aria-label': 'Previous page',
                disabled: page === 1,
                onClick: previousPage,
                children: (0, jsxRuntime.jsx)(z, {}),
              }),
              (0, jsxRuntime.jsxs)('span', {
                className: 'text-muted-foreground min-w-16 text-center text-sm',
                children: ['Page ', page],
              }),
              (0, jsxRuntime.jsx)(h, {
                variant: 'ghost',
                size: 'icon',
                'aria-label': 'Next page',
                disabled: !hasNextPage,
                onClick: nextPage,
                children: (0, jsxRuntime.jsx)(_, {}),
              }),
            ],
          }),
      ],
    })
  );
}
/** An archived chat: opens its session; Unarchive, or Delete after confirming. */
var ArchivedChat = ({item}) => {
    const {userId} = m.useParams(),
      {confirm} = k(),
      trpc = N(),
      queryClient = U(),
      unarchive = f(trpc.sessions.unarchive.mutationOptions({onError: () => C.error('Could not unarchive chat.')})),
      remove = f(trpc.sessions.delete.mutationOptions({onError: () => C.error('Could not delete chat.')})),
      pending = unarchive.isPending || remove.isPending,
      listItem = (0, b.useMemo)(() => ({session: item}), [item]),
      refresh = () =>
        Promise.all([
          queryClient.invalidateQueries(trpc.sessions.listPreviewItems.queryFilter({accountId: Number(userId)})),
          queryClient.invalidateQueries(
            trpc.sessions.listPreviewItems.infiniteQueryFilter({accountId: Number(userId)}),
          ),
        ]),
      unarchiveChat = async () => {
        (await unarchive.mutateAsync({accountId: Number(userId), sessionId: item.id}), await refresh());
      },
      deleteChat = () => {
        confirm(
          {
            title: 'Delete chat?',
            description: 'This will permanently delete this chat and its messages.',
            ui: {action: 'Delete', variant: 'destructive'},
          },
          async () => {
            (await remove.mutateAsync({accountId: Number(userId), sessionId: item.id}), await refresh());
          },
        );
      };
    return (0, jsxRuntime.jsx)(Y, {
      value: listItem,
      children: (0, jsxRuntime.jsxs)(u, {
        className: 'group/chat-list-item select-none',
        children: [
          (0, jsxRuntime.jsxs)(ee, {
            render: (0, jsxRuntime.jsx)(S, {
              to: '/u/$userId/tasks/$sessionId',
              params: {userId, sessionId: item.id},
              className: 'focus-visible:outline-0',
            }),
            children: [
              (0, jsxRuntime.jsx)(Z, {children: item.title}),
              (0, jsxRuntime.jsx)(X, {children: item.previewText}),
            ],
          }),
          (0, jsxRuntime.jsxs)(K, {
            children: [
              (0, jsxRuntime.jsx)(V, {datetime: item.updatedAt}),
              (0, jsxRuntime.jsxs)(O, {
                children: [
                  (0, jsxRuntime.jsx)(Q, {
                    render: (0, jsxRuntime.jsx)(h, {variant: 'ghost', size: 'icon', 'aria-label': 'Chat actions'}),
                    children: (0, jsxRuntime.jsx)(J, {}),
                  }),
                  (0, jsxRuntime.jsx)(H, {
                    align: 'end',
                    children: (0, jsxRuntime.jsxs)(R, {
                      children: [
                        (0, jsxRuntime.jsxs)(g, {
                          disabled: pending,
                          onClick: unarchiveChat,
                          children: [(0, jsxRuntime.jsx)(B, {}), (0, jsxRuntime.jsx)('span', {children: 'Unarchive'})],
                        }),
                        (0, jsxRuntime.jsxs)(g, {
                          variant: 'destructive',
                          disabled: pending,
                          onClick: deleteChat,
                          children: [(0, jsxRuntime.jsx)($, {}), (0, jsxRuntime.jsx)('span', {children: 'Delete'})],
                        }),
                      ],
                    }),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    });
  },
  /** A chat with its preview as plain text, at most 100 characters. */
  toListItem = item => ({...item, previewText: item.previewText ? W(G(item.previewText), 100) : void 0});
