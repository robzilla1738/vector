/* Aux-owned source: the New Tab tasks (assets/tasks-CtF0WxoJ.js, after its imports; qe exported as
 * NewTabTasks). Sessions that need the user's input (an action to confirm, with its artifact,
 * Confirm or a custom answer), and recent chats and routines as cards, three or four by width,
 * cached for the next New Tab.
 * Names the rest of the chunk uses keep their chunk names: qe NewTabTasks.
 * Chunk names used: K/$ the account, j useTRPC, G useQueryClient, W useMutation, q useQuery, C is a
 * suspension, y page href, te openPage, V relative time, de the artifact preview, X the custom answer,
 * b Button, se/ee/A tabs, ne/E motion, Y toasts, H arrow icon.
 * Aux change: the confirmation card takes the 12px corner (rounded-xl) of the task cards beside it. */
var React = D(Q(), 1),
  jsxRuntime = B(),
  PILL =
    'rounded-full px-3' /** A session waiting on an action confirmation: its artifact, Confirm, or a custom answer; the card opens the session. */,
  ConfirmationCard = ({session, className}) => {
    const {accountId} = K(),
      c = j(),
      u = G(),
      o = W(c.sessions.resolveSuspension.mutationOptions()),
      l = session.suspension;
    if (session.status !== 'suspended' || !C(l) || l.kind !== 'action-confirmation') return null;
    const d = () => {
        window.location.assign(y(`/u/${accountId}/tasks/${encodeURIComponent(session.id)}`));
      },
      f = a => {
        (a.target instanceof Element && a.target.closest('a, button, input, textarea')) || d();
      },
      i = a => {
        a.target !== a.currentTarget || a.key !== 'Enter' || d();
      },
      x = async a => {
        try {
          await o.mutateAsync({sessionId: session.id, toolCallId: l.toolCallId, response: a, accountId});
        } catch (p) {
          Y.error(p instanceof Error ? p.message : 'Failed to resolve confirmation');
        } finally {
          await Promise.all([
            u.invalidateQueries(c.sessions.get.queryFilter({sessionId: session.id, accountId})),
            u.invalidateQueries(c.sessions.turns.activeMessages.queryFilter({sessionId: session.id, accountId})),
            u.invalidateQueries(c.sessions.listPreviewItems.queryFilter({accountId})),
            u.invalidateQueries(c.sessions.listPreviewItems.infiniteQueryFilter({accountId})),
          ]);
        }
      },
      g = () => x({verdict: 'confirm'}),
      w = a => x({verdict: 'cancel', instruction: a});
    return (0, jsxRuntime.jsxs)('article', {
      'aria-label': `Open ${session.title}`,
      className: _(
        'bg-surface-primary ring-border-surface-strong focus-visible:ring-ring/50 relative flex min-h-40 w-full cursor-pointer overflow-hidden rounded-xl shadow-lg ring-[0.5px] outline-none focus-visible:ring-2 max-md:h-fit max-md:min-h-40 max-md:flex-col',
        className,
      ),
      role: 'link',
      tabIndex: 0,
      onClick: f,
      onKeyDown: i,
      children: [
        (0, jsxRuntime.jsx)('time', {
          className: 'text-muted-foreground absolute top-2 right-3 z-10 text-xs font-medium opacity-80',
          children: (0, jsxRuntime.jsx)(V, {datetime: session.updatedAt}),
        }),
        (0, jsxRuntime.jsx)('div', {
          className: 'h-40 w-[370px] shrink-0 overflow-auto max-md:w-full',
          children: (0, jsxRuntime.jsx)('div', {
            className: 'flex min-h-full min-w-full items-center justify-center p-4',
            children: (0, jsxRuntime.jsx)(de, {
              compact: true,
              artifact: l.request.artifact,
              className: 'w-[375px] shrink-0 zoom-80 shadow-md',
              sessionId: session.id,
            }),
          }),
        }),
        (0, jsxRuntime.jsx)(ConfirmationActions, {
          disabled: o.isPending,
          message: l.request.message,
          sessionTitle: session.title,
          title: l.request.title,
          onConfirm: g,
          onCustom: w,
        }),
      ],
    });
  },
  ConfirmationActions = ({disabled, message, sessionTitle, title, onConfirm, onCustom}) => {
    const [l, d] = (0, React.useState)(false),
      f = () => d(false),
      i = () => d(true);
    return (0, jsxRuntime.jsxs)('div', {
      className: 'flex min-w-0 flex-1 flex-col justify-between p-4',
      children: [
        (0, jsxRuntime.jsxs)('div', {
          children: [
            (0, jsxRuntime.jsx)('p', {className: 'text-muted-foreground text-xs font-medium', children: sessionTitle}),
            (0, jsxRuntime.jsx)('h3', {
              className: 'text-foreground font-display line-clamp-1 text-lg font-semibold',
              children: title,
            }),
            (0, jsxRuntime.jsx)('p', {className: 'text-muted-foreground mt-1 line-clamp-2 text-sm', children: message}),
          ],
        }),
        (0, jsxRuntime.jsx)('div', {
          className: 'pt-3',
          children: (0, jsxRuntime.jsx)(ne, {
            initial: false,
            mode: 'popLayout',
            children: l
              ? (0, jsxRuntime.jsx)(
                  E.div,
                  {
                    layout: true,
                    animate: {opacity: 1, y: 0, filter: 'blur(0px)'},
                    exit: {opacity: 0, y: -4, filter: 'blur(2px)'},
                    initial: {opacity: 0, y: 6, filter: 'blur(3px)'},
                    transition: {damping: 28, stiffness: 420, type: 'spring'},
                    children: (0, jsxRuntime.jsx)(X, {disabled, onCancel: f, onSubmit: onCustom}),
                  },
                  'custom-answer',
                )
              : (0, jsxRuntime.jsxs)(
                  E.div,
                  {
                    layout: true,
                    animate: {opacity: 1, y: 0, filter: 'blur(0px)'},
                    className: 'flex items-center gap-1',
                    exit: {opacity: 0, y: 4, filter: 'blur(2px)'},
                    initial: {opacity: 0, y: -4, filter: 'blur(2px)'},
                    transition: {damping: 28, stiffness: 420, type: 'spring'},
                    children: [
                      (0, jsxRuntime.jsx)(b, {className: PILL, disabled, onClick: onConfirm, children: 'Confirm'}),
                      (0, jsxRuntime.jsx)(b, {
                        className: _(PILL, 'text-secondary-foreground'),
                        disabled,
                        variant: 'ghost',
                        onClick: i,
                        children: 'Custom answer',
                      }),
                    ],
                  },
                  'actions',
                ),
          }),
        }),
      ],
    });
  }; /** The previews cached for the account (up to eight). */
function readCachedPreviews(s) {
  if (!(typeof window > 'u'))
    try {
      const r = window.localStorage.getItem(previewCacheKey(s));
      if (!r) return;
      const n = JSON.parse(r);
      return Array.isArray(n) ? n.slice(0, 8) : void 0;
    } catch {
      return;
    }
}
function writeCachedPreviews(s, r) {
  if (!(typeof window > 'u'))
    try {
      window.localStorage.setItem(previewCacheKey(s), JSON.stringify(r.slice(0, 8)));
    } catch {}
}
var previewCacheKey = s =>
    `aux.new-tab.session-previews.v2:${s}` /** Recent chats and routines as cards, three or four by width, with a link to all of them. */,
  RecentTasks = ({items, isLoading: r = false}) => {
    const n = $(),
      c = j(),
      u = (0, React.useRef)(null),
      [o, l] = (0, React.useState)('chats'),
      [d, f] = (0, React.useState)(false),
      {data = [], isLoading} = q(
        c.sessions.listPreviewItems.queryOptions(
          {accountId: n, standaloneRoutines: 'only', limit: 8, coders: 'exclude'},
          {refetchInterval: 3e4},
        ),
      ),
      g = d ? 4 : 3,
      w = items.length > 0,
      a = data.length > 0,
      p = o === 'chats' && !w && a ? 'routines' : o,
      [N, I] = [items, data].map(t =>
        t.filter(m => m.status !== 'suspended' || !C(m.suspension) || m.suspension.kind !== 'action-confirmation'),
      ),
      L = N.slice(0, 3).some(t => t.unread),
      M = I.slice(0, 3).some(t => t.unread),
      S = (p === 'routines' ? I : N).slice(0, g),
      U = g - S.length,
      z = t => {
        (t === 'chats' || t === 'routines') && l(t);
      },
      F = t => {
        te(`/u/${n}/settings/routines/${encodeURIComponent(t)}`);
      };
    return (
      (0, React.useEffect)(() => {
        const t = u.current;
        if (!t || typeof ResizeObserver > 'u') return;
        const m = v => {
          const R = v >= 496 && v < 752;
          f(k => (k === R ? k : R));
        };
        m(t.getBoundingClientRect().width);
        const T = new ResizeObserver(([v]) => {
          v && m(v.contentRect.width);
        });
        return (T.observe(t), () => T.disconnect());
      }, []),
      !w && (r || isLoading || !a)
        ? null
        : (0, jsxRuntime.jsxs)('section', {
            className: 'space-y-4',
            children: [
              (0, jsxRuntime.jsxs)('div', {
                className: 'mx-auto flex max-w-[827px] items-center justify-between gap-4',
                children: [
                  (0, jsxRuntime.jsx)(se, {
                    value: p,
                    onValueChange: z,
                    children: (0, jsxRuntime.jsxs)(ee, {
                      variant: 'rounded',
                      className: 'p-[3px]',
                      children: [
                        (0, jsxRuntime.jsxs)(A, {
                          className: 'px-2',
                          value: 'chats',
                          children: [
                            'Chats',
                            L &&
                              (0, jsxRuntime.jsx)('span', {
                                role: 'status',
                                'aria-label': 'Unread chats',
                                className: 'bg-brand size-1.5 shrink-0 rounded-full',
                              }),
                          ],
                        }),
                        (0, jsxRuntime.jsxs)(A, {
                          className: 'px-2',
                          value: 'routines',
                          children: [
                            'Routines',
                            M &&
                              (0, jsxRuntime.jsx)('span', {
                                role: 'status',
                                'aria-label': 'Unread routines',
                                className: 'bg-brand size-1.5 shrink-0 rounded-full',
                              }),
                          ],
                        }),
                      ],
                    }),
                  }),
                  (0, jsxRuntime.jsxs)(b, {
                    className: 'text-muted-foreground hover:text-foreground -mr-2 gap-1 pr-1 pl-2 hover:no-underline',
                    size: 'sm',
                    variant: 'ghost',
                    nativeButton: false,
                    render: t =>
                      (0, jsxRuntime.jsx)('a', {
                        ...t,
                        href: p === 'chats' ? y(`/u/${n}/tasks`) : y(`/u/${n}/settings/routines`),
                      }),
                    children: [
                      p === 'chats' ? 'All Chats' : 'All Routines',
                      (0, jsxRuntime.jsx)(H, {className: 'text-surface-tertiary-foreground size-4'}),
                    ],
                  }),
                ],
              }),
              (0, jsxRuntime.jsx)('div', {
                ref: u,
                className:
                  'relative mx-auto grid max-w-[827px] grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] justify-center gap-4',
                children:
                  p === 'routines' && !a
                    ? (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                        children: [
                          Array.from({length: g}, (t, m) =>
                            (0, jsxRuntime.jsx)(
                              'div',
                              {className: 'pointer-events-none aspect-square w-full opacity-0'},
                              `routine-empty-slot-${m}`,
                            ),
                          ),
                          (0, jsxRuntime.jsx)(ce, {
                            className: 'border-border-surface/40 absolute inset-0 border-2',
                            children: (0, jsxRuntime.jsxs)(ae, {
                              children: [
                                (0, jsxRuntime.jsx)(re, {variant: 'icon', children: (0, jsxRuntime.jsx)(Z, {})}),
                                (0, jsxRuntime.jsx)(oe, {children: 'No routines'}),
                                (0, jsxRuntime.jsx)(le, {children: 'Let Aux handle the tasks you do on repeat.'}),
                              ],
                            }),
                          }),
                        ],
                      })
                    : (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                        children: [
                          S.map(t =>
                            (0, jsxRuntime.jsx)(
                              'div',
                              {
                                className:
                                  'focus-visible:ring-ring/50 w-full rounded-xl outline-none focus-visible:ring-2',
                                children: (0, jsxRuntime.jsx)(me, {
                                  session: t,
                                  taskLinkProps: {href: y(`/u/${n}/tasks/${encodeURIComponent(t.id)}`)},
                                  onOpenRoutine: F,
                                }),
                              },
                              t.id,
                            ),
                          ),
                          Array.from({length: U}, (t, m) =>
                            (0, jsxRuntime.jsx)(
                              'div',
                              {
                                className:
                                  'border-border-surface/40 aspect-square w-full rounded-xl border-2 border-dashed',
                              },
                              `task-placeholder-${m}`,
                            ),
                          ),
                        ],
                      }),
              }),
            ],
          })
    );
  } /** NewTabTasks: what needs the user’s input, then recent chats and routines. */,
  qe = ({children}) => {
    const r = $(),
      {browserMode} = ie(),
      c = j(),
      u = J(),
      {data, isLoading} = q(
        c.sessions.listPreviewItems.queryOptions(
          {accountId: r, limit: 8, coders: 'exclude', standaloneRoutines: 'exclude'},
          {
            refetchInterval: i =>
              u && i.state.data?.some(x => x.status === 'running' || x.status === 'suspended') ? 5e3 : false,
            initialData: () => readCachedPreviews(r),
            initialDataUpdatedAt: 0,
          },
        ),
      ),
      d = data ?? [],
      f = d.filter(i => i.status === 'suspended' && C(i.suspension) && i.suspension.kind === 'action-confirmation');
    return (
      (0, React.useEffect)(() => {
        data && writeCachedPreviews(r, data);
      }, [r, data]),
      (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
        children: [
          (0, jsxRuntime.jsx)(ue, {}),
          browserMode !== 'incognito' &&
            (0, jsxRuntime.jsxs)('div', {
              className: 'mb-12 empty:hidden',
              children: [
                f.length > 0 &&
                  (0, jsxRuntime.jsxs)('section', {
                    className: 'mx-auto w-full max-w-206 space-y-4',
                    children: [
                      (0, jsxRuntime.jsx)('h3', {
                        className: 'text-foreground font-display text-lg font-semibold',
                        children: 'Needs your input',
                      }),
                      (0, jsxRuntime.jsx)('div', {
                        className: 'flex w-full flex-col gap-4',
                        children: f.map(i =>
                          (0, jsxRuntime.jsx)(ConfirmationCard, {session: i}, `${i.id}:${i.suspension?.createdAt}`),
                        ),
                      }),
                    ],
                  }),
                (0, jsxRuntime.jsx)(RecentTasks, {items: d, isLoading}),
              ],
            }),
          children?.({taskCount: data?.length ?? 0}),
        ],
      })
    );
  };
