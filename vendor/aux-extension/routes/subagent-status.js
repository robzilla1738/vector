/* Aux-owned source: how subagents and Aux Code agents show their progress (assets/provider-Cw0zhujt.js,
 * It through ol): the subagent list merged with its session previews, the model chip, time worked,
 * the latest activity, status and its icon, and the coder card. Icons keep their status colors.
 * Names the rest of the chunk uses keep their chunk names: It, Xc, eu, sl, rl, tu, Zn, Jn, il, nu (exported), fn the timer, ol the coder card.
 * Chunk names used: c React, r JSX runtime, L cn, St the current session, q useApp, Q useTRPC, Ye page
 * visibility, te useQuery, lt running, _n subagent colors, We agent settings, Rn provider icon, Cn Badge,
 * Dn duration, Ts RelativeTime, ir/sr/ar tool titles, Us/Hs message text, pt Spinner, pr clock, Cs/Ws/hr
 * status icons, ja stopped, As shimmer, nl useOpenSession, Ct the side panel, tr the coder card. */
var /** Whether a run ended in failure. */
  It = ({preview}) =>
    preview !== void 0 &&
    (preview.status === 'errored' ||
      preview.status === 'aborted' ||
      preview.status === 'interrupted' ||
      preview.latestRun.abortReason !== void 0),
  /** The session's subagents with their live previews. */
  Xc = () => {
    const {currentSession} = St(),
      {accountId} = q(),
      trpc = Q(),
      isVisible = Ye(),
      subagents = currentSession.toolState.subagent?.subagents ?? [],
      sessionIds = (0, c.useMemo)(() => subagents.map(value => value.sessionId), [subagents]),
      anyRunning = subagents.some(value => value.isRunning),
      previews = te(
        trpc.sessions.listPreviewItems.queryOptions(
          {accountId, limit: Math.max(sessionIds.length, 1), order: 'desc', parent: 'all', sessionIds},
          {
            enabled: sessionIds.length > 0,
            refetchInterval: value =>
              isVisible && (anyRunning || value.state.data?.some(colors => lt(colors.status))) ? 1e3 : false,
            refetchOnMount: 'always',
          },
        ),
      ),
      wasRunning = (0, c.useRef)(anyRunning);
    return (
      (0, c.useEffect)(() => {
        (wasRunning.current && !anyRunning && previews.refetch(), (wasRunning.current = anyRunning));
      }, [anyRunning, previews.refetch]),
      (0, c.useMemo)(() => {
        const value = new Map(previews.data?.map(subagent => [subagent.id, subagent])),
          colors = _n(subagents);
        return subagents.map(subagent => {
          const preview = value.get(subagent.sessionId);
          return {
            ...subagent,
            model: preview?.model ?? subagent.model,
            isRunning: subagent.isRunning || (preview ? lt(preview.status) : false),
            color: colors.get(subagent.sessionId) ?? 'mono',
            preview,
          };
        });
      }, [previews.data, subagents])
    );
  },
  /** The model used, and the response model when it differs. */
  eu = ({actualModel, model, variant = 'text'}) => {
    const {availableModels} = We(),
      shortName = ({modelId, provider}) =>
        availableModels.find(candidate => candidate.provider === provider && candidate.id === modelId)?.shortName ??
        modelId,
      selectedName = shortName(model),
      responseModel =
        actualModel && (actualModel.provider !== model.provider || actualModel.modelId !== model.modelId)
          ? actualModel
          : void 0,
      label = `Selected model ${model.provider}/${model.modelId}${responseModel ? `. Response model ${responseModel.provider}/${responseModel.modelId}.` : ''}`,
      content = (0, r.jsxs)(r.Fragment, {
        children: [
          (0, r.jsx)(Rn, {provider: model.provider, className: 'size-3 text-current'}),
          (0, r.jsx)('span', {className: 'min-w-0 truncate', children: selectedName}),
          responseModel &&
            (0, r.jsxs)('span', {
              className: 'text-muted-foreground min-w-0 truncate',
              children: ['Response: ', shortName(responseModel)],
            }),
        ],
      });
    return variant === 'badge'
      ? (0, r.jsx)(Cn, {
          variant: 'secondary',
          className: 'max-w-32 min-w-0 gap-1.5 rounded-full px-1.5',
          title: label,
          'aria-label': label,
          children: content,
        })
      : (0, r.jsx)('span', {
          className: 'inline-flex max-w-full min-w-0 items-center gap-1',
          title: label,
          'aria-label': label,
          children: content,
        });
  },
  /** How long an agent worked, or when it last updated. */
  sl = ({item, variant = 'default'}) => {
    if (variant === 'duration') {
      const duration = workedDuration(item);
      return item.preview
        ? (0, r.jsxs)('span', {
            className: 'tabular-nums',
            children: [
              'worked',
              ' ',
              item.isRunning ? (0, r.jsx)(fn, {startedAt: item.preview.latestRun.startedAt}) : Dn(duration ?? 0),
            ],
          })
        : null;
    }
    return item.isRunning
      ? item.preview
        ? (0, r.jsx)(fn, {startedAt: item.preview.latestRun.startedAt})
        : null
      : item.preview
        ? (0, r.jsx)(Ts, {datetime: item.preview.updatedAt})
        : null;
  },
  /** What an agent is doing now. */
  rl = ({item, fallback}) => {
    const {accountId} = q(),
      trpc = Q(),
      isVisible = Ye(),
      {data: toolCalls = []} = te(
        trpc.sessions.liveToolCalls.queryOptions(
          {accountId, sessionId: item.sessionId},
          {enabled: item.isRunning, refetchInterval: isVisible && item.isRunning ? 900 : false, staleTime: 0},
        ),
      ),
      latest = toolCalls.at(-1);
    if (!item.isRunning) {
      if (It(item)) return 'Failed';
      const message = item.preview?.latestRun.finalAssistantMessage?.at(-1);
      return message ? Us(Hs(message)) : null;
    }
    if (!latest) return fallback ?? 'Thinking';
    const tool = ir(latest.name),
      summary = sr(latest, void 0, {isStreaming: true, sessionId: item.sessionId});
    return ar(tool.title, summary);
  },
  /** The model of a finished agent's last message. */
  tu = item => {
    if (item.preview?.status !== 'idle' || It(item)) return;
    const message = item.preview.latestRun.finalAssistantMessage?.at(-1);
    return message ? {modelId: message.responseModel ?? message.model, provider: message.provider} : void 0;
  },
  /** How long a run took. */
  workedDuration = item => {
    const preview = item.preview;
    if (!preview) return;
    const finishedAt = preview.latestRun.finishedAt ?? preview.updatedAt;
    return Math.max(0, new Date(finishedAt).getTime() - new Date(preview.latestRun.startedAt).getTime());
  },
  /** A live worked-for timer. */
  fn = ({startedAt}) => {
    const isVisible = Ye(),
      [now, setNow] = (0, c.useState)(Date.now),
      startedAtMs = new Date(startedAt).getTime();
    return (
      (0, c.useEffect)(() => {
        if (!isVisible) return;
        setNow(Date.now());
        const interval = window.setInterval(() => setNow(Date.now()), 1e3);
        return () => window.clearInterval(interval);
      }, [isVisible, startedAt]),
      (0, r.jsx)('span', {className: 'tabular-nums', children: Dn(Math.max(0, now - startedAtMs))})
    );
  },
  /** Agent status labels and badges. */
  AGENT_STATUS = {
    starting: {label: 'Starting', badge: 'secondary'},
    working: {label: 'Working', badge: 'secondary'},
    waiting: {label: 'Waiting', badge: 'secondary'},
    'needs-you': {label: 'Needs you', badge: 'secondary'},
    done: {label: 'Done', badge: 'success'},
    failed: {label: 'Failed', badge: 'destructive'},
    stopped: {label: 'Stopped', badge: 'secondary'},
  },
  /** An agent's status from its preview. */
  Zn = preview => {
    if (!preview) return 'starting';
    switch (preview.status) {
      case 'running':
        return 'working';
      case 'suspended':
        return 'needs-you';
      case 'interrupted':
      case 'aborted':
        return 'stopped';
      default:
        return preview.waiting ? 'waiting' : It({preview}) ? 'failed' : 'done';
    }
  },
  /** A preview as a list item. */
  Jn = preview => ({sessionId: preview.id, isRunning: lt(preview.status), preview}),
  /** A status icon. */
  il = ({status, className}) => {
    const iconClass = L('size-3.5 shrink-0', className);
    switch (status) {
      case 'starting':
      case 'working':
        return (0, r.jsx)(pt, {className: L(iconClass, 'text-muted-foreground')});
      case 'waiting':
        return (0, r.jsx)(pr, {className: L(iconClass, 'text-muted-foreground')});
      case 'needs-you':
        return (0, r.jsx)(Cs, {className: L(iconClass, 'text-amber-500')});
      case 'done':
        return (0, r.jsx)(Ws, {className: L(iconClass, 'text-emerald-500')});
      case 'failed':
        return (0, r.jsx)(hr, {className: L(iconClass, 'text-destructive')});
      case 'stopped':
        return (0, r.jsx)(ja, {className: L(iconClass, 'text-muted-foreground')});
      default:
        return status;
    }
  },
  /** The line under an agent. */
  nu = ({preview}) => {
    const status = Zn(preview);
    if (status === 'needs-you') return preview.previewText || 'Waiting for your answer';
    if (status === 'stopped') return 'Stopped';
    if (status === 'waiting') return preview.previewText?.trim() || 'Waiting for its background work';
    if (status === 'done' && !preview.previewText?.trim()) return 'Finished';
    const activity = (0, r.jsx)(rl, {item: Jn(preview)});
    return status === 'working'
      ? (0, r.jsx)(As, {as: 'span', className: 'block truncate', children: activity})
      : activity;
  },
  /** The Aux Code card in a chat. */
  ol = ({taskId, title, prompt}) => {
    const {accountId} = q(),
      trpc = Q(),
      openSession = nl(),
      sidepanel = Ct(),
      {data: preview} = te(
        trpc.sessions.listPreviewItems.queryOptions(
          {accountId, sessionIds: taskId ? [taskId] : [], limit: 1, archived: 'include'},
          {enabled: !!taskId, select: ([first]) => first},
        ),
      ),
      status = Zn(preview),
      badge = (0, r.jsxs)(r.Fragment, {
        children: [
          status === 'starting' || status === 'working'
            ? (0, r.jsx)(pt, {className: 'size-3'})
            : (0, r.jsx)(il, {className: 'size-3 text-current', status}),
          AGENT_STATUS[status].label,
          status === 'working' &&
            preview &&
            (0, r.jsx)('span', {
              className: 'text-muted-foreground font-normal',
              children: (0, r.jsx)(sl, {item: Jn(preview)}),
            }),
        ],
      });
    return (0, r.jsx)(tr, {
      title,
      prompt,
      onOpen: preview
        ? () => {
            openSession(preview.id);
          }
        : void 0,
      status: (0, r.jsx)(Cn, {
        className: L('gap-1', sidepanel && 'hover:ring-border-surface-strong cursor-pointer hover:ring-1'),
        variant: AGENT_STATUS[status].badge,
        title: sidepanel ? 'Show all Aux Code agents' : void 0,
        render: sidepanel ? (0, r.jsx)('button', {type: 'button', onClick: sidepanel.openAuxCode}) : void 0,
        children: badge,
      }),
    });
  }
