/* Aux-owned source, composer pass 4: the composer's notices and status pills
 * (assets/session-composer-Dc0LRfZA.js, from the notice hook to the file-attachment test). The
 * provider, sign-in and subscription notices, the monthly usage warning with its upgrade and credit
 * buttons, the connection notice, and the pills above the composer (todos, subagents, scroll to
 * bottom). This block starts inside the chunk's `var` list.
 * Names the chunk uses elsewhere keep their chunk names: Nr useComposerNotice, jh UsageWarning,
 * Ih ComposerNotice (exported j), T1 ComposerCardNotice (exported A, drawn under the composer card),
 * Nh ComposerStatusBar, Er isFileAttachment.
 * Chunk names used: a JSX runtime, g React, Y cn, ge useApp, Ce useTRPC, Fe useQuery, on the model
 * settings, me useSession, zt the session controller, dn disconnected, un stream status, Ia a
 * dismissal, at dayjs, bi relative time, br openPage, pn page href, wr link click, J Button,
 * Ae/Pe/Ie tooltip parts, Bl dismissible nudge, Sn message list, ch/Xa scroll state, Sr
 * AnimatePresence, Mt motion, $t the side panel, Ut openSession, Rt the subagent icon, an shimmer.
 * Aux change: the usage warning takes the 12px scale corner (rounded-xl), and the notice under the
 * composer card tucks under and curves around the card's 12px corner (it followed the 16px one). */
/** useComposerNotice: what the composer should say about the selected provider: connect one, sign in, the monthly limit, or connect a subscription. */
  Nr = ({selectedProvider}) => {
    const {accountId} = ge(),
      trpc = Ce(),
      {availableModels, hasExternalSubscription, isLoading} = on(),
      {data: account} = Fe(trpc.accounts.get.queryOptions({accountId})),
      signedIn = account?.mode === 'cloud' && account.authStatus !== 'paused',
      paused = account?.mode === 'cloud' && account.authStatus === 'paused',
      local = account?.mode === 'local',
      auxProvider = selectedProvider === 'aux',
      subscriptionQuery = Fe(
        trpc.billing.getSubscription.queryOptions(
          {accountId},
          {enabled: signedIn && auxProvider, retry: false, staleTime: 6e4},
        ),
      );
    if (!isLoading && availableModels.length === 0 && local)
      return {
        kind: 'ai-subscription-connect',
        description: 'Connect an AI provider to start chatting',
        actionLabel: 'Connect',
        actionPath: `/u/${accountId}/settings/model`,
      };
    if (!isLoading && availableModels.length === 0 && paused)
      return {
        kind: 'aux-sign-in-required',
        description: paused
          ? 'Your session is paused, so Aux plan models are unavailable for Ask AI.'
          : 'Sign in to use Aux provider',
        actionLabel: 'Sign in',
        actionPath: '/auth/sign-in',
      };
    const billing = subscriptionQuery.data,
      usedPercent = billing?.credit.used_percent;
    if (signedIn && auxProvider && billing && !subscriptionQuery.isPending && $l(usedPercent))
      return {
        kind: 'aux-monthly-limit-warning',
        usedPercent,
        exhausted: BigInt(billing.credit.balance_micros) + BigInt(billing.credit.add_on_balance_micros) <= 0n,
        resetsAt: billing.credit.refresh_at,
        plan: billing.subscription?.plan.slug ?? 'free',
      };
    const subscriptionPending = signedIn && auxProvider && subscriptionQuery.isPending;
    if (account && !isLoading && !subscriptionPending && hasExternalSubscription === false)
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
var /** The monthly usage warning: how much is used or when credits reset, with upgrade and credit buttons. */
  UsageBanner = ({accountId, usage}) => {
    const {isDismissed, dismiss} = Ia(
      `composer.usageBanner.${accountId}.${usage.resetsAt}`,
      at.default.duration(Math.max(0, (0, at.default)(usage.resetsAt).diff((0, at.default)()))),
    );
    if (!AUX_LAUNCH_POLICY.hostedAiEnabled || (!usage.exhausted && isDismissed)) return null;
    const {plan, resetsAt} = usage,
      action = plan === 'free' ? 'Upgrade your plan' : plan === 'max' ? 'Buy credits' : 'Upgrade or buy credits',
      resetsLabel = bi(new Date(resetsAt), new Date()),
      detail = usage.exhausted
        ? `${action} to keep going${resetsLabel ? `, or wait until your credits reset ${resetsLabel}` : ''}.`
        : [`${usage.usedPercent}% used`, resetsIn(resetsAt)].filter(Boolean).join(' · '),
      buttons = [
        ...(plan === 'max' ? [] : [{label: 'Upgrade', search: '?change_plan=1', primary: true}]),
        ...(plan === 'free' ? [] : [{label: 'Buy credits', search: '?add_credits=1', primary: plan === 'max'}]),
      ],
      openBilling = search => () => br(`/u/${accountId}/settings/billing${search}`);
    return (0, a.jsx)('div', {
      role: 'status',
      'aria-label': 'Usage warning',
      className: 'bg-muted mb-2 rounded-xl py-2 pr-2 pl-3 text-xs',
      children: (0, a.jsxs)('div', {
        className: 'flex min-w-0 items-start gap-1',
        children: [
          (0, a.jsxs)('div', {
            className: 'flex min-w-0 grow flex-wrap items-center gap-x-2.5 gap-y-2 py-0.5',
            children: [
              (0, a.jsxs)('div', {
                className: 'min-w-0 grow basis-56',
                children: [
                  (0, a.jsx)('p', {
                    className: 'font-medium',
                    children: usage.exhausted ? 'Monthly usage limit reached' : 'Approaching monthly usage limit',
                  }),
                  (0, a.jsx)('p', {className: 'text-muted-foreground', children: detail}),
                ],
              }),
              (0, a.jsx)('div', {
                className: 'flex shrink-0 gap-1.5',
                children: buttons.map(button =>
                  (0, a.jsx)(
                    J,
                    {
                      variant: button.primary ? 'default' : 'secondary',
                      size: 'xs',
                      shape: 'pill',
                      onClick: openBilling(button.search),
                      children: button.label,
                    },
                    button.label,
                  ),
                ),
              }),
            ],
          }),
          !usage.exhausted &&
            (0, a.jsx)(J, {
              variant: 'ghost',
              size: 'icon-xs',
              shape: 'pill',
              'aria-label': 'Dismiss usage warning',
              className: 'shrink-0',
              onClick: dismiss,
              children: (0, a.jsx)(Nc, {className: 'size-3.5'}),
            }),
        ],
      }),
    });
  } /** Resets in 2 days 3 hours, or 4 hours 5 min, or 6 min. */,
  resetsIn = resetsAt => {
    const minutes = Math.ceil((0, at.default)(resetsAt).diff((0, at.default)(), 'minute', true));
    if (!Number.isFinite(minutes) || minutes <= 0) return '';
    const unit = (count, name) => (count ? `${count} ${name}${count === 1 ? '' : 's'}` : ''),
      [days, hours, mins] = [Math.floor(minutes / 1440), Math.floor((minutes % 1440) / 60), minutes % 60];
    return `Resets in ${(days ? [unit(days, 'day'), unit(hours, 'hour')] : hours ? [unit(hours, 'hour'), mins ? `${mins} min` : ''] : [`${mins} min`]).filter(Boolean).join(' ')}`;
  } /** UsageWarning: the usage banner for the current session, while connected. */,
  jh = () => {
    const notice = zt()?.notice,
      {accountId} = ge();
    return dn() || notice?.kind !== 'aux-monthly-limit-warning'
      ? null
      : (0, a.jsx)(UsageBanner, {accountId, usage: notice}, `${accountId}.${notice.resetsAt}.${notice.exhausted}`);
  } /** ComposerNotice: the provider notice for the current session. */,
  Ih = ({className}) => {
    const notice = zt()?.notice;
    return (0, a.jsx)(ProviderNotice, {reason: notice, className});
  } /** A provider notice: the subscription nudge, or the sign-in or connect line with its action. */,
  ProviderNotice = ({reason, className}) => {
    const {accountId} = ge();
    return dn() || !reason || reason.kind === 'aux-monthly-limit-warning'
      ? null
      : (0, a.jsx)('div', {
          className: Y(
            'text-muted-foreground mx-auto mb-2 flex min-w-0 items-center gap-1 px-2 text-xs font-medium empty:hidden',
            className,
          ),
          children:
            reason.kind === 'ai-subscription-connect'
              ? (0, a.jsx)(SubscriptionNudge, {reason}, accountId)
              : (0, a.jsx)(SignInNotice, {reason}),
        });
  } /** ComposerCardNotice: the notice under the composer card: offline, or what the provider needs. */,
  T1 = ({className}) => {
    const notice = zt()?.notice,
      disconnected = dn(),
      {isDismissed} = useSubscriptionNudge();
    return disconnected
      ? (0, a.jsx)(ConnectionNotice, {className})
      : !notice ||
          notice.kind === 'aux-monthly-limit-warning' ||
          (notice.kind === 'ai-subscription-connect' && isDismissed)
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
  },
  SignInNotice = ({reason}) =>
    (0, a.jsxs)(a.Fragment, {
      children: [
        (0, a.jsxs)('div', {
          className:
            'bg-surface-secondary ring-border-surface-strong inline-flex h-6 min-w-0 items-center gap-1 rounded-full px-2 shadow-xs ring-[0.5px]',
          title: reason.description,
          children: [
            (0, a.jsx)(Fi, {className: '-ml-0.5 size-3.5 shrink-0'}),
            (0, a.jsx)('span', {className: 'truncate', children: reason.description}),
          ],
        }),
        (0, a.jsx)(J, {
          variant: 'outline',
          className: 'shrink-0',
          size: 'xs',
          shape: 'pill',
          nativeButton: false,
          render: (0, a.jsx)('a', {href: pn(reason.actionPath), onClick: wr}),
          children: reason.actionLabel,
        }),
      ],
    }) /** ComposerStatusBar: the pills and notices floating above the composer. */,
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
      notice = Nr({selectedProvider: currentSession.model.provider});
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
