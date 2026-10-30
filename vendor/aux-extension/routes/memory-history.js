/* Aux-owned source: memory history (assets/histories-CpU8qS5w.js, after its imports; es exported as
 * component): a history entry's trigger, duration and session, the files it changed with their
 * diffs, opening a change in the editor, Dream now, and the session's messages without the
 * extraction prompts.
 * Names the rest of the chunk uses keep their chunk names: es the page. */
var React = B(U()),
  jsxRuntime = Y(),
  EntryMessages = ({messages, sessionId, className}) =>
    (0, jsxRuntime.jsx)(le, {
      sessionId,
      messages,
      children: (0, jsxRuntime.jsx)(oe, {
        sessionId,
        initialMessages: messages,
        children: (0, jsxRuntime.jsx)(ne, {className, isReadonly: true}),
      }),
    }); /** The memory history page. */
function es() {
  const {userId} = v.useParams(),
    {historyEntryId} = v.useSearch(),
    i = v.useNavigate(),
    n = Number.parseInt(userId, 10),
    a = te(),
    l = Z(),
    {confirm} = W(),
    y = j(a.meta.open.mutationOptions()),
    {data} = ee(a.memory.listFiles.queryOptions({accountId: n}, {select: Me})),
    h = V(a.memory.listHistory.infiniteQueryOptions({limit: 50, accountId: n}, {getNextPageParam: t => t.nextCursor})),
    N = (0, React.useMemo)(() => h.data?.pages.flatMap(t => t.entries) ?? [], [h.data]),
    M = j(a.memory.runDreaming.mutationOptions()),
    I = j(a.memory.revertHistoryEntry.mutationOptions({onError: t => u.error(t.message)})),
    c = historyEntryId ?? N[0]?.id,
    A = N.find(t => t.id === c),
    g = X(a.memory.getHistoryEntry.queryOptions({historyEntryId: c ?? '', accountId: n}, {enabled: !!c})),
    o = g.data,
    d = o ?? A,
    C = (0, React.useMemo)(() => o?.messages.filter(isShownMessage) ?? [], [o]),
    H = t => {
      i({
        to: '/u/$userId/settings/memories/histories',
        params: {userId},
        search: {historyEntryId: t},
        replace: true,
        resetScroll: false,
      });
    },
    w = async t => {
      (await Promise.all([
        l.invalidateQueries(a.memory.listHistory.queryFilter({accountId: n})),
        l.invalidateQueries(a.memory.listFiles.queryFilter({accountId: n})),
        l.invalidateQueries(a.memory.getDreamState.queryFilter({accountId: n})),
      ]),
        t?.id && H(t.id));
    },
    P = () => {
      M.mutate(
        {force: true, accountId: n},
        {
          onSuccess: t => {
            (u.success(`Dreaming finished with ${t.result.filesTouched.length} touched file(s).`), w(t));
          },
          onError: t => u.error(t.message),
        },
      );
    },
    F = () => {
      c &&
        confirm({title: 'Revert this memory run?', ui: {action: 'Revert'}}, async () => {
          const t = await I.mutateAsync({historyEntryId: c, accountId: n});
          (u.success(`Reverted ${t.result.filesTouched.length} file(s).`), w(t));
        });
    },
    z = async t => {
      const R = data.fileByPath.get(t);
      if (R)
        try {
          await y.mutateAsync({path: R.absolutePath, mode: 'open', accountId: n});
        } catch (L) {
          (u.error('There was an error opening the memory file.'), console.error(L));
        }
    },
    Q = () => {
      const t = d?.sessionId;
      t && i({to: '/u/$userId/tasks/$sessionId', params: {userId, sessionId: t}});
    },
    q = d?.status === 'success' && d.changes.length > 0;
  return (0, jsxRuntime.jsxs)('div', {
    className: 'flex size-full min-h-0 flex-col',
    children: [
      d &&
        (0, jsxRuntime.jsx)(HistoryEntry, {
          canRevert: q,
          isDreaming: M.isPending,
          isReverting: I.isPending,
          timestamp: d.finishedAt ?? d.startedAt,
          sessionId: d.sessionId,
          title: je(d),
          userId,
          onDreamNow: P,
          onOpenSession: Q,
          onRevert: F,
        }),
      g.isPending && c
        ? (0, jsxRuntime.jsxs)('div', {
            className: 'text-muted-foreground flex size-full items-center justify-center gap-2 text-sm',
            children: [(0, jsxRuntime.jsx)(T, {}), ' Loading history details…'],
          })
        : g.isError
          ? (0, jsxRuntime.jsx)('div', {
              className: 'text-destructive flex size-full items-center justify-center px-4 text-center text-sm',
              children: 'Could not load this history entry. The history list is still available.',
            })
          : o
            ? (0, jsxRuntime.jsx)(xe, {
                className: 'min-h-0 flex-1',
                children: (0, jsxRuntime.jsxs)('div', {
                  className: 'space-y-4 p-4',
                  children: [
                    (0, jsxRuntime.jsx)(EntryDetails, {entry: o}),
                    (o.result.skippedReason || o.result.errorMessage) &&
                      (0, jsxRuntime.jsx)('div', {
                        className: 'border-border bg-muted/40 rounded-md border p-3 text-sm',
                        children: o.result.errorMessage ?? o.result.skippedReason,
                      }),
                    (0, jsxRuntime.jsx)(EntryChanges, {entry: o, memoryIndex: data, onOpenChangeInEditor: z}),
                    C.length > 0 &&
                      (0, jsxRuntime.jsx)('section', {
                        className: 'bg-surface-secondary dark:bg-background/80 rounded-xl border',
                        children: (0, jsxRuntime.jsx)(EntryMessages, {
                          className: 'h-full min-h-0',
                          messages: C,
                          sessionId: `memory-history:${o.id}`,
                        }),
                      }),
                  ],
                }),
              })
            : (0, jsxRuntime.jsx)('div', {
                className: 'text-muted-foreground flex size-full items-center justify-center px-4 text-center text-sm',
                children: 'Select a history entry to view its details.',
              }),
    ],
  });
}
var HistoryEntry = ({
    canRevert,
    isDreaming,
    isReverting,
    sessionId,
    timestamp,
    title,
    userId,
    onDreamNow,
    onOpenSession,
    onRevert,
  }) =>
    (0, jsxRuntime.jsxs)('header', {
      className: 'flex h-12 shrink-0 items-center justify-between gap-3 border-b px-3',
      children: [
        sessionId
          ? (0, jsxRuntime.jsx)(K, {
              to: '/u/$userId/tasks/$sessionId',
              params: {userId, sessionId},
              className: 'min-w-0 truncate text-sm font-medium hover:underline',
              children: title,
            })
          : (0, jsxRuntime.jsx)('span', {className: 'min-w-0 truncate text-sm font-medium', children: title}),
        (0, jsxRuntime.jsxs)('div', {
          className: 'flex shrink-0 items-center gap-2',
          children: [
            (0, jsxRuntime.jsxs)(D, {
              children: [
                (0, jsxRuntime.jsxs)(O, {
                  render: (0, jsxRuntime.jsx)('span', {
                    className: 'text-muted-foreground flex items-center gap-1 text-xs',
                  }),
                  children: [
                    (0, jsxRuntime.jsx)(ue, {className: 'size-3.5 shrink-0'}),
                    (0, jsxRuntime.jsx)('span', {children: ge(timestamp)}),
                  ],
                }),
                (0, jsxRuntime.jsx)(_, {children: be(timestamp)}),
              ],
            }),
            (0, jsxRuntime.jsxs)(G, {
              children: [
                (0, jsxRuntime.jsxs)(b, {
                  variant: 'outline',
                  disabled: isDreaming,
                  onClick: onDreamNow,
                  children: [
                    isDreaming && (0, jsxRuntime.jsx)(T, {}),
                    (0, jsxRuntime.jsx)('span', {children: 'Dream now'}),
                  ],
                }),
                (0, jsxRuntime.jsxs)(re, {
                  children: [
                    (0, jsxRuntime.jsx)(J, {
                      render: (0, jsxRuntime.jsx)(b, {
                        variant: 'outline',
                        size: 'icon',
                        'aria-label': 'More history actions',
                      }),
                      children: (0, jsxRuntime.jsx)(ce, {}),
                    }),
                    (0, jsxRuntime.jsxs)(se, {
                      align: 'end',
                      children: [
                        (0, jsxRuntime.jsxs)(E, {
                          disabled: !canRevert || isReverting,
                          onClick: onRevert,
                          children: [(0, jsxRuntime.jsx)(ie, {}), (0, jsxRuntime.jsx)('span', {children: 'Revert'})],
                        }),
                        (0, jsxRuntime.jsxs)(E, {
                          disabled: !sessionId,
                          onClick: onOpenSession,
                          children: [
                            (0, jsxRuntime.jsx)($, {}),
                            (0, jsxRuntime.jsx)('span', {children: 'Open session'}),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  EntryDetails = ({entry}) => {
    const r = entry.usage,
      i = r && r.totalTokens > 0 ? `${Math.round((r.cacheRead / r.totalTokens) * 100)}%` : '0%';
    return (0, jsxRuntime.jsx)('div', {
      className: 'px-2',
      children: (0, jsxRuntime.jsxs)('div', {
        className: 'border-y',
        children: [
          (0, jsxRuntime.jsx)(DetailRow, {label: 'Trigger', value: triggerLabel(entry.trigger)}),
          (0, jsxRuntime.jsx)(DetailRow, {label: 'Duration', value: ve(entry.elapsedMs)}),
          (0, jsxRuntime.jsx)(DetailRow, {
            label: 'Model',
            value: entry.model ? `${entry.model.provider} / ${entry.model.modelId}` : '-',
          }),
          (0, jsxRuntime.jsx)(DetailRow, {
            label: 'Tokens',
            value: r ? `${r.totalTokens} (${r.input} in · ${r.output} out)` : '-',
          }),
          (0, jsxRuntime.jsx)(DetailRow, {
            label: 'Cache',
            value: r ? `${i} (${r.cacheRead} read · ${r.cacheWrite} write)` : '-',
          }),
          (0, jsxRuntime.jsx)(DetailRow, {label: 'Cost', value: r?.costUsd ? `$${r.costUsd.toFixed(4)}` : '-'}),
        ],
      }),
    });
  },
  DetailRow = ({label, value}) =>
    (0, jsxRuntime.jsxs)('div', {
      className: 'grid min-h-9 grid-cols-[120px_1fr] items-start border-b py-2 text-sm last:border-b-0',
      children: [
        (0, jsxRuntime.jsx)('div', {className: 'text-muted-foreground font-medium', children: label}),
        (0, jsxRuntime.jsx)('div', {children: value}),
      ],
    }),
  EntryChanges = ({entry, memoryIndex, onOpenChangeInEditor}) =>
    entry.changes.length === 0
      ? (0, jsxRuntime.jsx)('section', {
          className: 'space-y-2',
          children: (0, jsxRuntime.jsx)('div', {
            className: 'text-muted-foreground rounded-md border p-3 text-sm',
            children: 'No file changes recorded.',
          }),
        })
      : (0, jsxRuntime.jsx)('section', {
          className: 'space-y-2',
          children: (0, jsxRuntime.jsxs)('div', {
            className: 'bg-surface-secondary overflow-hidden rounded-xl border',
            children: [
              (0, jsxRuntime.jsxs)('div', {
                className: 'border-b-hairline flex items-center gap-2 px-3 py-2 text-[13px] font-medium',
                children: [
                  (0, jsxRuntime.jsx)('span', {children: Ne(entry.changes.length)}),
                  (0, jsxRuntime.jsxs)('span', {className: 'text-green-500', children: ['+', S(entry, 'addedLines')]}),
                  (0, jsxRuntime.jsxs)('span', {className: 'text-rose-500', children: ['-', S(entry, 'removedLines')]}),
                ],
              }),
              (0, jsxRuntime.jsx)(ye, {
                children: entry.changes.map(n =>
                  (0, jsxRuntime.jsx)(
                    ChangeRow,
                    {change: n, canOpenInEditor: memoryIndex.fileByPath.has(n.path), onOpenChangeInEditor},
                    n.path,
                  ),
                ),
              }),
            ],
          }),
        }),
  ChangeRow = ({canOpenInEditor, change, onOpenChangeInEditor}) => {
    const n = a => {
      (a.preventDefault(), a.stopPropagation(), onOpenChangeInEditor(change.path));
    };
    return (0, jsxRuntime.jsxs)(fe, {
      value: change.path,
      className: 'group/history-diff-item not-last:border-b-hairline',
      children: [
        (0, jsxRuntime.jsx)(he, {
          nativeButton: false,
          render: ({className, ...l}) =>
            (0, jsxRuntime.jsxs)('div', {
              ...l,
              className: 'group/accordion-trigger flex w-full items-center gap-2 px-3 py-0.5',
              children: [
                (0, jsxRuntime.jsxs)('div', {
                  className: 'flex min-w-0 flex-1 items-center gap-2 text-[13px]',
                  children: [
                    (0, jsxRuntime.jsx)('span', {
                      className: 'text-primary min-w-0 truncate font-medium',
                      children: change.path,
                    }),
                    (0, jsxRuntime.jsxs)('span', {
                      className: 'shrink-0 text-green-500',
                      children: ['+', change.addedLines],
                    }),
                    (0, jsxRuntime.jsxs)('span', {
                      className: 'shrink-0 text-rose-500',
                      children: ['-', change.removedLines],
                    }),
                  ],
                }),
                canOpenInEditor &&
                  (0, jsxRuntime.jsxs)(D, {
                    children: [
                      (0, jsxRuntime.jsx)(O, {
                        render: (0, jsxRuntime.jsx)(b, {
                          'aria-label': 'Open in editor',
                          className:
                            'text-muted-foreground size-7 shrink-0 opacity-0 transition-opacity group-hover/history-diff-item:pointer-events-auto group-hover/history-diff-item:opacity-100',
                          variant: 'ghost',
                          size: 'icon-sm',
                          onClick: n,
                        }),
                        children: (0, jsxRuntime.jsx)($, {}),
                      }),
                      (0, jsxRuntime.jsx)(_, {children: 'Open in editor'}),
                    ],
                  }),
                (0, jsxRuntime.jsx)(de, {
                  className: 'text-muted-foreground size-4 shrink-0 group-aria-expanded/accordion-trigger:hidden',
                }),
                (0, jsxRuntime.jsx)(me, {
                  className:
                    'text-muted-foreground hidden size-4 shrink-0 group-aria-expanded/accordion-trigger:inline',
                }),
              ],
            }),
        }),
        (0, jsxRuntime.jsx)(pe, {
          className: 'pt-0 pb-0',
          children: (0, jsxRuntime.jsx)('div', {
            className: 'bg-background border-t-hairline overflow-auto',
            children: (0, jsxRuntime.jsx)('div', {
              className: 'min-w-max',
              children: (0, jsxRuntime.jsx)(ChangeDiff, {change}),
            }),
          }),
        }),
      ],
    });
  },
  ChangeDiff = ({change}) => {
    const r = (0, React.useMemo)(
        () => ({
          name: change.path,
          contents: change.beforeContent ?? '',
          cacheKey: `${change.path}:${change.beforeSha256 ?? 'empty'}`,
        }),
        [change.beforeContent, change.beforeSha256, change.path],
      ),
      i = (0, React.useMemo)(
        () => ({
          name: change.path,
          contents: change.afterContent ?? '',
          cacheKey: `${change.path}:${change.afterSha256 ?? 'empty'}`,
        }),
        [change.afterContent, change.afterSha256, change.path],
      );
    return (0, jsxRuntime.jsx)(ae, {oldFile: r, newFile: i});
  } /** A history entry’s trigger, in words. */,
  triggerLabel = s => {
    switch (s) {
      case 'session_completed':
        return 'Session completed';
      case 'manual_extraction':
        return 'Manual extraction';
      case 'manual_dreaming':
        return 'Manual dreaming';
      case 'taxonomy_migrate':
        return 'Memory migration';
      case 'manual_revert':
        return 'Manual revert';
      case 'settings_ui':
        return 'Settings edit';
      case 'agent':
        return 'Agent edit';
      default:
        return s;
    }
  } /** Prompts Aux sends itself for memory work; their messages are not shown. */,
  INTERNAL_PROMPTS = [
    'You are now acting as the memory extraction subagent.',
    'Run a dreaming pass over the current memory store.',
    'Migrate the memory taxonomy to V2.',
  ] /** Messages worth showing: not Aux’s own memory prompts, nor a bare DONE or NONE. */,
  isShownMessage = s =>
    (s.role !== 'user' || !INTERNAL_PROMPTS.some(r => k(s).startsWith(r))) &&
    (s.role !== 'assistant' || !['DONE', 'NONE'].includes(k(s).trim()));
