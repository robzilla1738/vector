/* Aux-owned source: Context Awareness (assets/context-awareness-BocPTg31.js, after its imports; st
 * exported as component). Its switch, pausing it for a while, the summary model, apps and sites
 * excluded from capture, how long history is kept, the captured history by day with each window's
 * apps and summary, and deleting one window, a day or everything.
 * Names the rest of the chunk uses keep their chunk names: st the page. */
var React = Se(ke(), 1); /** An exclusion’s key: the app’s bundle id or the site’s domain. */
function exclusionKey(s) {
  return s.scope === 'app' ? `app:${s.bundleId}` : `url:${s.urlDomain}`;
}
function useHistoryStatus(s) {
  const n = k();
  return F(
    n.contextAwareness.historyStatus.queryOptions(
      {accountId: s},
      {
        refetchInterval: a => (a.state.data?.platform === 'win32' && a.state.data.state === 'starting' ? 1e3 : 15e3),
        refetchOnWindowFocus: true,
      },
    ),
  );
}
function useDeleteHistory(s, {onSuccess, successMessage = 'Context Awareness deleted.'} = {}) {
  const o = k(),
    d = fe();
  return xe(
    o.contextAwareness.clear.mutationOptions({
      onSuccess: async () => {
        (onSuccess?.(),
          Z.success(successMessage),
          await Promise.all([
            d.resetQueries(o.contextAwareness.historyList.queryFilter({accountId: s})),
            d.invalidateQueries(o.contextAwareness.historyStatus.queryFilter({accountId: s})),
          ]));
      },
      onError: r => Z.error(r.message),
    }),
  );
}
var ILLUSTRATION = '/assets/aux-context-awareness-CQFhCmYA.webp',
  jsxRuntime = Ie(),
  HistorySection = ({accountId, retentionDays}) => {
    const [a, o] = (0, React.useState)(0),
      d = 1 - retentionDays,
      r = Math.min(0, Math.max(a, d)),
      m = c => {
        c !== null && o(Number.parseInt(c, 10));
      };
    return (0, jsxRuntime.jsx)(ee, {
      title: 'History',
      children: (0, jsxRuntime.jsxs)('div', {
        className: 'dark:bg-secondary -mx-3.5 overflow-clip rounded-xl border dark:border-transparent',
        children: [
          (0, jsxRuntime.jsxs)('div', {
            className:
              'bg-background sticky top-0 z-10 flex items-center p-1 pb-0 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-2 after:[mask-image:linear-gradient(black,transparent)] after:[background:inherit] dark:bg-[linear-gradient(var(--secondary),var(--secondary))]',
            children: [
              (0, jsxRuntime.jsxs)(Y, {
                value: `${r}`,
                onValueChange: m,
                children: [
                  (0, jsxRuntime.jsx)(Q, {
                    'aria-label': 'History day',
                    className: 'border-transparent',
                    children: (0, jsxRuntime.jsx)(K, {}),
                  }),
                  (0, jsxRuntime.jsx)(G, {
                    children: Array.from({length: retentionDays}, (c, u) =>
                      (0, jsxRuntime.jsx)(B, {value: `${-u}`, children: dayName(-u)}, u),
                    ),
                  }),
                ],
              }),
              (0, jsxRuntime.jsx)('div', {className: 'grow'}),
              (0, jsxRuntime.jsx)(HistorySummary, {accountId}),
              (0, jsxRuntime.jsx)(ClearHistory, {accountId}),
            ],
          }),
          (0, jsxRuntime.jsx)(HistoryDay, {accountId, offset: r, oldestOffset: d}, `${accountId}:${r}`),
        ],
      }),
    });
  } /** Today, Yesterday, or the day’s name. */,
  dayName = s => (s === 0 ? 'Today' : s === -1 ? 'Yesterday' : (0, V.default)().add(s, 'day').format('ddd, MMM D')),
  HistorySummary = ({accountId}) => {
    const {data} = useHistoryStatus(accountId);
    if (!data) return null;
    const a = data.firstEventAt === null ? null : Math.max(1, (0, V.default)().diff(data.firstEventAt, 'day', true));
    return (0, jsxRuntime.jsxs)(ge, {
      children: [
        (0, jsxRuntime.jsx)(pe, {
          render: (0, jsxRuntime.jsx)(b, {size: 'icon', variant: 'ghost', 'aria-label': 'History storage usage'}),
          children: (0, jsxRuntime.jsx)(qe, {className: 'text-muted-foreground'}),
        }),
        (0, jsxRuntime.jsxs)(je, {
          align: 'end',
          className: 'px-3 py-2 text-sm',
          children: [
            (0, jsxRuntime.jsxs)('p', {children: ['Storage used: ', re(data.storageBytes)]}),
            a !== null &&
              (0, jsxRuntime.jsxs)('p', {children: ['Average usage: ', re(data.storageBytes / a), ' / day']}),
          ],
        }),
      ],
    });
  },
  ClearHistory = ({accountId}) => {
    const {capture} = ue(),
      {confirm} = me(),
      o = useDeleteHistory(accountId),
      d = m => () => {
        const c = (0, V.default)();
        o.mutate({
          accountId,
          target:
            m === 'today'
              ? {kind: 'today'}
              : {kind: 'timeRange', from: c.subtract(m === 'hour' ? 60 : 10, 'minute').valueOf(), to: c.valueOf()},
        });
      },
      r = () => {
        confirm(
          {
            title: 'Clear all Context Awareness?',
            description: 'All captured activity and summaries on this device are deleted permanently.',
            ui: {action: 'Delete', variant: 'destructive'},
          },
          async () => {
            (await o.mutateAsync({accountId, target: {kind: 'all'}}),
              capture('settings.context-awareness.clear', {kind: 'all'}));
          },
        );
      };
    return (0, jsxRuntime.jsxs)(ve, {
      children: [
        (0, jsxRuntime.jsx)(he, {
          render: (0, jsxRuntime.jsx)(b, {size: 'icon', variant: 'ghost', 'aria-label': 'History actions'}),
          children: (0, jsxRuntime.jsx)(Re, {}),
        }),
        (0, jsxRuntime.jsxs)(ye, {
          align: 'end',
          children: [
            (0, jsxRuntime.jsxs)(De, {
              children: [
                (0, jsxRuntime.jsx)(Oe, {children: 'Clear history'}),
                (0, jsxRuntime.jsx)(q, {onClick: d('ten_minutes'), children: 'Last 10 minutes'}),
                (0, jsxRuntime.jsx)(q, {onClick: d('hour'), children: 'Last hour'}),
                (0, jsxRuntime.jsx)(q, {onClick: d('today'), children: 'Today'}),
              ],
            }),
            (0, jsxRuntime.jsx)(ce, {}),
            (0, jsxRuntime.jsx)(q, {variant: 'destructive', onClick: r, children: 'All history'}),
          ],
        }),
      ],
    });
  } /** A day of captured history, newest window first, with its apps. */,
  HistoryDay = ({accountId, offset, oldestOffset}) => {
    const o = k(),
      d = fe(),
      r = F(o.contextAwareness.historyList.queryOptions({accountId, ...dayRange(offset)})),
      m = [...(r.data ?? [])].sort((p, h) => h.windowTo - p.windowTo || h.windowFrom - p.windowFrom),
      c = [...new Set(m.flatMap(p => p.applications.map(h => h.bundleId)))].filter(Boolean).sort(),
      {data} = F(
        o.contextAwareness.appIcons.queryOptions(
          {accountId, bundleIds: c.slice(0, 80)},
          {enabled: c.length > 0, staleTime: 1 / 0, placeholderData: ze},
        ),
      ),
      w = () => {
        r.refetch();
      };
    return (
      (0, React.useEffect)(() => {
        if (r.isSuccess)
          for (const p of [offset - 1, offset + 1])
            p > 0 ||
              p < oldestOffset ||
              d.prefetchQuery({
                ...o.contextAwareness.historyList.queryOptions({accountId, ...dayRange(p)}),
                staleTime: 6e4,
              });
      }, [r.isSuccess, offset, oldestOffset, accountId, d, o]),
      r.isPending
        ? (0, jsxRuntime.jsx)('div', {
            className: 'flex min-h-50 flex-col gap-3 p-4',
            children: [0, 1, 2].map(p => (0, jsxRuntime.jsx)(Ee, {className: 'h-12 w-full'}, p)),
          })
        : r.isError
          ? (0, jsxRuntime.jsxs)('div', {
              className: 'flex min-h-50 flex-col items-center justify-center gap-3 p-8 text-center',
              children: [
                (0, jsxRuntime.jsx)(be, {className: 'text-destructive size-4'}),
                (0, jsxRuntime.jsx)('p', {className: 'text-muted-foreground text-sm', children: r.error.message}),
                (0, jsxRuntime.jsx)(b, {size: 'sm', variant: 'outline', onClick: w, children: 'Try again'}),
              ],
            })
          : m.length === 0
            ? (0, jsxRuntime.jsx)('p', {
                className: 'text-muted-foreground flex min-h-50 items-center justify-center p-8 text-center text-sm',
                children: offset === 0 ? 'Nothing captured yet today.' : 'No activity on this day.',
              })
            : (0, jsxRuntime.jsx)('div', {
                className: 'min-h-50 py-2 pr-1 pl-3',
                children: m.map(p => (0, jsxRuntime.jsx)(HistoryItem, {item: p, appIcons: data}, p.id)),
              })
    );
  } /** The start and end of a day some days from today. */,
  dayRange = s => {
    const n = (0, V.default)().add(s, 'day').startOf('day');
    return {from: n.valueOf(), to: n.add(1, 'day').valueOf()};
  },
  SUMMARY_COMPONENTS = {img: () => null, a: ({children}) => (0, jsxRuntime.jsx)('span', {children})},
  HistoryItem = ({item, appIcons}) => {
    const [a, o] = (0, React.useState)(false),
      d = () => {
        o(r => !r);
      };
    return (0, jsxRuntime.jsxs)('article', {
      className: 'group/history-item grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3',
      children: [
        (0, jsxRuntime.jsx)('p', {
          className: 'text-muted-foreground pt-2.5 text-right text-xs font-medium tabular-nums',
          children: (0, V.default)(item.windowTo).format('LT'),
        }),
        (0, jsxRuntime.jsxs)('div', {
          className: 'relative pb-1 pl-4',
          children: [
            (0, jsxRuntime.jsx)('span', {
              'aria-hidden': 'true',
              className: 'bg-foreground absolute top-4 -left-0.5 h-0.5 w-3 rounded-full',
            }),
            (0, jsxRuntime.jsx)('span', {
              'aria-hidden': 'true',
              className:
                'bg-muted-foreground/40 pointer-events-none absolute top-8 -bottom-4 -left-0.5 w-3 group-last/history-item:hidden',
              style: {
                maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Crect width='12' height='1' rx='1'/%3E%3C/svg%3E")`,
              },
            }),
            (0, jsxRuntime.jsxs)('button', {
              type: 'button',
              'aria-expanded': a,
              className: 'hover:bg-muted/50 w-full cursor-pointer rounded-lg px-2 py-2 text-left',
              onClick: d,
              children: [
                (0, jsxRuntime.jsxs)('div', {
                  className: 'flex items-center justify-between gap-2',
                  children: [
                    (0, jsxRuntime.jsx)('p', {
                      className: 'text-sm font-medium',
                      children: (0, jsxRuntime.jsx)(InlineCode, {text: item.title}),
                    }),
                    (0, jsxRuntime.jsx)(we, {
                      className: U('text-muted-foreground size-4 shrink-0 transition-transform', a && 'rotate-180'),
                    }),
                  ],
                }),
                (0, jsxRuntime.jsx)('p', {
                  className: 'text-muted-foreground mt-0.5 pr-6 text-sm leading-relaxed',
                  children: (0, jsxRuntime.jsx)(InlineCode, {text: item.description}),
                }),
                item.applications.length > 0 &&
                  (0, jsxRuntime.jsx)('div', {
                    className: 'mt-1.5 flex items-center gap-1',
                    children: item.applications.slice(0, 8).map(r => {
                      const m = appIcons?.[r.bundleId];
                      return m
                        ? (0, jsxRuntime.jsx)('img', {src: m, alt: r.name, className: 'size-5'}, r.bundleId)
                        : (0, jsxRuntime.jsx)(
                            Ce,
                            {className: 'bg-background size-5 rounded-md', name: r.name},
                            r.bundleId || r.name,
                          );
                    }),
                  }),
              ],
            }),
            (0, jsxRuntime.jsx)(Xe, {
              open: a,
              children: (0, jsxRuntime.jsx)(Ye, {
                className:
                  'grid grid-rows-[1fr] transition-[grid-template-rows,opacity,filter] duration-300 ease-in-out data-ending-style:grid-rows-[0fr] data-ending-style:opacity-0 data-ending-style:blur-[2px] data-starting-style:grid-rows-[0fr] data-starting-style:opacity-0 data-starting-style:blur-[2px] motion-reduce:transition-none',
                children: (0, jsxRuntime.jsx)('div', {
                  className: 'overflow-hidden',
                  children: (0, jsxRuntime.jsx)($e, {
                    components: SUMMARY_COMPONENTS,
                    className:
                      'text-muted-foreground pr-8 pb-2 pl-2 text-sm leading-relaxed [&_code]:text-xs [&_h1]:text-sm [&_h1]:font-semibold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_li]:my-0.5',
                    children: item.narrative,
                  }),
                }),
              }),
            }),
          ],
        }),
      ],
    });
  },
  InlineCode = ({text}) =>
    text
      .split(/`([^`]+)`/)
      .map((n, a) =>
        a % 2
          ? (0, jsxRuntime.jsx)(
              'code',
              {className: 'bg-muted rounded-sm px-1 py-px font-mono text-[0.85em]', children: n},
              a,
            )
          : n,
      ),
  NEVER = 864e13,
  PAUSE_OPTIONS = [
    {value: '15', label: '15 minutes'},
    {value: '30', label: '30 minutes'},
    {value: '60', label: '1 hour'},
    {value: 'indefinite', label: 'Until I resume'},
  ]; /** The Context Awareness page, or why it is unavailable. */
function st() {
  const {userId} = Qe.useParams(),
    n = Number.parseInt(userId, 10),
    a = k(),
    {data} = te(a.settings.getAll.queryOptions({accountId: n}));
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsx)(as, {segments: ['Settings', 'Memory', 'Context Awareness']}),
      (0, jsxRuntime.jsx)(es, {
        children: (0, jsxRuntime.jsx)('div', {
          className: 'flex items-center gap-1.5',
          children: (0, jsxRuntime.jsx)('h1', {children: 'Context Awareness'}),
        }),
      }),
      data.contextAwareness
        ? (0, jsxRuntime.jsx)(ContextAwarenessSettings, {accountId: n, contextAwareness: data.contextAwareness})
        : (0, jsxRuntime.jsx)('p', {
            className: 'text-muted-foreground text-sm',
            children: 'Context Awareness settings are unavailable. Update and restart Aux, then try again.',
          }),
    ],
  });
}
function ContextAwarenessSettings({accountId, contextAwareness}) {
  const {capture} = ue(),
    o = k(),
    {confirm} = me(),
    u = ns({accountId, syncGetAllCache: true, scope: {id: `context-awareness-settings:${accountId}`}}),
    [w, p] = (0, React.useState)(() => Date.now()),
    {captureTypedText, enabled, pausedUntil, retentionDays, rules, screenOcr, summaryModel} = contextAwareness,
    j = pausedUntil !== null && pausedUntil > w,
    y = rules.filter(t => t.behavior === 'do_not_observe'),
    P = y.flatMap(t => (t.scope === 'app' ? [t.bundleId] : [])),
    W = F(o.contextAwareness.listApplications.queryOptions({accountId}, {enabled: P.length > 0, staleTime: 3e5})),
    l = useHistoryStatus(accountId).data,
    C = l?.platform ? l.platform === 'win32' : Je(),
    T = C && l?.state === 'starting',
    $ =
      !l || C
        ? []
        : [
            ...(l.accessibilityTrusted ? [] : ['Accessibility']),
            ...(l.inputMonitoringTrusted ? [] : ['Input Monitoring']),
            ...(screenOcr && !l.screenRecordingTrusted ? ['Screen Recording'] : []),
          ],
    M =
      l?.platform === 'win32' &&
      (!l.nativeCaptureAvailable || !l.inputCaptureAvailable || (screenOcr && !l.screenOcrAvailable)),
    E = xe(o.contextAwareness.requestPermissions.mutationOptions({onError: t => Z.error(t.message)})),
    i = pausedUntil !== null && pausedUntil >= NEVER;
  (0, React.useEffect)(() => {
    if (!j || i) return;
    const t = setInterval(() => p(Date.now()), 1e3);
    return () => clearInterval(t);
  }, [j, i]);
  const A = (0, React.useRef)(contextAwareness);
  (0, React.useEffect)(() => {
    u.isPending || (A.current = contextAwareness);
  }, [contextAwareness, u.isPending]);
  const v = t => {
      ((A.current = {...A.current, ...t}), u.mutate({accountId, key: 'contextAwareness', value: A.current}));
    },
    Ae = async t => {
      (!t &&
        !(await confirm({
          title: 'Disable Context Awareness?',
          description:
            'Aux will stop capturing your activity. Existing history stays on this device until it expires or you delete it.',
          ui: {variant: 'destructive', action: 'Disable'},
        }))) ||
        (v({enabled: t, pausedUntil: null}),
        t &&
          !C &&
          (!l?.accessibilityTrusted ||
            !l?.inputMonitoringTrusted ||
            (screenOcr && l?.screenRecordingTrusted === false)) &&
          E.mutate({accountId}),
        capture('settings.context-awareness.enable', {value: t}));
    };
  return (0, jsxRuntime.jsx)(jsxRuntime.Fragment, {
    children: (0, jsxRuntime.jsxs)('div', {
      className: 'space-y-8',
      children: [
        (0, jsxRuntime.jsx)(ss, {
          title: 'Let Aux remember your day',
          description: 'Aux captures what you do in your browser and apps so agents can recall it later.',
          illustration: {src: ILLUSTRATION, alt: 'Context Awareness'},
        }),
        (0, jsxRuntime.jsxs)(ee, {
          title: 'Capture',
          children: [
            enabled &&
              T &&
              (0, jsxRuntime.jsxs)(H, {
                className: 'text-muted-foreground flex items-center gap-2 border-none p-3 text-sm',
                children: [(0, jsxRuntime.jsx)(de, {className: 'size-4'}), 'Starting capture…'],
              }),
            enabled &&
              !T &&
              l &&
              (!l.healthy || $.length > 0 || M) &&
              (0, jsxRuntime.jsx)(H, {
                className: 'border-none bg-amber-500/15! p-3',
                children: (0, jsxRuntime.jsxs)('div', {
                  className: 'flex gap-1.5',
                  children: [
                    (0, jsxRuntime.jsx)(be, {className: 'size-4 text-amber-500'}),
                    (0, jsxRuntime.jsxs)('div', {
                      className: 'flex-1 text-amber-800 dark:text-amber-400',
                      children: [
                        (0, jsxRuntime.jsx)('p', {
                          className: 'mb-1 text-sm leading-none font-medium',
                          children: (0, jsxRuntime.jsx)('span', {
                            children: l?.healthy
                              ? M
                                ? 'Some capture features are unavailable'
                                : 'Permissions needed'
                              : 'Capture is not running',
                          }),
                        }),
                        (0, jsxRuntime.jsx)('p', {
                          className: 'text-xs font-medium opacity-80',
                          children: M
                            ? (l.message ?? 'Windows could not start app or input capture. Restart Aux to try again.')
                            : l?.healthy
                              ? `Allow ${new Intl.ListFormat('en').format($) || 'permissions'} so Aux can capture your activity.`
                              : (l?.message ?? 'The capture helper is not available on this device.'),
                        }),
                      ],
                    }),
                    l?.healthy &&
                      $.length > 0 &&
                      (0, jsxRuntime.jsx)(z, {
                        children: (0, jsxRuntime.jsx)(b, {
                          disabled: E.isPending,
                          onClick: () => E.mutate({accountId}),
                          children: 'Allow',
                        }),
                      }),
                  ],
                }),
              }),
            (0, jsxRuntime.jsxs)(H, {
              children: [
                (0, jsxRuntime.jsxs)(O, {
                  children: [
                    (0, jsxRuntime.jsx)(_, {
                      title: 'Enable Context Awareness',
                      description: 'Capture your activity on this device.',
                    }),
                    (0, jsxRuntime.jsx)(z, {
                      children: (0, jsxRuntime.jsxs)(Ge, {
                        children: [
                          (0, jsxRuntime.jsx)(Ve, {
                            render: (0, jsxRuntime.jsx)('div', {}),
                            children: (0, jsxRuntime.jsx)('div', {
                              className: 'relative',
                              children: (0, jsxRuntime.jsx)(J, {
                                checked: enabled,
                                disabled: u.isPending,
                                onCheckedChange: Ae,
                              }),
                            }),
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
                enabled &&
                  (0, jsxRuntime.jsxs)(O, {
                    children: [
                      (0, jsxRuntime.jsx)(_, {
                        title: 'Pause capturing',
                        description: i
                          ? 'Paused until you resume'
                          : j
                            ? `Resuming in ${Ke(pausedUntil - w)}`
                            : 'Stop capturing for a while without turning it off.',
                      }),
                      (0, jsxRuntime.jsx)(z, {
                        children: j
                          ? (0, jsxRuntime.jsxs)(b, {
                              variant: 'outline',
                              disabled: u.isPending,
                              onClick: () => v({pausedUntil: null}),
                              children: [(0, jsxRuntime.jsx)(Be, {className: 'size-4'}), 'Resume'],
                            })
                          : (0, jsxRuntime.jsxs)(Y, {
                              value: null,
                              disabled: u.isPending,
                              onValueChange: t => {
                                t &&
                                  (v({
                                    pausedUntil: t === 'indefinite' ? NEVER : Date.now() + Number.parseInt(t, 10) * 6e4,
                                  }),
                                  capture('settings.context-awareness.pause', {value: t}));
                              },
                              children: [
                                (0, jsxRuntime.jsx)(Q, {
                                  className: 'text-muted-foreground w-auto',
                                  children: (0, jsxRuntime.jsx)(K, {placeholder: 'Select'}),
                                }),
                                (0, jsxRuntime.jsx)(G, {
                                  align: 'end',
                                  children: PAUSE_OPTIONS.map(t =>
                                    (0, jsxRuntime.jsx)(B, {value: t.value, children: t.label}, t.value),
                                  ),
                                }),
                              ],
                            }),
                      }),
                    ],
                  }),
              ],
            }),
            enabled &&
              (0, jsxRuntime.jsxs)(H, {
                children: [
                  (0, jsxRuntime.jsxs)(O, {
                    children: [
                      (0, jsxRuntime.jsx)(_, {
                        title: 'Capture typed text',
                        description: 'Save the sentences you type. Aux never stores keystrokes or password fields.',
                      }),
                      (0, jsxRuntime.jsx)(z, {
                        children: (0, jsxRuntime.jsx)(J, {
                          checked: captureTypedText,
                          disabled: u.isPending,
                          onCheckedChange: t => v({captureTypedText: t}),
                        }),
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)(O, {
                    children: [
                      (0, jsxRuntime.jsx)(_, {
                        title: 'Allow Screen Recording',
                        description:
                          'When a page has no readable text, read it from the screen. Only the text is kept.',
                      }),
                      (0, jsxRuntime.jsx)(z, {
                        children: (0, jsxRuntime.jsx)(J, {
                          checked: screenOcr,
                          disabled: u.isPending,
                          onCheckedChange: t => v({screenOcr: t}),
                        }),
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)(O, {
                    className: y.length > 0 ? 'flex-col items-stretch gap-3' : void 0,
                    children: [
                      (0, jsxRuntime.jsxs)('div', {
                        className: 'flex grow items-center justify-between gap-3',
                        children: [
                          (0, jsxRuntime.jsx)(_, {
                            title: 'Denylist',
                            description: 'Aux never captures what you do in these apps and websites.',
                          }),
                          (0, jsxRuntime.jsx)(Exclusions, {
                            accountId,
                            disabled: u.isPending,
                            excludedBundleIds: P,
                            onAdd: t => !y.some(S => exclusionKey(S) === exclusionKey(t)) && v({rules: [...rules, t]}),
                          }),
                        ],
                      }),
                      y.length > 0 &&
                        (0, jsxRuntime.jsx)('div', {
                          className: 'border-border divide-border mb-0.5 divide-y rounded-lg border',
                          children: y.map(t => {
                            const S = t.scope === 'app' ? W.data?.find(X => X.bundleId === t.bundleId) : void 0;
                            return (0, jsxRuntime.jsxs)(
                              'div',
                              {
                                className: 'flex min-h-10 items-center gap-2 px-2.5 py-1.5',
                                children: [
                                  S
                                    ? (0, jsxRuntime.jsx)(AppIcon, {app: S, className: 'size-6'})
                                    : t.scope === 'app'
                                      ? (0, jsxRuntime.jsx)(Le, {className: 'text-muted-foreground size-6 shrink-0'})
                                      : (0, jsxRuntime.jsx)(SiteIcon, {domain: t.urlDomain, className: 'size-6'}),
                                  (0, jsxRuntime.jsx)('span', {
                                    className: U(
                                      'text-primary min-w-0 grow truncate',
                                      S ? 'text-sm' : 'font-mono text-xs',
                                    ),
                                    children: S?.name ?? (t.scope === 'app' ? t.bundleId : t.urlDomain),
                                  }),
                                  (0, jsxRuntime.jsx)(b, {
                                    className:
                                      'hover:bg-destructive/20! focus-visible:bg-destructive/20! text-muted-foreground hover:text-destructive focus-visible:text-destructive -mr-1',
                                    variant: 'ghost',
                                    size: 'icon-sm',
                                    'aria-label': `Remove ${S?.name ?? exclusionKey(t)}`,
                                    disabled: u.isPending,
                                    onClick: () => v({rules: rules.filter(X => exclusionKey(X) !== exclusionKey(t))}),
                                    children: (0, jsxRuntime.jsx)(Fe, {}),
                                  }),
                                ],
                              },
                              exclusionKey(t),
                            );
                          }),
                        }),
                    ],
                  }),
                ],
              }),
          ],
        }),
        enabled &&
          (0, jsxRuntime.jsx)(ee, {
            title: 'Summaries',
            children: (0, jsxRuntime.jsxs)(H, {
              children: [
                (0, jsxRuntime.jsx)(React.Suspense, {
                  fallback: null,
                  children: (0, jsxRuntime.jsx)(is, {
                    accountId,
                    children: (0, jsxRuntime.jsx)(SummaryModel, {
                      accountId,
                      disabled: u.isPending,
                      value: summaryModel ?? null,
                      onChange: t => v({summaryModel: t ?? void 0}),
                    }),
                  }),
                }),
                (0, jsxRuntime.jsxs)(O, {
                  children: [
                    (0, jsxRuntime.jsx)(_, {
                      title: 'Retention',
                      description: 'Aux deletes raw captures after this many days. Summaries stay.',
                    }),
                    (0, jsxRuntime.jsx)(z, {
                      children: (0, jsxRuntime.jsxs)(Y, {
                        value: `${retentionDays}`,
                        disabled: u.isPending,
                        onValueChange: t => t && v({retentionDays: Number.parseInt(t, 10)}),
                        children: [
                          (0, jsxRuntime.jsx)(Q, {className: 'w-32', children: (0, jsxRuntime.jsx)(K, {})}),
                          (0, jsxRuntime.jsx)(G, {
                            children: [1, 3, 7, 14, 30].map(t =>
                              (0, jsxRuntime.jsxs)(B, {value: `${t}`, children: [t, ' ', t === 1 ? 'day' : 'days']}, t),
                            ),
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
          }),
        enabled && (0, jsxRuntime.jsx)(HistorySection, {accountId, retentionDays}),
      ],
    }),
  });
}
var SummaryModel = ({accountId, disabled, value, onChange}) => {
    const d = k(),
      {modelCatalog} = rs(),
      {data} = te(d.contextAwareness.summaryModelDefault.queryOptions({accountId}));
    return (0, jsxRuntime.jsx)(os, {
      info: {title: 'Summary model', description: 'Summarizes your activity in the background while you work.'},
      value,
      fallbackValue: data ?? void 0,
      modelCatalog,
      allowDefaultValue: true,
      disabled,
      onChange,
    });
  },
  SiteIcon = ({domain, className}) => {
    const a = Ne(domain)?.preferredDomain,
      o = a ? ts(`https://${a}/`) : void 0,
      [d, r] = (0, React.useState)(false);
    return !o || d
      ? (0, jsxRuntime.jsx)(He, {className: 'text-muted-foreground size-4 shrink-0'})
      : (0, jsxRuntime.jsx)(
          'img',
          {src: o, alt: '', className: U('size-4 shrink-0 rounded-sm', className), onError: () => r(true)},
          o,
        );
  },
  AppIcon = ({app, className}) =>
    app.icon
      ? (0, jsxRuntime.jsx)('img', {src: app.icon, alt: '', className: U('size-4 shrink-0', className)})
      : (0, jsxRuntime.jsx)(Ce, {className: U('bg-background size-4 shrink-0 rounded-sm', className), name: app.name}),
  Exclusions = ({accountId, disabled, excludedBundleIds, onAdd}) => {
    const d = k(),
      [r, m] = (0, React.useState)(false),
      [c, u] = (0, React.useState)('app'),
      [w, p] = (0, React.useState)(''),
      [h, g] = (0, React.useState)(null),
      [N, I] = (0, React.useState)(''),
      f = useHistoryStatus(accountId).data?.platform === 'win32',
      [D, R] = (0, React.useState)(false),
      j = F(d.contextAwareness.listApplications.queryOptions({accountId}, {enabled: r && c === 'app', staleTime: 3e5})),
      y = !D && (j.isPending || (j.data?.length ?? 0) > 0),
      P = N.trim().toLowerCase(),
      W = (j.data ?? []).filter(
        i =>
          !excludedBundleIds.includes(i.bundleId) &&
          (!P || i.name.toLowerCase().includes(P) || i.bundleId.toLowerCase().includes(P)),
      ),
      l = Ne(w)?.preferredDomain ?? null,
      C = w.trim(),
      T = f ? (/^[a-z]:[\\/]/i.test(C) ? `win32:${C.replaceAll('/', '\\').toLowerCase()}` : C.toLowerCase()) : C,
      $ = f ? /^(win32:[a-z]:\\.+\.exe|aumid:[^!]+!.+)$/i.test(T) : T.length > 0,
      M = c === 'url' ? !!l : y ? h !== null : $,
      E = () => {
        M &&
          (onAdd(
            c === 'url'
              ? {scope: c, behavior: 'do_not_observe', urlDomain: l}
              : {scope: c, behavior: 'do_not_observe', bundleId: h?.bundleId ?? T},
          ),
          m(false));
      };
    return (0, jsxRuntime.jsxs)(ge, {
      open: r,
      onOpenChange: i => {
        (m(i), i && (u('app'), p(''), g(null), I(''), R(false)));
      },
      children: [
        (0, jsxRuntime.jsxs)(pe, {
          render: (0, jsxRuntime.jsx)(b, {variant: 'outline', disabled}),
          children: [(0, jsxRuntime.jsx)(ae, {'data-icon': 'inline-start'}), 'Add'],
        }),
        (0, jsxRuntime.jsxs)(je, {
          className: 'w-72 p-3',
          children: [
            (0, jsxRuntime.jsx)('p', {
              className: 'text-muted-foreground text-xs font-medium',
              children: 'Never observe',
            }),
            (0, jsxRuntime.jsxs)('div', {
              className: 'mt-3 flex flex-col gap-2',
              children: [
                (0, jsxRuntime.jsxs)(Y, {
                  value: c,
                  onValueChange: i => {
                    (i === 'app' || i === 'url') && (u(i), p(''), g(null), I(''), R(false));
                  },
                  children: [
                    (0, jsxRuntime.jsx)(Q, {
                      'aria-label': 'Source',
                      className: 'w-full',
                      children: (0, jsxRuntime.jsx)(K, {}),
                    }),
                    (0, jsxRuntime.jsxs)(G, {
                      children: [
                        (0, jsxRuntime.jsx)(B, {value: 'app', children: 'Application'}),
                        (0, jsxRuntime.jsx)(B, {value: 'url', children: 'Website'}),
                      ],
                    }),
                  ],
                }),
                c === 'app' && y
                  ? (0, jsxRuntime.jsxs)(ve, {
                      children: [
                        (0, jsxRuntime.jsxs)(he, {
                          render: (0, jsxRuntime.jsx)(b, {
                            variant: 'outline',
                            className: 'w-full justify-between font-normal',
                          }),
                          children: [
                            h
                              ? (0, jsxRuntime.jsxs)('span', {
                                  className: 'flex min-w-0 items-center gap-2',
                                  children: [
                                    (0, jsxRuntime.jsx)(AppIcon, {app: h}),
                                    (0, jsxRuntime.jsx)('span', {className: 'truncate', children: h.name}),
                                  ],
                                })
                              : (0, jsxRuntime.jsx)('span', {className: 'text-muted-foreground', children: 'Select..'}),
                            (0, jsxRuntime.jsx)(we, {className: 'text-muted-foreground size-4 shrink-0'}),
                          ],
                        }),
                        (0, jsxRuntime.jsxs)(ye, {
                          align: 'start',
                          className: 'w-64',
                          children: [
                            (0, jsxRuntime.jsxs)(Me, {
                              className: 'mb-1 border-0! bg-transparent! shadow-none ring-0!',
                              children: [
                                (0, jsxRuntime.jsx)(Pe, {
                                  align: 'inline-start',
                                  children: (0, jsxRuntime.jsx)(Ue, {className: 'size-4'}),
                                }),
                                (0, jsxRuntime.jsx)(_e, {
                                  autoFocus: true,
                                  value: N,
                                  placeholder: 'Search',
                                  onChange: i => I(i.target.value),
                                  onKeyDown: i => {
                                    if (i.key !== 'ArrowDown' && i.key !== 'ArrowUp') {
                                      i.stopPropagation();
                                      return;
                                    }
                                    (i.preventDefault(), i.stopPropagation());
                                    const A = [
                                      ...(i.currentTarget
                                        .closest('[role=menu]')
                                        ?.querySelectorAll('[role^=menuitem]') ?? []),
                                    ];
                                    (i.key === 'ArrowDown' ? A[0] : A.at(-1))?.focus();
                                  },
                                }),
                              ],
                            }),
                            (0, jsxRuntime.jsx)('div', {
                              className: 'max-h-64 overflow-y-auto',
                              children: j.isPending
                                ? (0, jsxRuntime.jsx)(de, {className: 'mx-auto my-4'})
                                : W.length === 0
                                  ? (0, jsxRuntime.jsx)('p', {
                                      className: 'text-muted-foreground px-2.5 py-2 text-sm',
                                      children: 'No matching applications',
                                    })
                                  : W.map(i =>
                                      (0, jsxRuntime.jsxs)(
                                        q,
                                        {
                                          onClick: () => g(i),
                                          children: [
                                            (0, jsxRuntime.jsx)(AppIcon, {app: i}),
                                            (0, jsxRuntime.jsx)('span', {className: 'truncate', children: i.name}),
                                          ],
                                        },
                                        i.bundleId,
                                      ),
                                    ),
                            }),
                            (0, jsxRuntime.jsx)(ce, {}),
                            (0, jsxRuntime.jsxs)(q, {
                              onClick: () => {
                                (g(null), R(true));
                              },
                              children: [
                                (0, jsxRuntime.jsx)(ae, {className: 'size-4'}),
                                (0, jsxRuntime.jsx)('span', {
                                  children: f ? 'Enter application identifier' : 'Enter bundle id',
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    })
                  : (0, jsxRuntime.jsx)(Te, {
                      autoFocus: true,
                      placeholder: c === 'url' ? 'example.com' : f ? 'C:\\Path\\Application.exe' : 'com.apple.Safari',
                      value: w,
                      onChange: i => p(i.target.value),
                      onKeyDown: i => i.key === 'Enter' && E(),
                    }),
                c === 'app' &&
                  !y &&
                  f &&
                  (0, jsxRuntime.jsx)('p', {
                    className: 'text-muted-foreground text-xs',
                    children: 'Enter the full executable path, or a packaged app identifier beginning with aumid:.',
                  }),
                (0, jsxRuntime.jsx)(b, {disabled: disabled || !M, onClick: E, children: 'Add'}),
              ],
            }),
          ],
        }),
      ],
    });
  };
