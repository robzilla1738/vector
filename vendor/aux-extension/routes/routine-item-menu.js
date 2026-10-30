/* Aux-owned source: a routine's row and menu (assets/routine-item-menu-DJrYR2RE.js, after its
 * imports; Pe exported as t): run now, pause or resume, edit, run history (runs, older runs, and a
 * run's conversation) and delete, from the row's menu or a right click.
 * Names the rest of the chunk uses keep their chunk names: Pe the routine row.
 * Chunk names used: M useTRPC, H/F/G queries and mutations, y useApp, g toasts, I dayjs, ne/oe/re/ie
 * dialog parts, de Switch, x Button, K the session transcript, W/V/Z session providers, U/B/A/q/Y menu
 * and context-menu parts. */
var React = z(k(), 1),
  jsxRuntime = E(),
  RUNS_PAGE = 50 /** A routine’s runs, newest first, with older runs on request and the selected run’s conversation. */,
  RunHistory = ({routineId, name}) => {
    const {accountId} = y(),
      o = M(),
      [r, m] = (0, React.useState)(null),
      n = T(
        o.sessions.listPreviewItems.infiniteQueryOptions(
          {
            accountId,
            routineId,
            parent: 'all',
            archived: 'include',
            ephemeral: 'include',
            pinnedFirst: false,
            limit: RUNS_PAGE,
          },
          {getNextPageParam: (a, f) => (a.length === RUNS_PAGE ? f.length * RUNS_PAGE : void 0)},
        ),
      ),
      i = n.data?.pages.flat() ?? [],
      t = i.find(a => a.id === r) ?? i[0],
      u = a => () => m(a),
      h = () => {
        n.refetch();
      },
      p = () => {
        n.fetchNextPage();
      };
    return (
      (0, React.useEffect)(() => {
        !r && t && m(t.id);
      }, [r, t]),
      (0, jsxRuntime.jsxs)(oe, {
        className: 'flex h-[min(80dvh,48rem)] w-5xl max-w-[calc(100%-2rem)]! flex-col gap-0 overflow-hidden p-0',
        children: [
          (0, jsxRuntime.jsxs)('div', {
            className: 'shrink-0 px-4 pt-4 pr-10 pb-3',
            children: [
              (0, jsxRuntime.jsx)(re, {className: 'truncate text-base', children: name}),
              (0, jsxRuntime.jsx)(ne, {children: 'Run history'}),
            ],
          }),
          (0, jsxRuntime.jsxs)('div', {
            className: 'border-border mx-4 mb-4 flex min-h-0 flex-1 overflow-hidden rounded-lg border',
            children: [
              (0, jsxRuntime.jsxs)('aside', {
                'aria-label': 'Routine runs',
                className: 'border-border flex w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r p-2 sm:w-64',
                children: [
                  n.isPending && (0, jsxRuntime.jsx)(P, {className: 'mx-auto my-4 size-4'}),
                  n.isError &&
                    (0, jsxRuntime.jsxs)('div', {
                      className: 'text-muted-foreground p-2 text-sm',
                      children: [
                        'Could not load runs.',
                        (0, jsxRuntime.jsx)(x, {variant: 'ghost', size: 'sm', onClick: h, children: 'Retry'}),
                      ],
                    }),
                  !n.isPending &&
                    !n.isError &&
                    i.length === 0 &&
                    (0, jsxRuntime.jsx)('p', {
                      className: 'text-muted-foreground p-2 text-sm',
                      children: 'No runs yet.',
                    }),
                  i.map(a =>
                    (0, jsxRuntime.jsxs)(
                      x,
                      {
                        variant: t?.id === a.id ? 'secondary' : 'ghost',
                        className: 'h-auto w-full justify-start gap-2 py-1 text-left font-normal',
                        'aria-pressed': t?.id === a.id,
                        onClick: u(a.id),
                        children: [
                          (0, jsxRuntime.jsx)('time', {
                            dateTime: a.createdAt,
                            className: 'text-sm',
                            children: (0, I.default)(a.createdAt).format('MMM D, YYYY'),
                          }),
                          (0, jsxRuntime.jsx)('span', {
                            className: 'text-muted-foreground text-sm',
                            children: (0, I.default)(a.createdAt).format('h:mmA'),
                          }),
                        ],
                      },
                      a.id,
                    ),
                  ),
                  n.hasNextPage &&
                    (0, jsxRuntime.jsx)(x, {
                      variant: 'ghost',
                      size: 'sm',
                      disabled: n.isFetchingNextPage,
                      onClick: p,
                      children: 'Load older runs',
                    }),
                ],
              }),
              (0, jsxRuntime.jsx)('div', {
                className: 'flex min-h-0 min-w-0 flex-1 flex-col',
                children: t
                  ? (0, jsxRuntime.jsx)(RunConversation, {sessionId: t.id}, t.id)
                  : (0, jsxRuntime.jsx)('p', {
                      className: 'text-muted-foreground m-auto px-4 text-sm',
                      children: 'Select a run to view its conversation.',
                    }),
              }),
            ],
          }),
        ],
      })
    );
  } /** A run’s conversation, or why it cannot be shown. */,
  RunConversation = ({sessionId}) => {
    const {accountId} = y(),
      c = M(),
      o = H(c.sessions.get.queryOptions({accountId, sessionId})),
      r = () => {
        o.refetch();
      },
      m = () => {};
    return o.isPending
      ? (0, jsxRuntime.jsx)(P, {className: 'm-auto size-4'})
      : o.isError
        ? (0, jsxRuntime.jsxs)('div', {
            className: 'text-muted-foreground m-auto text-sm',
            children: [
              'Could not load this run.',
              (0, jsxRuntime.jsx)(x, {variant: 'ghost', onClick: r, children: 'Retry'}),
            ],
          })
        : o.data
          ? (0, jsxRuntime.jsx)(W, {
              sessionId,
              onSessionChange: m,
              children: (0, jsxRuntime.jsx)(K, {
                isReadonly: true,
                isSidepanel: true,
                className:
                  '**:data-[agent-session-ui="chat"]:px-4 [&_.streamdown_pre]:wrap-anywhere [&_.streamdown_pre]:whitespace-pre-wrap',
              }),
            })
          : (0, jsxRuntime.jsx)('p', {
              className: 'text-muted-foreground m-auto text-sm',
              children: 'This run is no longer available.',
            });
  } /** A routine’s row: its switch, its menu and its run history. */,
  Pe = ({routine, children, showSwitch = false, trigger}) => {
    const {accountId} = y(),
      {confirm} = Y(),
      [n, i] = (0, React.useState)(null),
      {updateRoutine, deleteRoutine, runRoutine} = Z(),
      p = updateRoutine.isPending || deleteRoutine.isPending,
      a = async () => {
        try {
          if (routine.environment !== 'device') throw Error('Cloud routines are preserved and unavailable.');
          await updateRoutine.mutateAsync({
            accountId,
            routineId: routine.id,
            revision: routine.revision,
            status: routine.status === 'active' ? 'paused' : 'active',
          });
        } catch (d) {
          g.error(d instanceof Error ? d.message : 'Could not update routine.');
        }
      },
      f = async () => {
        if (routine.environment !== 'device') return;
        if (
          await confirm({
            title: `Remove “${routine.name}”?`,
            description: 'This routine will no longer run. Past runs will be kept.',
            ui: {action: 'Remove', variant: 'destructive'},
          })
        )
          try {
            await deleteRoutine.mutateAsync({accountId, routineId: routine.id, revision: routine.revision});
          } catch (d) {
            g.error(d instanceof Error ? d.message : 'Could not remove routine.');
          }
      },
      D = () => {
        if (routine.environment === 'device') i('edit');
      },
      S = () => i('runs'),
      N = () => i(null),
      _ = d => {
        d || N();
      },
      C = {
        routine,
        pending: p,
        onToggle: a,
        onRemove: f,
        onEdit: D,
        onListRuns: S,
        onRunNow: () => {
          if (routine.environment !== 'device') return;
          runRoutine
            .mutateAsync({accountId, routineId: routine.id})
            .catch(d => g.error(d instanceof Error ? d.message : 'Could not run routine'));
        },
      },
      R = (0, jsxRuntime.jsxs)(B, {
        children: [
          (0, jsxRuntime.jsx)($, {
            render:
              trigger ??
              (0, jsxRuntime.jsx)(x, {
                type: 'button',
                variant: 'ghost',
                size: 'icon-sm',
                'aria-label': `Actions for ${routine.name}`,
                className:
                  'text-muted-foreground pointer-events-auto opacity-0 group-focus-within/routine:opacity-100 group-hover/routine:opacity-100 aria-expanded:opacity-100 [@media(hover:none)]:opacity-100',
              }),
            children: (0, jsxRuntime.jsx)(X, {className: 'size-4'}),
          }),
          (0, jsxRuntime.jsx)(U, {align: 'end', className: 'w-40', children: (0, jsxRuntime.jsx)(RoutineMenu, {...C})}),
        ],
      });
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        trigger
          ? R
          : (0, jsxRuntime.jsxs)(F, {
              children: [
                (0, jsxRuntime.jsxs)(Q, {
                  className: 'group/routine relative',
                  children: [
                    children,
                    (0, jsxRuntime.jsxs)('div', {
                      className:
                        'pointer-events-none absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1.5',
                      children: [
                        R,
                        showSwitch &&
                          (0, jsxRuntime.jsx)(de, {
                            className: 'pointer-events-auto',
                            checked: routine.status === 'active',
                            disabled: p || routine.environment !== 'device' || routine.status === 'completed',
                            'aria-label':
                              routine.status === 'completed'
                                ? 'Routine completed'
                                : routine.status === 'active'
                                  ? 'Pause routine'
                                  : 'Resume routine',
                            onCheckedChange: a,
                          }),
                        showSwitch && (0, jsxRuntime.jsx)(O, {className: 'text-muted-foreground size-4'}),
                      ],
                    }),
                  ],
                }),
                (0, jsxRuntime.jsx)(L, {
                  className: 'w-40',
                  children: (0, jsxRuntime.jsx)(RoutineMenu, {...C, contextMenu: true}),
                }),
              ],
            }),
        (0, jsxRuntime.jsx)(V, {open: n === 'edit', routineId: routine.id, onClose: N}),
        (0, jsxRuntime.jsx)(ie, {
          open: n === 'runs',
          onOpenChange: _,
          children: n === 'runs' && (0, jsxRuntime.jsx)(RunHistory, {routineId: routine.id, name: routine.name}),
        }),
      ],
    });
  } /** The routine menu: run now, pause or resume, edit, run history and delete. */,
  RoutineMenu = ({routine, pending, contextMenu, onToggle, onListRuns, onEdit, onRemove, onRunNow}) => {
    const t = contextMenu ? G : A,
      u = contextMenu ? J : q;
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsxs)(t, {
          disabled: pending || routine.environment !== 'device' || routine.status === 'completed',
          onClick: onToggle,
          children: [
            routine.status === 'active'
              ? (0, jsxRuntime.jsx)(ae, {className: 'size-4'})
              : (0, jsxRuntime.jsx)(w, {className: 'size-4'}),
            routine.status === 'active' ? 'Pause' : 'Resume',
          ],
        }),
        (0, jsxRuntime.jsxs)(t, {
          onClick: onRunNow,
          disabled: pending || routine.environment !== 'device' || routine.status === 'paused',
          children: [(0, jsxRuntime.jsx)(w, {className: 'size-4'}), 'Run now'],
        }),
        (0, jsxRuntime.jsxs)(t, {
          onClick: onListRuns,
          disabled: routine.environment === 'cloud',
          children: [(0, jsxRuntime.jsx)(te, {className: 'size-4'}), 'Run history'],
        }),
        (0, jsxRuntime.jsxs)(t, {
          onClick: onEdit,
          disabled: routine.environment !== 'device',
          children: [(0, jsxRuntime.jsx)(se, {className: 'size-4'}), 'Edit'],
        }),
        (0, jsxRuntime.jsx)(u, {}),
        (0, jsxRuntime.jsxs)(t, {
          variant: 'destructive',
          disabled: pending || routine.environment !== 'device',
          onClick: onRemove,
          children: [(0, jsxRuntime.jsx)(ee, {className: 'size-4'}), 'Remove'],
        }),
      ],
    });
  };
