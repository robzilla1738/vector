/* Aux-owned source, composer pass 4: the composer's notices and status pills
 * (assets/session-composer-Dc0LRfZA.js, from the notice hook to the file-attachment test). The
 * provider and connect notices, the connection notice, and the pills above the composer (todos,
 * subagents, scroll to bottom). This block starts inside the chunk's `var` list.
 * Names the chunk uses elsewhere keep their chunk names: Nr useComposerNotice,
 * Ih ComposerNotice (exported j), T1 ComposerCardNotice (exported A, drawn under the composer card),
 * Nh ComposerStatusBar, Er isFileAttachment.
 * Chunk names used: a JSX runtime, g React, Y cn, ge useApp, Ce useTRPC, Fe useQuery, on the model
 * settings, me useSession, zt the session controller, dn disconnected, un stream status, Ia a
 * dismissal, at dayjs, pn page href, wr link click, J Button,
 * Ae/Pe/Ie tooltip parts, Bl dismissible nudge, Sn message list, ch/Xa scroll state, Sr
 * AnimatePresence, Mt motion, $t the side panel, Ut openSession, Rt the subagent icon, an shimmer.
 * Aux changes: the notice under the composer card tucks under and curves around the card's 12px
 * corner (it followed the 16px one); no plans or credits, so no usage warning, no billing lookup and
 * no paused-plan notice. */
/** useComposerNotice: what the composer should say about the models: connect one, or connect a subscription. */
  Nr = () => {
    const {accountId} = ge(),
      trpc = Ce(),
      {availableModels, hasExternalSubscription, isLoading} = on(),
      {data: account} = Fe(trpc.accounts.get.queryOptions({accountId})),
      local = account?.mode === 'local';

    if (!isLoading && availableModels.length === 0 && local)
      return {
        kind: 'ai-subscription-connect',
        description: 'Connect an AI provider to start chatting',
        actionLabel: 'Connect',
        actionPath: `/u/${accountId}/settings/model`,
      };
    if (account && !isLoading && hasExternalSubscription === false)
      return {
        kind: 'ai-subscription-connect',
        description: 'Connect my AI subscription',
        actionLabel: 'Connect',
        actionPath: `/u/${accountId}/settings/model`,
      };
  } /** The connection pill above the composer, with its explanation in a tooltip. */,
  ConnectionPill = () => {
    const message = connectionMessage();
    return message
      ? (0, a.jsxs)(Ae, {
          children: [
            (0, a.jsxs)(Pe, {
              render: (0, a.jsx)('div', {role: 'status'}),
              tabIndex: 0,
              className:
                'bg-popover text-muted-foreground border-hairline inline-flex min-w-0 items-center gap-1.5 rounded-full border px-2 py-1 text-xs shadow-xs backdrop-blur-lg',
              children: [
                (0, a.jsx)(su, {className: '-m-1 size-6 shrink-0'}),
                (0, a.jsx)('span', {className: 'truncate', children: 'Connection interrupted'}),
              ],
            }),
            (0, a.jsx)(Ie, {side: 'top', sideOffset: 8, children: message}),
          ],
        })
      : null;
  } /** The connection notice under the composer card. */,
  ConnectionNotice = ({className}) => {
    const message = connectionMessage();
    return message
      ? (0, a.jsx)('div', {
          role: 'status',
          className: Y('@container/notice mx-auto -mt-[var(--radius-xl)] w-full overflow-hidden', className),
          children: (0, a.jsx)('div', {
            className: 'inner-curved-shape-bottom [--_r:var(--radius-xl)] bg-muted mt-0 [--_k:calc(var(--_r)*0.55228475)]',
            children: (0, a.jsx)('div', {
              className: '-mt-px flex min-w-0 items-center gap-2 px-5 pb-1.5',
              children: (0, a.jsxs)('p', {
                className: 'min-w-0 grow truncate text-xs',
                children: [
                  (0, a.jsx)('span', {className: 'font-medium', children: 'Connection interrupted'}),
                  ' ',
                  (0, a.jsx)('span', {className: 'text-muted-foreground', children: message}),
                ],
              }),
            }),
          }),
        })
      : null;
  };
function connectionMessage() {
  return dn() ? 'Task status will update when the connection is restored.' : null;
}
var /** ComposerNotice: the provider notice for the current session. */
  Ih = ({className}) => {
    const notice = zt()?.notice;
    return (0, a.jsx)(ProviderNotice, {reason: notice, className});
  } /** A provider notice: the subscription nudge. */,
  ProviderNotice = ({reason, className}) => {
    const {accountId} = ge();
    return dn() || !reason
      ? null
      : (0, a.jsx)('div', {
          className: Y(
            'text-muted-foreground mx-auto mb-2 flex min-w-0 items-center gap-1 px-2 text-xs font-medium empty:hidden',
            className,
          ),
          children: (0, a.jsx)(SubscriptionNudge, {reason}, accountId),
        });
  } /** ComposerCardNotice: the notice under the composer card: offline, or what the provider needs. */,
  T1 = ({className}) => {
    const notice = zt()?.notice,
      disconnected = dn(),
      {isDismissed} = useSubscriptionNudge();
    return disconnected
      ? (0, a.jsx)(ConnectionNotice, {className})
      : !notice || (notice.kind === 'ai-subscription-connect' && isDismissed)
        ? null
        : (0, a.jsx)('div', {
            role: 'status',
            className: Y('@container/notice mx-auto -mt-[var(--radius-xl)] w-full overflow-hidden', className),
            children: (0, a.jsx)('div', {
              className: 'inner-curved-shape-bottom [--_r:var(--radius-xl)] bg-muted mt-0 [--_k:calc(var(--_r)*0.55228475)]',
              children: (0, a.jsxs)('div', {
                className: '-mt-px flex min-w-0 items-center gap-2 px-5 pb-1.5 text-xs',
                children: [
                  (0, a.jsx)('p', {
                    className: 'min-w-0 grow truncate',
                    title: notice.description,
                    children: notice.description,
                  }),
                  (0, a.jsxs)(J, {
                    variant: 'secondary',
                    className: 'shrink-0 @max-sm:size-6',
                    size: 'xs',
                    shape: 'pill',
                    nativeButton: false,
                    'aria-label': notice.actionLabel,
                    render: (0, a.jsx)('a', {href: pn(notice.actionPath), onClick: wr}),
                    children: [
                      (0, a.jsx)('span', {className: '@max-sm:hidden', children: notice.actionLabel}),
                      (0, a.jsx)(cn, {className: 'size-3 @sm:hidden'}),
                    ],
                  }),
                ],
              }),
            }),
          });
  } /** The subscription nudge, dismissed for good once dismissed. */,
  useSubscriptionNudge = () => {
    const {accountId} = ge();
    return Ia(`nudge.aiSubscription.${accountId}.dismissedUntil`, at.default.duration(1e3, 'years'));
  },
  SubscriptionNudge = ({reason}) => {
    const {isDismissed, dismissForever} = useSubscriptionNudge();
    return isDismissed
      ? null
      : (0, a.jsx)(Bl, {
          dismissLabel: 'Dismiss AI subscription suggestion',
          href: pn(reason.actionPath),
          onDismiss: dismissForever,
          children: (0, a.jsx)('span', {className: 'truncate', children: reason.description}),
        });
  } /** ComposerStatusBar: the pills and notices floating above the composer. */,
  Nh = () => {
    const {isReadonly} = Sn();
    return (0, a.jsx)('div', {
      className: 'pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center',
      children: (0, a.jsx)('div', {
        className: 'flex w-full max-w-4xl min-w-0 flex-col items-center gap-2 px-4 lg:px-8',
        'data-agent-session-ui': 'chat',
        children: (0, a.jsxs)('div', {
          className: 'flex w-full min-w-0 items-end gap-1 px-2',
          children: [
            (0, a.jsxs)('div', {
              className: 'pointer-events-auto flex min-w-0 flex-1 flex-wrap items-center gap-1',
              children: [
                (0, a.jsx)(ActivityPills, {}),
                !isReadonly && (0, a.jsx)(ConnectionPill, {}),
                !isReadonly && (0, a.jsx)(SessionProviderNotice, {}),
                !isReadonly && (0, a.jsx)(Ol, {}),
              ],
            }),
            (0, a.jsx)(ScrollToBottomButton, {}),
          ],
        }),
      }),
    });
  } /** The provider notice in the status bar, for an open session. */,
  SessionProviderNotice = () => {
    const {currentSession} = me(),
      notice = Nr();
    return currentSession.id
      ? (0, a.jsx)(ProviderNotice, {reason: notice, className: '*:bg-popover! mx-0 mb-0 max-w-full px-0'})
      : null;
  } /** The pills pop in and out. */,
  PILL_MOTION = (0, a.jsx)(Mt.button, {
    initial: {opacity: 0, scale: 0.85},
    animate: {opacity: 1, scale: 1},
    exit: {opacity: 0, scale: 0.85},
    transition: {duration: 0.15, ease: 'easeOut'},
  }) /** Scroll to bottom, showing dots while the agent works. */,
  ScrollToBottomButton = () => {
    const scroll = ch(),
      scroller = Xa(),
      streaming = un() === 'streaming',
      visible = !scroll.isAtBottom || streaming,
      scrollToBottom = () => {
        scroller.scrollToBottom('smooth');
      };
    return (0, a.jsx)(Sr, {
      initial: false,
      children:
        visible &&
        (0, a.jsx)(
          J,
          {
            render: PILL_MOTION,
            size: 'icon-xs',
            shape: 'pill',
            variant: 'outline',
            'aria-label': streaming && scroll.isAtBottom ? 'Working' : 'Scroll to bottom',
            title: streaming ? 'Working — scroll to bottom' : 'Scroll to bottom',
            className: 'bg-popover! border-hairline pointer-events-auto shadow-xs backdrop-blur-lg',
            onClick: scrollToBottom,
            type: 'button',
            children: streaming
              ? (0, a.jsx)(dh, {className: 'text-surface-secondary-foreground size-4', dotClassName: 'size-[3px]'})
              : (0, a.jsx)($i, {className: 'text-surface-primary-foreground size-4'}),
          },
          'scroll-to-bottom',
        ),
    });
  } /** The subagents and todos pills while the agent is working. */,
  ActivityPills = () => {
    const {currentSession} = me(),
      status = un(),
      todos = _n(currentSession.status) ? currentSession.toolState.todo.todos : [],
      subagents = currentSession.toolState.subagent?.subagents ?? [],
      hasTodos = todos.length > 0,
      anyRunning = subagents.some(subagent => subagent.isRunning),
      streaming = status === 'streaming';
    return (0, a.jsxs)(Sr, {
      initial: false,
      children: [
        streaming && anyRunning && (0, a.jsx)(SubagentsPill, {subagents}, 'subagents'),
        streaming && hasTodos && (0, a.jsx)(TodosPill, {todos}, 'todos'),
      ],
    });
  } /** Todos: progress, with the list in a tooltip; a todo expands when clicked. */,
  TodosPill = ({todos}) => {
    const [expanded, setExpanded] = (0, g.useState)(null),
      completed = todos.filter(todo => todo.status === 'completed').length,
      percent = todos.length === 0 ? 0 : (completed / todos.length) * 100,
      toggle = id => () => setExpanded(expanded === id ? null : id);
    return (0, a.jsxs)(Ae, {
      disableHoverablePopup: false,
      children: [
        (0, a.jsxs)(Pe, {
          render: (0, a.jsx)(J, {
            size: 'xs',
            shape: 'pill',
            variant: 'outline',
            className:
              'bg-popover! text-muted-foreground border-hairline hover:text-muted-foreground aria-expanded:text-muted-foreground max-w-full shadow-xs backdrop-blur-lg *:cursor-pointer',
            render: PILL_MOTION,
          }),
          children: [
            (0, a.jsx)(Ea, {percent, className: 'text-green-500', 'data-icon': 'inline-start'}),
            (0, a.jsxs)('span', {className: 'tabular-nums', children: [completed, '/', todos.length, ' tasks']}),
          ],
        }),
        (0, a.jsxs)(Ie, {
          side: 'top',
          sideOffset: 8,
          className: 'max-w-[min(18rem,var(--available-width))] flex-col items-stretch gap-1 rounded-lg px-2.5 py-2',
          children: [
            (0, a.jsx)('h4', {className: 'text-muted-foreground mb-1 text-[13px] font-medium', children: 'Todos'}),
            todos.map(todo =>
              (0, a.jsxs)(
                'button',
                {
                  'aria-expanded': expanded === todo.id,
                  className: Y(
                    'flex cursor-pointer items-start gap-2 py-0.5 text-left text-[13px] font-normal',
                    todo.status === 'completed' && 'text-muted-foreground',
                    todo.status === 'cancelled' && 'text-muted-foreground line-through',
                  ),
                  onClick: toggle(todo.id),
                  children: [
                    (0, a.jsx)(zi, {status: todo.status}),
                    (0, a.jsx)('span', {
                      className: Y(
                        'min-w-0 flex-1 overflow-hidden wrap-break-word [interpolate-size:allow-keywords]',
                        expanded === todo.id
                          ? 'h-auto transition-[height] duration-200 ease-out'
                          : 'line-clamp-1 h-lh [transition:height_200ms_ease-out,-webkit-line-clamp_0s_200ms_allow-discrete]',
                      ),
                      children: todo.content,
                    }),
                  ],
                },
                todo.id,
              ),
            ),
          ],
        }),
      ],
    });
  } /** Subagents: how many are running, with the running and completed lists in a tooltip. */,
  SubagentsPill = ({subagents}) => {
    const panel = $t(),
      {colorKeysBySessionId, completedSubagents, runningSubagents} = (0, g.useMemo)(() => {
        const running = [],
          completed = [];
        for (const subagent of [...subagents].reverse())
          subagent.isRunning ? running.push(subagent) : completed.push(subagent);
        return {colorKeysBySessionId: Cl(subagents), completedSubagents: completed, runningSubagents: running};
      }, [subagents]),
      label = `${runningSubagents.length} subagent${runningSubagents.length === 1 ? '' : 's'}`,
      openAll = () => panel?.openSubagents();
    return (0, a.jsxs)(Ae, {
      disableHoverablePopup: false,
      children: [
        (0, a.jsxs)(Pe, {
          render: (0, a.jsx)(J, {
            size: 'xs',
            shape: 'pill',
            variant: 'outline',
            className:
              'bg-popover! text-muted-foreground border-hairline hover:text-muted-foreground aria-expanded:text-muted-foreground max-w-full shadow-xs backdrop-blur-lg *:cursor-pointer',
            render: PILL_MOTION,
            onClick: openAll,
          }),
          children: [
            (0, a.jsx)(Rt, {
              className: 'size-4 shrink-0 rounded-sm opacity-60',
              color: 'mono',
              'data-icon': 'inline-start',
            }),
            runningSubagents.length > 0
              ? (0, a.jsx)(an, {as: 'span', shimmerColor: 'var(--color-primary)', children: label})
              : (0, a.jsx)('span', {children: label}),
          ],
        }),
        (0, a.jsxs)(Ie, {
          side: 'top',
          sideOffset: 8,
          className: 'max-h-96 max-w-72 flex-col items-stretch gap-1 overflow-auto rounded-lg px-2.5 py-2',
          children: [
            (0, a.jsx)('h4', {className: 'text-muted-foreground mb-1 text-[13px] font-medium', children: 'Subagents'}),
            runningSubagents.length > 0 &&
              (0, a.jsx)(SubagentGroup, {title: 'Running', subagents: runningSubagents, colorKeysBySessionId}),
            completedSubagents.length > 0 &&
              (0, a.jsx)(SubagentGroup, {title: 'Completed', subagents: completedSubagents, colorKeysBySessionId}),
          ],
        }),
      ],
    });
  },
  SubagentGroup = ({title, subagents, colorKeysBySessionId}) =>
    (0, a.jsxs)('div', {
      className: '-mx-1 flex flex-col gap-0.5',
      children: [
        (0, a.jsxs)('div', {
          className: 'text-muted-foreground flex items-center gap-1 px-1 text-xs font-medium select-none',
          children: [
            (0, a.jsx)('span', {children: title}),
            (0, a.jsx)('span', {className: 'text-muted-foreground/60', children: subagents.length}),
          ],
        }),
        subagents.map(subagent =>
          (0, a.jsx)(
            SubagentRow,
            {color: colorKeysBySessionId.get(subagent.sessionId) ?? 'mono', subagent},
            subagent.sessionId,
          ),
        ),
      ],
    }) /** A subagent row: opens it in the side panel, or as its own session. */,
  SubagentRow = ({color, subagent}) => {
    const openSession = Ut(),
      panel = $t(),
      open = () => {
        panel ? panel.openSubagents(subagent.sessionId) : openSession(subagent.sessionId);
      };
    return (0, a.jsxs)(J, {
      className: 'group h-auto w-full justify-start gap-2 px-1 py-1.5',
      variant: 'ghost',
      onClick: open,
      children: [
        (0, a.jsx)(Rt, {className: 'size-4 shrink-0 rounded-sm', color}),
        (0, a.jsx)('div', {
          className: 'text-primary min-w-0 flex-1 text-left text-sm leading-5 font-normal',
          children: subagent.isRunning
            ? (0, a.jsx)(an, {
                as: 'span',
                className: 'block max-w-full truncate',
                shimmerColor: 'var(--color-primary)',
                children: subagent.description,
              })
            : (0, a.jsx)('span', {className: 'block truncate', children: subagent.description}),
        }),
        (0, a.jsx)(cr, {className: 'text-muted-foreground size-4 shrink-0'}),
      ],
    });
  },
  Er = attachment => attachment.type === 'file';
