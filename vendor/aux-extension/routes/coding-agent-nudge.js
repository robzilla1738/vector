/* Aux-owned source: the nudge to connect a coding agent (assets/coding-agent-nudge-Cy9BtLdb.js, after its
 * logo assets): the pill with a dismiss button, the chat and New Tab forms of it, the check that a
 * chat's last message is about code, and whether to show it: dismissed for a month, or forever
 * once used. Connecting opens Developers. The Claude and terminal tiles keep their own colors.
 * Names the rest of the chunk uses keep their chunk names: I the pill, $ the New Tab form, T a target, ee the chat form (exported), and
 * s the JSX runtime stays as named.
 * Chunk names used: k JSX runtime, x cn, d Button, B/S extension page links, h close, auxClaudeIcon, Z/R the logos,
 * P the session, N useApp, F/y/_/U hidden check, capture, the dismissal hook and dayjs. */
s = k(),
  /** The nudge pill. */
  I = ({children, className, dismissLabel, href, onClick, onDismiss}) =>
    (0, s.jsxs)('div', {
      className: x(
        'group/nudge inline-flex max-w-full min-w-0 items-center overflow-hidden rounded-full',
        'bg-popover! text-muted-foreground border-hairline hover:text-muted-foreground aria-expanded:text-muted-foreground max-w-full shadow-xs backdrop-blur-lg *:cursor-pointer',
        className,
      ),
      children: [
        (0, s.jsx)(d, {
          size: 'xs',
          shape: 'pill',
          variant: 'ghost',
          className:
            'max-w-full min-w-0 shrink gap-1 rounded-none border-0 bg-transparent! pr-2.5 pl-2.5 text-inherit! shadow-none transition-none group-focus-within/nudge:pr-0.5 group-hover/nudge:pr-0.5 hover:bg-transparent! dark:hover:bg-transparent!',
          nativeButton: !href,
          render: href ? (0, s.jsx)('a', {href, onClick: B}) : void 0,
          onClick,
          children,
        }),
        (0, s.jsx)(d, {
          type: 'button',
          size: 'icon-xs',
          shape: 'pill',
          variant: 'ghost',
          'aria-label': dismissLabel,
          className:
            'mr-0.5 hidden size-5 shrink-0 rounded-none text-inherit! transition-none group-focus-within/nudge:inline-flex group-hover/nudge:inline-flex hover:bg-black/5 dark:hover:bg-white/10',
          onClick: onDismiss,
          children: (0, s.jsx)(h, {}),
        }),
      ],
    }),
  /** The agents the nudge can suggest. */
  TARGETS = {
    codex: {name: 'Codex', logoSrc: Z},
    'claude-code': {name: 'Claude Code', logoSrc: R},
  };
/** The agent to suggest for a provider. */
function T(provider) {
  if (!provider || provider === 'aux' || provider === 'openai-codex') return 'codex';
  if (provider === 'claude-code') return 'claude-code';
}
var /** Whether a message is about code. */
  looksLikeCode = text =>
    [
      /\b(code|coding|bug|debug|implement|refactor|typecheck|stack trace|repo|repository|github|commit|pull request|localhost)\b/iu,
      /\b(react|typescript|javascript|python|node|vite|tsx?|jsx?|css|html|sql|cli|mcp|pnpm|npm|bun|vitest|playwright)\b/iu,
      /\b(pnpm|npm|yarn|bun|git|cargo|go|pytest|vitest)\s+\S+/iu,
      /(?:^|[\s`'"])(?:\.{0,2}\/)?[\w.-]+\/[\w./-]+\.(?:tsx?|jsx?|py|rs|go|java|kt|swift|css|scss|html|json|ya?ml|md)(?:\b|[:`'"])/iu,
      /```[\s\S]*```/u,
      /(코드|버그|구현|디버그|리팩터|리팩토링|타입체크|커밋|레포|깃허브|프론트엔드|백엔드|개발)/u,
    ].some(pattern => pattern.test(text)),
  /** The chat nudge. */
  ChatNudge = ({className, ...props}) => {
    const {target, handleConnect, handleDismiss} = useNudge({...props, place: 'chat'});
    return target
      ? (0, s.jsxs)(I, {
          className,
          dismissLabel: `Dismiss ${target.name} suggestion`,
          onClick: handleConnect,
          onDismiss: handleDismiss,
          children: [
            (0, s.jsx)('img', {
              alt: '',
              src: target.logoSrc,
              className: '-m-0.5 size-5 shrink-0',
              'data-icon': 'inline-start',
            }),
            (0, s.jsxs)('span', {className: 'truncate', children: ['Connect ', target.name]}),
          ],
        })
      : null;
  },
  /** The New Tab nudge. */
  $ = ({className, ...props}) => {
    const {target, handleConnect, handleDismiss} = useNudge({...props, place: 'new-tab-page'});
    if (!target) return null;
    const tileStyle = (style, zIndex) => ({
      position: 'relative',
      zIndex,
      width: 28,
      height: 28,
      marginLeft: zIndex === 3 ? 0 : -10,
      paddingLeft: zIndex === 3 ? 0 : 10,
      borderRadius: 8,
      overflow: 'hidden',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 0 2px var(--popover)',
      ...style,
    });
    return (0, s.jsxs)('div', {
      onClick: handleConnect,
      className: x(
        'bg-surface-primary ring-border-surface-strong mb-10 flex min-h-15 w-full cursor-pointer items-center gap-3 rounded-xl px-3 shadow-lg ring-[0.5px]',
        className,
      ),
      children: [
        (0, s.jsxs)('div', {
          'aria-hidden': true,
          className: 'flex shrink-0 items-center pl-0.5',
          children: [
            (0, s.jsx)('span', {
              style: tileStyle({}, 3),
              children: (0, s.jsx)('img', {alt: '', src: Z, style: {width: 35, height: 35, maxWidth: 'none'}}),
            }),
            (0, s.jsx)('span', {
              style: tileStyle({background: '#D97757', color: '#fff'}, 2),
              children: (0, s.jsx)(auxClaudeIcon, {size: 16}),
            }),
            (0, s.jsx)('span', {
              className: 'text-muted-foreground',
              style: tileStyle(
                {
                  background: 'var(--popover)',
                  boxShadow: '0 0 0 2px var(--popover),inset 0 0 0 0.5px var(--border-surface-strong)',
                },
                1,
              ),
              children: (0, s.jsxs)('svg', {
                viewBox: '0 0 24 24',
                width: 14,
                height: 14,
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: 2,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                children: [(0, s.jsx)('path', {d: 'm5 8 4 4-4 4'}), (0, s.jsx)('path', {d: 'M12 16h7'})],
              }),
            }),
          ],
        }),
        (0, s.jsxs)('div', {
          className: 'min-w-0 grow select-none [&>p]:truncate',
          children: [
            (0, s.jsx)('p', {className: 'text-foreground text-sm font-medium', children: 'Connect your agents'}),
            (0, s.jsx)('p', {
              className: 'text-muted-foreground text-[13px] font-medium',
              children: 'Use Aux’s browsing agent from Codex, Claude and more.',
            }),
          ],
        }),
        (0, s.jsx)(d, {className: 'bg-transparent', variant: 'outline', children: 'Connect'}),
        (0, s.jsx)(d, {
          'aria-label': 'Dismiss',
          className: 'text-muted-foreground',
          size: 'icon',
          variant: 'ghost',
          onClick: event => {
            (event.stopPropagation(), handleDismiss());
          },
          children: (0, s.jsx)(h, {}),
        }),
      ],
    });
  },
  /** The chat nudge when the last message is about code. */
  ee = ({className}) => {
    const {currentSession} = Q(),
      {status} = E(),
      {accountId} = N(),
      r = T(currentSession.model.provider);
    return F() ||
      (currentSession.status !== 'idle' && status !== 'streaming') ||
      !r ||
      !looksLikeCode(lastUserMessage(currentSession.messages))
      ? null
      : (0, s.jsx)(ChatNudge, {accountId, className, targetId: r});
  };
/** The latest user message's text. */
function lastUserMessage(messages) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === 'user') return messageText(message);
  }
  return '';
}
/** A message's text without system messages. */
function messageText(message) {
  return (
    typeof message.content == 'string'
      ? message.content
      : message.content
          .filter(part => part.type === 'text')
          .map(part => part.text)
          .join('')
  )
    .replace(/<system-message>[\s\S]*?<\/system-message>/giu, '')
    .trim();
}
/** Whether to show the nudge, and its actions. */
function useNudge({accountId, isPending = false, targetId, onStatusChange, place}) {
  const {capture} = y(),
    viewed = (0, l.useRef)(new Set()),
    {isDismissed, dismiss, dismissForever} = _(
      'nudge.codingAgentConnection.dismissedUntil',
      U.default.duration(1, 'month'),
    ),
    target = !isDismissed && targetId ? TARGETS[targetId] : void 0,
    visibleId = target ? targetId : void 0,
    handleConnect = () => {
      (visibleId && capture('nudges.coding-agent.connect', {place, target: visibleId}),
        dismissForever(),
        S(`/u/${accountId}/settings/developers`));
    },
    handleDismiss = () => {
      (visibleId && capture('nudges.coding-agent.dismiss', {place, target: visibleId}), dismiss());
    },
    status = target ? 'visible' : !isDismissed && isPending ? 'pending' : 'hidden';
  return (
    (0, l.useEffect)(() => onStatusChange?.(status), [onStatusChange, status]),
    (0, l.useEffect)(() => {
      if (!visibleId) return;
      const key = `${place}:${visibleId}`;
      viewed.current.has(key) ||
        (viewed.current.add(key), capture('nudges.coding-agent.view', {place, target: visibleId}));
    }, [capture, place, visibleId]),
    {target, handleConnect, handleDismiss}
  );
}
